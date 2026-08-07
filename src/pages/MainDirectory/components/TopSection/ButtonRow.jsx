


import { useEffect } from 'react';
import Swal from 'sweetalert2';
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
  onEditResident,
  onAiFilter
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

  const handleAiQuery = async () => {
    const { value: prompt } = await Swal.fire({
      title: '🤖 Consulta IA en Lenguaje Natural',
      input: 'text',
      inputLabel: 'Introduce tu consulta para filtrar la tabla:',
      inputPlaceholder: 'Ej: filtra los registros en los que annual dues rate sea mayor que cero',
      showCancelButton: true,
      confirmButtonText: 'Consultar IA',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2b579a',
      inputValidator: (value) => {
        if (!value) {
          return '¡Por favor ingresa una consulta!';
        }
      }
    });

    if (prompt) {
      Swal.fire({
        title: 'Procesando consulta...',
        text: 'Consultando con el modelo OpenRouter AI...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch('/api/ai-filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        Swal.close();

        if (!response.ok || !data.success) {
          Swal.fire('Error AI', data.error || 'Error al procesar la consulta', 'error');
          return;
        }

        if (onAiFilter) {
          onAiFilter(data.residents || null, prompt);
        }

        Swal.fire({
          icon: 'success',
          title: 'Filtro IA Aplicado',
          text: `Se encontraron y aplicaron ${data.residents?.length || 0} registro(s).`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error de Red', err.message, 'error');
      }
    }
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
        id="btnMDAiQuery"
        type="button"
        className="btn-blue"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontWeight: 'bold' }}
        onClick={handleAiQuery}
      >
        🤖 AI QUERY
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