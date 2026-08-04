



import { openOverlay } from '../../../../engines';
import EnterDepositUF from '../EnterDepositUF/EnterDepositUF';
import MonthlySummaryUF from '../MonthlySummaryUF/MonthlySummaryUF';
import VoidDepositUF from '../VoidDepositUF/VoidDepositUF.jsx';
import ModifyGLDepositUF from '../ModifyGLDepositUF/ModifyGLDepositUF.jsx';

function ButtonRow({ onSelectPage, onAddDeposit }) {

const handleEnterDeposits = () => {
  openOverlay({
    title: 'DEPOSIT REGISTER ENTRY',
    component: (
      <EnterDepositUF onAddDeposit={onAddDeposit} />
    ),
    width: '1320px',
    maxWidth: '98vw'
  });
};



  const handleMonthlySummary = () => {
    openOverlay({
      title: 'DEPOSIT SUMMARY REPORT',
      component: (
        <MonthlySummaryUF onSelectPage={onSelectPage} />
      ),
      width: '360px',
      maxWidth: '360px'
    });
  };

  const handleVoidDeposits = () => {
    openOverlay({
      title: 'VOID DEPOSITS',
      component: <VoidDepositUF />,
      width: '900px',
      maxWidth: '900px'
    });
  };

  const handleModifyGL = () => {
    openOverlay({
      title: 'Modify Deposit Register GL#',
      component: <ModifyGLDepositUF />,
      width: '1220px',
      maxWidth: '1220px'
    });
  };

  return (
    <div className="depreg-button-row">
      <button
        type="button"
        className="depreg-btn-back"
        onClick={() => onSelectPage('master-navigation-panel')}
      >
        BACK TO NAV PANEL
      </button>

      <button
        type="button"
        className="depreg-btn-enter"
        onClick={handleEnterDeposits}
      >
        ENTER DEPOSITS
      </button>

      <button
        type="button"
        className="depreg-btn-void"
        onClick={handleVoidDeposits}
      >
        VOID DEPOSITS
      </button>

      <button
        type="button"
        className="depreg-btn-modify"
        onClick={handleModifyGL}
      >
        MODIFY GL#
      </button>

      <button
        type="button"
        className="depreg-btn-summary"
        onClick={handleMonthlySummary}
      >
        MONTHLY SUMMARY
      </button>

      <button className="depreg-btn-receivables">
        RECEIVABLES SUMMARY
      </button>
    </div>
  );
}

export default ButtonRow;