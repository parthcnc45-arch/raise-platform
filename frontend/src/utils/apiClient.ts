const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // GP portal endpoints use their own cookie session and must never trigger the admin sign-out redirect
  const isGpPortalEndpoint = cleanEndpoint.startsWith('/gp-applications/view/') || cleanEndpoint.startsWith('/gp-applications/session');

  // Automatically log out if unauthorized (skip on sign in)
  if (response.status === 401 && typeof window !== 'undefined' && !cleanEndpoint.includes('/auth/login') && !isGpPortalEndpoint) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  }

  return response;
};
