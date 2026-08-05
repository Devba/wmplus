
import { useMemo, useState, useEffect } from 'react';

import './MainDirectory.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import { fetchResidents, createResident, updateResident } from '../../services/mainDirectoryService.js';

function accountNumberFor(resident) {
  return resident?.acctNo || resident?.acct || '';
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

  const [residentNameFilter, setResidentNameFilter] =
    useState('');

  const [residentAddressFilter, setResidentAddressFilter] =
    useState('');

  const [appliedAccountFilter, setAppliedAccountFilter] =
    useState('');

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
    if (!appliedAccountFilter) {
      return sortedResidents;
    }

    return sortedResidents.filter(
      (resident) =>
        String(accountNumberFor(resident)) ===
        String(appliedAccountFilter)
    );
  }, [sortedResidents, appliedAccountFilter]);

  const handleResidentNameChange = (accountNumber) => {
    setResidentNameFilter(accountNumber);

    if (accountNumber) {
      setResidentAddressFilter('');
    }
  };

  const handleResidentAddressChange = (accountNumber) => {
    setResidentAddressFilter(accountNumber);

    if (accountNumber) {
      setResidentNameFilter('');
    }
  };

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
    setResidentNameFilter('');
    setResidentAddressFilter('');
    setSelectedResident(matchingResident);
  };

  const handleResetFilter = () => {
    setResidentNameFilter('');
    setResidentAddressFilter('');
    setAppliedAccountFilter('');
    setSelectedResident(null);
  };

  const handleAddResident = async (newResident) => {
    try {
      await createResident(newResident);
      setResidents((currentResidents) =>
        sortResidentsByAccount([
          ...currentResidents,
          newResident
        ])
      );

      setResidentNameFilter('');
      setResidentAddressFilter('');
      setAppliedAccountFilter('');
      setSelectedResident(newResident);
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
            residentNameFilter={residentNameFilter}
            residentAddressFilter={
              residentAddressFilter
            }
            onResidentNameChange={
              handleResidentNameChange
            }
            onResidentAddressChange={
              handleResidentAddressChange
            }
            onApplyResidentFilter={
              handleApplyResidentFilter
            }
            onResetFilter={handleResetFilter}
            onAddResident={handleAddResident}
            onEditResident={handleEditResident}
          />
        </div>

        <BodyBox
          residents={displayedResidents}
          selectedResident={selectedResident}
          onSelectResident={setSelectedResident}
        />
      </div>
    </div>
  );
}

export default MainDirectory;