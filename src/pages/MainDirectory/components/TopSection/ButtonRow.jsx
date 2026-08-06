


import { useEffect } from 'react';
import { openOverlay } from '../../../../engines';

import FilterUF from '../../../../components/FilterUF/FilterUF';
import AddResidentUF from '../AddResidentUF/AddResidentUF';

function ButtonRow({
  onSelectPage,
  residents,
  selectedResident,
  onApplyResidentFilter,
  onResetFilter,
  onAddResident,
  onEditResident
}) {
  const handleEditResidentDirect = (resident) => {
    const residentName = [
      resident.lastName,
      resident.firstName
    ]
      .filter(Boolean)
      .join(', ');

    const accountNumber =
      resident.acctNo ||
      resident.acct ||
      '';

    openOverlay({
      title: 'MAIN DIRECTORY',
      component: (
        <AddResidentUF
          mode="edit"
          resident={resident}
          onEnterData={(updatedResident) =>
            onEditResident(
              resident,
              updatedResident
            )
          }
        />
      ),
      width: '1400px',
      maxWidth: '98vw'
    });
  };

  useEffect(() => {
    const handleEditClick = (e) => {
      if (e.detail) {
        handleEditResidentDirect(e.detail);
      }
    };

    document.addEventListener('edit-click', handleEditClick);
    return () => {
      document.removeEventListener('edit-click', handleEditClick);
    };
  }, [onEditResident]);

  const handleAddResident = () => {
    openOverlay({
      title: 'MAIN DIRECTORY',
      component: (
        <AddResidentUF
          mode="add"
          resident={null}
          onEnterData={onAddResident}
        />
      ),
      width: '1400px',
      maxWidth: '98vw'
    });
  };

  const handleEditResident = () => {
    if (!selectedResident) {
      window.alert(
        'Please select a resident row before using Edit Resident.'
      );
      return;
    }

    const residentName = [
      selectedResident.lastName,
      selectedResident.firstName
    ]
      .filter(Boolean)
      .join(', ');

    const accountNumber =
      selectedResident.acctNo ||
      selectedResident.acct ||
      '';

    const confirmed = window.confirm(
      `Edit this resident?\n\n` +
      `Acct#: ${accountNumber}\n` +
      `Resident: ${residentName}\n` +
      `Residence: ${selectedResident.residence || ''}`
    );

    if (!confirmed) {
      return;
    }

    openOverlay({
      title: 'MAIN DIRECTORY',
      component: (
        <AddResidentUF
          mode="edit"
          resident={selectedResident}
          onEnterData={(updatedResident) =>
            onEditResident(
              selectedResident,
              updatedResident
            )
          }
        />
      ),
      width: '1400px',
      maxWidth: '98vw'
    });
  };

  const handleResidentFilter = () => {
    openOverlay({
      title: '',
      component: (
        <FilterUF
          pageLabel="MAIN DIRECTORY"
          residents={residents}
          onApplyResidentFilter={
            onApplyResidentFilter
          }
        />
      ),
      width: '1260px',
      maxWidth: '96vw'
    });
  };

  return (
    <div className="md-button-row">
      <button
        id="btnMDAddResident"
        type="button"
        className="btn-green"
        onClick={handleAddResident}
      >
        ADD RESIDENT
      </button>

      <button
        id="btnMDEditResident"
        type="button"
        className="btn-blue"
        onClick={handleEditResident}
      >
        EDIT RESIDENT
      </button>

      <button
        id="btnMDFilter"
        type="button"
        className="btn-blue"
        onClick={handleResidentFilter}
      >
        RESIDENT FILTER
      </button>

      <button
        id="btnMDResetFilter"
        type="button"
        className="btn-blue"
        onClick={onResetFilter}
      >
        RESET FILTER
      </button>

      <button
        id="btnMDBack"
        type="button"
        className="btn-blue"
        onClick={() =>
          onSelectPage('master-navigation-panel')
        }
      >
        BACK TO NAV PANEL
      </button>
    </div>
  );
}

export default ButtonRow;