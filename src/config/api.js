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

// FASE A2-fix: 60+ llamadas usan fetch crudo sin credenciales -> la sesión
// se perdía y todo caía a mock. Este wrapper central inyecta sesión + HOA
// en TODO fetch same-origin (URLs externas intactas). Cero cambios por archivo.
if (typeof window !== 'undefined' && window.fetch && !window.fetch.__wmAuthWrapped) {
  const origFetch = window.fetch.bind(window);
  const isSameOriginApi = (url) => {
    try {
      const u = new URL(String(url), window.location.origin);
      return u.origin === window.location.origin;
    } catch {
      return false;
    }
  };
  const wrappedFetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input && input.url);
    if (url && isSameOriginApi(url)) {
      const headers = new Headers(init.headers || {});
      const body = init.body;
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
      if (body && !isForm && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      try {
        const activeHoa = localStorage.getItem('wm_active_hoa');
        if (activeHoa && !headers.has('X-HOA-ID')) headers.set('X-HOA-ID', activeHoa);
      } catch {}
      init = { ...init, credentials: init.credentials || 'include', headers };
    }
    return origFetch(input, init);
  };
  wrappedFetch.__wmAuthWrapped = true;
  window.fetch = wrappedFetch;
}

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

