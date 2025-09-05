import { useState, useEffect, useCallback, useRef } from 'react';
import chatService from '../services/chatService';
const BACKEND_URL = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:4000';

export const useChat = (currentUserId, currentUserName, authToken) => {
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const typingTimers = useRef({});

  // Conectar ao chat
  useEffect(() => {
    let isMounted = true;
    
    if (currentUserId && currentUserName) {
      chatService.connect(currentUserId, currentUserName, authToken).then(() => {
        if (isMounted) {
          setIsConnected(true);
        }
      });
    }

    return () => {
      isMounted = false;
      chatService.disconnect();
      setIsConnected(false);
    };
  }, [currentUserId, currentUserName, authToken]);

  // Configurar listeners
  useEffect(() => {
    // Listener para mensagens
    const unsubscribeMessage = chatService.onMessage((data) => {
      if (data.type === 'history') {
        // Carregar histórico de mensagens
        const roomKey = getRoomKey(currentUserId, data.messages[0]?.senderId === currentUserId 
          ? data.messages[0]?.receiverId 
          : data.messages[0]?.senderId);
        
        setMessages(prev => ({
          ...prev,
          [roomKey]: data.messages
        }));
      } else if (data.type === 'read') {
        // Marcar mensagem como lida
        setMessages(prev => {
          const newMessages = { ...prev };
          Object.keys(newMessages).forEach(key => {
            newMessages[key] = newMessages[key].map(msg => 
              msg.id === data.messageId ? { ...msg, read: true } : msg
            );
          });
          return newMessages;
        });
      } else {
        // Nova mensagem
        const roomKey = getRoomKey(data.senderId, data.receiverId);
        setMessages(prev => ({
          ...prev,
          [roomKey]: [...(prev[roomKey] || []), data]
        }));

        // Atualizar contador de não lidas se não for mensagem própria
        if (data.senderId !== currentUserId) {
          setUnreadCounts(prev => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1
          }));
        }
      }
    });

    // Listener para status de usuários
    const unsubscribeStatus = chatService.onStatusUpdate((data) => {
      if (data.type === 'onlineUsers') {
        setOnlineUsers(data.users);
      } else {
        // Atualizar status de um usuário específico
        setOnlineUsers(prev => prev.map(user => 
          user.id === data.userId ? { ...user, status: data.status } : user
        ));
      }
    });

    // Listener para indicador de digitação
    const unsubscribeTyping = chatService.onTyping((data) => {
      const { userId, userName, isTyping } = data;
      
      setTypingUsers(prev => ({
        ...prev,
        [userId]: isTyping ? userName : undefined
      }));

      // Limpar indicador após 3 segundos
      if (isTyping) {
        if (typingTimers.current[userId]) {
          clearTimeout(typingTimers.current[userId]);
        }
        
        typingTimers.current[userId] = setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: undefined
          }));
        }, 3000);
      }
    });

    // Listener para notificações
    const unsubscribeNotification = chatService.onNotification((data) => {
      // Mostrar notificação do navegador se permitido
      if (Notification.permission === 'granted') {
        new Notification(`Nova mensagem de ${data.senderName}`, {
          body: data.message,
          icon: '/favicon.svg',
          tag: `message-${data.senderId}`
        });
      }
    });

    // Listener para rate limit
    const unsubscribeRate = chatService.onRateLimited((data) => {
      // Expor via console e notificação do navegador se permitido
      const retryMs = data?.retryAfterMs ?? 60000;
      const seconds = Math.ceil(retryMs / 1000);
      if (Notification.permission === 'granted') {
        new Notification('Limite de envio atingido', {
          body: `Aguarde ${seconds}s para enviar novamente.`,
          tag: 'rate-limit'
        });
      } else {
        console.warn(`Rate limited. Aguarde ${seconds}s`);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      unsubscribeTyping();
      unsubscribeNotification();
      unsubscribeRate();
    };
  }, [currentUserId]);

  // Fetch unread counts do backend ao montar
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const url = `${BACKEND_URL}/api/chat/unread-counts`;
        const headers = { 'content-type': 'application/json', 'x-user-id': String(currentUserId) };
        if (authToken) headers['authorization'] = `Bearer ${authToken}`;
        const r = await fetch(url, { headers });
        const data = await r.json();
        if (data && typeof data === 'object') setUnreadCounts((prev) => ({ ...prev, ...data }));
      } catch {}
    };
    if (currentUserId) fetchUnread();
  }, [currentUserId, authToken]);

  // Funções auxiliares
  const getRoomKey = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
  };

  const loadOlderMessages = useCallback(async (partnerId) => {
    const roomKey = getRoomKey(currentUserId, partnerId);
    const existing = messages[roomKey] || [];
    const before = existing.length > 0 ? existing[0].timestamp : undefined;
    try {
      const url = new URL(`${BACKEND_URL}/api/chat/messages`);
      url.searchParams.set('partnerId', String(partnerId));
      url.searchParams.set('limit', '50');
      if (before) url.searchParams.set('before', String(before));
      const headers = { 'content-type': 'application/json', 'x-user-id': String(currentUserId) };
      if (authToken) headers['authorization'] = `Bearer ${authToken}`;
      const r = await fetch(url.toString(), { headers });
      const older = await r.json();
      if (Array.isArray(older) && older.length > 0) {
        const normalized = older.map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderId === currentUserId ? currentUserName : 'Outro',
          receiverId: m.receiverId,
          content: m.content,
          timestamp: m.timestamp,
          read: !!m.read
        }));
        const existingIds = new Set(existing.map(m => m.id));
        const merged = [...normalized.filter(m => !existingIds.has(m.id)), ...existing];
        setMessages(prev => ({ ...prev, [roomKey]: merged }));
        return true;
      }
    } catch {}
    return false;
  }, [messages, currentUserId, currentUserName, authToken]);

  // Entrar em uma sala
  const joinRoom = useCallback((partnerId) => {
    chatService.joinRoom(partnerId);
    
    // Resetar contador de não lidas
    setUnreadCounts(prev => ({
      ...prev,
      [partnerId]: 0
    }));
  }, []);

  // Enviar mensagem
  const sendMessage = useCallback((receiverId, content) => {
    return chatService.sendMessage(receiverId, content);
  }, []);

  // Enviar indicador de digitação
  const sendTyping = useCallback((receiverId, isTyping) => {
    chatService.sendTyping(receiverId, isTyping);
  }, []);

  // Marcar mensagens como lidas
  const markAsRead = useCallback((messageId, partnerId) => {
    const roomKey = getRoomKey(currentUserId, partnerId);
    chatService.markAsRead(messageId, roomKey);
  }, [currentUserId]);

  // Obter mensagens de uma conversa
  const getConversationMessages = useCallback((partnerId) => {
    const roomKey = getRoomKey(currentUserId, partnerId);
    return messages[roomKey] || [];
  }, [currentUserId, messages]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    messages,
    onlineUsers,
    typingUsers,
    unreadCounts,
    isConnected,
    joinRoom,
    sendMessage,
    sendTyping,
    markAsRead,
    getConversationMessages,
    requestNotificationPermission,
    loadOlderMessages
  };
};
