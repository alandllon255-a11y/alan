import React, { useState } from 'react';
import { 
  Bell, X, Check, CheckCheck, MessageSquare, 
  ThumbsUp, Award, User, Settings,
  Filter
} from 'lucide-react';

const NotificationCenter = ({ 
  notifications = [], 
  unreadCount = 0, 
  isOpen = false, 
  onClose = () => {},
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearAll = () => {}
}) => {
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Ícones por tipo de notificação
  const getNotificationIcon = (type) => {
    const icons = {
      'answer': <MessageSquare className="w-5 h-5 text-blue-500" />,
      'vote': <ThumbsUp className="w-5 h-5 text-green-500" />,
      'accepted': <CheckCheck className="w-5 h-5 text-yellow-500" />,
      'mention': <User className="w-5 h-5 text-purple-500" />,
      'badge': <Award className="w-5 h-5 text-orange-500" />,
      'success': <Check className="w-5 h-5 text-green-500" />,
      'reply': <MessageSquare className="w-5 h-5 text-blue-500" />,
      'comment': <MessageSquare className="w-5 h-5 text-gray-500" />
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  // Cores por prioridade
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'border-l-red-500 bg-red-900/20',
      'normal': 'border-l-blue-500 bg-blue-900/20',
      'low': 'border-l-gray-500 bg-gray-900/20'
    };
    return colors[priority] || colors['normal'];
  };

  // Formatar tempo
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Painel de Notificações */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-white">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="unread">Não lidas</option>
              <option value="answer">Respostas</option>
              <option value="vote">Votos</option>
              <option value="mention">Menções</option>
              <option value="badge">Conquistas</option>
            </select>
          </div>

          {/* Ações em lote */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Marcar todas como lidas
              </button>
              <button
                onClick={onClearAll}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 transition-all hover:bg-gray-700/50 cursor-pointer ${
                    notification.read ? 'opacity-60' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                    // TODO: Navegar para o conteúdo relacionado
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-white">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-300 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      {/* Ações da notificação */}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Marcar como lida
                          </button>
                        )}
                        {notification.link && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Navegar para o link
                            }}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                          >
                            Ver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 'ões' : ''}
            </span>
            <span>
              {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
