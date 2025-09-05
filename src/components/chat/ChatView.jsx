import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle as MessageCircleIcon, Send, Bell, BellOff, 
  Circle, Search, MoreVertical, Paperclip,
  Smile
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const ChatView = ({ currentUser }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
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
  } = useChat(currentUser?.id, currentUser?.name);

  const [rateLimitedMsg, setRateLimitedMsg] = useState(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = async () => {
      if (el.scrollTop < 50 && !isLoadingMore && hasMore && selectedUserId) {
        setIsLoadingMore(true);
        const loaded = await loadOlderMessages(selectedUserId);
        if (!loaded) setHasMore(false);
        setIsLoadingMore(false);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [isLoadingMore, hasMore, selectedUserId]);

  // Solicitar permissão de notificações
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Aviso simples de rate limit baseado em evento de toast no hook (console/notification)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.type === 'rateLimited') {
        const seconds = Math.ceil((e.detail.retryAfterMs ?? 60000) / 1000);
        setRateLimitedMsg(`Você atingiu o limite de envio. Aguarde ${seconds}s.`);
        setTimeout(() => setRateLimitedMsg(null), Math.min(10000, (e.detail.retryAfterMs ?? 60000)));
      }
    };
    window.addEventListener('chat-rate-limit', handler);
    return () => window.removeEventListener('chat-rate-limit', handler);
  }, []);

  // Filtrar usuários pela busca
  const filteredUsers = onlineUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selecionar usuário e entrar na sala
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    joinRoom(userId);
    setMessageInput('');
  };

  // Enviar mensagem
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUserId) {
      sendMessage(selectedUserId, messageInput);
      setMessageInput('');
    }
  };

  // Gerenciar indicador de digitação
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (selectedUserId) {
      // Enviar que está digitando
      sendTyping(selectedUserId, true);
      
      // Limpar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Parar de digitar após 1 segundo de inatividade
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(selectedUserId, false);
      }, 1000);
    }
  };

  // Marcar mensagens como lidas
  useEffect(() => {
    if (selectedUserId) {
      const conversation = getConversationMessages(selectedUserId);
      conversation.forEach(msg => {
        if (msg.senderId === selectedUserId && !msg.read) {
          markAsRead(msg.id, selectedUserId);
        }
      });
    }
  }, [selectedUserId, messages, markAsRead, getConversationMessages]);

  const selectedUserData = onlineUsers.find(u => u.id === selectedUserId);
  const currentConversation = selectedUserId ? getConversationMessages(selectedUserId) : [];

  // Adicionar emoji à mensagem
  const addEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '🙏', '🎉', '🔥', '💯', '🤔'];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-[600px] flex">
      {/* Lista de Usuários */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircleIcon className="w-6 h-6 text-blue-500" />
              Mensagens
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
              >
                {notificationsEnabled ? 
                  <Bell className="w-5 h-5 text-gray-400" /> : 
                  <BellOff className="w-5 h-5 text-gray-400" />
                }
              </button>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Conectado' : 'Desconectado'} />
            </div>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(user => {
            const unreadCount = unreadCounts[user.id] || 0;
            const isTyping = typingUsers[user.id];
            
            return (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors relative ${
                  selectedUserId === user.id ? 'bg-gray-700' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    user.isBot ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                    'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {user.avatar}
                  </div>
                  {user.status === 'online' && (
                    <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-green-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">{user.name}</h3>
                  <p className="text-sm text-gray-400">
                    {isTyping ? (
                      <span className="text-blue-400 italic">digitando...</span>
                    ) : (
                      user.status === 'online' ? 'Online' : 'Offline'
                    )}
                  </p>
                </div>

                {/* Badge de não lidas */}
                {unreadCount > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>
            );
          })}
          
          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </div>

      {/* Área de Conversa */}
      <div className="flex-1 flex flex-col">
        {selectedUserData ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  selectedUserData.isBot ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                  'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {selectedUserData.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedUserData.name}</h3>
                  <p className="text-sm text-gray-400">
                    {typingUsers[selectedUserId] ? (
                      <span className="text-blue-400">digitando...</span>
                    ) : (
                      selectedUserData.status === 'online' ? 'Online' : 'Offline'
                    )}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Mensagens */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMore && (
                <div className="text-center text-gray-400 text-sm">Carregando mais...</div>
              )}
              {!isLoadingMore && hasMore && (
                <div className="text-center">
                  <button onClick={async () => { setIsLoadingMore(true); const loaded = await loadOlderMessages(selectedUserId); if (!loaded) setHasMore(false); setIsLoadingMore(false); }} className="px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600">Carregar mais</button>
                </div>
              )}
              {rateLimitedMsg && (
                <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 rounded text-sm">
                  {rateLimitedMsg}
                </div>
              )}
              {currentConversation.map((msg) => {
                const isOwnMessage = msg.senderId === currentUser.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        selectedUserData.isBot ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                        'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {selectedUserData.avatar}
                      </div>
                    )}

                    {/* Mensagem */}
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-700 text-gray-100 rounded-bl-none'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${
                        isOwnMessage ? 'justify-end' : ''
                      }`}>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isOwnMessage && msg.read && (
                          <span className="text-blue-400">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Indicador de digitação animado */}
              {typingUsers[selectedUserId] && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">{typingUsers[selectedUserId]} está digitando</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              {/* Picker de Emoji */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 bg-gray-700 border border-gray-600 rounded-lg p-2 flex gap-1 flex-wrap max-w-xs">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="p-2 hover:bg-gray-600 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Botões de ação */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Anexar arquivo"
                >
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Emojis"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>

                {/* Input */}
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Botão de enviar */}
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  // TODO: Implementar envio de arquivos
                  console.log('Arquivo selecionado:', e.target.files[0]);
                }}
              />
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione uma conversa para começar</p>
              <p className="text-sm mt-2">Escolha um usuário na lista ao lado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
