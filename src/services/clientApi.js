const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export async function registerClient({ nom_complet, email, mot_de_passe, telephone, cin, adresse }) {
  const res = await fetch(`${API_BASE}/clients/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom_complet, email, mot_de_passe, telephone, cin, adresse }),
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

// ─── Dossier API ────────────────────────────────────────────────────

export async function fetchAgences() {
  const res = await fetch(`${API_BASE}/dossiers/agences`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function submitDossier({ souscripteur, police_number, agence_id, type_prestation, demande_initiale }) {
  const res = await fetch(`${API_BASE}/dossiers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ souscripteur, police_number, agence_id, type_prestation, demande_initiale }),
  });
  return handleResponse(res);
}

export async function fetchClientDossiers() {
  const res = await fetch(`${API_BASE}/dossiers`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
