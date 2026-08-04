


function accountNumberFor(resident) {
  return resident.acctNo || resident.acct || '';
}

function FilterRow({
  residents = [],
  residentNameFilter,
  residentAddressFilter,
  onResidentNameChange,
  onResidentAddressChange
}) {
  const residentsByName = [...residents].sort((a, b) => {
    const lastNameComparison = String(
      a.lastName || ''
    ).localeCompare(String(b.lastName || ''));

    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }

    return String(a.firstName || '').localeCompare(
      String(b.firstName || '')
    );
  });

  const residentsByAddress = [...residents].sort((a, b) => {
    const aStreetNumber = Number.parseInt(
      String(a.residence || '').match(/^\d+/)?.[0] || '0',
      10
    );

    const bStreetNumber = Number.parseInt(
      String(b.residence || '').match(/^\d+/)?.[0] || '0',
      10
    );

    if (aStreetNumber !== bStreetNumber) {
      return aStreetNumber - bStreetNumber;
    }

    return String(a.residence || '').localeCompare(
      String(b.residence || '')
    );
  });

  return (
    <div className="md-filter-row">
      <div className="md-filter-group">
        <label
          className="md-filter-label"
          htmlFor="mdResidentNameFilter"
        >
          Resident Name
        </label>

        <select
          id="mdResidentNameFilter"
          className="md-filter-select md-name-filter"
          value={residentNameFilter}
          onChange={(event) =>
            onResidentNameChange(event.target.value)
          }
        >
          <option value="">All Residents</option>

          {residentsByName.map((resident, index) => {
            const accountNumber =
              accountNumberFor(resident);

            const label =
              `${resident.lastName || ''} | ` +
              `${accountNumber} | ` +
              `${resident.residence || ''}`;

            return (
              <option
                key={`name-${accountNumber}-${index}`}
                value={accountNumber}
              >
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <div className="md-filter-group">
        <label
          className="md-filter-label"
          htmlFor="mdResidentAddressFilter"
        >
          Residence Address
        </label>

        <select
          id="mdResidentAddressFilter"
          className="md-filter-select md-address-filter"
          value={residentAddressFilter}
          onChange={(event) =>
            onResidentAddressChange(event.target.value)
          }
        >
          <option value="">All Addresses</option>

          {residentsByAddress.map((resident, index) => {
            const accountNumber =
              accountNumberFor(resident);

            const label =
              `${resident.residence || ''} | ` +
              `${resident.lastName || ''} | ` +
              `${accountNumber}`;

            return (
              <option
                key={`address-${accountNumber}-${index}`}
                value={accountNumber}
              >
                {label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

export default FilterRow;