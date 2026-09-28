import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../config/api';
import mountainIcon from '../../assets/image-mountain.gif';
import './WelcomeModal.css';

// Post-login welcome dialog in the Easypay style: gray overlay, white
// rounded card, animated Lordicon image-mountain (wired-outline-54,
// served locally), "Welcome to W M+!" title, the active HOA name,
// and a purple OK button. Shown once per session/HOA.

export default function WelcomeModal({ user, hoaId, onClose }) {
  const [hoaLabel, setHoaLabel] = useState('');
  const activeReq = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Auto-dismiss after 5 seconds (OK button still works anytime).
  useEffect(() => {
    const t = setTimeout(() => closeRef.current && closeRef.current(), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Clean slate on every HOA switch so the previous name never lingers.
    setHoaLabel('');
    // Request id: a slow response from a previous HOA must not
    // overwrite the name of the currently selected one.
    const reqId = Symbol('hoa-name');
    activeReq.current = reqId;
    (async () => {
      try {
        const data = await apiFetch('/auth/hoas');
        const list = data.hoas || data || [];
        const match = list.find((h) => String(h.hoa_id) === String(hoaId));
        if (activeReq.current !== reqId) return; // stale response
        if (match) {
          const code = match.hoa_code ? ` (${match.hoa_code})` : '';
          setHoaLabel(`${match.legal_name || match.hoa_code || ''}${code}`);
        }
      } catch {
        // Name stays empty; the dialog still works.
      }
    })();
    return () => { activeReq.current = null; };
  }, [hoaId]);

  return (
    <div className="ep-welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="ep-welcome-card">
        <h1 className="ep-welcome-title">Welcome to W M+!</h1>
        <div className="ep-welcome-avatar">
          <img src={mountainIcon} width="150" height="150" alt="Image mountain animated icon" />
        </div>
        <p className="ep-welcome-sub">
          We have everything prepared for you
          {hoaLabel ? (
            <> at <strong>{hoaLabel}</strong></>
          ) : null}
          {user && user.display_name ? (
            <>, {user.display_name}</>
          ) : null}
        </p>
        <button type="button" className="ep-welcome-ok" onClick={onClose} autoFocus>
          OK
        </button>
      </div>
    </div>
  );
}
