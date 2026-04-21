const DEFAULT_API_BASE = 'http://localhost:5000/api';

function normalizeApiBase(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_API_BASE;

  const trimmed = raw.replace(/\/+$/, '');
  if (/\/api$/i.test(trimmed)) return trimmed;

  return `${trimmed}/api`;
}

const API_BASE = normalizeApiBase(process.env.REACT_APP_API_URL || DEFAULT_API_BASE);

// ─── Helper: get auth headers ───────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem('client_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Helper: handle response ────────────────────────────────────────
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue.');
  }
  return data;
}

// ─── Client Auth API ────────────────────────────────────────────────

export async function registerClient({ nom_complet, email, mot_de_passe, police_number, telephone, adresse }) {
  const res = await fetch(`${API_BASE}/clients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom_complet, email, mot_de_passe, police_number, telephone, adresse }),
  });
  const data = await handleResponse(res);
  if (data.token) {
    localStorage.setItem('client_token', data.token);
    localStorage.setItem('client_data', JSON.stringify(data.client));
  }
  return data;
}

export async function loginClient({ email, mot_de_passe }) {
  const res = await fetch(`${API_BASE}/clients/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe }),
  });
  const data = await handleResponse(res);
  if (data.token) {
    localStorage.setItem('client_token', data.token);
    localStorage.setItem('client_data', JSON.stringify(data.client));
  }
  return data;
}

export function logoutClient() {
  localStorage.removeItem('client_token');
  localStorage.removeItem('client_data');
}

export function getStoredClient() {
  const token = localStorage.getItem('client_token');
  const clientStr = localStorage.getItem('client_data');
  if (!token || !clientStr) return null;
  try {
    return { token, client: JSON.parse(clientStr) };
  } catch {
    return null;
  }
}

export function isClientAuthenticated() {
  return !!localStorage.getItem('client_token');
}

export async function fetchClientProfile() {
  const endpoints = [`${API_BASE}/clients/me`, `${API_BASE}/clients/profile`];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (res.ok) {
        return data.client || data.data || data;
      }

      if (res.status !== 404) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      lastError = new Error(data.message || 'Route non trouvée.');
    } catch (error) {
      lastError = error;
      if (!String(error?.message || '').toLowerCase().includes('route non trouv')) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Route non trouvée.');
}

export async function requestPasswordReset({ email }) {
  const res = await fetch(`${API_BASE}/clients/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function verifyPasswordResetToken(token) {
  const res = await fetch(`${API_BASE}/clients/password-reset/verify?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

export async function confirmPasswordReset({ token, mot_de_passe }) {
  const res = await fetch(`${API_BASE}/clients/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, mot_de_passe }),
  });
  return handleResponse(res);
}

// ─── Dossier API ────────────────────────────────────────────────────

export async function fetchAgences() {
  const res = await fetch(`${API_BASE}/dossiers/agences`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function submitDossier(formData) {
  // If formData is an instance of FormData, use it as is (for file uploads)
  const isFormData = formData instanceof FormData;
  
  const headers = getAuthHeaders();
  if (isFormData) {
    // When using FormData, we CANNOT set Content-Type to application/json.
    // The browser will automatically set it to multipart/form-data and add the boundary.
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}/dossiers`, {
    method: 'POST',
    headers,
    body: isFormData ? formData : JSON.stringify(formData),
  });
  return handleResponse(res);
}

export async function fetchClientDossiers() {
  const res = await fetch(`${API_BASE}/dossiers`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function fetchClientDossierById(id) {
  const res = await fetch(`${API_BASE}/dossiers/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function fetchClientNotifications({ limit = 50 } = {}) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 50;
  const route = `/notifications?limit=${safeLimit}`;
  const endpoints = [];

  endpoints.push(`${API_BASE}${route}`);
  endpoints.push(`/api${route}`);

  if (typeof window !== 'undefined') {
    const host = String(window.location?.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      endpoints.push(`http://localhost:5000/api${route}`);
    }
  }

  const uniqueEndpoints = Array.from(new Set(endpoints));
  let lastError = null;

  for (const endpoint of uniqueEndpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }

      const message = data?.message || 'Une erreur est survenue.';
      const isRouteNotFound = res.status === 404 && String(message).toLowerCase().includes('route non trouv');
      if (isRouteNotFound) {
        lastError = new Error(`Route non trouvee (${endpoint})`);
        continue;
      }

      throw new Error(message);
    } catch (error) {
      lastError = error;
      if (!String(error?.message || '').toLowerCase().includes('route non trouv')) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Route non trouvee.');
}
