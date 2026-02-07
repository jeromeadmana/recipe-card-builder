const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { username: string; email: string; password: string; role?: string }) =>
      fetchAPI('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { username: string; password: string }) =>
      fetchAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    switchRole: (role: string) =>
      fetchAPI('/api/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),

    getMe: () => fetchAPI('/api/auth/me'),
  },

  recipes: {
    list: () => fetchAPI('/api/recipes'),

    get: (id: string) => fetchAPI(`/api/recipes/${id}`),

    create: (data: { title: string; description?: string; is_public?: boolean; canvas_data: any }) =>
      fetchAPI('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { title?: string; description?: string; is_public?: boolean; canvas_data?: any }) =>
      fetchAPI(`/api/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/api/recipes/${id}`, {
        method: 'DELETE',
      }),
  },

  templates: {
    list: () => fetchAPI('/api/templates'),

    get: (id: string) => fetchAPI(`/api/templates/${id}`),

    create: (data: { name: string; description?: string; canvas_data: any }) =>
      fetchAPI('/api/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { name?: string; description?: string; canvas_data?: any }) =>
      fetchAPI(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/api/templates/${id}`, {
        method: 'DELETE',
      }),
  },
};
