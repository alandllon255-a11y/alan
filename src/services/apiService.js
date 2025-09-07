const baseUrl = (import.meta.env && import.meta.env.VITE_NEST_URL) || 'http://localhost:4000/api';
let authToken = '';

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.response = body;
    throw err;
  }
  return body;
}

function toQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

const apiService = {
  setToken(token) { authToken = token || ''; },

  async login(email, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.accessToken) authToken = data.accessToken;
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async refresh(refreshToken) {
    try {
      const data = await request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      if (data?.accessToken) authToken = data.accessToken;
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
  async listQuestions({ q, tags, sort } = {}, userId = '7') {
    try {
      const data = await request(`/questions${toQuery({ q, tags, sort })}`, {
        method: 'GET',
        headers: { 'x-user-id': String(userId) },
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async searchQuestions({ q, limit = 20, offset = 0 } = {}, userId = '7') {
    try {
      const data = await request(`/questions/search${toQuery({ q, limit, offset })}`, {
        method: 'GET',
        headers: { 'x-user-id': String(userId) },
      });
      return { ok: true, data: data?.data ?? [] };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async getQuestion(id, userId = '7') {
    try {
      const data = await request(`/questions/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { 'x-user-id': String(userId) },
      });
      return { ok: true, data: data?.data ?? null };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async createQuestion({ title, content, tags = [] }, userId = '7') {
    try {
      const data = await request('/questions', {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
        body: JSON.stringify({ title, content, tags }),
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async addAnswer(questionId, { content, parentAnswerId }, userId = '7') {
    try {
      const data = await request(`/questions/${encodeURIComponent(questionId)}/answers`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
        body: JSON.stringify({ content, parentAnswerId }),
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async voteQuestion(questionId, type, userId = '7') {
    try {
      const data = await request(`/questions/${encodeURIComponent(questionId)}/vote`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
        body: JSON.stringify({ type }),
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async voteAnswer(answerId, type, userId = '7') {
    try {
      const path = type === 'UP' ? `/answers/${encodeURIComponent(answerId)}/upvote` : `/answers/${encodeURIComponent(answerId)}/downvote`;
      const data = await request(path, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async createComment({ content, questionId, answerId }, userId = '7') {
    try {
      const data = await request('/comments', {
        method: 'POST',
        headers: { 'x-user-id': String(userId) },
        body: JSON.stringify({ content, questionId, answerId }),
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },

  async acceptAnswer(questionId, answerId, userId = '7') {
    try {
      const data = await request(`/questions/${encodeURIComponent(questionId)}/accept/${encodeURIComponent(answerId)}`, {
        method: 'PATCH',
        headers: { 'x-user-id': String(userId) },
      });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e };
    }
  },
};

export default apiService;

