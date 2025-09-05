import React, { useState, useEffect } from 'react';
import { 
  Search, X, 
  User, Hash, MessageSquare
} from 'lucide-react';

const AdvancedSearch = ({ 
  isOpen = false, 
  onClose = () => {},
  onSearch = () => {},
  questions = [],
  users = [],
  tags = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // all, questions, answers, users, tags
    sortBy: 'relevance', // relevance, newest, oldest, votes, views
    timeRange: 'all', // all, today, week, month, year
    tags: [],
    users: [],
    hasAcceptedAnswer: null,
    minVotes: 0,
    minViews: 0
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Gerar sugestões baseadas na query
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const newSuggestions = [];

    // Sugestões de perguntas
    questions.forEach(q => {
      if (q.title.toLowerCase().includes(query) || q.content.toLowerCase().includes(query)) {
        newSuggestions.push({
          type: 'question',
          id: q.id,
          title: q.title,
          subtitle: `${q.votes} votos • ${q.views} visualizações`,
          icon: <MessageSquare className="w-4 h-4" />
        });
      }
    });

    // Sugestões de tags
    const allTags = [...new Set(questions.flatMap(q => q.tags))];
    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        newSuggestions.push({
          type: 'tag',
          id: tag,
          title: tag,
          subtitle: `${questions.filter(q => q.tags.includes(tag)).length} perguntas`,
          icon: <Hash className="w-4 h-4" />
        });
      }
    });

    // Sugestões de usuários
    users.forEach(user => {
      if (user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query)) {
        newSuggestions.push({
          type: 'user',
          id: user.id,
          title: user.name,
          subtitle: `${user.reputation} reputação`,
          icon: <User className="w-4 h-4" />
        });
      }
    });

    setSuggestions(newSuggestions.slice(0, 8));
  }, [searchQuery, questions, users]);

  // Executar busca
  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      filters
    });
    onClose();
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !showSuggestions) {
        handleSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSuggestions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal de Busca */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Busca Avançada
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Digite sua busca..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            
            {/* Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => {
                      setSearchQuery(suggestion.title);
                      setShowSuggestions(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-600 transition-colors flex items-center gap-3"
                  >
                    {suggestion.icon}
                    <div>
                      <div className="text-white font-medium">{suggestion.title}</div>
                      <div className="text-sm text-gray-400">{suggestion.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Conteúdo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Conteúdo
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tudo</option>
                <option value="questions">Perguntas</option>
                <option value="answers">Respostas</option>
                <option value="users">Usuários</option>
                <option value="tags">Tags</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevância</option>
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="votes">Mais votadas</option>
                <option value="views">Mais visualizadas</option>
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Período
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Qualquer período</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="year">Este ano</option>
              </select>
            </div>

            {/* Resposta Aceita */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status da Resposta
              </label>
              <select
                value={filters.hasAcceptedAnswer || 'all'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  hasAcceptedAnswer: e.target.value === 'all' ? null : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Qualquer</option>
                <option value="true">Com resposta aceita</option>
                <option value="false">Sem resposta aceita</option>
              </select>
            </div>
          </div>

          {/* Filtros Numéricos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mínimo de Votos
              </label>
              <input
                type="number"
                min="0"
                value={filters.minVotes}
                onChange={(e) => setFilters(prev => ({ ...prev, minVotes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mínimo de Visualizações
              </label>
              <input
                type="number"
                min="0"
                value={filters.minViews}
                onChange={(e) => setFilters(prev => ({ ...prev, minViews: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Use aspas para busca exata: &quot;React hooks&quot;
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
