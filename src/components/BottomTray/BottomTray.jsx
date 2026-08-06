import { useRef, useState } from 'react'

const trayItems = [
  { key: 'master-navigation-panel', label: 'Master Navigation Panel' },
  { key: 'main-directory', label: 'Main Directory' },
  { key: 'report', label: 'Report' },
  { key: 'ytd-acct-cash-flow-analysis', label: 'YTD Acct Cash Flow Analysis' },
  { key: 'monthly-general-ledger-report', label: 'Monthly General Ledger Report' },
  { key: 'check-register', label: 'Check Register' },
  { key: 'check-register-monthly-summary', label: 'Check Register Monthly Summary' },
  { key: 'vendor-id-list', label: 'Vendor ID List' },
  { key: 'open-check-register-report', label: 'Open Check Register Report' },
  { key: 'escrow-account-summary', label: 'Escrow Account Summary' },
  { key: 'escrow-cf', label: 'Escrow_CF' },
  { key: 'historic-escrow', label: 'Historic Escrow' },
  { key: 'deposit-register', label: 'Deposit Register' },
  { key: 'receivables-summary', label: 'Receivables Summary' },
  { key: 'deposit-register-monthly-summary', label: 'Deposit Register Monthly Summary' },
  { key: 'payment-summary', label: 'Payment Summary' },
  { key: 'credit-card-services', label: 'Credit Card Services' },
  { key: 'bank-debits-credits', label: 'Bank Debits & Credits' },
  { key: 'xfer-intra-acct-deposits', label: '$$ XFER & Intra Acct Deposits' },
  { key: 'assmt-paymt-register', label: 'Assmt Paymt Register' },
  { key: 'resident-assmt-paymt-summary', label: 'Resident Assmt Paymt Summary' },
  { key: 'yrly-assmt-register', label: 'YRLY Assmt Register' },
  { key: 'qtrly-assmt-register', label: 'QTRLY Assmt Register' },
  { key: 'monthly-assmt-register', label: 'Monthly Assmt Register' },
  { key: 'startup-resident-paymt-register', label: 'Startup Resident Paymt Register' },
  { key: 'accounts-receivable-aging', label: 'Accounts Receivable Aging' },
  { key: 'ar-summary', label: 'AR Summary' },
  { key: 'accounts-receivable-archive', label: 'Accounts Receivable Archive' },
  { key: 'violation-register', label: 'Violation Register' },
  { key: 'violation-letter-codes', label: 'Violation Letter Codes' },
  { key: 'annual-budget', label: 'Annual Budget' },
  { key: 'ledger-id', label: 'Ledger ID' },
  { key: 'settings', label: 'Settings' }
]

function BottomTray({ currentPage, onSelectPage }) {
  const trayRef = useRef(null)
  const [filter, setFilter] = useState('')

  function scrollTray(direction) {
    if (!trayRef.current) return
    trayRef.current.scrollBy({
      left: direction * 220,
      behavior: 'smooth'
    })
  }

  const filteredItems = filter
    ? trayItems.filter(item => 
        item.label.toLowerCase().includes(filter.toLowerCase()) ||
        item.key.toLowerCase().includes(filter.toLowerCase())
      )
    : trayItems

  return (
    <div className="tray-inner">
      <input
        type="text"
        className="tray-search"
        placeholder="Buscar página..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <button className="tray-arrow" onClick={() => scrollTray(-1)}>&lt;</button>

      <div className="tray-scroll" ref={trayRef}>
        {filteredItems.map((item) => (
            <button
              key={item.key}
              className={'tray-btn ' + (currentPage === item.key ? 'selected' : '')}
              onClick={() => onSelectPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        {filteredItems.length === 0 && (
          <span className="tray-no-results">No se encontraron resultados</span>
        )}
      </div>

      <button className="tray-arrow" onClick={() => scrollTray(1)}>&gt;</button>
    </div>
  )
}

export default BottomTray