
import './MasterNavPanel.css'

function MasterNavPanel({ onSelectPage }) {
  return (
    <main className="mnp-page">

    

      <section className="mnp-header">

  <div className="mnp-logo-left">
    <img 
      src="/PICTURE FILES/hoa-logo.png"
      alt="HOA-e-Solutions"
    />
  </div>

  <div className="mnp-title">

  <img
    src="/PICTURE FILES/manage-plus-logo.png"
    alt="Manage Plus"
  />

  <img
    className="mnp-bubble"
    // src="/PICTURE FILES/hoa-logo.png"
    src="/PICTURE FILES/bubble1.png"
    alt="Information"
  />

</div>

    </section>

      <section className="mnp-mid" aria-label="Master Navigation Panel Options">
        <div className="left-col">
          <img className="house" src="/PICTURE FILES/HOUSE.jpg" alt="House" />
          <button className="prestart-btn" type="button">
            Pre-Start Up System Programming
          </button>
        </div>

        <div className="right-col">
          <div className="button-grid" role="navigation" aria-label="Master Navigation Panel">
            <button
                className="mnp-btn"
                type="button"
                onClick={() => onSelectPage('check-register')}
              >
                PAYMENTS
            </button>
            <button className="mnp-btn" type="button">BANKING</button>


            <button
                className="mnp-btn"
                type="button"
                onClick={() => onSelectPage('main-directory')}
            >
                MAIN DIRECTORY
            </button>

            <button
              className="mnp-btn"
              type="button"
              onClick={() => onSelectPage('deposit-register')}
            >
              DEPOSITS
            </button>

            <button className="mnp-btn" type="button">ACCOUNTS RECEIVABLE</button>
            <button className="mnp-btn" type="button">REPORTS</button>

            <button
              className="mnp-btn"
              type="button"
              onClick={() => onSelectPage('assmt-paymt-register')}
            >
              ASSESSMENT DEPOSITS
            </button>

            <button className="mnp-btn" type="button">FINANCIALS</button>
            <button className="mnp-btn" type="button">BUDGETS</button>

            <button className="mnp-btn" type="button">VIOLATIONS</button>
            <button className="mnp-btn" type="button">ESCROW ACCT SUMMARY</button>


            {/* <button className="mnp-btn" type="button">SETTINGS</button> */}
            

            <button
              className="mnp-btn"
              type="button"
              onClick={() => onSelectPage('settings')}
            >
              SETTINGS
            </button>
          
          
          
          </div>
        </div>
      </section>

      <footer className="mnp-bottom" aria-label="Legal Notices">
        <img className="notice notice-left" src="/PICTURE FILES/MASTER NAV WARNING 1.png" alt="Confidentiality notice" />
        <img className="notice notice-right" src="/PICTURE FILES/MASTER NAV WARNING 2.png" alt="Program protection warning" />
      </footer>
    </main>
  )
}

export default MasterNavPanel