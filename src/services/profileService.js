const API_BASE = (import.meta?.env?.VITE_API_BASE ?? '') || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const devUserId = localStorage.getItem('devUserId');
  if (devUserId) headers['X-User-Id'] = devUserId;
  return headers;
}

export const profileService = {
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const devUserId = localStorage.getItem('devUserId');
    if (devUserId) headers['X-User-Id'] = devUserId;

    const res = await fetch(`${API_BASE}/users/upload/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Falha ao enviar avatar');
    return res.json();
  },

  async updateProfile(userId, data) {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar perfil');
    return res.json();
  },

  async getMyProfile() {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao carregar perfil');
    return res.json();
  },
};

