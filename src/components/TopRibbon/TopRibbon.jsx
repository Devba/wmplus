
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './TopRibbon.css';
import { apiFetch } from '../../config/api';
import { openOverlay } from '../../engines';
import AskPanel from '../../pages/MainDirectory/components/AskPanel/AskPanel';

// Reportes disponibles en el diálogo. `escrow: true` indica que requiere
// can_view_escrow_flag = 'Y' (si no, se oculta para ese usuario).
const REPORT_ITEMS = [
  { key: 'report-letter-codes', label: 'Letter Codes', icon: 'SUMMARIZE.png' },
  { key: 'report-gl-accounts', label: 'GL Accounts', icon: 'ShowDetailsPage.png' },
  { key: 'report-dues-rates', label: 'Dues Rates', icon: 'ReviewAcceptChange.png' },
  { key: 'report-open-checks', label: 'Open Checks', icon: 'SUMMARIZE.png' },
  { key: 'report-payment-summary', label: 'Payment Summary', icon: 'ShowDetailsPage.png' },
  { key: 'report-ar-summary', label: 'AR Summary', icon: 'AddressBook.png' },
  { key: 'report-receivables-summary', label: 'Receivables Summary', icon: 'AddressBook.png' },
  { key: 'report-ytd-cash-flow', label: 'YTD Cash Flow Analysis', icon: 'SUMMARIZE.png' },
  { key: 'report-monthly-gl', label: 'Monthly GL Report', icon: 'ShowDetailsPage.png' },
  { key: 'escrow-account-summary', label: 'Escrow Account Summary', icon: 'AddressBook.png', escrow: true },
  { key: 'escrow-cf', label: 'Escrow Cash Flow', icon: 'ShowDetailsPage.png', escrow: true },
  { key: 'historic-escrow', label: 'Historic Escrow', icon: 'ReviewAcceptChange.png', escrow: true },
];

function openMenuDialog({ onSelectPage, user, scopeLabel, onLogout }) {
  const base = import.meta.env.BASE_URL || '/';
  // Filtra reportes Escrow si el usuario no tiene can_view_escrow_flag = 'Y'
  const canEscrow = !user || user.can_view_escrow_flag !== 'N';
  const generalItems = REPORT_ITEMS.filter((r) => !r.escrow);
  const escrowItems = canEscrow ? REPORT_ITEMS.filter((r) => r.escrow) : [];

  // Lee estado colapsado de localStorage
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('swal_reports_collapsed') || '{}'); }
    catch { return {}; }
  })();

  const usuarioActions = [
    { action: 'my-account', label: 'My account', icon: 'AddressBook.png', title: 'My account and password change' },
    { action: 'logout', label: 'Log out', icon: 'FileManageMenu.png', title: 'Log out' },
  ];
  const serviceLayerHtml = renderReportGroup(
    'svclayer', 'Service Layer', 2,
    `<button type="button" data-action="golden-set" title="AI router checks (golden set)" class="swal-reports-btn">` +
      `<img src="${base}icons/SUMMARIZE.png" alt="" class="swal-reports-icon" />` +
      `<span>Golden Set</span></button>` +
    `<button type="button" data-action="query-ai" title="Natural language query (AI)" class="swal-reports-btn">` +
      `<img src="${base}icons/ShowDetailsPage.png" alt="" class="swal-reports-icon" />` +
      `<span>Query AI</span></button>`,
    !!stored.svclayer
  );
  const usuarioHtml = user ? renderReportGroup(
    'usuario', 'USER', usuarioActions.length,
    usuarioActions.map(
      (a) => `<button type="button" data-action="${a.action}" title="${a.title}" class="swal-reports-btn">` +
        `<img src="${base}icons/${a.icon}" alt="" class="swal-reports-icon" />` +
        `<span>${a.label}</span></button>`
    ).join(''),
    !!stored.usuario
  ) : '';
  const adminHtml = (user && user.is_admin) ? renderReportGroup(
    'admin', 'ADMIN', 1,
    `<button type="button" data-action="user-admin" title="User administration" class="swal-reports-btn">` +
      `<img src="${base}icons/AddressBook.png" alt="" class="swal-reports-icon" />` +
      `<span>Admin Users</span></button>`,
    !!stored.admin
  ) : '';

  const generalHtml = renderReportGroup(
    'general', 'REPORTS', generalItems.length,
    renderReportButtons(generalItems, base), !!stored.general
  );
  const escrowHtml = escrowItems.length
    ? renderReportGroup(
        'escrow', 'Escrow', escrowItems.length,
        renderReportButtons(escrowItems, base), !!stored.escrow
      )
    : '';

  Swal.fire({
    title: 'AI + Auth Dev',
    html: (scopeLabel && user ? `<p class="swal-usuario-scope">${scopeLabel}</p>` : '') +
      `<div class="swal-reports-list">${serviceLayerHtml}${adminHtml}${usuarioHtml}${generalHtml}${escrowHtml}</div>`,
    showConfirmButton: false,
    showCloseButton: true,
    width: 420,
    didOpen: () => {
      const container = Swal.getHtmlContainer();
      // Toggle de grupos
      container.querySelectorAll('[data-toggle]').forEach((header) => {
        header.addEventListener('click', () => {
          const groupId = header.getAttribute('data-toggle');
          const group = header.parentElement;
          group.classList.toggle('is-collapsed');
          // Persistir estado
          try {
            const cur = JSON.parse(localStorage.getItem('swal_reports_collapsed') || '{}');
            cur[groupId] = group.classList.contains('is-collapsed');
            localStorage.setItem('swal_reports_collapsed', JSON.stringify(cur));
          } catch { /* ignore */ }
        });
      });
      // Click en botones de reporte
      container.querySelectorAll('[data-report]').forEach((btn) => {
        btn.addEventListener('click', () => {
          Swal.close();
          onSelectPage(btn.getAttribute('data-report'));
        });
      });
      // Click en acciones (usuario/admin)
      container.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          Swal.close();
          if (action === 'logout') onLogout();
          else if (action === 'query-ai') {
            // Ir a Main Directory primero para que sus filas queden detrás,
            // y abrir el panel en el siguiente tick (tras el render).
            onSelectPage('main-directory');
            setTimeout(() => {
              openOverlay({
                title: '',
                component: (<AskPanel />),
                width: '860px',
                maxWidth: '94vw'
              });
            }, 60);
          }
          else onSelectPage(action);
        });
      });
    },
  });
}

function renderReportButtons(items, base) {
  return items.map(
    (r) => `<button type="button" data-report="${r.key}" class="swal-reports-btn">` +
      `<img src="${base}icons/${r.icon}" alt="" class="swal-reports-icon" />` +
      `<span>${r.label}</span></button>`
  ).join('');
}

function renderReportGroup(groupId, label, count, itemsHtml, collapsed) {
  return `<div class="swal-reports-group${collapsed ? ' is-collapsed' : ''}" data-group="${groupId}">
    <div class="swal-reports-group-header" data-toggle="${groupId}">
      <span class="swal-reports-group-chevron">▾</span>
      <span class="swal-reports-group-label">${label}</span>
      <span class="swal-reports-group-count">${count}</span>
    </div>
    <div class="swal-reports-group-body">${itemsHtml}</div>
  </div>`;
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
      ? 'admin · all HOAs'
      : (user.hoas || []).map((h) => `${h.hoa_code} · ${h.role}`).join(', ') || 'no HOAs';
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










{/* Menú único: Reportes + Usuario + Admin en un diálogo plano por secciones */}
<div className="ribbon-group" title="AI + Auth Dev">
  <div className="ribbon-buttons">
    <div className="ribbon-btn" onClick={() => openMenuDialog({ onSelectPage, user, scopeLabel, onLogout })} style={{ cursor: 'pointer' }}>
      <div className="icon icon-report"></div>
      <div className="label">AI + Auth Dev</div>
    </div>
  </div>
  <div className="group-label">MENU</div>
</div>

{/* FASE A2: selector de HOA activa */}
{user && hoas.length > 0 && (
  <div className="ribbon-group" title="Active HOA (data scope)">
    <div className="ribbon-buttons">
      <select
        value={activeHoa || ''}
        onChange={(e) => {
          if (e.target.value === '__logout__') { onLogout(); return; }
          onSelectHoa(e.target.value);
        }}
        style={{ maxWidth: 170, padding: '0.35rem', borderRadius: 6 }}
      >
        <option value="">-- HOA --</option>
        {user && user.is_admin && (
          <option value="all">All HOAs</option>
        )}
        {hoas.map((h) => (
          <option key={h.hoa_id || h.id} value={h.hoa_id || h.id}>
            {h.hoa_code} · {h.legal_name}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="__logout__">Log out</option>
      </select>
    </div>
    <div className="group-label">
      <span style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: activeHoa ? '#10b981' : '#64748b', marginRight: 4,
      }} />
      {(() => {
        if (String(activeHoa).toLowerCase() === 'all') return 'HOA: ALL';
        const cur = hoas.find((h) => String(h.hoa_id || h.id) === String(activeHoa));
        return cur ? `HOA: ${cur.hoa_code}` : 'NO HOA';
      })()}
    </div>
  </div>
)}

{/* End ribbon-inner */}
  </div>

)
}

export default TopRibbon