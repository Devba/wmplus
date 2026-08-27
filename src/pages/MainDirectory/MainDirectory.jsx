
import { useMemo, useState, useEffect } from 'react';

import './MainDirectory.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import { fetchResidents, createResident, updateResident } from '../../services/mainDirectoryService.js';
import { API_BASE_URL } from '../../config/api.js';

function accountNumberFor(resident) {
  const raw =
    resident?.acctNo ||
    resident?.acct ||
    resident?.account_id ||
    resident?.ResidentAccountID ||
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


function mapCurrentResident(r) {
  if (!r) {
    return null;
  }

  return {
    acctNo: r.ResidentAccountID || r.account_id || '',
    acct: r.ResidentAccountID || r.account_id || '',
    account_id: r.ResidentAccountID || r.account_id || '',

    firstName: r.FirstName || r.first_name || '',
    middleName: r.MiddleName || r.middle_name || '',
    lastName: r.LastName || r.last_name || '',
    prefix: r.Prefix || r.prefix || '',

    name:
      r.DisplayName ||
      r.display_name ||
      `${r.FirstName || r.first_name || ''} ${r.LastName || r.last_name || ''}`.trim(),

    residence:
      r.ResidenceAddress ||
      r.residence_address ||
      '',

    address:
      r.ResidenceAddress ||
      r.residence_address ||
      '',

    billingAddress:
      r.BillingAddress ||
      r.billing_address ||
      '',

    city: r.City || r.city || '',
    state: r.StateCode || r.state_code || '',
    st: r.StateCode || r.state_code || '',
    zip: r.ZipCode || r.zip_code || '',

    phone:
      r.PrimaryPhone ||
      r.primary_phone ||
      '',

    email:
      r.EmailAddress ||
      r.email_address ||
      '',

    primaryCell:
      r.PrimaryCell ||
      r.primary_cell ||
      '',

    secondaryCell:
      r.SecondaryCell ||
      r.secondary_cell ||
      '',

    moveInDate:
      r.MoveInDate ||
      r.move_in_date ||
      '',

    type:
      r.ResidentType ||
      r.resident_type ||
      '',

    active:
      r.ActiveResidentFlag ||
      r.active_flag ||
      'Y',

    activeFlag:
      r.ActiveResidentFlag ||
      r.active_flag ||
      'Y',

    ach:
      r.ACHFlag ||
      r.ach_flag ||
      '',

    addlFirst:
      r.AdditionalOwnerFirstName ||
      r.addl_first_name ||
      '',

    addlMiddle:
      r.AdditionalOwnerMiddleName ||
      r.addl_middle_name ||
      '',

    addlLast:
      r.AdditionalOwnerLastName ||
      r.addl_last_name ||
      '',

    addlEmail:
      r.AdditionalOwnerEmail ||
      r.addl_email ||
      '',

    bothFirst:
      `${r.FirstName || r.first_name || ''}${
        (r.AdditionalOwnerFirstName || r.addl_first_name)
          ? ' & ' + (r.AdditionalOwnerFirstName || r.addl_first_name)
          : ''
      }`.trim(),

    annualRate:
      r.AnnualDuesRate ||
      r.annual_dues_rate ||
      'Rate Code A',

    annualDues:
      r.AnnualDues !== null && r.AnnualDues !== undefined
        ? String(r.AnnualDues)
        : (
            r.annual_dues !== null && r.annual_dues !== undefined
              ? String(r.annual_dues)
              : ''
          ),

    dues:
      r.AnnualDues ??
      r.annual_dues ??
      0.00,

    specialRate:
      r.SpecialAssessmentRate ||
      r.special_assessment_rate ||
      'Rate Code A',

    specialDues:
      r.SpecialAssessmentDues !== null &&
      r.SpecialAssessmentDues !== undefined
        ? String(r.SpecialAssessmentDues)
        : (
            r.special_assessment_dues !== null &&
            r.special_assessment_dues !== undefined
              ? String(r.special_assessment_dues)
              : ''
          ),

    nextAnnual:
      r.NextYearAnnualDues !== null &&
      r.NextYearAnnualDues !== undefined
        ? String(r.NextYearAnnualDues)
        : (
            r.next_year_annual_dues !== null &&
            r.next_year_annual_dues !== undefined
              ? String(r.next_year_annual_dues)
              : ''
          ),

    nextSpecial:
      r.NextYearSpecialAssmtDues !== null &&
      r.NextYearSpecialAssmtDues !== undefined
        ? String(r.NextYearSpecialAssmtDues)
        : (
            r.next_year_special_assmt_dues !== null &&
            r.next_year_special_assmt_dues !== undefined
              ? String(r.next_year_special_assmt_dues)
              : ''
          ),

    notes:
      r.ResidentNotes ||
      r.resident_notes ||
      '',

    proRata:
      r.ProRata ??
      r.pro_rata ??
      ''
  };
}

async function fetchCurrentResident(accountNumber) {
  const accountId = String(accountNumber || '').trim();

  const response = await fetch(
    `${API_BASE_URL}/residents/${encodeURIComponent(accountId)}/current`
  );

  const result = await response.json();

  if (!response.ok || !result?.ok || !result?.resident) {
    const error = new Error(
      result?.message ||
      'Unable to retrieve the current resident record.'
    );

    error.code =
      result?.code ||
      'RESIDENT_LOOKUP_ERROR';

    throw error;
  }

  return mapCurrentResident(result.resident);
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

  const handleApplyResidentFilter = async (
    accountNumber
  ) => {
    const accountId =
      String(accountNumber || '').trim();

    if (!accountId) {
      window.alert(
        'No resident account was selected.'
      );
      return;
    }

    try {
      const currentResident =
        await fetchCurrentResident(accountId);

      setResidents((currentResidents) =>
        sortResidentsByAccount(
          currentResidents.map((resident) =>
            accountNumberFor(resident) ===
            accountNumberFor(currentResident)
              ? currentResident
              : resident
          )
        )
      );

      setAppliedAccountFilter(
        accountNumberFor(currentResident)
      );

      setSearchTerm('');
      setSelectedResident(currentResident);

    } catch (err) {
      if (err.code === 'RESIDENT_NOT_FOUND') {
        window.alert(
          'This resident record is no longer current. Please select the current resident.'
        );
      } else {
        window.alert(
          'Unable to retrieve the current resident record.'
        );
      }
    }
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
  if (err.message === 'HTTP 409') {
    window.alert(
      'That residence address is already assigned to another resident. Please select a different residence address.'
    );
  } else {
    window.alert(
      'Error creating resident: ' + err.message
    );
  }

  throw err;
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
      if (err.message === 'HTTP 409') {
        window.alert(
          'That residence address is already assigned to another resident. Please select a different residence address.'
        );
      } else {
        window.alert(
          'Error updating resident: ' + err.message
        );
      }

      throw err;
    }
  };

  const handleDoubleClickResident = async (resident) => {
    const accountId = accountNumberFor(resident);

    if (!accountId) {
      return;
    }

    try {
      const currentResident =
        await fetchCurrentResident(accountId);

      setResidents((currentResidents) =>
        sortResidentsByAccount(
          currentResidents.map((row) =>
            accountNumberFor(row) ===
            accountNumberFor(currentResident)
              ? currentResident
              : row
          )
        )
      );

      setSelectedResident(currentResident);

      const event = new CustomEvent(
        'edit-click',
        { detail: currentResident }
      );

      document.dispatchEvent(event);

    } catch (err) {
      if (err.code === 'RESIDENT_NOT_FOUND') {
        window.alert(
          'This resident record is no longer current. Please select the current resident.'
        );
      } else {
        window.alert(
          'Unable to retrieve the current resident record.'
        );
      }
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