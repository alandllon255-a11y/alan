import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { publishEvent, startGamificationWorker } from './gamification.js';
import { getUserStats, getAllUsersStats, markProfileComplete } from './state.js';
import { rateLimit, makeSocketLimiter } from './rateLimit.js';

const app = express();
app.use(cors());
app.use(express.json());
// Global API rate limit: 100 req/min per IP
app.use(rateLimit({ key: 'api', windowMs: 60_000, max: 100 }));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Start the simple gamification worker (in-memory, logs only)
startGamificationWorker();

// Socket message rate limiter: 30 messages/min per socket
const canSendMessage = makeSocketLimiter({ key: 'chat:send', windowMs: 60_000, max: 30 });

// Toggle: encaminhar eventos para backend NestJS (BullMQ) em vez de in-memory
const USE_NEST_GAMIFY = String(process.env.USE_NEST_GAMIFY || '').toLowerCase() === 'true';
const NEST_BASE_URL = process.env.NEST_BASE_URL || 'http://localhost:4000/api';

// Armazenar usuários conectados e mensagens
const connectedUsers = new Map();
const messageHistory = new Map(); // userId-userId -> messages[]
const typingUsers = new Map(); // roomId -> Set of userIds

// Função para criar uma chave de sala única
const getRoomKey = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

io.on('connection', (socket) => {
  console.log('✅ Novo usuário conectado:', socket.id);
  
  // Quando um usuário entra no chat
  socket.on('join', ({ userId, userName }) => {
    socket.userId = userId;
    socket.userName = userName;
    connectedUsers.set(userId, { socketId: socket.id, userName, status: 'online' });
    
    // Notificar todos que o usuário está online
    io.emit('userStatusUpdate', { userId, status: 'online' });
    
    // Enviar lista de usuários online
    const onlineUsers = Array.from(connectedUsers.entries()).map(([id, data]) => ({
      id,
      name: data.userName,
      status: data.status
    }));
    socket.emit('onlineUsers', onlineUsers);
    
    console.log(`👤 ${userName} (${userId}) entrou no chat`);
  });
  
  // Entrar em uma sala de conversa específica
  socket.on('joinRoom', ({ partnerId }) => {
    const roomKey = getRoomKey(socket.userId, partnerId);
    socket.join(roomKey);
    
    // Enviar histórico de mensagens
    const history = messageHistory.get(roomKey) || [];
    socket.emit('messageHistory', history);
    
    console.log(`🚪 Usuário ${socket.userId} entrou na sala ${roomKey}`);
  });
  
  // Enviar mensagem
  socket.on('sendMessage', ({ receiverId, content }) => {
    if (!canSendMessage(socket.id)) {
      socket.emit('rateLimited', { key: 'chat:send', retryAfterMs: 60_000 });
      return;
    }
    const roomKey = getRoomKey(socket.userId, receiverId);
    
    const message = {
      id: Date.now() + Math.random(),
      senderId: socket.userId,
      senderName: socket.userName,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Salvar no histórico
    if (!messageHistory.has(roomKey)) {
      messageHistory.set(roomKey, []);
    }
    messageHistory.get(roomKey).push(message);
    
    // Enviar para todos na sala (incluindo o remetente)
    io.to(roomKey).emit('newMessage', message);
    
    // Se o destinatário não estiver na sala, enviar notificação
    const receiverSocket = connectedUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('messageNotification', {
        senderId: socket.userId,
        senderName: socket.userName,
        message: content
      });
    }

    // Gamification: count as COMMENT_CREATED (messaging treated as comment-like activity)
    try {
      publishEvent('COMMENT_CREATED', { userId: socket.userId, targetId: roomKey });
    } catch (err) {
      console.warn('Failed to publish gamification event', err);
    }
    
    console.log(`💬 ${socket.userName} -> ${receiverId}: ${content}`);
  });
  
  // Indicador de digitação
  socket.on('typing', ({ receiverId, isTyping }) => {
    const roomKey = getRoomKey(socket.userId, receiverId);
    
    if (!typingUsers.has(roomKey)) {
      typingUsers.set(roomKey, new Set());
    }
    
    if (isTyping) {
      typingUsers.get(roomKey).add(socket.userId);
    } else {
      typingUsers.get(roomKey).delete(socket.userId);
    }
    
    // Notificar apenas o outro usuário na sala
    socket.to(roomKey).emit('userTyping', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping
    });
  });
  
  // Marcar mensagem como lida
  socket.on('markAsRead', ({ messageId, roomKey }) => {
    const messages = messageHistory.get(roomKey);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
        io.to(roomKey).emit('messageRead', { messageId });
      }
    }
  });
  
  // Quando o usuário se desconecta
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      io.emit('userStatusUpdate', { userId: socket.userId, status: 'offline' });
      console.log(`👋 ${socket.userName} (${socket.userId}) saiu do chat`);
    }
  });
});

// Root endpoint para verificação rápida
app.get('/', (req, res) => {
  res.type('text/plain').send('DevForum chat server ativo. Experimente GET /api/users');
});

// Endpoint REST para obter usuários (simulado)
app.get('/api/users', (req, res) => {
  // Simular alguns usuários para teste
  const mockUsers = [
    { id: '1', name: 'João Silva', avatar: 'JS', status: 'online' },
    { id: '2', name: 'Maria Santos', avatar: 'MS', status: 'offline' },
    { id: '3', name: 'Pedro Costa', avatar: 'PC', status: 'online' },
    { id: '4', name: 'Ana Lima', avatar: 'AL', status: 'offline' },
    { id: '5', name: 'DevBot', avatar: '🤖', status: 'online', isBot: true }
  ];
  
  // Atualizar status com base nos usuários conectados
  mockUsers.forEach(user => {
    if (connectedUsers.has(user.id)) {
      user.status = 'online';
    }
  });
  
  res.json(mockUsers);
});

// Profile endpoint with gamification fields (additive)
app.get('/api/users/profile', (req, res) => {
  const userId = (req.header('x-user-id') || '7').toString();
  const base = { id: userId, name: 'Você', email: 'voce@exemplo.com' };
  const stats = getUserStats(userId);
  const rankTitle = stats.currentLevel < 5 ? 'Iniciante' : stats.currentLevel < 15 ? 'Júnior' : stats.currentLevel < 30 ? 'Pleno' : stats.currentLevel < 50 ? 'Sênior' : 'Arquiteto';
  res.json({
    ...base,
    reputation_points: stats.reputationPoints,
    currency_balance: stats.currencyBalance,
    current_level: stats.currentLevel,
    rank_title: rankTitle,
    achievements: stats.achievements
  });
});

// Leaderboard (simple, all_time; type=rep|currency)
app.get('/api/v1/leaderboard', (req, res) => {
  const type = (req.query.type || 'rep').toString();
  const all = getAllUsersStats();
  const sorted = all.sort((a, b) => {
    return type === 'currency' ? b.currencyBalance - a.currencyBalance : b.reputationPoints - a.reputationPoints;
  }).slice(0, 100);
  res.json({ type, period: 'all_time', data: sorted });
});

// Simulate profile completion
app.patch('/api/users/profile', (req, res) => {
  const userId = (req.header('x-user-id') || '7').toString();
  const transitioned = markProfileComplete(userId);
  if (transitioned) publishEvent('PROFILE_COMPLETED', { userId });
  res.json({ success: true, profileCompleted: transitioned });
});

// Simulate login event
app.post('/api/auth/login', (req, res) => {
  const userId = (req.header('x-user-id') || '7').toString();
  publishEvent('DAILY_LOGIN', { userId });
  res.json({ token: 'mock-jwt', userId });
});
// Example endpoint to simulate upvote on an answer (for integration pattern)
// In a real app, this would live under your API controllers
app.post('/api/answers/:id/upvote', (req, res) => {
  const userId = req.header('x-user-id') || '7';
  const answerId = req.params.id;
  if (USE_NEST_GAMIFY) {
    // Encaminhar para o backend Nest
    fetch(`${NEST_BASE_URL}/answers/${encodeURIComponent(answerId)}/upvote`, {
      method: 'POST',
      headers: { 'x-user-id': String(userId) }
    }).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      res.status(r.status).json(body);
    }).catch((err) => {
      res.status(502).json({ success: false, error: 'Nest backend indisponível', details: String(err?.message || err) });
    });
  } else {
    // Protótipo local: publicar evento in-memory
    publishEvent('ANSWER_UPVOTED', { userId, targetId: answerId, targetOwnerId: '2' });
    res.json({ success: true });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor de chat rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO aguardando conexões...`);
});
