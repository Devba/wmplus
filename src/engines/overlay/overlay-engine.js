


let overlayListener = null;
let activeOverlay = null;

function notifyOverlayChange() {
  if (typeof overlayListener === 'function') {
    overlayListener(activeOverlay);
  }
}

export function subscribeToOverlay(listener) {
  overlayListener = listener;
  listener(activeOverlay);

  return () => {
    if (overlayListener === listener) {
      overlayListener = null;
    }
  };
}

export function openOverlay(options = {}) {
  activeOverlay = {
    title: options.title || 'User Form',
    component: options.component || null,
    width: options.width,
    maxWidth: options.maxWidth,
    height: options.height,
    bodyHeight: options.bodyHeight,
    beforeClose:
      typeof options.beforeClose === 'function'
        ? options.beforeClose
        : null
  };

  notifyOverlayChange();
}

export function closeOverlay() {
  activeOverlay = null;
  notifyOverlayChange();

  return true;
}

export function requestCloseOverlay() {
  if (!canCloseOverlay()) {
    return false;
  }

return closeOverlay();

}


export function canCloseOverlay() {
  if (
    activeOverlay &&
    typeof activeOverlay.beforeClose === 'function'
  ) {
    return activeOverlay.beforeClose() !== false;
  }

  return true;
}

 
export function isOverlayOpen() {
  return activeOverlay !== null;
}