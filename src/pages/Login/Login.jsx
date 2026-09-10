import { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import './Login.css';

// FASE A (auth): gate de login por roles. Reemplaza el formulario PWUF del VBA.
// Usa fetch crudo (no apiFetch) para no disparar el estado offline ante un 401.
export default function Login({ onLogin }) {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
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
      setError('Sin conexión con el servidor.');
    } finally {
      setBusy(false);
      setPassword('');
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>W M+</h1>
        <p className="login-sub">Acceso por rol (admin / solo lectura)</p>
        <label>
          Usuario
          <input value={loginName} onChange={(e) => setLoginName(e.target.value)} autoComplete="username" />
        </label>
        <label>
          Clave
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" disabled={busy || !loginName || !password}>
          {busy ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
