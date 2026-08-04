


import { useMemo, useState } from 'react';

import './MainDirectory.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import mainDirectorySampleData from './data/mainDirectorySampleData.js';

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
  const [residents, setResidents] = useState(() =>
    sortResidentsByAccount(mainDirectorySampleData)
  );

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [residentNameFilter, setResidentNameFilter] =
    useState('');

  const [residentAddressFilter, setResidentAddressFilter] =
    useState('');

  const [appliedAccountFilter, setAppliedAccountFilter] =
    useState('');

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

  const handleAddResident = (newResident) => {
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
  };

  const handleEditResident = (
    originalResident,
    updatedResident
  ) => {
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
  };

  return (
    <div className="md-page">
      <div className="md-shell">
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