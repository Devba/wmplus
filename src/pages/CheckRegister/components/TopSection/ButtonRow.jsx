


import { openOverlay } from '../../../../engines';

import EnterCheckUF from '../EnterCheckUF/EnterCheckUF';
import ModifyGLCheckUF from '../ModifyGLCheckUF/ModifyGLCheckUF';
import MonthlySummaryUF from '../MonthlySummaryUF/MonthlySummaryUF';
import VoidCheckUF from '../VoidCheckUF/VoidCheckUF';

function ButtonRow({
  onSelectPage,
  onAddCheck,
  checkRows
}) {
  const handleEnterChecks = () => {
    openOverlay({
      title: 'ENTER CHECKS',
      component: <EnterCheckUF onAddCheck={onAddCheck} />,
      width: '1480px',
      maxWidth: '98vw'
    });
  };

  const handleVoidChecks = () => {
    openOverlay({
      title: 'VOID CHECKS ROUTINE',
      component: <VoidCheckUF />,
      width: '900px',
      maxWidth: '900px'
    });
  };

  const handleModifyGL = () => {
    openOverlay({
      title: 'Modify Check Register GL#',
      component: <ModifyGLCheckUF />,
      width: '900px',
      maxWidth: '900px'
    });
  };

  const handleMonthlySummary = () => {
    openOverlay({
      title: 'CHECK REGISTER MONTHLY SUMMARY',
      component: (
  <MonthlySummaryUF
    onSelectPage={onSelectPage}
    checkRows={checkRows}
  />
  ),
      width: '360px',
      maxWidth: '360px'
    });
  };

  return (
    <div className="checkreg-actions">
      <button
        id="btnCRBackToNav"
        type="button"
        className="checkreg-btn blueText"
        onClick={() =>
          onSelectPage('master-navigation-panel')
        }
      >
        BACK TO NAV PANEL
      </button>

      <button
        id="btnCREnterChecks"
        type="button"
        className="checkreg-btn greenText"
        onClick={handleEnterChecks}
      >
        ENTER CHECKS
      </button>

      <button
        id="btnVoidChecks"
        type="button"
        className="checkreg-btn redText"
        onClick={handleVoidChecks}
      >
        VOID CHECKS
      </button>

      <button
        id="btnPrintChecksCR"
        type="button"
        className="checkreg-btn"
      >
        PRINT CHECKS
      </button>

      <button
        id="btnModifyGLCR"
        type="button"
        className="checkreg-btn blueText"
        onClick={handleModifyGL}
      >
        MODIFY GL#
      </button>

      <button
        id="btnCRMonthlySummary"
        type="button"
        className="checkreg-btn blueText"
        onClick={handleMonthlySummary}
      >
        MONTHLY SUMMARY
      </button>

      <div className="checkreg-yellowbar">
        <button
          id="btnCRVendorIDList"
          type="button"
          className="checkreg-yellowbtn"
          onClick={() => onSelectPage('vendor-id-list')}
        >
          VENDOR ID LIST
        </button>

        <button
          id="btnCROpenChecksReport"
          type="button"
          className="checkreg-yellowbtn"
        >
          OPEN CHECKS REPORT
        </button>
      </div>
    </div>
  );
}

export default ButtonRow;