

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


    </div>
  );
}

export default App;