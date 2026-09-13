import { useEffect, useState } from 'react';
import { apiFetch, API_BASE_URL } from '../../config/api';
import './UserAdmin.css';

// FASE A2: administración de usuarios (solo admin global).
// Lista, alta con clave temporal (visible una vez), activar/desactivar,
// rol/read-only, asignaciones HOA, reset de clave.
const ROLES = ['manager', 'accountant', 'viewer'];

export default function UserAdmin() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [hoas, setHoas] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ login_name: '', display_name: '', email: '', authorization_level: 1, read_only_flag: 'N' });

  async function reload() {
    setError('');
    try {
      const m = await apiFetch('/auth/me');
      setMe(m.user);
      if (!m.user.is_admin) return;
      const u = await apiFetch('/admin/users');
      setUsers(u.users || []);
      setAssignments(u.assignments || []);
      const h = await apiFetch('/auth/hoas');
      setHoas(h.hoas || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { reload(); }, []);

  async function call(method, path, body) {
    setError(''); setNotice('');
    try {
      const data = await apiFetch(path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (data && data.temp_password) {
        setNotice(`Clave temporal (cópiala ahora, no se muestra de nuevo): ${data.temp_password}`);
      }
      await reload();
    } catch (e) {
      setError(e.message);
    }
  }

  if (me && !me.is_admin) {
    return <div className="useradmin"><h2>Usuarios</h2><p>Sin acceso: requiere administrador.</p></div>;
  }

  return (
    <div className="useradmin">
      <h2>Administración de usuarios</h2>
      {error && <div className="ua-error">{error}</div>}
      {notice && <div className="ua-notice">{notice}</div>}

      <h3>Alta (clave temporal)</h3>
      <div className="ua-row">
        <input placeholder="login_name" value={form.login_name}
          onChange={(e) => setForm({ ...form, login_name: e.target.value })} />
        <input placeholder="Nombre visible" value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        <input placeholder="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Nivel <input type="number" min="1" max="9" value={form.authorization_level}
          onChange={(e) => setForm({ ...form, authorization_level: e.target.value })} /></label>
        <label><input type="checkbox" checked={form.read_only_flag === 'Y'}
          onChange={(e) => setForm({ ...form, read_only_flag: e.target.checked ? 'Y' : 'N' })} /> Solo lectura</label>
        <button onClick={() => call('POST', '/admin/users', form)}>Crear</button>
      </div>

      <h3>Usuarios ({users.length})</h3>
      <table className="ua-table">
        <thead><tr><th>Login</th><th>Nombre</th><th>Nivel</th><th>RO</th><th>Activo</th><th>HOAs</th><th>Acciones</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.login_name}</td>
              <td>{u.display_name}</td>
              <td>{u.authorization_level}</td>
              <td>{u.read_only_flag}</td>
              <td>{u.active_flag}</td>
              <td>{assignments.filter((a) => a.user_id === u.user_id)
                .map((a) => `${a.hoa_code}:${a.role}${a.active_flag === 'Y' ? '' : '(off)'}`).join(', ') || '—'}</td>
              <td className="ua-actions">
                <button onClick={() => call('PUT', `/admin/users/${u.user_id}`,
                  { active_flag: u.active_flag === 'Y' ? 'N' : 'Y' })}>
                  {u.active_flag === 'Y' ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => call('POST', `/admin/users/${u.user_id}/reset-password`)}>
                  Reset clave
                </button>
                <select defaultValue="" onChange={(e) => {
                  if (!e.target.value) return;
                  const [hoa_id, role] = e.target.value.split(':');
                  call('POST', `/admin/users/${u.user_id}/assignments`, { hoa_id, role });
                  e.target.value = '';
                }}>
                  <option value="">+ Asignar HOA…</option>
                  {hoas.map((h) => ROLES.map((r) => (
                    <option key={`${h.hoa_id || h.id}:${r}`} value={`${h.hoa_id || h.id}:${r}`}>
                      {(h.hoa_code)} · {r}
                    </option>
                  )))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ua-hint">API base: {API_BASE_URL}. Quitar asignación: vía API DELETE /api/admin/users/:id/assignments/:assignId.</p>
    </div>
  );
}
