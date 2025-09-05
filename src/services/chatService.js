import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.messageCallbacks = [];
    this.statusCallbacks = [];
    this.typingCallbacks = [];
    this.notificationCallbacks = [];
    this.rateLimitCallbacks = [];
  }

  // Conectar ao servidor
  connect(userId, userName) {
    return new Promise((resolve, reject) => {
      // Se já estiver conectado com o mesmo usuário, não reconectar
      if (this.socket && this.socket.connected && this.currentUser?.id === userId) {
        resolve();
        return;
      }

      if (this.socket) {
        this.disconnect();
      }

      this.currentUser = { id: userId, name: userName };
      this.socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Configurar listeners
      this.setupSocketListeners();

      // Aguardar conexão antes de emitir join
      this.socket.on('connect', () => {
        console.log('✅ Conectado ao servidor de chat');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro ao conectar ao servidor de chat:', error);
        reject(error);
      });

      // Emitir evento de join após conectar
      this.socket.on('connect', () => {
        this.socket.emit('join', { userId, userName });
      });
    });
  }

  // Configurar listeners do socket
  setupSocketListeners() {
    // Receber nova mensagem
    this.socket.on('newMessage', (message) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Atualizações de status de usuário
    this.socket.on('userStatusUpdate', (data) => {
      this.statusCallbacks.forEach(callback => callback(data));
    });

    // Usuários online
    this.socket.on('onlineUsers', (users) => {
      this.statusCallbacks.forEach(callback => callback({ type: 'onlineUsers', users }));
    });

    // Indicador de digitação
    this.socket.on('userTyping', (data) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    // Notificação de nova mensagem
    this.socket.on('messageNotification', (data) => {
      this.notificationCallbacks.forEach(callback => callback(data));
      
      // Tocar som de notificação
      this.playNotificationSound();
    });

    // Evento de rate limit do servidor
    this.socket.on('rateLimited', (data) => {
      this.rateLimitCallbacks.forEach(cb => cb(data));
      try {
        const ev = new CustomEvent('chat-rate-limit', { detail: { type: 'rateLimited', retryAfterMs: data?.retryAfterMs } });
        window.dispatchEvent(ev);
      } catch (err) {
        console.warn('Failed to dispatch chat-rate-limit event', err);
      }
    });

    // Histórico de mensagens
    this.socket.on('messageHistory', (messages) => {
      this.messageCallbacks.forEach(callback => callback({ type: 'history', messages }));
    });

    // Mensagem lida
    this.socket.on('messageRead', (data) => {
      this.messageCallbacks.forEach(callback => callback({ type: 'read', ...data }));
    });

    // Eventos de conexão
    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado do servidor de chat');
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Reconectado ao servidor de chat');
      if (this.currentUser) {
        this.socket.emit('join', this.currentUser);
      }
    });
  }

  // Entrar em uma sala de conversa
  joinRoom(partnerId) {
    if (this.socket) {
      this.socket.emit('joinRoom', { partnerId });
    }
  }

  // Enviar mensagem
  sendMessage(receiverId, content) {
    if (this.socket && content.trim()) {
      this.socket.emit('sendMessage', { receiverId, content });
      return true;
    }
    return false;
  }

  // Enviar indicador de digitação
  sendTyping(receiverId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { receiverId, isTyping });
    }
  }

  // Marcar mensagem como lida
  markAsRead(messageId, roomKey) {
    if (this.socket) {
      this.socket.emit('markAsRead', { messageId, roomKey });
    }
  }

  // Registrar callbacks
  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onStatusUpdate(callback) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onNotification(callback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  onRateLimited(callback) {
    this.rateLimitCallbacks.push(callback);
    return () => {
      this.rateLimitCallbacks = this.rateLimitCallbacks.filter(cb => cb !== callback);
    };
  }

  // Tocar som de notificação
  playNotificationSound() {
    try {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    } catch (error) {
      console.error('Erro ao tocar som de notificação:', error);
    }
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Verificar se está conectado
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Exportar instância única (singleton)
export default new ChatService();
