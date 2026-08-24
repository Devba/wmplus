

import { useEffect, useState } from 'react';
import './App.css';

import TopRibbon from './components/TopRibbon/TopRibbon';
import BottomTray from './components/BottomTray/BottomTray';
import Overlay from './components/Overlay/Overlay';

import {
  requestCloseOverlay,
  subscribeToOverlay
} from './engines';

import { pageMap } from './pages/pageMap';
import { API_BASE_URL, subscribeToConnectionStatus, setConnectionStatus } from './config/api.js';

function App() {
  const [currentPage, setCurrentPage] = useState(
    'master-navigation-panel'
  );

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [showBadge, setShowBadge] = useState(
    () => localStorage.getItem('hideBadge') !== 'true'
  );
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus(setIsOffline);
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setConnectionStatus(!data.alive);
      } catch (err) {
        setConnectionStatus(true);
      }
    }

    // Check on startup and then every 15 seconds
    checkHealth();
    const timer = setInterval(checkHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleRetry = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.alive) {
        setConnectionStatus(false);
        window.location.reload();
      } else {
        alert("El backend sigue sin conexión a la base de datos.");
      }
    } catch (err) {
      alert("No se pudo establecer conexión con el servidor backend.");
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToOverlay(setActiveOverlay);

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && activeOverlay) {
        requestCloseOverlay();
      }
    }

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeOverlay]);

  function renderPage() {
    const Page = pageMap[currentPage];

    if (Page) {
      return <Page onSelectPage={setCurrentPage} />;
    }

    return (
      <div className="dev-placeholder">
        {currentPage}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="top-ribbon">
        <TopRibbon onSelectPage={setCurrentPage} />
      </div>

      <div className="middle-content">
          {renderPage()}

          {activeOverlay && (
            <Overlay
              title={activeOverlay.title}
              width={activeOverlay.width}
              maxWidth={activeOverlay.maxWidth}
              height={activeOverlay.height}
              bodyHeight={activeOverlay.bodyHeight}
              onClose={requestCloseOverlay}
            >
              {activeOverlay.component}
            </Overlay>
          )}
      </div>

<div className="bottom-tray">

        <BottomTray
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
        />
      </div>

      {showBadge ? (
        <div
          onClick={() => { setShowBadge(false); localStorage.setItem('hideBadge', 'true'); }}
          title="Click para ocultar"
          style={{
            position: 'fixed',
            bottom: 52,
            right: 8,
            background: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 9999,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {import.meta.env.VITE_GIT_BRANCH || 'local'} / {import.meta.env.VITE_GIT_COMMIT || 'dev'} ✕
        </div>
      ) : (
        <div
          onClick={() => { setShowBadge(true); localStorage.setItem('hideBadge', 'false'); }}
          title="Click para mostrar versión"
          style={{
            position: 'fixed',
            bottom: 52,
            right: 8,
            background: 'rgba(0, 0, 0, 0.35)',
            color: 'rgba(255,255,255,0.5)',
            padding: '3px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'monospace',
            zIndex: 9999,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          v
        </div>
      )}

      {isOffline && (
        <div className="offline-status-badge">
          <span className="offline-badge-pulse"></span>
          <span className="offline-badge-text">⚠️ Modo Offline (Datos Mock)</span>
          <button className="offline-badge-retry-btn" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;