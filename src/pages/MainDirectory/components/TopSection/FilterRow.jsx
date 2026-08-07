import React from 'react';

function FilterRow({
  searchTerm = '',
  onSearchTermChange
}) {
  return (
    <div className="md-filter-row">
      <div className="md-filter-group">
        <label
          className="md-filter-label"
          htmlFor="mdSearchInput"
        >
          Search Resident
        </label>

        <input
          id="mdSearchInput"
          type="text"
          className="md-filter-input"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Type name, address, phone, account..."
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export default FilterRow;