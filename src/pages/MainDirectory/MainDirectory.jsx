
import { useMemo, useState, useEffect } from 'react';

import './MainDirectory.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import { fetchResidents, createResident, updateResident } from '../../services/mainDirectoryService.js';

function accountNumberFor(resident) {
  const raw =
    resident?.acctNo ||
    resident?.acct ||
    '';

  const digits = String(raw).replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return digits.padStart(6, '0');
}

function sortResidentsByAccount(rows) {
  return [...rows].sort((a, b) => {
    const aRaw = String(
      accountNumberFor(a)
    ).trim();

    const bRaw = String(
      accountNumberFor(b)
    ).trim();

    const aIsBlank = aRaw === '';
    const bIsBlank = bRaw === '';

    if (aIsBlank && !bIsBlank) {
      return 1;
    }

    if (!aIsBlank && bIsBlank) {
      return -1;
    }

    if (aIsBlank && bIsBlank) {
      return 0;
    }

    return aRaw.localeCompare(
      bRaw,
      undefined,
      { numeric: true }
    );
  });
}

function MainDirectory({ onSelectPage }) {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [appliedAccountFilter, setAppliedAccountFilter] =
    useState('');

  const [aiResidents, setAiResidents] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchResidents();
        if (active) {
          setResidents(sortResidentsByAccount(data));
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Error loading residents');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const sortedResidents = useMemo(
    () => sortResidentsByAccount(residents),
    [residents]
  );

  const displayedResidents = useMemo(() => {
    let result = aiResidents !== null ? aiResidents : sortedResidents;

    if (appliedAccountFilter) {
      result = result.filter(
        (resident) =>
          String(accountNumberFor(resident)) ===
          String(appliedAccountFilter)
      );
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter((r) => {
        const name = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
        const acct = String(accountNumberFor(r)).toLowerCase();
        const address = (r.residence || r.address || '').toLowerCase();
        const phone = (r.phone || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        return (
          name.includes(term) ||
          acct.includes(term) ||
          address.includes(term) ||
          phone.includes(term) ||
          email.includes(term)
        );
      });
    }

    return result;
  }, [sortedResidents, appliedAccountFilter, aiResidents, searchTerm]);

  const handleApplyResidentFilter = (
    accountNumber
  ) => {
    const matchingResident = sortedResidents.find(
      (resident) =>
        String(accountNumberFor(resident)) ===
        String(accountNumber)
    );

    if (!matchingResident) {
      window.alert(
        'No Main Directory resident found.'
      );
      return;
    }

    setAppliedAccountFilter(accountNumber);
    setSearchTerm('');
    setSelectedResident(matchingResident);
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setAppliedAccountFilter('');
    setAiResidents(null);
    setAiPrompt('');
    setSelectedResident(null);
  };

  const handleAddResident = async (newResident) => {
  try {
    const result = await createResident(newResident);

    const savedResident = {
      ...newResident,
      acctNo: result.account_id,
      acct: result.account_id
    };

    setResidents((currentResidents) =>
      sortResidentsByAccount([
        ...currentResidents,
        savedResident
      ])
    );

      setSearchTerm('');
      setAppliedAccountFilter('');
      setSelectedResident(savedResident);
    } catch (err) {
      window.alert('Error creating resident: ' + err.message);
    }
  };

  const handleEditResident = async (
    originalResident,
    updatedResident
  ) => {
    try {
      const accountId = originalResident.acctNo || originalResident.acct || originalResident.account_id;
      await updateResident(accountId, updatedResident);

      setResidents((currentResidents) =>
        sortResidentsByAccount(
          currentResidents.map((resident) =>
            resident === originalResident
              ? updatedResident
              : resident
          )
        )
      );

      setSelectedResident(updatedResident);

      if (appliedAccountFilter) {
        setAppliedAccountFilter(
          accountNumberFor(updatedResident)
        );
      }
    } catch (err) {
      window.alert('Error updating resident: ' + err.message);
    }
  };

  const handleDoubleClickResident = (resident) => {
    setSelectedResident(resident);
    const event = new CustomEvent('edit-click', { detail: resident });
    document.dispatchEvent(event);
  };

  return (
    <div className="md-page">
      <div className="md-shell">
        {loading && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', zIndex: 1000, color: '#333', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            Loading Resident Data...
          </div>
        )}
        {error && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ffebee', border: '1px solid #c62828', color: '#c62828', padding: '20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            Error: {error}
          </div>
        )}
        <div className="md-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            residents={sortedResidents}
            selectedResident={selectedResident}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onApplyResidentFilter={
              handleApplyResidentFilter
            }
            onResetFilter={handleResetFilter}
            onAddResident={handleAddResident}
            onEditResident={handleEditResident}
            onAiFilter={(filteredRows, promptText) => {
              setAiResidents(filteredRows);
              setAiPrompt(promptText);
            }}
          />
        </div>

        <BodyBox
          residents={displayedResidents}
          selectedResident={selectedResident}
          onSelectResident={setSelectedResident}
          onDoubleClickResident={handleDoubleClickResident}
        />
      </div>
    </div>
  );
}

export default MainDirectory;