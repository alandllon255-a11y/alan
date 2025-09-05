// DevForum - StackOverflow Clone
import { 
  Search, Clock, CheckCircle, ChevronDown, ChevronUp, MessageSquare, 
  User, Filter, X, Edit2, BookOpen, Zap, 
  Trophy, Code, Bell, MessageCircle as MessageCircleIcon, ArrowLeft, 
  Settings, Camera, 
  MapPin, Link as LinkIcon, Calendar, Github, Linkedin, Twitter, Globe, Shield, Activity, BarChart, PieChart, Coffee, 
  Briefcase, Moon, Sun, Users,

} from 'lucide-react';



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProfileRecentQuestions from './components/profile/ProfileRecentQuestions.jsx';
import ProfileRecentAnswers from './components/profile/ProfileRecentAnswers.jsx';
import ChatView from './components/chat/ChatView.jsx';
import FeedView from './components/feed/FeedView.jsx';
 
import NotificationCenter from './components/notifications/NotificationCenter.jsx';
import AdvancedSearch from './components/search/AdvancedSearch.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import SettingsPage from './pages/SettingsPage.jsx';



import { useToast } from './hooks/useToast.js';
import { useTheme } from './hooks/useTheme.js';


 
import { useChat } from './hooks/useChat.js';

const StackOverflowCloneMain = () => {
  // Definir currentUser
  const [currentUser, setCurrentUser] = useState({
    id: 7,
    name: "Você",
    username: "devmaster",
    email: "voce@exemplo.com",
    reputation: 150,
    avatar: "YU",
    portfolio: []
  });

  

  // Sistema de chat em tempo real
  const {
    messages: chatMessages,
    onlineUsers,
    typingUsers,
    unreadCounts,
    isConnected: chatConnected,
    joinRoom,
    sendMessage: sendChatMessage,
    sendTyping,
    markAsRead,
    getConversationMessages,
    requestNotificationPermission
  } = useChat(currentUser.id, currentUser.name);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: "Como implementar autenticação JWT em Node.js?",
      content: "Estou desenvolvendo uma API REST e preciso implementar autenticação JWT. Qual a melhor forma de fazer isso com Express? Preciso de um exemplo completo com refresh tokens.",
      tags: ["node.js", "jwt", "authentication", "express"],
      author: { id: 1, name: "João Silva", reputation: 1250, avatar: "JS" },
      votes: 42,
      views: 1523,
      answers: [
        {
          id: 1,
          content: "Para implementar JWT em Node.js, você precisa:\n\n**1. Instalar as dependências:**\n```bash\nnpm install jsonwebtoken bcrypt\n```\n\n**2. Criar middleware de autenticação:**\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Token não fornecido' });\n  \n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.userId = decoded.id;\n    next();\n  } catch (error) {\n    return res.status(401).json({ error: 'Token inválido' });\n  }\n};\n```\n\n**3. Implementar refresh tokens para maior segurança:**\n```javascript\nconst generateTokens = (userId) => {\n  const accessToken = jwt.sign(\n    { id: userId },\n    process.env.ACCESS_TOKEN_SECRET,\n    { expiresIn: '15m' }\n  );\n  \n  const refreshToken = jwt.sign(\n    { id: userId },\n    process.env.REFRESH_TOKEN_SECRET,\n    { expiresIn: '7d' }\n  );\n  \n  return { accessToken, refreshToken };\n};\n```\n\n**Dica importante:** Sempre armazene o refresh token de forma segura (httpOnly cookie ou banco de dados) e nunca no localStorage!",
          author: { id: 2, name: "Maria Santos", reputation: 3420, avatar: "MS" },
          votes: 38,
          isAccepted: true,
          createdAt: new Date('2024-01-15'),
          comments: [
            { id: 1, author: "Pedro Lima", content: "Ótima explicação! Muito útil.", createdAt: new Date('2024-01-16') },
            { id: 2, author: "João Silva", content: "@MariaSantos obrigado! Funcionou perfeitamente!", createdAt: new Date('2024-01-16') }
          ],
          replies: [
            {
              id: 101,
              content: "Complementando a resposta da @MariaSantos, também é importante implementar um sistema de *blacklist* para tokens revogados:\n\n```javascript\nconst revokedTokens = new Set();\n\nconst revokeToken = (token) => {\n  revokedTokens.add(token);\n  // Em produção, use Redis ou banco de dados\n};\n```",
              author: { id: 8, name: "Carlos Tech", reputation: 890, avatar: "CT" },
              votes: 5,
              createdAt: new Date('2024-01-17'),
              comments: []
            }
          ]
        },
        {
          id: 2,
          content: "Outra abordagem é criar um middleware customizado que valida e decodifica o token:\n\n**Implementação alternativa:**\n```javascript\nconst jwt = require('jsonwebtoken');\nconst User = require('./models/User');\n\nconst authStrategy = async (req, res, next) => {\n  try {\n    // Extrair token do header\n    const token = req.headers.authorization?.replace('Bearer ', '');\n    \n    if (!token) {\n      throw new Error();\n    }\n    \n    // Verificar e decodificar\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    const user = await User.findById(decoded.id);\n    \n    if (!user) {\n      throw new Error();\n    }\n    \n    // Anexar user ao request\n    req.user = user;\n    req.token = token;\n    next();\n  } catch (error) {\n    res.status(401).json({ error: 'Por favor, autentique-se' });\n  }\n};\n\nmodule.exports = authStrategy;\n```\n\n**Uso em rotas protegidas:**\n```javascript\napp.get('/profile', authStrategy, (req, res) => {\n  res.json({ user: req.user });\n});\n```",
          author: { id: 3, name: "Carlos Oliveira", reputation: 890, avatar: "CO" },
          votes: 12,
          isAccepted: false,
          createdAt: new Date('2024-01-16'),
          comments: [],
          replies: []
        },
        {
          id: 3,
          content: "Não esqueça de implementar também **rate limiting** e **proteção contra brute force** nos endpoints de autenticação:\n\n```javascript\nconst rateLimit = require('express-rate-limit');\n\nconst loginLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutos\n  max: 5, // limite de 5 requisições\n  message: 'Muitas tentativas de login, tente novamente mais tarde'\n});\n\napp.post('/login', loginLimiter, async (req, res) => {\n  // lógica de login\n});\n```\n\nIsso é *crucial* para a segurança da sua API!",
          author: { id: 9, name: "Ana Security", reputation: 2100, avatar: "AS" },
          votes: 25,
          isAccepted: false,
          createdAt: new Date('2024-01-17'),
          comments: [
            { id: 3, author: "João Silva", content: "Excelente ponto sobre segurança! Vou implementar isso também.", createdAt: new Date('2024-01-17') }
          ],
          replies: []
        }
      ],
      createdAt: new Date('2024-01-14'),
      hasAcceptedAnswer: true,
      userVote: 1
    },
    {
      id: 2,
      title: "Diferença entre useState e useReducer no React?",
      content: "Quando devo usar useState vs useReducer? Existe uma regra clara ou é mais questão de preferência? Gostaria de entender os prós e contras de cada abordagem.",
      tags: ["react", "hooks", "javascript", "state-management"],
      author: { id: 4, name: "Ana Costa", reputation: 567, avatar: "AC" },
      votes: 28,
      views: 892,
      answers: [
        {
          id: 3,
          content: "**useState** é ideal para estados simples:\n- Valores primitivos\n- Estados independentes\n- Lógica simples de atualização\n\n**useReducer** é melhor para:\n- Estados complexos com múltiplas sub-valores\n- Quando o próximo estado depende do anterior\n- Lógica de atualização complexa\n- Quando você precisa passar a lógica de atualização para componentes filhos\n\nExemplo com useReducer:\n```javascript\nconst [state, dispatch] = useReducer(reducer, initialState);\n```",
          author: { id: 5, name: "Roberto Dias", reputation: 2100, avatar: "RD" },
          votes: 24,
          isAccepted: false,
          createdAt: new Date('2024-01-20'),
          comments: []
        }
      ],
      createdAt: new Date('2024-01-19'),
      hasAcceptedAnswer: false,
      userVote: 0
    },
    {
      id: 3,
      title: "Como otimizar queries SQL para grandes volumes de dados?",
      content: "Tenho uma tabela com mais de 10 milhões de registros e as queries estão muito lentas. Já criei índices nas colunas principais, mas ainda está lento. O que mais posso fazer?",
      tags: ["sql", "database", "performance", "optimization"],
      author: { id: 6, name: "Lucas Ferreira", reputation: 1890, avatar: "LF" },
      votes: 15,
      views: 445,
      answers: [],
      createdAt: new Date('2024-01-22'),
      hasAcceptedAnswer: false,
      userVote: 0
    },
    {
      id: 4,
      title: "Como criar um sistema de chat em tempo real com WebSockets?",
      content: "Preciso implementar um chat em tempo real na minha aplicação. Como posso fazer isso usando WebSockets nativos com React no frontend e Node.js no backend? Gostaria de exemplos práticos.",
      tags: ["websocket", "react", "node.js", "real-time", "chat"],
      author: { id: 7, name: "Você", reputation: 150, avatar: "YU" },
      votes: 8,
      views: 234,
      answers: [
        {
          id: 4,
          content: "Para criar um chat em tempo real com WebSockets, siga estes passos:\n\n**Backend (Node.js):**\n```javascript\nconst express = require('express');\nconst http = require('http');\nconst WebSocket = require('ws');\n\nconst app = express();\nconst server = http.createServer(app);\nconst wss = new WebSocket.Server({ server });\n\nconst clients = new Set();\n\nwss.on('connection', (ws) => {\n  console.log('Novo usuário conectado');\n  clients.add(ws);\n  \n  ws.on('message', (data) => {\n    // Enviar mensagem para todos os clientes\n    clients.forEach((client) => {\n      if (client.readyState === WebSocket.OPEN) {\n        client.send(data);\n      }\n    });\n  });\n  \n  ws.on('close', () => {\n    clients.delete(ws);\n    console.log('Usuário desconectado');\n  });\n});\n\nserver.listen(4000, () => {\n  console.log('Server rodando na porta 4000');\n});\n```\n\n**Frontend (React):**\n```javascript\nfunction Chat() {\n  const [messages, setMessages] = useState([]);\n  const [ws, setWs] = useState(null);\n  \n  useEffect(() => {\n    // Criar conexão WebSocket\n    const websocket = new WebSocket('ws://localhost:4000');\n    \n    websocket.onopen = () => {\n      console.log('Conectado ao servidor');\n      setWs(websocket);\n    };\n    \n    websocket.onmessage = (event) => {\n      const message = JSON.parse(event.data);\n      setMessages(prev => [...prev, message]);\n    };\n    \n    websocket.onerror = (error) => {\n      console.error('WebSocket error:', error);\n    };\n    \n    return () => {\n      websocket.close();\n    };\n  }, []);\n  \n  const sendMessage = (text) => {\n    if (ws && ws.readyState === WebSocket.OPEN) {\n      ws.send(JSON.stringify({ text, user: 'Você', timestamp: Date.now() }));\n    }\n  };\n  \n  return (\n    // Interface do chat\n    <div>\n      {/* Lista de mensagens */}\n      {/* Input para enviar mensagem */}\n    </div>\n  );\n}\n```\n\n**Dica:** WebSockets nativos são ótimos para aplicações simples. Para funcionalidades mais avançadas como salas, reconexão automática e eventos customizados, considere criar suas próprias abstrações!",
          author: { id: 10, name: "Paulo Dev", reputation: 1560, avatar: "PD" },
          votes: 12,
          isAccepted: false,
          createdAt: new Date('2024-01-23'),
          comments: [],
          replies: [
            {
              id: 102,
              content: "Ótima resposta @PauloDev! Só complementando, é importante também implementar **salas de chat** para conversas privadas:\n\n```javascript\n// Estrutura para gerenciar salas\nconst rooms = new Map();\n\nfunction joinRoom(ws, roomId) {\n  if (!rooms.has(roomId)) {\n    rooms.set(roomId, new Set());\n  }\n  rooms.get(roomId).add(ws);\n}\n\nfunction sendToRoom(roomId, message) {\n  const room = rooms.get(roomId);\n  if (room) {\n    room.forEach(client => {\n      if (client.readyState === WebSocket.OPEN) {\n        client.send(JSON.stringify(message));\n      }\n    });\n  }\n}\n```\n\nIsso permite criar chats privados e canais específicos!",
              author: { id: 11, name: "Felipe Costa", reputation: 780, avatar: "FC" },
              votes: 3,
              createdAt: new Date('2024-01-23'),
              comments: []
            }
          ]
        }
      ],
      createdAt: new Date('2024-01-23'),
      hasAcceptedAnswer: false,
      userVote: 1
    }
  ]);



  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("votes");
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuickAnswer, setShowQuickAnswer] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "", tags: "" });
  const [newAnswer, setNewAnswer] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  
  // Estados do chat
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados de busca
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Sistema de toast
  const { toasts, success, error, warning, info, removeToast } = useToast();
  
  // Sistema de temas
  const { theme, accentColor, toggleTheme, isDark } = useTheme();
  
  // Estados de configurações



  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  

  

  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'answer',
      title: 'Nova resposta',
      message: 'Maria Santos respondeu sua pergunta sobre JWT',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      actionUrl: '#',
      avatar: 'MS',
      priority: 'normal'
    },
    {
      id: 2,
      type: 'mention',
      title: 'Você foi mencionado',
      message: '@Você foi mencionado em uma resposta por Carlos Tech',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '#',
      avatar: 'CT',
      priority: 'high'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newAnswerId, setNewAnswerId] = useState(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileTab, setProfileTab] = useState('overview');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [tempProfileData, setTempProfileData] = useState(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showBannerUpload, setShowBannerUpload] = useState(false);
  const [profileTheme, setProfileTheme] = useState('dark');
  const [notificationSettings, setNotificationSettings] = useState({
    answers: true,
    mentions: true,
    votes: true,
    accepted: true,
    badges: true,
    comments: true,
    sound: true,
    desktop: false,
    email: true,
    digest: 'daily',
    showToasts: true
  });
  const [notificationFilter, setNotificationFilter] = useState('all');

  const allTags = useMemo(() => {
    const tagCount = {};
    questions.forEach(q => {
      q.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ name: tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(q => selectedTags.every(tag => q.tags.includes(tag)));
    }
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'votes': return b.votes - a.votes;
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'unanswered': return a.answers.length - b.answers.length;
        case 'views': return b.views - a.views;
        default: return 0;
      }
    });
    return sorted;
  }, [questions, searchQuery, selectedTags, sortBy]);

  const addNotification = (type, title, message, priority = 'normal', actionUrl = '#') => {
    const notification = {
      id: Date.now(), type, title, message, timestamp: new Date(), read: false, actionUrl, priority,
      avatar: getNotificationAvatar(type)
    };
    setNotifications(prev => [notification, ...prev]);
    playNotificationSound();
    if (notificationSettings.showToasts && type !== 'success') {
      const toastId = Date.now();
      setToastNotifications(prev => [...prev, { ...notification, toastId }]);
      setTimeout(() => { setToastNotifications(prev => prev.filter(t => t.toastId !== toastId)); }, 5000);
    }
    if (notificationSettings.desktop && type !== 'success') {
      console.log(`Desktop notification: ${title} - ${message}`);
    }
  };

  const handleVoteQuestion = useCallback((questionId, voteType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentVote = q.userVote || 0;
        let newVote = 0; let voteDiff = 0;
        if (voteType === 1) { newVote = currentVote === 1 ? 0 : 1; voteDiff = newVote - currentVote; }
        else { newVote = currentVote === -1 ? 0 : -1; voteDiff = newVote - currentVote; }
        
        if (voteDiff > 0 && q.author.id !== currentUser?.id) {
          if (notificationSettings.votes) {
            addNotification('vote', 'Novo voto positivo', `Sua pergunta "${q.title.substring(0, 40)}..." recebeu um voto positivo`, 'low', `#question-${questionId}`);
          }
        }
        
        return { ...q, votes: q.votes + voteDiff, userVote: newVote };
      }
      return q;
    }));
  }, [currentUser, notificationSettings, addNotification]);

  const handleVoteAnswer = (questionId, answerId, voteType) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, answers: q.answers.map(a => {
          if (a.id === answerId) {
            const currentVote = a.userVote || 0;
            let newVote = 0; let voteDiff = 0;
            if (voteType === 1) { newVote = currentVote === 1 ? 0 : 1; voteDiff = newVote - currentVote; }
            else { newVote = currentVote === -1 ? 0 : -1; voteDiff = newVote - currentVote; }
            if (voteDiff > 0 && a.author.id !== currentUser?.id && notificationSettings.votes) {
              addNotification('vote', 'Novo voto positivo', `Sua resposta recebeu um voto positivo`, 'low', `#answer-${answerId}`);
            }
            return { ...a, votes: a.votes + voteDiff, userVote: newVote };
          }
          return a; }) };
      }
      return q;
    }));
  };

  const handleAcceptAnswer = (questionId, answerId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const answer = q.answers.find(a => a.id === answerId);
        if (answer && answer.author.id !== currentUser?.id && notificationSettings.accepted) {
          addNotification('accepted', 'Resposta aceita!', 'Sua resposta foi marcada como a melhor solução!', 'high', `#answer-${answerId}`);
          
          if (Math.random() > 0.5 && notificationSettings.badges) {
            setTimeout(() => {
              addNotification('badge', 'Nova conquista desbloqueada!', 'Você ganhou a medalha "Resposta Exemplar" por ter 5 respostas aceitas', 'high');
            }, 2000);
          }
        }
        return { ...q, hasAcceptedAnswer: true, answers: q.answers.map(a => ({ ...a, isAccepted: a.id === answerId })) };
      }
      return q;
    }));
  };

  const extractCodeBlocks = (content) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; const blocks = []; let match;
    while ((match = codeRegex.exec(content)) !== null) {
      blocks.push({ language: match[1] || 'plaintext', code: match[2] });
    }
    return blocks;
  };

  const escapeHtml = (text) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  const renderMarkdown = (content) => {
    if (!content) return '';
    let processed = content.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-2 py-1 rounded text-blue-400 text-sm font-mono">$1</code>');
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto my-2"><code class="text-green-400 text-sm font-mono">${escapeHtml(code)}</code></pre>`;
    });
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank">$1</a>');
    processed = processed.replace(/@(\w+)/g, '<span class="text-blue-500 font-semibold">@$1</span>');
    processed = processed.replace(/\n/g, '<br>');
    return processed;
  };

  const handleCreateQuestion = useCallback(() => {
    if (!newQuestion.title || !newQuestion.content) return;
    const question = {
      id: Date.now(), title: newQuestion.title, content: newQuestion.content,
      tags: newQuestion.tags.split(',').map(t => t.trim()).filter(t => t),
      author: currentUser, votes: 0, views: 0, answers: [], createdAt: new Date(), hasAcceptedAnswer: false, userVote: 0
    };
    setQuestions(prev => [question, ...prev]);
    setNewQuestion({ title: "", content: "", tags: "" });
    setShowNewQuestion(false);
    

    
    success('Pergunta criada!', `Sua pergunta "${question.title.substring(0, 40)}..." foi publicada com sucesso!`);
  }, [newQuestion, currentUser, success]);

  const handleCreateAnswer = (questionId, parentAnswerId = null) => {
    if (!newAnswer.trim()) return;
    const answerId = Date.now();
    const answer = {
      id: answerId, content: newAnswer, author: currentUser, votes: 0, isAccepted: false,
      createdAt: new Date(), comments: [], userVote: 0, parentId: parentAnswerId, replies: [], editHistory: [], codeBlocks: extractCodeBlocks(newAnswer)
    };
    
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        if (q.author.id !== currentUser?.id) {
          addNotification('answer', 'Nova resposta', `${currentUser?.name} respondeu sua pergunta: "${q.title.substring(0, 50)}..."`, 'high', `#question-${questionId}`);
        }
        const mentions = newAnswer.match(/@(\w+)/g);
        if (mentions) { mentions.forEach(() => addNotification('mention', 'Você foi mencionado', `${currentUser?.name} mencionou você em uma resposta`, 'high', `#answer-${answerId}`)); }
        addNotification('success', 'Resposta publicada!', 'Sua resposta foi publicada com sucesso', 'normal');
        if (parentAnswerId) {
          return { ...q, answers: q.answers.map(a => {
            if (a.id === parentAnswerId) {
              if (a.author.id !== currentUser?.id) {
                addNotification('comment', 'Nova resposta ao seu comentário', `${currentUser?.name} respondeu ao seu comentário`, 'normal', `#answer-${parentAnswerId}`);
              }
              return { ...a, replies: [...(a.replies || []), answer] };
            }
            return a; }) };
        } else {
          return { ...q, answers: [...q.answers, answer] };
        }
      }
      return q;
    }));
    setNewAnswerId(answerId);
    setTimeout(() => setNewAnswerId(null), 3000);
    setNewAnswer(""); setShowAnswerForm(null); setReplyingTo(null); setShowMarkdownPreview(false); setShowQuickAnswer(null);
  };

  const handleAddComment = (questionId, answerId, comment) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, answers: q.answers.map(a => {
          if (a.id === answerId) {
            if (a.author.id !== currentUser?.id && notificationSettings.comments) {
              addNotification('comment', 'Novo comentário', `${currentUser?.name} comentou em sua resposta: "${comment.substring(0, 50)}..."`, 'normal', `#answer-${answerId}`);
            }
            return { ...a, comments: [...a.comments, { id: Date.now(), author: currentUser?.name, content: comment, createdAt: new Date() }] };
          }
          return a; }) };
      }
      return q;
    }));
  };

  const handleEditAnswer = (questionId, answerId, newContent) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, answers: q.answers.map(a => {
          if (a.id === answerId) {
            return { ...a, content: newContent, editHistory: [...(a.editHistory || []), { content: a.content, editedAt: new Date(), editedBy: currentUser?.name }], lastEditedAt: new Date() };
          }
          return a; }) };
      }
      return q;
    }));
    setEditingAnswer(null);
  };

  const playNotificationSound = () => {
    if (notificationSettings.sound) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Verificar se o contexto está suspenso e tentar retomar
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            createNotificationSound(audioContext);
          }).catch(() => {
            // Silenciosamente falhar se não conseguir retomar
          });
        } else {
          createNotificationSound(audioContext);
        }
      } catch (error) {
        // Silenciosamente falhar se não conseguir criar o contexto de áudio
      }
    }
  };

  const createNotificationSound = (audioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode); 
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800; 
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime); 
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const getNotificationAvatar = (type) => {
    switch(type) {
      case 'answer': return '💬';
      case 'mention': return '@';
      case 'vote': return '👍';
      case 'accepted': return '✅';
      case 'badge': return '🏆';
      case 'comment': return '💭';
      case 'follow': return '👥';
      case 'success': return '✨';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => { 
    setNotifications(prev => prev.filter(n => n.id !== notificationId)); 
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Função para busca avançada
  const handleAdvancedSearch = (searchParams) => {
    const { query, filters } = searchParams;
    
    // Aplicar filtros
    let filtered = questions;
    
    if (filters.type === 'questions' || filters.type === 'all') {
      if (query) {
        filtered = filtered.filter(q => 
          q.title.toLowerCase().includes(query.toLowerCase()) ||
          q.content.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Filtros adicionais
      if (filters.hasAcceptedAnswer !== null) {
        filtered = filtered.filter(q => q.hasAcceptedAnswer === filters.hasAcceptedAnswer);
      }
      
      if (filters.minVotes > 0) {
        filtered = filtered.filter(q => q.votes >= filters.minVotes);
      }
      
      if (filters.minViews > 0) {
        filtered = filtered.filter(q => q.views >= filters.minViews);
      }
      
      // Ordenação
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'votes':
          filtered.sort((a, b) => b.votes - a.votes);
          break;
        case 'views':
          filtered.sort((a, b) => b.views - a.views);
          break;
        default: // relevance
          // Manter ordenação atual
          break;
      }
    }
    
    // Atualizar resultados
    setSearchQuery(query);
    // TODO: Implementar sistema de resultados de busca
    console.log('Busca avançada:', { query, filters, results: filtered.length });
  };
  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    if (seconds < 60) return 'agora mesmo';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} d atrás`;
    return new Date(timestamp).toLocaleDateString();
  };
  const getDateGroup = (timestamp) => {
    const now = new Date(); const date = new Date(timestamp); const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'Última hora'; if (diffInHours < 24) return 'Hoje'; if (diffInHours < 48) return 'Ontem'; if (diffInHours < 168) return 'Esta semana'; return 'Mais antigas';
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    switch(notificationFilter) {
      case 'unread': filtered = filtered.filter(n => !n.read); break;
      case 'mentions': filtered = filtered.filter(n => n.type === 'mention'); break;
      case 'answers': filtered = filtered.filter(n => n.type === 'answer'); break;
      default: break;
    }
    return filtered;
  }, [notifications, notificationFilter]);

  const groupedNotifications = useMemo(() => {
    const groups = {}; filteredNotifications.forEach(notif => { const group = getDateGroup(notif.timestamp); if (!groups[group]) groups[group] = []; groups[group].push(notif); }); return groups;
  }, [filteredNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!currentUser || !notificationSettings) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && notificationSettings.votes) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        if (randomQuestion && randomQuestion.author && randomQuestion.author.id === currentUser?.id) {
          addNotification('vote', 'Nova votação', `Sua pergunta "${randomQuestion.title.substring(0, 30)}..." recebeu um voto positivo`, 'low');
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [questions, notificationSettings?.votes]);

  const handleProfileUpdate = (field, value) => {
    setCurrentUser(prev => ({ ...prev, [field]: value }));
    addNotification('success', 'Perfil atualizado', `${field} foi atualizado com sucesso`, 'normal');
  };

  const handleSkillEndorse = (skillName) => {
    setCurrentUser(prev => ({ ...prev, skills: prev.skills.map(skill => skill.name === skillName ? { ...skill, endorsed: skill.endorsed + 1 } : skill) }));
  };

  const calculateLevel = (reputation) => {
    if (reputation < 50) return { level: 1, title: "Iniciante", color: "gray" };
    if (reputation < 100) return { level: 2, title: "Aprendiz", color: "green" };
    if (reputation < 250) return { level: 3, title: "Contribuidor", color: "blue" };
    if (reputation < 500) return { level: 4, title: "Expert", color: "purple" };
    if (reputation < 1000) return { level: 5, title: "Mestre", color: "orange" };
    return { level: 6, title: "Lenda", color: "red" };
  };

  const getUserLevel = (user) => {
    return calculateLevel(user?.reputation || 0);
  };

  const getUserProfile = (userId) => {
    const profiles = {
      1: { id: 1, name: "João Silva", username: "joaosilva", reputation: 1250, avatar: "JS", bio: "Backend Developer especializado em Node.js e microserviços.", title: "Senior Backend Developer", company: "Tech Corp", location: "Rio de Janeiro, Brasil", website: "https://joaosilva.dev", joinedAt: new Date('2022-03-10'), stats: { questions: 15, answers: 45, accepted: 18, streak: 12, reached: 3200, votes: 89, helpful: 67, bestStreak: 25, tags: 18, following: 42, followers: 38 }, badges: { gold: 1, silver: 5, bronze: 12 }, skills: [ { name: "Node.js", level: 95, endorsed: 25 }, { name: "MongoDB", level: 85, endorsed: 18 }, { name: "Docker", level: 80, endorsed: 15 } ], social: { github: "joaosilva", linkedin: "joao-silva-dev", twitter: "@joaosilva_dev" }, status: { emoji: "🚀", text: "Building awesome APIs", availability: "online" }, achievements: [ { id: 1, name: "Primeira Pergunta", icon: "❓", unlocked: true, date: new Date('2022-03-11') }, { id: 2, name: "Primeira Resposta", icon: "💬", unlocked: true, date: new Date('2022-03-12') }, { id: 3, name: "Resposta Aceita", icon: "✅", unlocked: true, date: new Date('2022-03-15') }, { id: 4, name: "100 de Reputação", icon: "💯", unlocked: true, date: new Date('2022-04-01') }, { id: 5, name: "1000 de Reputação", icon: "🏆", unlocked: true, date: new Date('2023-01-15') } ], settings: { accentColor: "green", profileVisibility: "public", showEmail: false, showLocation: true, showCompany: true, showSocial: true, showActivity: true, allowMessages: true, allowMentions: true, showOnlineStatus: true } },
      2: { id: 2, name: "Maria Santos", username: "mariasantos", reputation: 3420, avatar: "MS", bio: "Full Stack Developer | React Expert | Open Source Contributor | Speaker | Tech Writer", title: "Lead Developer", company: "Innovation Labs", location: "São Paulo, Brasil", website: "https://mariasantos.tech", joinedAt: new Date('2021-06-20'), stats: { questions: 32, answers: 128, accepted: 67, streak: 25, reached: 8500, votes: 234, helpful: 189, bestStreak: 45, tags: 32, following: 78, followers: 156 }, badges: { gold: 3, silver: 12, bronze: 28 }, skills: [ { name: "React", level: 98, endorsed: 45 }, { name: "TypeScript", level: 92, endorsed: 38 }, { name: "GraphQL", level: 85, endorsed: 22 }, { name: "Next.js", level: 88, endorsed: 28 }, { name: "AWS", level: 75, endorsed: 15 } ], social: { github: "mariasantos", linkedin: "maria-santos-dev", twitter: "@maria_codes" }, status: { emoji: "⚛️", text: "Teaching React at workshop", availability: "busy" }, achievements: [ { id: 1, name: "Primeira Pergunta", icon: "❓", unlocked: true, date: new Date('2021-06-21') }, { id: 2, name: "Primeira Resposta", icon: "💬", unlocked: true, date: new Date('2021-06-21') }, { id: 3, name: "Expert em React", icon: "⚛️", unlocked: true, date: new Date('2022-01-10') }, { id: 4, name: "1000 de Reputação", icon: "🏆", unlocked: true, date: new Date('2022-03-01') }, { id: 5, name: "Mentor", icon: "🎓", unlocked: true, date: new Date('2023-06-15') } ], settings: { accentColor: "purple", profileVisibility: "public", showEmail: false, showLocation: true, showCompany: true, showSocial: true, showActivity: true, allowMessages: true, allowMentions: true, showOnlineStatus: true } }
    };
    return profiles[userId] || { id: userId, name: `Usuário ${userId}`, username: `user${userId}`, reputation: Math.floor(Math.random() * 2000), avatar: "U" + userId, bio: "Desenvolvedor apaixonado por tecnologia", title: "Developer", company: "Tech Company", location: "Brasil", website: "", joinedAt: new Date('2023-01-01'), stats: { questions: 10, answers: 20, accepted: 5, streak: 3, reached: 500, votes: 25, helpful: 15, bestStreak: 7, tags: 8, following: 10, followers: 5 }, badges: { gold: 0, silver: 1, bronze: 3 }, skills: [], social: {}, status: { emoji: "💻", text: "Coding", availability: "online" }, achievements: [], settings: { accentColor: "blue", profileVisibility: "public", showEmail: false, showLocation: true, showCompany: true, showSocial: false, showActivity: true, allowMessages: true, allowMentions: true, showOnlineStatus: true } };
  };

  const incrementViews = (questionId) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, views: q.views + 1 } : q));
  };

  const Tag = ({ name, count, selected, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${selected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
      {name} {count && <span className="ml-1 opacity-60">×{count}</span>}
    </button>
  );

  const UserProfile = ({ user, isOwnProfile = false }) => {
    const profileUser = isOwnProfile ? currentUser : getUserProfile(viewingUserId);
    const level = calculateLevel(profileUser.reputation);
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o fórum
          </button>
        </div>
        <div className="relative">
          <div className={`h-48 md:h-64 bg-gradient-to-r ${profileUser.settings?.accentColor === 'purple' ? 'from-purple-600 to-pink-600' : profileUser.settings?.accentColor === 'green' ? 'from-green-600 to-teal-600' : profileUser.settings?.accentColor === 'red' ? 'from-red-600 to-orange-600' : profileUser.settings?.accentColor === 'orange' ? 'from-orange-600 to-yellow-600' : 'from-blue-600 to-cyan-600'} relative overflow-hidden`} style={{ backgroundImage: profileUser.bannerUrl ? `url(${profileUser.bannerUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
            {isOwnProfile && (
              <button onClick={() => setShowBannerUpload(true)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            )}
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-sm ${profileUser.status?.availability === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : profileUser.status?.availability === 'away' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : profileUser.status?.availability === 'busy' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'}`}>
                <div className={`w-2 h-2 rounded-full ${profileUser.status?.availability === 'online' ? 'bg-green-400' : profileUser.status?.availability === 'away' ? 'bg-yellow-400' : profileUser.status?.availability === 'busy' ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">{profileUser.status?.availability === 'online' ? 'Disponível' : profileUser.status?.availability === 'away' ? 'Ausente' : profileUser.status?.availability === 'busy' ? 'Ocupado' : 'Offline'}</span>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 flex-1">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${level.color === 'red' ? 'from-red-500 to-orange-600' : level.color === 'orange' ? 'from-orange-500 to-yellow-600' : level.color === 'purple' ? 'from-purple-500 to-pink-600' : level.color === 'blue' ? 'from-blue-500 to-cyan-600' : level.color === 'green' ? 'from-green-500 to-teal-600' : 'from-gray-500 to-gray-600'} p-1`}>
                      <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden">
                        {profileUser.avatarUrl ? (
                          <img src={profileUser.avatarUrl} alt={profileUser.name} className="w-full h-full object-cover" />
                        ) : (
                          profileUser.avatar
                        )}
                      </div>
                    </div>
                    <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${level.color === 'red' ? 'from-red-500 to-orange-600' : level.color === 'orange' ? 'from-orange-500 to-yellow-600' : level.color === 'purple' ? 'from-purple-500 to-pink-600' : level.color === 'blue' ? 'from-blue-500 to-cyan-600' : level.color === 'green' ? 'from-green-500 to-teal-600' : 'from-gray-500 to-gray-600'} text-white text-xs font-bold shadow-lg`}>
                      Nível {level.level}
                    </div>
                    {isOwnProfile && (
                      <button onClick={() => setShowAvatarUpload(true)} className="absolute inset-0 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <h1 className="text-3xl font-bold text-white">{profileUser.name}</h1>
                      {profileUser.status?.emoji && (<span className="text-2xl" title={profileUser.status.text}>{profileUser.status.emoji}</span>)}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">@{profileUser.username}</p>
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${level.color === 'red' ? 'from-red-500/20 to-orange-600/20 text-orange-400' : level.color === 'orange' ? 'from-orange-500/20 to-yellow-600/20 text-yellow-400' : level.color === 'purple' ? 'from-purple-500/20 to-pink-600/20 text-purple-400' : level.color === 'blue' ? 'from-blue-500/20 to-cyan-600/20 text-blue-400' : level.color === 'green' ? 'from-green-500/20 to-teal-600/20 text-green-400' : 'from-gray-500/20 to-gray-600/20 text-gray-400'}`}> {level.title}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-yellow-500 font-bold">⭐ {profileUser.reputation}</span>
                    </div>
                    {profileUser.title && (<p className="text-white font-medium mb-2">{profileUser.title}</p>)}
                    {profileUser.bio && (<p className="text-gray-300 mb-4 max-w-2xl">{profileUser.bio}</p>)}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      {profileUser.company && profileUser.settings?.showCompany && (<span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{profileUser.company}</span>)}
                      {profileUser.location && profileUser.settings?.showLocation && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profileUser.location}</span>)}
                      {profileUser.website && (<a href={profileUser.website} className="flex items-center gap-1 hover:text-blue-400"><Globe className="w-4 h-4" />{profileUser.website.replace(/https?:\/\//, '')}</a>)}
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Membro desde {new Date(profileUser.joinedAt).toLocaleDateString()}</span>
                    </div>
                    {profileUser.settings?.showSocial && profileUser.social && (
                      <div className="flex gap-3">
                        {profileUser.social.github && (<a href={`https://github.com/${profileUser.social.github}`} className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>)}
                        {profileUser.social.linkedin && (<a href={`https://linkedin.com/in/${profileUser.social.linkedin}`} className="text-gray-400 hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5" /></a>)}
                        {profileUser.social.twitter && (<a href={`https://twitter.com/${profileUser.social.twitter}`} className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 justify-center md:justify-end">
                    {isOwnProfile ? (
                      <>
                        <button onClick={() => setEditingProfile(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"><Edit2 className="w-4 h-4" />Editar Perfil</button>
                        <button onClick={() => setProfileTheme(prev => prev === 'dark' ? 'light' : 'dark')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">{profileTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
                      </>
                    ) : (
                      <>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Seguir</button>
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Mensagem</button>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-700 rounded-lg p-3"><div className="text-2xl font-bold text-white">{profileUser.stats?.questions || 0}</div><div className="text-xs text-gray-400">Perguntas</div></div>
                    <div className="bg-gray-700 rounded-lg p-3"><div className="text-2xl font-bold text-white">{profileUser.stats?.answers || 0}</div><div className="text-xs text-gray-400">Respostas</div></div>
                    <div className="bg-gray-700 rounded-lg p-3"><div className="text-2xl font-bold text-green-500">{profileUser.stats?.accepted || 0}</div><div className="text-xs text-gray-400">Aceitas</div></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-700 pt-4">
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Visão Geral', icon: BarChart },
                    { id: 'activity', label: 'Atividade', icon: Activity },
                    { id: 'questions', label: 'Perguntas', icon: MessageSquare },
                    { id: 'answers', label: 'Respostas', icon: MessageCircleIcon },
                    { id: 'achievements', label: 'Conquistas', icon: Trophy },
                    { id: 'skills', label: 'Habilidades', icon: Zap },
                    { id: 'stats', label: 'Estatísticas', icon: PieChart }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setProfileTab(tab.id)} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${profileTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'}`}>
                      <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {profileTab === 'questions' && (
                  <ProfileRecentQuestions
                    questions={questions}
                    profileUserId={profileUser.id}
                    onOpenQuestion={(q) => { setSelectedQuestion(q); setShowProfile(false); }}
                  />
                )}
                {profileTab === 'answers' && (
                  <ProfileRecentAnswers
                    questions={questions}
                    profileUserId={profileUser.id}
                    onOpenQuestionById={(questionId) => { const question = questions.find(q => q.id === questionId); setSelectedQuestion(question); setShowProfile(false); }}
                  />
                )}
              </div>
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" />Rede</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-gray-400">Seguindo</span><span className="text-white font-semibold">{profileUser.stats?.following || 0}</span></div>
                    <div className="flex items-center justify-between"><span className="text-gray-400">Seguidores</span><span className="text-white font-semibold">{profileUser.stats?.followers || 0}</span></div>
                  </div>
                  <div className="flex -space-x-2 mt-4">
                    {['MS', 'JD', 'AC', 'PL', 'RF'].map((avatar, index) => (
                      <div key={index} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800">{avatar}</div>
                    ))}
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800">+{(profileUser.stats?.followers || 0) - 5}</div>
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" />Privacidade</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-300">Perfil público</span><input type="checkbox" checked={profileUser.settings?.profileVisibility === 'public'} onChange={(e) => handleProfileUpdate('settings', { ...profileUser.settings, profileVisibility: e.target.checked ? 'public' : 'private' })} className="rounded bg-gray-700 border-gray-600 text-blue-500" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-300">Mostrar e-mail</span><input type="checkbox" checked={profileUser.settings?.showEmail} onChange={(e) => handleProfileUpdate('settings', { ...profileUser.settings, showEmail: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-blue-500" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-300">Permitir mensagens</span><input type="checkbox" checked={profileUser.settings?.allowMessages} onChange={(e) => handleProfileUpdate('settings', { ...profileUser.settings, allowMessages: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-blue-500" /></label>
                      <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-300">Status online</span><input type="checkbox" checked={profileUser.settings?.showOnlineStatus} onChange={(e) => handleProfileUpdate('settings', { ...profileUser.settings, showOnlineStatus: e.target.checked })} className="rounded bg-gray-700 border-gray-600 text-blue-500" /></label>
                    </div>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-purple-500" />Links Rápidos</h3>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><BookOpen className="w-4 h-4" />Blog pessoal</a>
                    <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><Code className="w-4 h-4" />Projetos</a>
                    <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"><Coffee className="w-4 h-4" />Buy me a coffee</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ question, detailed = false }) => {
    const [expanded, setExpanded] = useState(detailed);
    useEffect(() => { if (detailed) incrementViews(question.id); }, []);
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border transition-all ${detailed ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => handleVoteQuestion(question.id, 1)} className={`p-1 rounded hover:bg-gray-700 transition-colors ${question.userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}>
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="text-xl font-semibold text-white">{question.votes}</span>
            <button onClick={() => handleVoteQuestion(question.id, -1)} className={`p-1 rounded hover:bg-gray-700 transition-colors ${question.userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}>
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => { if (!detailed) { setSelectedQuestion(question); incrementViews(question.id); setShowQuickAnswer(null); } }}>
              {question.title}
              {question.hasAcceptedAnswer && (<CheckCircle className="inline-block ml-2 w-5 h-5 text-green-500" />)}
              {question.answers.length === 0 && (<span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-normal">Sem respostas</span>)}
            </h3>
            {!detailed && (<div className="text-gray-300 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{question.content}</div>)}
            {detailed && (<div className="text-gray-300 mb-4 whitespace-pre-wrap">{question.content}</div>)}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map(tag => (
                <Tag key={tag} name={tag} selected={selectedTags.includes(tag)} onClick={() => { setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{question.answers.reduce((total, ans) => total + 1 + (ans.replies?.length || 0), 0)} respostas</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(question.createdAt).toLocaleDateString()}</span>
                <span>{question.views} visualizações</span>
                {!detailed && (
                  <button onClick={(e) => { e.stopPropagation(); setShowQuickAnswer(question.id); }} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 hover:bg-gray-700 px-2 py-1 rounded" title="Responder rapidamente sem abrir a pergunta completa">
                    <MessageCircleIcon className="w-4 h-4" />Responder
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setShowProfile(true); setViewingUserId(question.author.id); }} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform">{question.author.avatar}</button>
                <div>
                  <button onClick={(e) => { e.stopPropagation(); setShowProfile(true); setViewingUserId(question.author.id); }} className="text-white hover:text-blue-400 transition-colors">{question.author.name}</button>
                  <div className="text-xs">⭐ {question.author.reputation}</div>
                </div>
              </div>
            </div>
            {showQuickAnswer === question.id && !detailed && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="mb-3">
                  <div className="text-sm text-gray-300 mb-2">Responder rapidamente:</div>
                  <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" rows="4" placeholder="Digite sua resposta... (Markdown suportado)" onClick={(e) => e.stopPropagation()} />
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleCreateAnswer(question.id); setShowQuickAnswer(null); }} className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">Publicar Resposta</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowQuickAnswer(null); setNewAnswer(""); }} className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors">Cancelar</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedQuestion(question); setShowQuickAnswer(null); setNewAnswer(""); incrementViews(question.id); }} className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">Ver Pergunta Completa</button>
                </div>
              </div>
            )}
            {detailed && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between border-t border-gray-600 pt-6">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">{question.answers.reduce((total, ans) => total + 1 + (ans.replies?.length || 0), 0)}</span><span>Respostas</span>{question.answers.length > 0 && question.answers.some(a => a.isAccepted) && (<CheckCircle className="w-5 h-5 text-green-500" title="Tem resposta aceita" />)}</h4>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="votes">
                      <option value="votes">Mais votadas</option>
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigas</option>
                    </select>
                  </div>
                </div>
                {question.answers.length > 0 && !question.hasAcceptedAnswer && !showAnswerForm && (
                  <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 text-yellow-200"><p className="text-sm">💡 Esta pergunta ainda não tem uma resposta aceita. Sua contribuição pode ser a solução que o autor procura!</p></div>
                )}
                {!showAnswerForm && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg">
                    <h3 className="text-white font-semibold text-lg mb-2">Conhece a resposta?</h3>
                    <p className="text-gray-200 mb-4">Ajude a comunidade compartilhando seu conhecimento sobre este tema.</p>
                    <button onClick={() => setShowAnswerForm(question.id)} className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold">✍️ Escrever Resposta</button>
                  </div>
                )}
                {showAnswerForm === question.id && (
                  <div className="bg-gray-700 rounded-lg p-6 border-2 border-blue-500">
                    <h3 className="text-lg font-semibold text-white mb-4">Sua Resposta</h3>
                    <div className="mb-4">
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setShowMarkdownPreview(false)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${!showMarkdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>✏️ Escrever</button>
                        <button onClick={() => setShowMarkdownPreview(true)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${showMarkdownPreview ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>👁️ Visualizar</button>
                        <div className="flex-1 text-right"><span className={`text-xs ${newAnswer.length < 30 ? 'text-gray-400' : newAnswer.length < 100 ? 'text-yellow-400' : 'text-green-400'}`}>{newAnswer.length} caracteres{newAnswer.length < 30 && ' (mínimo recomendado: 30)'}</span></div>
                      </div>
                      {!showMarkdownPreview ? (
                        <>
                          <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm" rows="12" placeholder={"Digite sua resposta aqui...\n\nFormatação suportada:\n• **texto em negrito**\n• *texto em itálico*\n• `código inline`\n• ```javascript\n  blocos de código\n  ```\n• @menções para usuários\n• [texto do link](url)\n\nSeja claro, objetivo e forneça exemplos quando possível."} />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button onClick={() => { const el = document.querySelector('textarea'); if (!el) return; const start = el.selectionStart; const end = el.selectionEnd; const text = newAnswer; setNewAnswer(text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end)); }} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700" title="Negrito"><strong>B</strong></button>
                            <button onClick={() => { const el = document.querySelector('textarea'); if (!el) return; const start = el.selectionStart; const end = el.selectionEnd; const text = newAnswer; setNewAnswer(text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end)); }} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700" title="Itálico"><em>I</em></button>
                            <button onClick={() => { const code = "```javascript\n// seu código aqui\n```"; setNewAnswer(newAnswer + (newAnswer ? '\n\n' : '') + code); }} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700" title="Bloco de código">{'</>'}</button>
                            <button onClick={() => { const link = "[texto do link](https://exemplo.com)"; setNewAnswer(newAnswer + link); }} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700" title="Link">🔗</button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-800 rounded-lg p-6 min-h-[300px]">
                          <div className="prose prose-invert max-w-none">
                            {newAnswer ? (<div dangerouslySetInnerHTML={{ __html: renderMarkdown(newAnswer) }} />) : (<p className="text-gray-500 italic">Nada para visualizar ainda...</p>)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 mb-4"><p className="text-xs text-gray-400">💡 <strong>Dicas para uma boa resposta:</strong> Seja específico, forneça exemplos de código quando relevante, cite fontes se necessário, e explique o &quot;porquê&quot; além do &quot;como&quot;.</p></div>
                    <div className="flex gap-3">
                      <button onClick={() => handleCreateAnswer(question.id, replyingTo)} disabled={!newAnswer.trim()} className={`px-6 py-3 rounded-lg font-semibold transition-all ${newAnswer.trim() ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>📤 Publicar Resposta</button>
                      <button onClick={() => { setShowAnswerForm(null); setNewAnswer(""); setReplyingTo(null); setShowMarkdownPreview(false); }} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold">Cancelar</button>
                    </div>
                  </div>
                )}
                {showAnswerForm === question.id && newAnswer.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4"><div className="flex space-x-1"><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div></div><span>{currentUser?.name} está digitando uma resposta...</span></div>
                )}
                {question.answers.length === 0 ? (
                  <div className="bg-gray-700 rounded-lg p-8 text-center"><MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" /><h3 className="text-xl font-semibold text-white mb-2">Ainda não há respostas</h3><p className="text-gray-400 mb-6">Seja o primeiro a ajudar! Compartilhe seu conhecimento e ganhe reputação.</p>{!showAnswerForm && (<button onClick={() => setShowAnswerForm(question.id)} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105 font-semibold">🎯 Ser o Primeiro a Responder</button>)}</div>
                ) : (
                  question.answers
                    .sort((a, b) => { if (a.isAccepted) return -1; if (b.isAccepted) return 1; return b.votes - a.votes; })
                    .map(answer => (
                      <div key={answer.id} className={`bg-gray-700 rounded-lg p-4 ${answer.isAccepted ? 'ring-2 ring-green-500' : ''}`}>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <button onClick={() => handleVoteAnswer(question.id, answer.id, 1)} className={`p-1 rounded hover:bg-gray-600 transition-colors ${answer.userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}><ChevronUp className="w-5 h-5" /></button>
                            <span className="text-lg font-semibold text-white">{answer.votes}</span>
                            <button onClick={() => handleVoteAnswer(question.id, answer.id, -1)} className={`p-1 rounded hover:bg-gray-600 transition-colors ${answer.userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}><ChevronDown className="w-5 h-5" /></button>
                            {answer.isAccepted && (<CheckCircle className="w-6 h-6 text-green-500 mt-2" />)}
                            {!answer.isAccepted && question.author.id === currentUser?.id && (
                              <button onClick={() => handleAcceptAnswer(question.id, answer.id)} className="p-1 rounded hover:bg-gray-600 transition-colors text-gray-400 hover:text-green-500" title="Aceitar resposta"><CheckCircle className="w-5 h-5" /></button>
                            )}
                          </div>
                          <div className="flex-1">
                            {editingAnswer === answer.id ? (
                              <div className="mb-4">
                                <textarea value={answer.content} onChange={(e) => { const newContent = e.target.value; setQuestions(prev => prev.map(q => { if (q.id === question.id) { return { ...q, answers: q.answers.map(a => a.id === answer.id ? { ...a, content: newContent } : a) }; } return q; })); }} className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" rows="6" />
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleEditAnswer(question.id, answer.id, answer.content)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Salvar</button>
                                  <button onClick={() => setEditingAnswer(null)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500">Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-200 mb-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(answer.content) }} />
                            )}
                            {answer.lastEditedAt && (<div className="text-xs text-gray-500 mb-2">Editado em {new Date(answer.lastEditedAt).toLocaleString()}</div>)}
                            <div className="flex items-center justify-between text-sm mb-4">
                              <div className="flex items-center gap-4 text-gray-400">
                                <button onClick={() => setReplyingTo(answer.id)} className="hover:text-white transition-colors flex items-center gap-1"><MessageSquare className="w-4 h-4" />Responder</button>
                                {answer.author.id === currentUser?.id && (<button onClick={() => setEditingAnswer(answer.id)} className="hover:text-white transition-colors flex items-center gap-1"><Edit2 className="w-4 h-4" />Editar</button>)}
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(answer.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{answer.author.avatar}</div>
                                <div>
                                  <div className="text-white text-sm">{answer.author.name}</div>
                                  <div className="text-xs text-gray-400">⭐ {answer.author.reputation}</div>
                                </div>
                              </div>
                            </div>
                            {replyingTo === answer.id && (
                              <div className="bg-gray-800 rounded-lg p-3 mb-4">
                                <div className="text-sm text-gray-400 mb-2">Respondendo para @{answer.author.name}</div>
                                <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} className="w-full px-3 py-2 bg-gray-900 text-white rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" rows="4" placeholder="Digite sua resposta..." />
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleCreateAnswer(question.id, answer.id)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Responder</button>
                                  <button onClick={() => { setReplyingTo(null); setNewAnswer(""); }} className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600">Cancelar</button>
                                </div>
                              </div>
                            )}
                            {answer.replies && answer.replies.length > 0 && (
                              <div className="ml-8 mt-4 space-y-3 border-l-2 border-gray-600 pl-4">
                                {answer.replies.map(reply => (
                                  <div key={reply.id} className="bg-gray-800 rounded p-3">
                                    <div className="text-sm text-gray-300 mb-2" dangerouslySetInnerHTML={{ __html: renderMarkdown(reply.content) }} />
                                    <div className="flex items-center justify-between text-xs text-gray-400"><span>{new Date(reply.createdAt).toLocaleDateString()}</span><div className="flex items-center gap-1"><div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs">{reply.author.avatar}</div><span>{reply.author.name}</span></div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {answer.comments.length > 0 && (
                              <div className="mt-4 space-y-2 border-t border-gray-600 pt-4">
                                {answer.comments.map(comment => (
                                  <div key={comment.id} className="text-sm text-gray-400"><span className="text-gray-300">{comment.content}</span> — <span className="ml-1">{comment.author}</span><span className="ml-2 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span></div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2">
                              <button onClick={() => { const comment = prompt("Adicionar comentário:"); if (comment) { handleAddComment(question.id, answer.id, comment); } }} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">adicionar comentário</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown')) setShowNotifications(false);
      if (showNotificationSettings && !event.target.closest('.notification-settings')) setShowNotificationSettings(false);
      if (showMobileMenu && !event.target.closest('.mobile-menu')) setShowMobileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showNotificationSettings, showMobileMenu]);

  useEffect(() => {
    if (newAnswerId) {
      setTimeout(() => {
        const element = document.getElementById(`answer-${newAnswerId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [newAnswerId]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <style>{`
        @keyframes bellRing { 0%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(10deg); } 20%, 40% { transform: rotate(-10deg); } 50% { transform: rotate(5deg); } 60% { transform: rotate(-5deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .bell-ring { animation: bellRing 0.5s ease-in-out; }
        .notification-slide-in { animation: slideInRight 0.3s ease-out; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo com animação */}
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {setActiveTab("questions"); setSelectedQuestion(null); setShowProfile(false);}}>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:via-yellow-300 group-hover:to-orange-400 transition-all duration-300">
                  DevForum
                </h1>
              </div>
              
              {/* Navegação principal */}
              <nav className="hidden lg:flex gap-1 items-center bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm border border-gray-700/30">
                <button 
                  onClick={() => {setActiveTab("questions"); setSelectedQuestion(null); setShowProfile(false);}} 
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${
                    activeTab === "questions" && !showProfile 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Perguntas
                  {questions.filter(q => q.answers.length === 0).length > 0 && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold animate-pulse">
                      {questions.filter(q => q.answers.length === 0).length}
                    </span>
                  )}
                </button>
                

                

                
                <button 
                  onClick={() => {setActiveTab("chat"); setSelectedQuestion(null); setShowProfile(false);}} 
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium relative ${
                    activeTab === "chat" && !showProfile 
                      ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <MessageCircleIcon className="w-4 h-4" />
                  Chat
                  {chatConnected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-800 animate-pulse"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => {setShowProfile(true); setViewingUserId(currentUser?.id);}} 
                  className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${
                    showProfile 
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Perfil
                </button>
              </nav>
              
              {/* Menu Mobile */}
              <div className="lg:hidden mobile-menu">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              
              
              {/* Barra de Busca */}
              <div className="relative flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Buscar perguntas..." 
                    className="pl-10 pr-4 py-2.5 bg-gray-800/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none w-64 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 focus:bg-gray-800 focus:border-blue-500/50" 
                  />
                </div>
                <button
                  onClick={() => setShowAdvancedSearch(true)}
                  className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600"
                  title="Busca avançada"
                >
                  <Filter className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>
              
              {/* Controles da aplicação */}
              <div className="flex items-center gap-1 bg-gray-800/30 rounded-2xl p-1 backdrop-blur-sm border border-gray-700/30">


                <button
                  onClick={() => setShowSettingsPage(true)}
                  className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 group"
                  title="Configurações (Alt+S)"
                >
                  <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                {/* Notificações */}
                <div className="relative notifications-dropdown">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)} 
                    className={`relative p-2.5 text-gray-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-gray-700/50 group ${unreadCount > 0 ? 'bell-ring' : ''}`} 
                    title={`Notificações (${unreadCount} não lidas) - Alt+N`}
                  >
                    <Bell className={`w-5 h-5 group-hover:scale-110 transition-transform ${unreadCount > 0 ? 'text-yellow-400' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold animate-pulse shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Perfil do usuário */}
              <div className="flex items-center gap-3 bg-gray-800/30 rounded-2xl p-2 backdrop-blur-sm border border-gray-700/30">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{currentUser?.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span> {currentUser?.reputation}
                  </div>
                </div>
                <button 
                  onClick={() => { setShowProfile(true); setViewingUserId(currentUser?.id); }} 
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer border-2 border-gray-700/50" 
                  title="Ver perfil"
                >
                  {currentUser?.avatar}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Mobile Dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden bg-gray-800/95 backdrop-blur-md border-t border-gray-700/50">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => {setActiveTab("questions"); setSelectedQuestion(null); setShowProfile(false); setShowMobileMenu(false);}} 
                  className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 font-medium ${
                    activeTab === "questions" && !showProfile 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Perguntas
                  {questions.filter(q => q.answers.length === 0).length > 0 && (
                    <span className="ml-auto px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                      {questions.filter(q => q.answers.length === 0).length}
                    </span>
                  )}
                </button>
                

                

                
                <button 
                  onClick={() => {setActiveTab("chat"); setSelectedQuestion(null); setShowProfile(false); setShowMobileMenu(false);}} 
                  className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 font-medium ${
                    activeTab === "chat" && !showProfile 
                      ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <MessageCircleIcon className="w-5 h-5" />
                  Chat
                  {chatConnected && (
                    <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => {setShowProfile(true); setViewingUserId(currentUser?.id); setShowMobileMenu(false);}} 
                  className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 font-medium ${
                    showProfile 
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Meu Perfil
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>
      {showProfile ? (
        <UserProfile user={viewingUserId === currentUser?.id ? currentUser : null} isOwnProfile={viewingUserId === currentUser?.id} />
      ) : (
        <main className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <aside className="w-64 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-4">Estatísticas</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Total de perguntas</span><span className="text-white font-semibold">{questions.length}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Respostas</span><span className="text-white font-semibold">{questions.reduce((acc, q) => acc + q.answers.length + q.answers.reduce((sum, a) => sum + (a.replies?.length || 0), 0), 0)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Usuários ativos</span><span className="text-white font-semibold">147</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Tags populares</span><span className="text-white font-semibold">{allTags.length}</span></div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-4">Tags Populares</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map(tag => (<Tag key={tag.name} name={tag.name} count={tag.count} selected={selectedTags.includes(tag.name)} onClick={() => { setSelectedTags(prev => prev.includes(tag.name) ? prev.filter(t => t !== tag.name) : [...prev, tag.name]); }} />))}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-4">Suas Conquistas</h3>
                  <div className="flex gap-3">
                    <div className="text-center"><div className="text-yellow-500 text-2xl">🥇</div><div className="text-xs text-gray-400">{currentUser?.badges?.gold || 0}</div></div>
                    <div className="text-center"><div className="text-gray-300 text-2xl">🥈</div><div className="text-xs text-gray-400">{currentUser?.badges?.silver || 0}</div></div>
                    <div className="text-center"><div className="text-orange-600 text-2xl">🥉</div><div className="text-xs text-gray-400">{currentUser?.badges?.bronze || 0}</div></div>
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex-1">
              {selectedQuestion && !showProfile && (
                <div>
                  <div className="mb-6">
                    <button onClick={() => setSelectedQuestion(null)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-4 group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />Voltar para perguntas</button>
                    <h1 className="text-3xl font-bold text-white mb-2">{selectedQuestion.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400"><span>Perguntado em {new Date(selectedQuestion.createdAt).toLocaleDateString()}</span><span>Visualizado {selectedQuestion.views} vezes</span></div>
                  </div>
                  <QuestionCard question={selectedQuestion} detailed={true} />
                </div>
              )}
              {!selectedQuestion && activeTab === "questions" && !showProfile && (
                <FeedView 
                  questions={filteredQuestions}
                  currentUser={currentUser}
                  onVote={handleVoteQuestion}
                  onCreateQuestion={handleCreateQuestion}
                  onSelectQuestion={setSelectedQuestion}
                  onSelectTag={(tag) => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag) 
                        : [...prev, tag]
                    );
                  }}
                  selectedTags={selectedTags}
                />
              )}
              {activeTab === "chat" && !showProfile && (
                <ChatView currentUser={currentUser} />
              )}
            </div>
          </div>
        </main>
      )}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toastNotifications.map((toast, index) => (
          <div key={toast.toastId} className="notification-slide-in pointer-events-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-sm cursor-pointer hover:scale-105 transition-transform" style={{ animation: `slideInRight 0.3s ease-out`, animationDelay: `${index * 0.1}s` }} onClick={() => { setToastNotifications(prev => prev.filter(t => t.toastId !== toast.toastId)); markNotificationAsRead(toast.id); setShowNotifications(true); }}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${toast.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>{toast.avatar}</div>
              <div className="flex-1"><p className="text-sm font-semibold text-white">{toast.title}</p><p className="text-xs text-gray-400 mt-1">{toast.message}</p></div>
              <button onClick={(e) => { e.stopPropagation(); setToastNotifications(prev => prev.filter(t => t.toastId !== toast.toastId)); }} className="text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      
      

      {/* Centro de Notificações */}
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onClearAll={clearAllNotifications}
      />

      {/* Busca Avançada */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        questions={questions}
        users={[]} // TODO: Implementar lista de usuários
        tags={[]} // TODO: Implementar lista de tags
      />

      {/* Sistema de Toast */}
      <ToastContainer 
        toasts={toasts} 
        onClose={removeToast} 
      />

      {/* Página de Configurações */}
      {showSettingsPage && (
        <SettingsPage 
          onBack={() => setShowSettingsPage(false)} 
        />
      )}






    </div>
  );
};

export default StackOverflowCloneMain;
