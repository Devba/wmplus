import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

export default function AutoRefresh({ target = 'flashback', intervalMs = 8000 }) {
  const [initialHash, setInitialHash] = useState(null);
  const [newVersionDetected, setNewVersionDetected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkVersion() {
      try {
        const res = await fetch(`${API_BASE_URL}/version?target=${target}`);
        if (!res.ok) return;
        const data = await res.json();
        const currentHash = data.hash;

        if (!isMounted) return;

        if (!initialHash) {
          setInitialHash(currentHash);
        } else if (currentHash && currentHash !== initialHash) {
          console.log(`✨ New version detected (${currentHash}). Auto-refreshing...`);
          setNewVersionDetected(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        // Ignore network errors during poll
      }
    }

    checkVersion();
    const timer = setInterval(checkVersion, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [target, initialHash, intervalMs]);

  if (!newVersionDetected) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 99999,
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      fontWeight: '600',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <span style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#4ade80',
        boxShadow: '0 0 8px #4ade80'
      }} />
      🚀 Nuevos cambios detectados. Recargando aplicación...
    </div>
  );
}
