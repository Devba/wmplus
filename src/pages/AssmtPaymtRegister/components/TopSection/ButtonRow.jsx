


import { openOverlay } from '../../../../engines';

import FilterUF from '../../../../components/FilterUF/FilterUF';
import EnterAssmtPaymentUF from './EnterAssmtPaymentUF/EnterAssmtPaymentUF';
import VoidAssmtPaymentUF from '../VoidAssmtPaymentUF/VoidAssmtPaymentUF';

function ButtonRow({
  onSelectPage,
  residents = [],
  onApplyResidentFilter,
  onResetResidentFilter,
  onAddPayment
}) {
  const handleOpenResidentFilter = () => {
    openOverlay({
      title: '',
      component: (
        <FilterUF
          page="apr"
          pageLabel="ASSESSMENT PAYMENT REGISTER"
          showResidents
          showVendors={false}
          residents={residents}
          onApplyFilter={
            onApplyResidentFilter
          }
        />
      ),
      width: '1260px',
      maxWidth: '96vw'
    });
  };

  const handleOpenEnterPayment = () => {

    openOverlay({
      title:
        'RESIDENT ASSESSMENT PAYMENT',
      component: (
        <EnterAssmtPaymentUF
          residents={residents}
          onAddPayment={
            onAddPayment
          }
        />
      ),
      width: '1200px',
      maxWidth: '96vw'
    });
  };

const handleOpenVoidPayment = () => {
  openOverlay({
    title: 'VOID ASSESSMENT PAYMENT',
    component: <VoidAssmtPaymentUF />,
    width: '820px',
    maxWidth: '96vw'
  });
};







  return (
    <div className="apr-button-row">
      <button
        type="button"
        className="apr-btn-filter"
        onClick={
          handleOpenResidentFilter
        }
      >
        RESIDENT FILTER
      </button>

      <button
        type="button"
        className="apr-btn-reset"
        onClick={
          onResetResidentFilter
        }
      >
        RESET FILTER
      </button>

      <button
        type="button"
        className="apr-btn-back"
        onClick={() =>
          onSelectPage(
            'master-navigation-panel'
          )
        }
      >
        BACK TO NAV PANEL
      </button>

      <button
        type="button"
        className="apr-btn-enter"
        onClick={
          handleOpenEnterPayment
        }
      >
        ENTER ASS&apos;MT PAYMENTS
      </button>

      <button
        type="button"
        className="apr-btn-void"
        onClick={handleOpenVoidPayment}
      >
        VOID ASSMT PAYMT
      </button>

      <button
        type="button"
        className="apr-btn-ach"
      >
        ENTER ACH PAYMENTS
      </button>

      <button
        type="button"
        className="apr-btn-batch"
      >
        ENTER BATCH PAYMENTS
      </button>
    </div>
  );
}

export default ButtonRow;