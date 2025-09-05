// Serviço de backup e restore de dados
export const backupService = {
  // Criar backup completo dos dados
  createBackup: () => {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        // Dados do usuário
        user: {
          currentUser: JSON.parse(localStorage.getItem('devforum-currentUser') || 'null'),
          settings: JSON.parse(localStorage.getItem('devforum-settings') || '{}'),
          theme: localStorage.getItem('devforum-theme') || 'dark',
          accentColor: localStorage.getItem('devforum-accent') || 'blue'
        },
        
        // Dados da economia
        economy: {
          userStats: JSON.parse(localStorage.getItem('devforum-userStats') || '{}'),
          transactions: JSON.parse(localStorage.getItem('devforum-transactions') || '[]'),
          leaderboard: JSON.parse(localStorage.getItem('devforum-leaderboard') || '[]')
        },
        
        // Dados do chat
        chat: {
          messages: JSON.parse(localStorage.getItem('devforum-chatMessages') || '[]'),
          conversations: JSON.parse(localStorage.getItem('devforum-conversations') || '{}'),
          unreadCounts: JSON.parse(localStorage.getItem('devforum-unreadCounts') || '{}')
        },
        
        // Dados das notificações
        notifications: JSON.parse(localStorage.getItem('devforum-notifications') || '[]'),
        
        // Dados das perguntas e respostas
        questions: JSON.parse(localStorage.getItem('devforum-questions') || '[]'),
        
        // Analytics
        analytics: JSON.parse(localStorage.getItem('devforum-analytics') || '{}')
      }
    };
    
    return backup;
  },
  
  // Salvar backup no localStorage
  saveBackup: (backup) => {
    const backupKey = `devforum-backup-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));
    return backupKey;
  },
  
  // Listar backups disponíveis
  listBackups: () => {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('devforum-backup-')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key));
          backups.push({
            key,
            timestamp: backup.timestamp,
            version: backup.version,
            size: JSON.stringify(backup).length
          });
        } catch (e) {
          console.warn('Backup corrompido:', key);
        }
      }
    }
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  // Restaurar dados de um backup
  restoreBackup: (backupKey) => {
    try {
      const backup = JSON.parse(localStorage.getItem(backupKey));
      if (!backup || !backup.data) {
        throw new Error('Backup inválido');
      }
      
      const { data } = backup;
      
      // Restaurar dados do usuário
      if (data.user) {
        if (data.user.currentUser) {
          localStorage.setItem('devforum-currentUser', JSON.stringify(data.user.currentUser));
        }
        if (data.user.settings) {
          localStorage.setItem('devforum-settings', JSON.stringify(data.user.settings));
        }
        if (data.user.theme) {
          localStorage.setItem('devforum-theme', data.user.theme);
        }
        if (data.user.accentColor) {
          localStorage.setItem('devforum-accent', data.user.accentColor);
        }
      }
      
      // Restaurar dados da economia
      if (data.economy) {
        if (data.economy.userStats) {
          localStorage.setItem('devforum-userStats', JSON.stringify(data.economy.userStats));
        }
        if (data.economy.transactions) {
          localStorage.setItem('devforum-transactions', JSON.stringify(data.economy.transactions));
        }
        if (data.economy.leaderboard) {
          localStorage.setItem('devforum-leaderboard', JSON.stringify(data.economy.leaderboard));
        }
      }
      
      // Restaurar dados do chat
      if (data.chat) {
        if (data.chat.messages) {
          localStorage.setItem('devforum-chatMessages', JSON.stringify(data.chat.messages));
        }
        if (data.chat.conversations) {
          localStorage.setItem('devforum-conversations', JSON.stringify(data.chat.conversations));
        }
        if (data.chat.unreadCounts) {
          localStorage.setItem('devforum-unreadCounts', JSON.stringify(data.chat.unreadCounts));
        }
      }
      
      // Restaurar outros dados
      if (data.notifications) {
        localStorage.setItem('devforum-notifications', JSON.stringify(data.notifications));
      }
      if (data.questions) {
        localStorage.setItem('devforum-questions', JSON.stringify(data.questions));
      }
      if (data.analytics) {
        localStorage.setItem('devforum-analytics', JSON.stringify(data.analytics));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  },
  
  // Exportar backup como arquivo
  exportBackup: (backup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devforum-backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // Importar backup de arquivo
  importBackup: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          if (!backup || !backup.data) {
            throw new Error('Arquivo de backup inválido');
          }
          resolve(backup);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  },
  
  // Limpar backups antigos (manter apenas os últimos N)
  cleanupOldBackups: (keepCount = 5) => {
    const backups = backupService.listBackups();
    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.key);
      });
      return toDelete.length;
    }
    return 0;
  },
  
  // Verificar integridade do backup
  validateBackup: (backup) => {
    const required = ['timestamp', 'version', 'data'];
    const dataRequired = ['user', 'economy', 'chat'];
    
    for (const field of required) {
      if (!backup[field]) {
        return { valid: false, error: `Campo obrigatório ausente: ${field}` };
      }
    }
    
    for (const field of dataRequired) {
      if (!backup.data[field]) {
        return { valid: false, error: `Dados obrigatórios ausentes: ${field}` };
      }
    }
    
    return { valid: true };
  }
};
