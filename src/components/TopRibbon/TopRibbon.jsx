
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './TopRibbon.css';
import { apiFetch } from '../../config/api';

// Reportes disponibles en el diálogo. `escrow: true` indica que requiere
// can_view_escrow_flag = 'Y' (si no, se oculta para ese usuario).
const REPORT_ITEMS = [
  { key: 'report-letter-codes', label: 'Letter Codes', icon: 'SUMMARIZE.png' },
  { key: 'report-gl-accounts', label: 'GL Accounts', icon: 'ShowDetailsPage.png' },
  { key: 'report-dues-rates', label: 'Dues Rates', icon: 'ReviewAcceptChange.png' },
  { key: 'report-open-checks', label: 'Open Checks', icon: 'SUMMARIZE.png' },
  { key: 'report-payment-summary', label: 'Payment Summary', icon: 'ShowDetailsPage.png' },
  { key: 'report-ar-summary', label: 'AR Summary', icon: 'AddressBook.png' },
  { key: 'escrow-account-summary', label: 'Escrow Account Summary', icon: 'AddressBook.png', escrow: true },
  { key: 'escrow-cf', label: 'Escrow Cash Flow', icon: 'ShowDetailsPage.png', escrow: true },
  { key: 'historic-escrow', label: 'Historic Escrow', icon: 'ReviewAcceptChange.png', escrow: true },
];

function openUsuarioDialog(user, scopeLabel, onSelectPage, onLogout) {
  const base = import.meta.env.BASE_URL || '/';
  const actions = [
    { action: 'my-account', label: 'Mi cuenta', icon: 'AddressBook.png', title: 'Mi cuenta y cambio de clave' },
    { action: 'logout', label: 'Cerrar sesión', icon: 'FileManageMenu.png', title: 'Cerrar sesión' },
  ];
  const buttonsHtml = actions.map(
    (a) => `<button type="button" data-action="${a.action}" title="${a.title}" class="swal-reports-btn">` +
      `<img src="${base}icons/${a.icon}" alt="" class="swal-reports-icon" />` +
      `<span>${a.label}</span></button>`
  ).join('');
  Swal.fire({
    title: `Sesión: ${user.login_name}`,
    html: (scopeLabel ? `<p class="swal-usuario-scope">${scopeLabel}</p>` : '') +
      `<div class="swal-reports-grid">${buttonsHtml}</div>`,
    showConfirmButton: false,
    showCloseButton: true,
    width: 420,
    didOpen: () => {
      const container = Swal.getHtmlContainer();
      container.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          Swal.close();
          if (action === 'logout') onLogout();
          else onSelectPage('my-account');
        });
      });
    },
  });
}

function openReportsDialog(onSelectPage, user) {
  const base = import.meta.env.BASE_URL || '/';
  // Filtra reportes Escrow si el usuario no tiene can_view_escrow_flag = 'Y'
  const canEscrow = !user || user.can_view_escrow_flag !== 'N';
  const items = REPORT_ITEMS.filter((r) => !r.escrow || canEscrow);
  const buttonsHtml = items.map(
    (r) => `<button type="button" data-report="${r.key}" class="swal-reports-btn">` +
      `<img src="${base}icons/${r.icon}" alt="" class="swal-reports-icon" />` +
      `<span>${r.label}</span></button>`
  ).join('');
  Swal.fire({
    title: 'Reportes',
    html: `<div class="swal-reports-grid">${buttonsHtml}</div>`,
    showConfirmButton: false,
    showCloseButton: true,
    width: 420,
    didOpen: () => {
      const container = Swal.getHtmlContainer();
      container.querySelectorAll('[data-report]').forEach((btn) => {
        btn.addEventListener('click', () => {
          Swal.close();
          onSelectPage(btn.getAttribute('data-report'));
        });
      });
    },
  });
}


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










{/* Tier 1: grupo REPORTES comprimido a 1 icono (diálogo con los 6 reportes) */}
<div className="ribbon-group" title="Reportes por HOA activa">
  <div className="ribbon-buttons">
    <div className="ribbon-btn" onClick={() => openReportsDialog(onSelectPage, user)} style={{ cursor: 'pointer' }}>
      <div className="icon icon-report"></div>
      <div className="label">Reportes</div>
    </div>
  </div>
  <div className="group-label">REPORTES</div>
</div>

{/* FASE A: grupo USUARIO comprimido a 1 icono (diálogo con Mi cuenta + Cerrar sesión) */}
{user && (
  <div className="ribbon-group" title={`Sesión: ${user.login_name}`}>
    <div className="ribbon-buttons">
      <div className="ribbon-btn" onClick={() => openUsuarioDialog(user, scopeLabel, onSelectPage, onLogout)} style={{ cursor: 'pointer' }}>
        <div className="icon icon-addressbook"></div>
        <div className="label">{user.display_name || user.login_name}</div>
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