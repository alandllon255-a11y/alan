import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreVertical, 
  TrendingUp, Clock, Eye, ChevronUp, ChevronDown, 
  Filter, Sparkles, Flame, Award, RefreshCw, 
  CheckCircle, AlertCircle, Code, Link2, Image as ImageIcon,
  Play, Hash, User, Calendar, BarChart, ThumbsUp,
  MessageSquare, Send, X, Edit2, Trash2, Flag
} from 'lucide-react';

const FeedView = ({ 
  questions, 
  currentUser,
  onVote,
  onCreateQuestion,
  onSelectQuestion,
  onSelectTag,
  selectedTags = []
}) => {
  const [feedFilter, setFeedFilter] = useState('trending'); // trending, recent, following, unanswered
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    tags: '', 
    type: 'question',
    media: [] // Array para armazenar mídia
  });
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(null);
  const feedEndRef = useRef(null);
  const [feedItems, setFeedItems] = useState([]);
  const fileInputRef = useRef(null);

  // Simular carregamento infinito
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Transformar perguntas em itens de feed
  useEffect(() => {
    const items = questions.map((q, index) => ({
      ...q,
      type: 'question',
      engagement: {
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        impressions: q.views || Math.floor(Math.random() * 1000)
      },
      // Adicionar mídia de exemplo para alguns posts
      media: index % 3 === 0 ? [
        {
          id: 1,
          type: 'image',
          url: `https://picsum.photos/800/600?random=${index}`,
          name: 'screenshot.png',
          size: 1024 * 1024 * 2
        }
      ] : index % 5 === 0 ? [
        {
          id: 1,
          type: 'image',
          url: `https://picsum.photos/400/400?random=${index}`,
          name: 'image1.jpg',
          size: 1024 * 512
        },
        {
          id: 2,
          type: 'image',
          url: `https://picsum.photos/400/400?random=${index + 1}`,
          name: 'image2.jpg',
          size: 1024 * 768
        },
        {
          id: 3,
          type: 'image',
          url: `https://picsum.photos/400/400?random=${index + 2}`,
          name: 'image3.jpg',
          size: 1024 * 640
        }
      ] : []
    }));
    setFeedItems(items);
  }, [questions]);

  // Filtrar e ordenar feed
  const filteredFeed = useCallback(() => {
    let filtered = [...feedItems];

    // Aplicar filtros de tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Ordenar por filtro
    switch (feedFilter) {
      case 'trending':
        filtered.sort((a, b) => {
          const scoreA = (a.votes * 2) + a.answers.length + (a.engagement?.likes || 0);
          const scoreB = (b.votes * 2) + b.answers.length + (b.engagement?.likes || 0);
          return scoreB - scoreA;
        });
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'unanswered':
        filtered = filtered.filter(item => item.answers?.length === 0);
        break;
      default:
        break;
    }

    return filtered;
  }, [feedItems, selectedTags, feedFilter]);

  // Toggle like
  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });

    // Atualizar engagement
    setFeedItems(prev => prev.map(item => 
      item.id === postId 
        ? { ...item, engagement: { ...item.engagement, likes: item.engagement.likes + (likedPosts.has(postId) ? -1 : 1) } }
        : item
    ));
  };

  // Toggle bookmark
  const toggleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId);
      } else {
        newBookmarks.add(postId);
      }
      return newBookmarks;
    });
  };

  // Compartilhar
  const handleShare = (post) => {
    const url = `${window.location.origin}/question/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      setShareMenuOpen(null);
    }
  };

  // Criar nova postagem
  const handleCreatePost = () => {
    if (newPost.title && newPost.content) {
      onCreateQuestion(newPost);
      setNewPost({ title: '', content: '', tags: '', type: 'question', media: [] });
      setShowCreatePost(false);
    }
  };

  // Lidar com upload de arquivos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const mediaItem = {
            id: Date.now() + Math.random(),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: event.target.result,
            name: file.name,
            size: file.size
          };
          
          setNewPost(prev => ({
            ...prev,
            media: [...prev.media, mediaItem]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remover mídia
  const removeMedia = (mediaId) => {
    setNewPost(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== mediaId)
    }));
  };

  // Componente de Card do Feed
  const FeedCard = ({ item }) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const isLiked = likedPosts.has(item.id);
    const isBookmarked = bookmarkedPosts.has(item.id);
    const contentPreview = item.content.substring(0, 200);
    const hasMore = item.content.length > 200;

    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden group">
        {/* Header do Card */}
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onSelectQuestion(item)}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform"
              >
                {item.author.avatar}
              </button>
              <div>
                <p className="font-semibold text-white hover:text-blue-400 cursor-pointer">
                  {item.author.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Título */}
          <h3 
            onClick={() => onSelectQuestion(item)}
            className="text-xl font-bold text-white mb-3 hover:text-blue-400 cursor-pointer transition-colors"
          >
            {item.title}
            {item.hasAcceptedAnswer && (
              <CheckCircle className="inline-block ml-2 w-5 h-5 text-green-500" />
            )}
          </h3>

          {/* Conteúdo */}
          <div className="text-gray-300 mb-4">
            <p className={`${!showFullContent && hasMore ? 'line-clamp-3' : ''}`}>
              {showFullContent ? item.content : contentPreview}
              {hasMore && !showFullContent && '...'}
            </p>
            {hasMore && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium"
              >
                {showFullContent ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Hash className="w-3 h-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Mídia do post */}
          {item.media && item.media.length > 0 && (
            <div className="mb-4">
              {item.media.length === 1 ? (
                // Mídia única
                <div className="relative rounded-lg overflow-hidden">
                  {item.media[0].type === 'image' ? (
                    <img
                      src={item.media[0].url}
                      alt="Post media"
                      className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setShowImagePreview(item.media[0])}
                    />
                  ) : (
                    <div className="relative bg-black rounded-lg">
                      <video
                        src={item.media[0].url}
                        controls
                        className="w-full h-auto max-h-96"
                      >
                        Seu navegador não suporta vídeos.
                      </video>
                    </div>
                  )}
                </div>
              ) : (
                // Grid para múltiplas mídias
                <div className={`grid gap-1 rounded-lg overflow-hidden ${
                  item.media.length === 2 ? 'grid-cols-2' : 
                  item.media.length === 3 ? 'grid-cols-2' : 
                  'grid-cols-2'
                }`}>
                  {item.media.slice(0, 4).map((media, index) => (
                    <div
                      key={media.id || index}
                      className={`relative cursor-pointer hover:opacity-95 transition-opacity ${
                        item.media.length === 3 && index === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          onClick={() => setShowImagePreview(media)}
                        />
                      ) : (
                        <div className="relative bg-black h-full flex items-center justify-center">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      )}
                      {/* Indicador de mais mídia */}
                      {index === 3 && item.media.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{item.media.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview de código se houver */}
          {item.codeSnippet && (
            <div className="bg-gray-900 rounded-lg p-3 mb-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  {item.codeLanguage || 'JavaScript'}
                </span>
                <button className="text-xs text-gray-400 hover:text-white">
                  Copiar
                </button>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{item.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Estatísticas e Ações */}
        <div className="px-4 pb-4">
          {/* Estatísticas */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {item.views || 0} visualizações
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {item.answers?.length || 0} respostas
            </span>
            <span className="flex items-center gap-1">
              <BarChart className="w-4 h-4" />
              {item.engagement?.impressions || 0} impressões
            </span>
          </div>

          {/* Barra de Ações */}
          <div className="flex items-center justify-between border-t border-gray-700 pt-3">
            <div className="flex items-center gap-1">
              {/* Votos */}
              <button
                onClick={() => onVote(item.id, 1)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                  item.userVote === 1 
                    ? 'text-orange-500 bg-orange-500/10' 
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <ChevronUp className="w-5 h-5" />
                <span className="text-sm font-medium">{item.votes}</span>
              </button>
              <button
                onClick={() => onVote(item.id, -1)}
                className={`p-2 rounded-lg transition-colors ${
                  item.userVote === -1 
                    ? 'text-blue-500 bg-blue-500/10' 
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {/* Like */}
              <button
                onClick={() => toggleLike(item.id)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ml-2 ${
                  isLiked 
                    ? 'text-red-500 bg-red-500/10' 
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{item.engagement?.likes || 0}</span>
              </button>

              {/* Comentários */}
              <button
                onClick={() => onSelectQuestion(item)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{item.answers?.length || 0}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* Compartilhar */}
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(shareMenuOpen === item.id ? null : item.id)}
                  className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {shareMenuOpen === item.id && (
                  <div className="absolute right-0 bottom-full mb-2 bg-gray-700 rounded-lg shadow-lg p-2 min-w-[150px]">
                    <button
                      onClick={() => handleShare(item)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded text-sm text-white"
                    >
                      Copiar link
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded text-sm text-white">
                      Compartilhar no Twitter
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-600 rounded text-sm text-white">
                      Compartilhar no LinkedIn
                    </button>
                  </div>
                )}
              </div>

              {/* Salvar */}
              <button
                onClick={() => toggleBookmark(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-500 bg-yellow-500/10' 
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de trending */}
        {item.votes > 10 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Trending
          </div>
        )}
      </div>
    );
  };

  // Filtros do Feed
  const filters = [
    { id: 'trending', label: 'Em Alta', icon: TrendingUp, color: 'text-orange-500' },
    { id: 'recent', label: 'Recentes', icon: Clock, color: 'text-blue-500' },
    { id: 'following', label: 'Seguindo', icon: User, color: 'text-purple-500' },
    { id: 'unanswered', label: 'Sem Resposta', icon: MessageSquare, color: 'text-red-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header do Feed */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Feed</h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Nova Pergunta
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setFeedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                feedFilter === filter.id
                  ? 'bg-gray-700 text-white shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <filter.icon className={`w-4 h-4 ${feedFilter === filter.id ? filter.color : ''}`} />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tags ativas */}
        {selectedTags.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm">Filtros ativos:</span>
            {selectedTags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center gap-1 hover:bg-blue-600 transition-colors"
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </button>
            ))}
            <button
              onClick={() => selectedTags.forEach(tag => onSelectTag(tag))}
              className="text-sm text-gray-400 hover:text-white"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Modal de Criar Post */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Nova Pergunta</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Qual é sua pergunta?"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Forneça mais detalhes sobre sua pergunta..."
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="javascript, react, node.js"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Upload de mídia */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mídia (opcional)
                </label>
                
                {/* Botões de upload */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Adicionar Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Adicionar Vídeo
                  </button>
                </div>

                {/* Preview de mídia */}
                {newPost.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {newPost.media.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="relative w-full h-32 bg-black rounded-lg flex items-center justify-center">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Play className="absolute w-8 h-8 text-white" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(media.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                          {(media.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPost({ title: '', content: '', tags: '', type: 'question', media: [] });
                  }}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-4">
        {filteredFeed().length > 0 ? (
          filteredFeed().map(item => (
            <FeedCard key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-gray-500">
              {selectedTags.length > 0 
                ? 'Tente remover alguns filtros'
                : 'Seja o primeiro a fazer uma pergunta!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Loader para scroll infinito */}
      {hasMore && filteredFeed().length > 0 && (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      
      <div ref={feedEndRef} />

      {/* Modal de visualização de imagem */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={showImagePreview.url}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImagePreview(null);
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {/* Informações da imagem */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
              <p className="text-sm opacity-80">{showImagePreview.name}</p>
              <p className="text-xs opacity-60">
                {(showImagePreview.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedView;
