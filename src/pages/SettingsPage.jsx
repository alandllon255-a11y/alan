import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Volume2,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { backupService } from '../services/backupService';
import { ToastContainer } from '../components/ui/Toast';

const SettingsPage = ({ onBack }) => {
  const { theme, accentColor, toggleTheme, changeAccentColor, isDark } = useTheme();
  const { toasts, success, error, removeToast } = useToast();
  
  // Estados das configurações
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    desktop: true,
    email: false,
    push: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    showActivity: true
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    language: 'pt-BR'
  });
  
  const [activeTab, setActiveTab] = useState('appearance');

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    const savedPrivacySettings = localStorage.getItem('privacySettings');
    const savedAppearanceSettings = localStorage.getItem('appearanceSettings');
    
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
    if (savedPrivacySettings) {
      setPrivacySettings(JSON.parse(savedPrivacySettings));
    }
    if (savedAppearanceSettings) {
      setAppearanceSettings(JSON.parse(savedAppearanceSettings));
    }
  }, []);

  // Salvar configurações
  const saveSettings = (settings, key) => {
    localStorage.setItem(key, JSON.stringify(settings));
    success('Configurações salvas!');
  };

  const handleNotificationChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    saveSettings(newSettings, 'notificationSettings');
  };

  const handlePrivacyChange = (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    saveSettings(newSettings, 'privacySettings');
  };

  const handleAppearanceChange = (key, value) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    saveSettings(newSettings, 'appearanceSettings');
  };

  const handleBackup = async () => {
    try {
      const data = backupService.createBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devforum-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success('Backup exportado com sucesso!');
    } catch (error) {
      error('Erro ao exportar backup');
    }
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          backupService.restoreBackup(data);
          success('Backup restaurado com sucesso!');
          // Recarregar a página para aplicar as mudanças
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          error('Erro ao restaurar backup');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      success('Todos os dados foram limpos!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const accentColors = [
    { name: 'Azul', value: 'blue', class: 'from-blue-500 to-blue-600' },
    { name: 'Verde', value: 'green', class: 'from-green-500 to-green-600' },
    { name: 'Roxo', value: 'purple', class: 'from-purple-500 to-purple-600' },
    { name: 'Rosa', value: 'pink', class: 'from-pink-500 to-pink-600' },
    { name: 'Laranja', value: 'orange', class: 'from-orange-500 to-orange-600' },
    { name: 'Teal', value: 'teal', class: 'from-teal-500 to-teal-600' },
    { name: 'Índigo', value: 'indigo', class: 'from-indigo-500 to-indigo-600' },
    { name: 'Vermelho', value: 'red', class: 'from-red-500 to-red-600' }
  ];

  const tabs = [
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'privacy', name: 'Privacidade', icon: Shield },
    { id: 'backup', name: 'Backup', icon: Database },
    { id: 'advanced', name: 'Avançado', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-gray-400 text-sm">Personalize sua experiência no DevForum</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 hidden lg:block">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              {/* Aparência */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Aparência</h2>
                  </div>

                  {/* Tema */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Tema</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleTheme()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                          isDark
                            ? 'border-gray-600 bg-gray-700/50 text-white'
                            : 'border-gray-600 bg-gray-700/50 text-white'
                        }`}
                      >
                        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        {isDark ? 'Modo Escuro' : 'Modo Claro'}
                      </button>
                    </div>
                  </div>

                  {/* Cores de Destaque */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Cor de Destaque</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => changeAccentColor(color.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                            accentColor === color.value
                              ? 'border-white shadow-lg scale-105'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-full h-8 bg-gradient-to-r ${color.class} rounded-lg`}></div>
                          <p className="text-sm text-gray-300 mt-2">{color.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Configurações de Interface */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Interface</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                        <span className="text-white">Modo Compacto</span>
                        <input
                          type="checkbox"
                          checked={appearanceSettings.compactMode}
                          onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                        <span className="text-white">Animações</span>
                        <input
                          type="checkbox"
                          checked={appearanceSettings.showAnimations}
                          onChange={(e) => handleAppearanceChange('showAnimations', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notificações */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Notificações</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-gray-400" />
                        <span className="text-white">Som de Notificação</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.sound}
                        onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-gray-400" />
                        <span className="text-white">Notificações Desktop</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.desktop}
                        onChange={(e) => handleNotificationChange('desktop', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <span className="text-white">Notificações Push</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Privacidade */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Privacidade</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-white">Visibilidade do Perfil</label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Público</option>
                        <option value="friends">Apenas Amigos</option>
                        <option value="private">Privado</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <span className="text-white">Mostrar Status Online</span>
                      <input
                        type="checkbox"
                        checked={privacySettings.showOnlineStatus}
                        onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                      <span className="text-white">Permitir Mensagens Diretas</span>
                      <input
                        type="checkbox"
                        checked={privacySettings.allowDirectMessages}
                        onChange={(e) => handlePrivacyChange('allowDirectMessages', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Backup */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-orange-400" />
                    <h2 className="text-xl font-bold text-white">Backup e Restauração</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-semibold">Exportar Dados</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Faça backup de todas as suas perguntas, respostas e configurações.
                      </p>
                      <button
                        onClick={handleBackup}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        Exportar Backup
                      </button>
                    </div>

                    <div className="p-4 bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold">Importar Dados</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Restaure seus dados a partir de um arquivo de backup.
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleRestore}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <h3 className="text-red-400 font-semibold">Zona de Perigo</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Esta ação irá limpar todos os dados locais. Use com cuidado!
                    </p>
                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Limpar Todos os Dados
                    </button>
                  </div>
                </div>
              )}

              {/* Avançado */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-gray-400" />
                    <h2 className="text-xl font-bold text-white">Configurações Avançadas</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700/30 rounded-xl">
                      <h3 className="text-white font-semibold mb-2">Informações do Sistema</h3>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Versão: 1.0.0</p>
                        <p>Navegador: {navigator.userAgent.split(' ')[0]}</p>
                        <p>Local Storage: {localStorage.length} itens</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-700/30 rounded-xl">
                      <h3 className="text-white font-semibold mb-2">Atalhos de Teclado</h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p><kbd className="px-2 py-1 bg-gray-600 rounded">Alt + S</kbd> Configurações</p>
                        <p><kbd className="px-2 py-1 bg-gray-600 rounded">Alt + N</kbd> Notificações</p>
                        <p><kbd className="px-2 py-1 bg-gray-600 rounded">Alt + A</kbd> Analytics</p>
                        <p><kbd className="px-2 py-1 bg-gray-600 rounded">Alt + B</kbd> Backup</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
                 </div>
       </div>
       
       {/* Toast Container */}
       <ToastContainer 
         toasts={toasts} 
         onClose={removeToast} 
       />
     </div>
   );
 };
 
 export default SettingsPage;
