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
    if (neu !== neu2) { setErr('New password and confirmation do not match.'); return; }
    if (neu.length < 8) { setErr('New password must be 8+ characters.'); return; }
    setBusy(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: cur, newPassword: neu }),
      });
      setMsg('Password updated. Other sessions were closed.');
      setCur(''); setNeu(''); setNeu2('');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="myaccount">
      <h2>My account</h2>
      {err && <div className="ma-error">{err}</div>}
      {msg && <div className="ma-notice">{msg}</div>}
      {me && (
        <table className="ma-table">
          <tbody>
            <tr><th>User</th><td>{me.login_name}</td></tr>
            <tr><th>Name</th><td>{me.display_name}</td></tr>
            <tr><th>Email</th><td>{me.email || '—'}</td></tr>
            <tr><th>Role</th><td>{me.is_admin ? 'global admin' : 'standard'}</td></tr>
            <tr><th>Access</th><td>{me.read_only_flag === 'Y' ? 'read only' : 'read and write'}</td></tr>
            <tr><th>HOAs</th><td>{me.is_admin ? 'all' :
              (me.hoas || []).map((h) => `${h.hoa_code} (${h.role}, lvl ${h.level ?? '?'}${h.assignment_read_only === 'Y' ? ', RO' : ''})`).join(', ') || '—'}</td></tr>
          </tbody>
        </table>
      )}
      <h3>Change my password</h3>
      <form className="ma-form" onSubmit={handleChange}>
        <label>Current password
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
        </label>
        <label>New password (8+)
          <input type="password" value={neu} onChange={(e) => setNeu(e.target.value)} autoComplete="new-password" />
        </label>
        <label>Confirm new password
          <input type="password" value={neu2} onChange={(e) => setNeu2(e.target.value)} autoComplete="new-password" />
        </label>
        <button type="submit" disabled={busy || !cur || !neu}>Update password</button>
      </form>
    </div>
  );
}
