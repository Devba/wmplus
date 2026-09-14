
import { useEffect, useState } from 'react';
import './TopRibbon.css';
import { apiFetch } from '../../config/api';


function TopRibbon({ onSelectPage, user, onLogout, activeHoa, onSelectHoa }) {
  const [hoas, setHoas] = useState([]);

  // FASE A2: HOAs alcanzables (asignadas; admin: todas). Auto-selección inicial.
  useEffect(() => {
    let cancelled = false;
    if (!user) { setHoas([]); return; }
    (async () => {
      try {
        const data = await apiFetch('/auth/hoas');
        if (cancelled) return;
        const list = data.hoas || [];
        setHoas(list);
        if (!activeHoa && list.length === 1) onSelectHoa(list[0].hoa_id || list[0].id);
      } catch {
        if (!cancelled) setHoas([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);
  const scopeLabel = !user
    ? ''
    : user.is_admin
      ? 'admin · todas las HOAs'
      : (user.hoas || []).map((h) => `${h.hoa_code} · ${h.role}`).join(', ') || 'sin HOAs';
  return (
    <div className="top-ribbon">
    <div className="ribbon-inner">
    <div className="ribbon-group"> 

  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-violations"></div>
      <div className="label">Manage Violations</div>
    </div>


    <div className="ribbon-btn">
      <div className="icon icon-lateassmt"></div>
      <div className="label">Manage<br />Late Assmt</div>
    </div>
  </div>

  <div className="group-label">VIOLATIONS</div>
</div>
    </div>

  <div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-arrears"></div>
      <div className="label">Manage Arrears</div>
    </div>
  </div>

  <div className="group-label">
    ARREARS
  </div>
  {/* End ARREARS ribbon-group  */}
</div> 

<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-summarize"></div>
      <div className="label">Summarize A/R Aging</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-archive-ar"></div>
      <div className="label">Archive<br />AR</div>
    </div>
  </div>

  <div className="group-label">
    ACCOUNTS RECEIVABLE
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-addressbook"></div>
      <div className="label">All Residents</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-showdetailspage"></div>
      <div className="label">Select 1 Resident</div>
    </div>
  </div>

  <div className="group-label">
    RESIDENTS ACTIVITY<br />REPORTS
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-accesslistcontacts"></div>
      <div className="label">SEARCH IDs</div>
    </div>
  </div>

  <div className="group-label">
    RESIDENT<br />ACCT&nbsp;&nbsp;ID
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn ribbon-btn-daily-deposit">
      <div className="icon icon-reviewacceptchange"></div>
      <div className="label">VERIFY<br />DEPOSIT</div>
    </div>
  </div>

  <div className="group-label">
    DAILY DEPOSIT<br />SLIP CHECK
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-addresident"></div>
      <div className="label">Add Resident</div>
    </div>

    <div className="ribbon-btn">
      <div className="icon icon-editresident"></div>
      <div className="label">Edit Resident</div>
    </div>
  </div>

  <div className="group-label">
    MAIN DIRECTORY
  </div>
</div>


<div className="ribbon-group">
  <div className="ribbon-buttons">

    <div className="ribbon-btn" onClick={() => document.dispatchEvent(new CustomEvent('ribbon-add-vendor'))}>
      <div className="icon icon-addvendor"></div>
      <div className="label">Add Vendor</div>
    </div>

    <div className="ribbon-btn" onClick={() => document.dispatchEvent(new CustomEvent('ribbon-edit-vendor'))}>
      <div className="icon icon-editvendor"></div>
      <div className="label">Edit Vendor</div>
    </div>

    <div className="ribbon-btn" onClick={() => document.dispatchEvent(new CustomEvent('ribbon-delete-vendor'))}>
      <div className="icon icon-deletevendor"></div>
      <div className="label">Delete Vendor</div>
    </div>

  </div>

  <div className="group-label">
    VENDOR ID
  </div>
</div>

<div className="ribbon-group">
  <div className="ribbon-buttons">
    <div className="ribbon-btn">
      <div className="icon icon-newyearinvoices"></div>
      <div className="label">
        New Year<br />Invoices
      </div>
    </div>
  </div>

  <div className="group-label">
    NEW YEAR<br />INVOICES
  </div>
</div>





<div className="ribbon-group">
  <div className="ribbon-buttons">

    <div
  className="ribbon-btn ribbon-btn-master"
  onClick={() => onSelectPage('master-navigation-panel')}
    >
      <div className="label label-master">
        Go To<br />
        Master Nav<br />
        Panel
      </div>
    </div>

  </div>

  <div className="group-label">
    MASTER NAV
  </div>
</div>










{/* Tier 1: grupo REPORTES (solo lectura; visible también a view-only) */}
<div className="ribbon-group" title="Reportes por HOA activa">
  <div className="ribbon-buttons">
    <div className="ribbon-btn" onClick={() => onSelectPage('report-letter-codes')} style={{ cursor: 'pointer' }}>
      <div className="icon icon-summarize"></div>
      <div className="label">Letter<br />Codes</div>
    </div>
    <div className="ribbon-btn" onClick={() => onSelectPage('report-gl-accounts')} style={{ cursor: 'pointer' }}>
      <div className="icon icon-showdetailspage"></div>
      <div className="label">GL<br />Accounts</div>
    </div>
    <div className="ribbon-btn" onClick={() => onSelectPage('report-dues-rates')} style={{ cursor: 'pointer' }}>
      <div className="icon icon-reviewacceptchange"></div>
      <div className="label">Dues<br />Rates</div>
    </div>
  </div>
  <div className="group-label">REPORTES</div>
</div>

{/* FASE A: chip de usuario/scope visible + acciones explícitas */}
{user && (
  <div className="ribbon-group" title={`Sesión: ${user.login_name}`}>
    <div className="ribbon-buttons">
      <div className="ribbon-btn" style={{ cursor: 'default' }}>
        <div className="icon icon-showdetailspage"></div>
        <div className="label">{user.display_name || user.login_name}<br />{scopeLabel}</div>
      </div>
      <div className="ribbon-btn" onClick={() => onSelectPage('my-account')} style={{ cursor: 'pointer' }} title="Mi cuenta y cambio de clave">
        <div className="icon icon-addressbook"></div>
        <div className="label">Mi<br />cuenta</div>
      </div>
      <div className="ribbon-btn" onClick={onLogout} style={{ cursor: 'pointer' }} title="Cerrar sesión">
        <div className="icon icon-archive-ar"></div>
        <div className="label">Cerrar<br />sesión</div>
      </div>
    </div>
    <div className="group-label">USUARIO</div>
  </div>
)}

{/* FASE A2: acceso a administración (solo admin global) */}
{user && user.is_admin && (
  <div className="ribbon-group" title="Administración de usuarios">
    <div className="ribbon-buttons">
      <div className="ribbon-btn" onClick={() => onSelectPage('user-admin')} style={{ cursor: 'pointer' }}>
        <div className="icon icon-addressbook"></div>
        <div className="label">Admin<br />Usuarios</div>
      </div>
    </div>
    <div className="group-label">ADMIN</div>
  </div>
)}

{/* FASE A2: selector de HOA activa */}
{user && hoas.length > 0 && (
  <div className="ribbon-group" title="HOA activa (scope de datos)">
    <div className="ribbon-buttons">
      <select
        value={activeHoa || ''}
        onChange={(e) => onSelectHoa(e.target.value)}
        style={{ maxWidth: 170, padding: '0.35rem', borderRadius: 6 }}
      >
        <option value="">-- HOA --</option>
        {user && user.is_admin && (
          <option value="all">Todas las HOAs</option>
        )}
        {hoas.map((h) => (
          <option key={h.hoa_id || h.id} value={h.hoa_id || h.id}>
            {h.hoa_code} · {h.legal_name}
          </option>
        ))}
      </select>
    </div>
    <div className="group-label">
      <span style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: activeHoa ? '#10b981' : '#64748b', marginRight: 4,
      }} />
      {(() => {
        if (String(activeHoa).toLowerCase() === 'all') return 'HOA: TODAS';
        const cur = hoas.find((h) => String(h.hoa_id || h.id) === String(activeHoa));
        return cur ? `HOA: ${cur.hoa_code}` : 'SIN HOA';
      })()}
    </div>
  </div>
)}

{/* End ribbon-inner */}
  </div>

)
}

export default TopRibbon