import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Camera, Edit2, Plus, Trash2, Save, X, 
  User, Briefcase, MapPin, Calendar, Globe, Github, 
  Linkedin, Twitter, Code, Trophy, Zap, BookOpen,
  Coffee, Link as LinkIcon, Shield, Eye, EyeOff, Star,
  Award, Target, TrendingUp, Users, Heart, MessageCircle,
  ExternalLink, Sparkles, PaintBucket, Layers, Grid3X3
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../hooks/useTheme';

const EditableProfile = ({ user, onBack, onUpdateProfile }) => {
  const { success, error } = useToast();
  const { accentColor, isDark } = useTheme();
  
  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDecorationModal, setShowDecorationModal] = useState(false);
  const [currentDecoration, setCurrentDecoration] = useState('none');
  
  // Estados dos dados do perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    title: user?.title || '',
    company: user?.company || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || '',
    github: user?.social?.github || '',
    linkedin: user?.social?.linkedin || '',
    twitter: user?.social?.twitter || '',
    avatarUrl: user?.avatarUrl || '',
    bannerUrl: user?.bannerUrl || '',
    projects: user?.projects || [],
    experiences: user?.experiences || [],
    skills: user?.skills || []
  });

  // Estados para novos itens
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '', imageUrl: '' });
  const [newExperience, setNewExperience] = useState({ title: '', company: '', period: '', description: '' });
  const [newSkill, setNewSkill] = useState('');
  
  // Estados para edição de itens
  const [editingProject, setEditingProject] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);

  // Refs para upload de arquivos
  const avatarInputRef = useRef();
  const bannerInputRef = useRef();
  const projectImageInputRef = useRef();

  // Decorações disponíveis para avatar
  const avatarDecorations = [
    { id: 'none', name: 'Nenhum', class: '' },
    { id: 'gold', name: 'Dourado', class: 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' },
    { id: 'silver', name: 'Prata', class: 'ring-4 ring-gray-300 shadow-lg shadow-gray-300/50' },
    { id: 'rainbow', name: 'Arco-íris', class: 'ring-4 ring-gradient-to-r from-purple-400 via-pink-400 to-orange-400 shadow-lg shadow-purple-400/50 animate-pulse' },
    { id: 'neon', name: 'Neon', class: 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse' },
    { id: 'fire', name: 'Fogo', class: 'ring-4 ring-orange-500 shadow-lg shadow-orange-500/50 animate-pulse' }
  ];

  // Função para lidar com upload de imagens
  const handleImageUpload = (file, type) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if (type === 'avatar') {
        setProfileData(prev => ({ ...prev, avatarUrl: result }));
      } else if (type === 'banner') {
        setProfileData(prev => ({ ...prev, bannerUrl: result }));
      }
      success(`${type === 'avatar' ? 'Avatar' : 'Banner'} atualizado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  // Função para salvar perfil
  const handleSaveProfile = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
    success('Perfil atualizado com sucesso!');
  };

  // Funções para gerenciar projetos
  const addProject = () => {
    if (!newProject.title.trim()) return;
    
    const project = {
      id: Date.now(),
      ...newProject,
      createdAt: new Date()
    };
    
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, project]
    }));
    
    setNewProject({ title: '', description: '', link: '', imageUrl: '' });
    success('Projeto adicionado com sucesso!');
  };

  const updateProject = (id, updatedProject) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updatedProject } : p)
    }));
    setEditingProject(null);
    success('Projeto atualizado!');
  };

  const deleteProject = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      setProfileData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id)
      }));
      success('Projeto removido!');
    }
  };

  // Funções para gerenciar experiências
  const addExperience = () => {
    if (!newExperience.title.trim()) return;
    
    const experience = {
      id: Date.now(),
      ...newExperience,
      createdAt: new Date()
    };
    
    setProfileData(prev => ({
      ...prev,
      experiences: [...prev.experiences, experience]
    }));
    
    setNewExperience({ title: '', company: '', period: '', description: '' });
    success('Experiência adicionada com sucesso!');
  };

  const updateExperience = (id, updatedExperience) => {
    setProfileData(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id === id ? { ...e, ...updatedExperience } : e)
    }));
    setEditingExperience(null);
    success('Experiência atualizada!');
  };

  const deleteExperience = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta experiência?')) {
      setProfileData(prev => ({
        ...prev,
        experiences: prev.experiences.filter(e => e.id !== id)
      }));
      success('Experiência removida!');
    }
  };

  // Funções para gerenciar habilidades
  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const skill = {
      id: Date.now(),
      name: newSkill,
      level: 50,
      endorsed: 0
    };
    
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    
    setNewSkill('');
    success('Habilidade adicionada!');
  };

  const updateSkill = (id, updatedSkill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, ...updatedSkill } : s)
    }));
    setEditingSkill(null);
    success('Habilidade atualizada!');
  };

  const deleteSkill = (id) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
    success('Habilidade removida!');
  };

  // Tabs do perfil
  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: User },
    { id: 'projects', name: 'Projetos', icon: Code },
    { id: 'experience', name: 'Experiência', icon: Briefcase },
    { id: 'skills', name: 'Habilidades', icon: Zap }
  ];

  const getAccentColorClasses = () => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
    };
    return colorMap[accentColor] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-x-hidden">
      {/* Floating Header */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isEditing 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white' 
                    : `bg-gradient-to-r ${getAccentColorClasses()} text-white shadow-lg hover:shadow-xl`
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </>
                ) : (
                  <>
                    <PaintBucket className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Salvar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          
          {/* Profile Card - Large */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="relative group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
              {/* Banner Background */}
              <div 
                className="h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 relative"
                style={profileData.bannerUrl ? {
                  backgroundImage: `url(${profileData.bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/20"
                    >
                      <Camera className="w-4 h-4" />
                      Banner
                    </button>
                  </div>
                )}
              </div>
              
              {/* Profile Content */}
              <div className="p-6 -mt-16 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  {/* Avatar */}
                  <div className="relative group/avatar">
                    <div className={`w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-gray-900/50 ${avatarDecorations.find(d => d.id === currentDecoration)?.class || ''}`}>
                      {profileData.avatarUrl ? (
                        <img 
                          src={profileData.avatarUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16" />
                      )}
                    </div>
                    
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 rounded-2xl transition-opacity flex items-center justify-center gap-1">
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="bg-white/20 text-white p-2 rounded-lg text-xs hover:bg-white/30 transition-all"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDecorationModal(true)}
                          className="bg-white/20 text-white p-2 rounded-lg text-xs hover:bg-white/30 transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-2xl font-bold bg-gray-700/50 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                          placeholder="Seu nome"
                        />
                        <input
                          type="text"
                          value={profileData.title}
                          onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                          className="text-lg bg-gray-700/50 text-gray-300 rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                          placeholder="Seu cargo/título"
                        />
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{profileData.name || 'Seu Nome'}</h1>
                        <p className="text-lg text-gray-300 mb-3">{profileData.title || 'Seu Cargo'}</p>
                      </div>
                    )}

                    {/* Professional Quick Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {profileData.company && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.company}
                              onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                              className="bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none"
                              placeholder="Empresa"
                            />
                          ) : (
                            profileData.company
                          )}
                        </span>
                      )}
                      
                      {profileData.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                              className="bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none"
                              placeholder="Localização"
                            />
                          ) : (
                            profileData.location
                          )}
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="mt-4">
                      {isEditing ? (
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full bg-gray-700/30 text-gray-300 rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                          rows="2"
                          placeholder="Sua bio..."
                        />
                      ) : (
                        <p className="text-gray-300 text-sm leading-relaxed">{profileData.bio || 'Adicione uma bio...'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
            {/* Avatar */}
            <div className="relative group">
              <div className={`w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-4xl font-bold text-white relative ${avatarDecorations.find(d => d.id === currentDecoration)?.class || ''}`}>
                {profileData.avatarUrl ? (
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-20 h-20" />
                )}
              </div>
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/30 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDecorationModal(true)}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/30 transition-all"
                  >
                    ✨ Efeito
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-3xl font-bold bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Seu nome"
                  />
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-lg bg-gray-700/50 text-gray-300 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Seu cargo/título"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{profileData.name || 'Seu Nome'}</h1>
                  <p className="text-lg text-gray-300 mb-4">{profileData.title || 'Seu Cargo'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Empresa</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Sua empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Localização</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Sua localização"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="https://seusite.com"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Empresa</h3>
                  <p className="text-white font-semibold">{profileData.company || 'Não informado'}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Localização</h3>
                  <p className="text-white font-semibold">{profileData.location || 'Não informado'}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Website</h3>
                  {profileData.website ? (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold">
                      Visitar
                    </a>
                  ) : (
                    <p className="text-white font-semibold">Não informado</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Bio</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows="4"
                placeholder="Conte um pouco sobre você..."
              />
            ) : (
              <p className="text-gray-300">{profileData.bio || 'Adicione uma biografia para se apresentar melhor.'}</p>
            )}
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Links Sociais</h2>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">GitHub</label>
                  <input
                    type="text"
                    value={profileData.github}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="seu-usuario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="seu-perfil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="@seuusuario"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                {profileData.github && (
                  <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                )}
                {profileData.linkedin && (
                  <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {profileData.twitter && (
                  <a href={`https://twitter.com/${profileData.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
                {!profileData.github && !profileData.linkedin && !profileData.twitter && (
                  <p className="text-gray-400">Nenhum link social adicionado</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-8">
          <nav className="flex gap-2 bg-gray-800/30 p-2 rounded-2xl backdrop-blur-sm border border-gray-700/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${getAccentColorClasses()} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="mt-8">
            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Projetos</h2>
                  {isEditing && (
                    <button
                      onClick={() => {
                        // Show add project form
                        const form = document.getElementById('add-project-form');
                        form.style.display = form.style.display === 'none' ? 'block' : 'none';
                      }}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getAccentColorClasses()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Projeto
                    </button>
                  )}
                </div>

                {/* Add Project Form */}
                {isEditing && (
                  <div id="add-project-form" className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50" style={{ display: 'none' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Novo Projeto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Nome do projeto"
                      />
                      <input
                        type="url"
                        value={newProject.link}
                        onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Link do projeto"
                      />
                    </div>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
                      rows="3"
                      placeholder="Descrição do projeto"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={addProject}
                        className={`px-4 py-2 bg-gradient-to-r ${getAccentColorClasses()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById('add-project-form').style.display = 'none';
                          setNewProject({ title: '', description: '', link: '', imageUrl: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.projects.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Code className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">Nenhum projeto adicionado ainda</p>
                      <p className="text-gray-500">Adicione seus projetos para mostrar seu trabalho</p>
                    </div>
                  ) : (
                    profileData.projects.map((project) => (
                      <div key={project.id} className="bg-gray-700/30 rounded-xl overflow-hidden border border-gray-600/30 group relative">
                        {isEditing && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => setEditingProject(project.id)}
                              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <Code className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="p-4">
                          {editingProject === project.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                defaultValue={project.title}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Nome do projeto"
                                onBlur={(e) => updateProject(project.id, { title: e.target.value })}
                              />
                              <textarea
                                defaultValue={project.description}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                rows="3"
                                placeholder="Descrição"
                                onBlur={(e) => updateProject(project.id, { description: e.target.value })}
                              />
                              <input
                                type="url"
                                defaultValue={project.link}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Link do projeto"
                                onBlur={(e) => updateProject(project.id, { link: e.target.value })}
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                              <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  Ver projeto
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Experiência</h2>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const form = document.getElementById('add-experience-form');
                        form.style.display = form.style.display === 'none' ? 'block' : 'none';
                      }}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getAccentColorClasses()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Experiência
                    </button>
                  )}
                </div>

                {/* Add Experience Form */}
                {isEditing && (
                  <div id="add-experience-form" className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/50" style={{ display: 'none' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Nova Experiência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Cargo"
                      />
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Empresa"
                      />
                      <input
                        type="text"
                        value={newExperience.period}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Período (ex: Jan 2020 - Presente)"
                      />
                    </div>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
                      rows="3"
                      placeholder="Descrição das responsabilidades e conquistas"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={addExperience}
                        className={`px-4 py-2 bg-gradient-to-r ${getAccentColorClasses()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById('add-experience-form').style.display = 'none';
                          setNewExperience({ title: '', company: '', period: '', description: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Experiences List */}
                <div className="space-y-6">
                  {profileData.experiences.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">Nenhuma experiência adicionada ainda</p>
                      <p className="text-gray-500">Adicione suas experiências profissionais</p>
                    </div>
                  ) : (
                    profileData.experiences.map((experience) => (
                      <div key={experience.id} className="flex gap-6 group relative">
                        <div className="flex-shrink-0 w-24 text-right">
                          <p className="text-sm text-gray-400">{experience.period}</p>
                        </div>
                        
                        <div className="flex-grow pl-6 border-l-2 border-gray-600 relative">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-800"></div>
                          
                          {isEditing && (
                            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingExperience(experience.id)}
                                className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteExperience(experience.id)}
                                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {editingExperience === experience.id ? (
                            <div className="space-y-3 bg-gray-700/30 p-4 rounded-xl">
                              <input
                                type="text"
                                defaultValue={experience.title}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Cargo"
                                onBlur={(e) => updateExperience(experience.id, { title: e.target.value })}
                              />
                              <input
                                type="text"
                                defaultValue={experience.company}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Empresa"
                                onBlur={(e) => updateExperience(experience.id, { company: e.target.value })}
                              />
                              <input
                                type="text"
                                defaultValue={experience.period}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Período"
                                onBlur={(e) => updateExperience(experience.id, { period: e.target.value })}
                              />
                              <textarea
                                defaultValue={experience.description}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                rows="3"
                                placeholder="Descrição"
                                onBlur={(e) => updateExperience(experience.id, { description: e.target.value })}
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-semibold text-white mb-1">{experience.title}</h3>
                              <p className="text-blue-400 font-medium mb-2">{experience.company}</p>
                              <p className="text-gray-300 text-sm">{experience.description}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Habilidades</h2>
                  {isEditing && (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Nova habilidade"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className={`px-4 py-2 bg-gradient-to-r ${getAccentColorClasses()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {profileData.skills.length === 0 ? (
                    <div className="w-full text-center py-12">
                      <Zap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">Nenhuma habilidade adicionada ainda</p>
                      <p className="text-gray-500">Adicione suas habilidades técnicas</p>
                    </div>
                  ) : (
                    profileData.skills.map((skill) => (
                      <div key={skill.id} className="relative group">
                        {editingSkill === skill.id ? (
                          <input
                            type="text"
                            defaultValue={skill.name}
                            className="bg-gray-700 text-white rounded-full px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            onBlur={(e) => updateSkill(skill.id, { name: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:shadow-lg transition-all duration-300">
                              {skill.name}
                            </span>
                            {isEditing && (
                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingSkill(skill.id)}
                                  className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteSkill(skill.id)}
                                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Projects */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Projetos Recentes
                  </h3>
                  {profileData.projects.slice(0, 3).length === 0 ? (
                    <p className="text-gray-400">Nenhum projeto para mostrar</p>
                  ) : (
                    <div className="space-y-3">
                      {profileData.projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                          <h4 className="text-white font-medium mb-1">{project.title}</h4>
                          <p className="text-gray-400 text-sm">{project.description?.substring(0, 80)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Summary */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Principais Habilidades
                  </h3>
                  {profileData.skills.slice(0, 8).length === 0 ? (
                    <p className="text-gray-400">Nenhuma habilidade para mostrar</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.slice(0, 8).map((skill) => (
                        <span
                          key={skill.id}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Decoration Modal */}
      {showDecorationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Escolher Decoração</h3>
              <button
                onClick={() => setShowDecorationModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {avatarDecorations.map((decoration) => (
                <button
                  key={decoration.id}
                  onClick={() => {
                    setCurrentDecoration(decoration.id);
                    setShowDecorationModal(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors border border-gray-600/50 hover:border-gray-500"
                >
                  <div className={`w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center ${decoration.class}`}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{decoration.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
      />
      <input
        ref={projectImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e.target.files[0], 'project')}
      />
    </div>
  );
};

export default EditableProfile;