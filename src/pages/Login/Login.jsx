import { useEffect, useRef, useState } from 'react';
import { Player } from '@lordicon/react';
import { API_BASE_URL } from '../../config/api';
import mountainIcon from '../../assets/image-mountain.json';
import './Login.css';

// Easypay-style login (light theme): brand header, blue banner,
// icon-prefixed inputs, key-cap ENTER button. All strings in English.
// Uses raw fetch (not apiFetch) so a 401 does not trip offline state.
function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="14" r="4" />
      <path d="M11 11l8-8M16 4l3 3M13 7l2.5 2.5" />
    </svg>
  );
}

function getPrefill() {
  try {
    const q = new URLSearchParams(window.location.search);
    return q.get('email') || q.get('login') || '';
  } catch {
    return '';
  }
}

// Animated Lordicon image-mountain (wired-outline-54, morph-portrait
// state): plays the landscape -> portrait transition once on load.
function MountainIcon() {
  const playerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try { playerRef.current && playerRef.current.playFromBeginning(); } catch {
        // Static first frame stays visible; animation is decorative.
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="ep-login-mountain">
      <Player ref={playerRef} icon={mountainIcon} size={72} />
    </span>
  );
}

// Typewriter line next to the avatar: types the welcome phrase once,
// then keeps a blinking caret at the end.
const TYPEWRITER_TEXT = 'Welcome to W M+, please sign in.';

function TypewriterLine() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= TYPEWRITER_TEXT.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 55);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <span className="ep-login-typed" aria-label={TYPEWRITER_TEXT}>
      <span aria-hidden="true">{TYPEWRITER_TEXT.slice(0, count)}</span>
      <span className="ep-login-caret" aria-hidden="true">|</span>
    </span>
  );
}

export default function Login({ onLogin, expiredNotice }) {
  const [loginName, setLoginName] = useState(getPrefill);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ loginName, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Error ${res.status}`);
        return;
      }
      onLogin(data.user);
    } catch {
      setError('Cannot reach the server.');
    } finally {
      setBusy(false);
      setPassword('');
    }
  }

  return (
    <div className="ep-login-page">
      <header className="ep-login-header">
        <span className="ep-login-brand-icon"><HomeIcon /></span>
        <span className="ep-login-brand">W M+</span>
        <span className="ep-login-brand-sep" />
        <span className="ep-login-context">HOA Management</span>
      </header>

      <main className="ep-login-main">
        <div className="ep-login-banner">W M+ Login</div>

        <form className="ep-login-form" onSubmit={handleSubmit}>
          <div className="ep-login-avatar-row">
            <MountainIcon />
            <TypewriterLine />
          </div>

          {expiredNotice && (
            <div className="ep-login-notice">Session expired, please sign in again.</div>
          )}

          <label className="ep-login-label" htmlFor="ep-login-user">
            Username
          </label>
          <div className="ep-login-field">
            <span className="ep-login-field-icon"><UserIcon /></span>
            <input
              id="ep-login-user"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              autoComplete="username"
            />
          </div>

          <label className="ep-login-label" htmlFor="ep-login-pass">
            Password
          </label>
          <div className="ep-login-field">
            <span className="ep-login-field-icon"><KeyIcon /></span>
            <input
              id="ep-login-pass"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ep-login-peek"
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <div className="ep-login-error">{error}</div>}

          <div className="ep-login-actions">
            <button
              type="submit"
              className="ep-login-enter"
              disabled={busy || !loginName || !password}
            >
              {busy ? 'SIGNING IN…' : 'ENTER'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
