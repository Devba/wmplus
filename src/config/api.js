// Centralized API configuration for W M+ React

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running in browser on remote server
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}/api`;
  }
  return '/api';
};

export const API_BASE_URL = getBaseUrl();
export const PERSISTENCE_MODE = 'server'; // 'server' for live DB hoamanager26, 'local' for mock

let isOffline = false;
const subscribers = new Set();

export function setConnectionStatus(offlineStatus) {
  if (isOffline !== offlineStatus) {
    isOffline = offlineStatus;
    subscribers.forEach(cb => cb(isOffline));
  }
}

export function subscribeToConnectionStatus(cb) {
  subscribers.add(cb);
  cb(isOffline); // Emit current state on subscription
  return () => {
    subscribers.delete(cb);
  };
}

export async function apiFetch(endpoint, options = {}) {
  try {
    // FASE A2: HOA activa en cada llamada (selector TopRibbon -> localStorage)
    const activeHoa = typeof localStorage !== 'undefined'
      ? localStorage.getItem('wm_active_hoa') : null;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // FASE A: envía la cookie de sesión wm_session
      headers: {
        'Content-Type': 'application/json',
        ...(activeHoa ? { 'X-HOA-ID': activeHoa } : {}),
        ...options.headers
      },
      ...options
    });
    if (res.status === 401) {
      // FASE A2: sesión ausente/expirada -> App vuelve al Login
      try { window.dispatchEvent(new Event('wm-unauthorized')); } catch {}
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    setConnectionStatus(false);
    return data;
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err);
    setConnectionStatus(true);
    throw err;
  }
}

