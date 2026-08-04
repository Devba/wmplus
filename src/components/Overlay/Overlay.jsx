



import './Overlay.css';

function Overlay({
  title = 'User Form',
  children,
  width,
  maxWidth,
  height,
  bodyHeight,
  onClose
}) {
  const dialogStyle = {
    width,
    maxWidth,
    height
  };

  const bodyStyle = {
    height: bodyHeight
  };

  return (
    <div
      id="overlayHost"
      className="overlay-host"
      aria-hidden="false"
    >
      <div
        className="overlay-backdrop"
        data-overlay-block="1"
      />

      <div
        className="overlay-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={dialogStyle}
      >
        <div className="overlay-titlebar">
          <div className="overlay-title">
            {title}
          </div>

          <button
            type="button"
            className="overlay-close"
            data-overlay-close="1"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div
          className="overlay-body"
          style={bodyStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Overlay;