# Guia de Integração do Sistema de Chat - DevForum

## Visão Geral

O DevForum já possui um sistema de chat integrado que permite conversas em tempo real entre usuários. Este guia explica como o sistema funciona e como pode ser expandido.

## Estrutura Atual do Chat

### Componente ChatView

O componente `ChatView` está localizado em `src/StackOverflowClone.jsx` e possui as seguintes funcionalidades:

1. **Lista de Conversas**: Painel lateral mostrando todos os usuários com quem você tem conversas
2. **Área de Mensagens**: Exibição das mensagens com indicadores de leitura
3. **Input de Mensagens**: Campo para digitar e enviar novas mensagens
4. **Integração com Perfil**: Clique no avatar/nome para ver o perfil do usuário

### Como Funciona

```javascript
// Estado principal do chat
const [chats, setChats] = useState({});
const [activeChatUserId, setActiveChatUserId] = useState(null);

// Estrutura de dados do chat
// chats = {
//   "userId1-userId2": [
//     { id, senderId, content, timestamp, read }
//   ]
// }
```

## Melhorias Implementadas

### 1. Interface Aprimorada
- Design moderno com Tailwind CSS
- Indicadores visuais de status online/offline
- Animações suaves de transição
- Scroll automático para novas mensagens

### 2. Funcionalidades de UX
- Indicador de "digitando..."
- Contador de mensagens
- Timestamps formatados
- Avatares personalizados com gradientes

### 3. Simulação de Respostas
- Bot automático (DevBot) para demonstração
- Respostas contextuais após 2 segundos
- Sistema pode ser facilmente substituído por WebSocket real

## Como Adicionar WebSocket Real

### 1. Instalar Dependências

```bash
npm install socket.io-client
```

### 2. Configurar o Cliente Socket.IO

```javascript
// Em src/StackOverflowClone.jsx ou arquivo separado
import io from 'socket.io-client';

// Dentro do componente
useEffect(() => {
  const socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    socket.emit('join', { userId: currentUser.id });
  });
  
  socket.on('message', (message) => {
    // Atualizar estado do chat
    setChats(prev => {
      const key = [message.senderId, message.receiverId].sort().join('-');
      return {
        ...prev,
        [key]: [...(prev[key] || []), message]
      };
    });
  });
  
  return () => socket.disconnect();
}, [currentUser.id]);
```

### 3. Backend Node.js/Express

Crie um arquivo `server/chatServer.js`:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5178",
    methods: ["GET", "POST"]
  }
});

// Armazenar usuários conectados
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);
  
  socket.on('join', ({ userId }) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Notificar outros usuários que este está online
    socket.broadcast.emit('userOnline', userId);
  });
  
  socket.on('sendMessage', ({ receiverId, message }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    
    const messageData = {
      id: Date.now(),
      senderId: socket.userId,
      receiverId,
      content: message,
      timestamp: new Date(),
      read: false
    };
    
    // Enviar para o destinatário se estiver online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message', messageData);
    }
    
    // Enviar confirmação para o remetente
    socket.emit('messageSent', messageData);
  });
  
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      socket.broadcast.emit('userOffline', socket.userId);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor de chat rodando na porta ${PORT}`);
});
```

## Próximas Melhorias Sugeridas

### 1. Notificações
- Som ao receber mensagem
- Notificações do navegador
- Badge com contador de não lidas

### 2. Funcionalidades Avançadas
- Envio de arquivos/imagens
- Emojis e reações
- Busca em conversas
- Mensagens de voz

### 3. Salas de Chat
- Criar salas por tópico (JavaScript, React, etc.)
- Moderação de salas
- Chat público vs privado

### 4. Persistência
- Integrar com banco de dados (MongoDB/PostgreSQL)
- Histórico de conversas
- Sincronização entre dispositivos

## Como Testar o Chat Atual

1. Acesse http://localhost:5178
2. Faça login com qualquer usuário (simulado)
3. Clique no ícone de chat no menu lateral
4. Digite um nome de usuário para entrar
5. Envie mensagens e veja as respostas automáticas do DevBot

## Estrutura de Arquivos Recomendada

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatView.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── ChatUserList.jsx
│   │   └── ChatInput.jsx
│   └── ...
├── services/
│   └── chatService.js
├── hooks/
│   └── useChat.js
└── ...
```

## Scripts NPM Úteis

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "chat-server": "node server/chatServer.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run chat-server\""
  }
}
```

## Conclusão

O sistema de chat do DevForum está pronto para uso e pode ser facilmente expandido com WebSocket real. A arquitetura modular permite adicionar novas funcionalidades sem grandes refatorações.

Para dúvidas ou sugestões, abra uma issue no repositório!

---

## Integração com Gamificação (Eventos, Fila e Limites)

### Visão geral do fluxo
- Ações do chat (ex.: envio de mensagens) e do app (ex.: upvote, login, completar perfil) disparam eventos de gamificação.
- Os eventos entram em uma fila (protótipo: in-memory; produção: BullMQ/Redis) e são processados por um worker.
- As regras concedem REP e Moedas, atualizam nível e registram conquistas.

### No protótipo Express (local)
- Publicação de eventos ocorre em `server/chatServer.js` via `publishEvent(type, payload)`.
- O worker roda em `server/gamification.js` (in-memory), com limites diários e bloqueios básicos de abuso.
- Endpoints úteis (porta 3001):
  - `POST /api/auth/login` → DAILY_LOGIN
  - `PATCH /api/users/profile` → PROFILE_COMPLETED
  - `POST /api/answers/:id/upvote` → ANSWER_UPVOTED
  - `GET /api/users/profile` → inclui reputation_points, currency_balance, current_level, rank_title, achievements
  - `GET /api/v1/leaderboard?type=rep|currency`

### Rate limit e UX de cooldown
- API: 100 req/min por IP (headers: Retry-After, X-RateLimit-*)
- Chat: 30 msgs/min por socket; quando excede, o cliente recebe `rateLimited` com `retryAfterMs`.
- O front exibe aviso visual no `ChatView` e, se permitido, notificação desktop com tempo restante.

### Para produção (NestJS + BullMQ)
- Módulo em `backend/` com fila redis (BullMQ) e Processor:
  - Publicação: `EventTriggerService.publish(type, payload)`
  - Consumo: `GamificationProcessor` aplica regras e serviços (reputação/moedas)
- Requisitos: Redis disponível e variáveis no `backend/.env` (REDIS_HOST/PORT, BACKEND_PORT)
- Execução (dev): `npm run nest:dev` (default: http://localhost:4000/api)
- Exemplo de rota: `POST /api/answers/:id/upvote` (controller injeta o publicador e dispara evento)

### Toggle de migração (Express → Nest)
- Para ativar o encaminhamento de eventos do Express (porta 3001) para o backend Nest (BullMQ):
  - Defina `USE_NEST_GAMIFY=true`
  - Opcionalmente ajuste a base: `NEST_BASE_URL=http://localhost:4000/api`
- Se `USE_NEST_GAMIFY` não estiver ativo, o Express usa o worker em memória para processar eventos localmente.

#### Exemplo de variáveis (arquivo .env na raiz ou variáveis de ambiente)
```
# Toggle de migração
USE_NEST_GAMIFY=true
NEST_BASE_URL=http://localhost:4000/api

# Redis para BullMQ (usado pelo backend Nest)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

# Porta do backend Nest
BACKEND_PORT=4000
```

### Próximos passos recomendados
- Migrar limites diários e leaderboard para consultas em banco via Prisma (`GamificationActionLog`).
- Trocar fila in-memory do protótipo por BullMQ e consolidar apenas o backend NestJS em produção.
- Adicionar cache ao leaderboard e endpoints de store/purchase.