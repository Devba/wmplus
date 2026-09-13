import { useEffect, useState } from 'react';
import { apiFetch } from '../../config/api';
import './MyAccount.css';

// Pulido demo auth: datos de sesión + cambio de clave propia.
export default function MyAccount() {
  const [me, setMe] = useState(null);
  const [cur, setCur] = useState('');
  const [neu, setNeu] = useState('');
  const [neu2, setNeu2] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/auth/me');
        setMe(data.user);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  async function handleChange(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    if (neu !== neu2) { setErr('La nueva clave y su confirmación no coinciden.'); return; }
    if (neu.length < 8) { setErr('La nueva clave debe tener 8+ caracteres.'); return; }
    setBusy(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: cur, newPassword: neu }),
      });
      setMsg('Clave actualizada. Las demás sesiones se cerraron.');
      setCur(''); setNeu(''); setNeu2('');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="myaccount">
      <h2>Mi cuenta</h2>
      {err && <div className="ma-error">{err}</div>}
      {msg && <div className="ma-notice">{msg}</div>}
      {me && (
        <table className="ma-table">
          <tbody>
            <tr><th>Usuario</th><td>{me.login_name}</td></tr>
            <tr><th>Nombre</th><td>{me.display_name}</td></tr>
            <tr><th>Email</th><td>{me.email || '—'}</td></tr>
            <tr><th>Rol</th><td>{me.is_admin ? 'admin global' : 'estándar'}</td></tr>
            <tr><th>Lectura</th><td>{me.read_only_flag === 'Y' ? 'solo lectura' : 'lectura y escritura'}</td></tr>
            <tr><th>HOAs</th><td>{me.is_admin ? 'todas' :
              (me.hoas || []).map((h) => `${h.hoa_code} (${h.role})`).join(', ') || '—'}</td></tr>
          </tbody>
        </table>
      )}
      <h3>Cambiar mi clave</h3>
      <form className="ma-form" onSubmit={handleChange}>
        <label>Clave actual
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </label>
        <label>Nueva clave (8+)
          <input type="password" value={neu} onChange={(e) => setNeu(e.target.value)} autoComplete="new-password" />
        </label>
        <label>Confirmar nueva
          <input type="password" value={neu2} onChange={(e) => setNeu2(e.target.value)} autoComplete="new-password" />
        </label>
        <button type="submit" disabled={busy || !cur || !neu}>Actualizar clave</button>
      </form>
    </div>
  );
}
