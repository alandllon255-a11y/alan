# Sistema de Chat com WebSocket - Guia de Implementação

## ✅ O que foi implementado

### 1. Servidor de Chat (Socket.IO)
- **Arquivo**: `server/chatServer.js`
- **Porta**: 3001
- **Funcionalidades**:
  - Conexão/desconexão de usuários
  - Envio de mensagens em tempo real
  - Indicador de digitação
  - Status online/offline
  - Histórico de mensagens
  - Notificações push

### 2. Serviço de Chat (Frontend)
- **Arquivo**: `src/services/chatService.js`
- **Funcionalidades**:
  - Gerenciamento de conexão WebSocket
  - Sistema de callbacks para eventos
  - Reconexão automática
  - Som de notificação

### 3. Hook Customizado
- **Arquivo**: `src/hooks/useChat.js`
- **Funcionalidades**:
  - Estado do chat centralizado
  - Contadores de mensagens não lidas
  - Indicadores de digitação
  - Permissões de notificação

### 4. Componente de Chat
- **Arquivo**: `src/components/chat/ChatView.jsx`
- **Funcionalidades**:
  - Interface completa de chat
  - Lista de usuários online
  - Busca de conversas
  - Envio de mensagens
  - Indicador de digitação animado
  - Emojis
  - Preparado para envio de arquivos

## 🚀 Como iniciar o sistema

### Opção 1: Servidores separados

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Servidor de Chat
npm run chat-server
```

### Opção 2: Tudo junto (recomendado)

```bash
npm run dev:all
```

## 📡 Como testar

1. Acesse http://localhost:5173
2. Clique em "Chat" no menu superior
3. Digite um nome de usuário
4. Comece a conversar!

### Teste com múltiplos usuários

1. Abra várias abas do navegador
2. Entre com nomes diferentes em cada aba
3. Veja as mensagens sendo sincronizadas em tempo real

## 🔧 Configurações

### Mudar porta do servidor de chat

Em `server/chatServer.js`:
```javascript
const PORT = process.env.PORT || 3001; // Mude aqui
```

### Mudar URL do servidor no frontend

Em `src/services/chatService.js`:
```javascript
this.socket = io('http://localhost:3001', { // Mude aqui
```

## 🎨 Personalização

### Adicionar novos emojis

Em `src/components/chat/ChatView.jsx`:
```javascript
const emojis = ['😀', '😂', '❤️', '👍', '👎', '🙏', '🎉', '🔥', '💯', '🤔']; // Adicione mais aqui
```

### Mudar cores do chat

O componente usa Tailwind CSS. Principais classes:
- Mensagem própria: `bg-blue-600`
- Mensagem de outros: `bg-gray-700`
- Avatar bot: `from-purple-500 to-pink-600`

## 🔐 Segurança (Produção)

Para usar em produção, adicione:

1. **Autenticação JWT**
```javascript
// Em chatServer.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verificar token JWT aqui
  next();
});
```

2. **Rate Limiting**
```javascript
const rateLimiter = new Map();
// Limitar mensagens por usuário
```

3. **Validação de Mensagens**
```javascript
// Sanitizar HTML, limitar tamanho, etc.
```

## 📊 Próximas melhorias

1. **Persistência de Dados**
   - Integrar MongoDB ou PostgreSQL
   - Salvar histórico de conversas

2. **Recursos Avançados**
   - Envio de arquivos/imagens
   - Mensagens de voz
   - Videochamadas
   - Reações a mensagens

3. **Salas de Chat**
   - Criar salas por tópico
   - Chat público vs privado
   - Moderação

4. **Integrações**
   - Webhooks
   - Bots automatizados
   - APIs externas

## 🐛 Troubleshooting

### Erro: "Porta já em uso"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Erro: "CORS bloqueado"
Verifique em `server/chatServer.js`:
```javascript
cors: {
  origin: "http://localhost:5173", // Deve corresponder ao frontend
}
```

### Chat não conecta
1. Verifique se o servidor está rodando
2. Verifique o console do navegador
3. Verifique a URL em `chatService.js`

## 📝 Estrutura de dados

### Mensagem
```javascript
{
  id: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  content: string,
  timestamp: ISO string,
  read: boolean
}
```

### Usuário Online
```javascript
{
  id: string,
  name: string,
  avatar: string,
  status: 'online' | 'offline'
}
```

## 🎉 Conclusão

O sistema de chat está completo e funcionando! Com WebSocket real, notificações, indicadores de digitação e uma interface moderna. Pronto para ser expandido com novos recursos conforme necessário.
