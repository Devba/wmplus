





function ButtonRow({ onSelectPage, onEnterBankAction }) {
  return (
    <div className="bankdc-button-row">

      <button
        type="button"
        className="bankdc-btn bankdc-enter-btn"
        onClick={onEnterBankAction}
      >
        ENTER DEBITS / CREDITS
      </button>

      <button
        type="button"
        className="bankdc-btn bankdc-void-btn"
      >
        VOID BANK TRANSACTION
      </button>

      <button
        type="button"
        className="bankdc-btn bankdc-back-btn"
        onClick={() => onSelectPage('master-navigation-panel')}
      >
        BACK TO NAV PANEL
      </button>

    </div>
  );
}

export default ButtonRow;