export const apiBaseUrl = (import.meta?.env?.VITE_BACKEND_URL || `http://localhost:${import.meta?.env?.VITE_BACKEND_PORT || 4000}`) + '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  const xUserId = localStorage.getItem('x_user_id');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (xUserId && !token) headers['X-User-Id'] = xUserId;
  return headers;
}

export async function getProfile() {
  const res = await fetch(`${apiBaseUrl}/users/profile`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const headers = {};
  const token = localStorage.getItem('access_token');
  const xUserId = localStorage.getItem('x_user_id');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (xUserId && !token) headers['X-User-Id'] = xUserId;
  const res = await fetch(`${apiBaseUrl}/users/upload/avatar`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error('Failed to upload avatar');
  return res.json();
}

export async function updateProfile(userId, data) {
  const res = await fetch(`${apiBaseUrl}/users/${userId}/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

