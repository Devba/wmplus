

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

function App() {
  const [currentPage, setCurrentPage] = useState(
    'master-navigation-panel'
  );

  const [activeOverlay, setActiveOverlay] = useState(null);
  const [showBadge, setShowBadge] = useState(
    () => localStorage.getItem('hideBadge') !== 'true'
  );

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
        <TopRibbon />
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
    </div>
  );
}

export default App;