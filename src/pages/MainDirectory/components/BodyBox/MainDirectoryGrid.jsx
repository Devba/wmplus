


import HeaderRow from './HeaderRow';

function MainDirectoryGrid({
  residents,
  selectedResident,
  onSelectResident
}) {
  return (
    <div className="md-table-wrap">
      <table className="md-table">
        <colgroup>
          <col className="md-c1" />
          <col className="md-c2" />
          <col className="md-c3" />
          <col className="md-c4" />
          <col className="md-c5" />
          <col className="md-c6" />
          <col className="md-c7" />
          <col className="md-c8" />
          <col className="md-c9" />
          <col className="md-c10" />
          <col className="md-c11" />
          <col className="md-c12" />
          <col className="md-c13" />
          <col className="md-c14" />
          <col className="md-c15" />
          <col className="md-c16" />
          <col className="md-c17" />
          <col className="md-c18" />
          <col className="md-c19" />
          <col className="md-c20" />
          <col className="md-c21" />
          <col className="md-c22" />
          <col className="md-c23" />
          <col className="md-c24" />
          <col className="md-c25" />
          <col className="md-c26" />
          <col className="md-c27" />
          <col className="md-c28" />
          <col className="md-c29" />
        </colgroup>

        <HeaderRow />

        <tbody id="mdRows">
          {residents.map((row, index) => {
            const isSelected =
              selectedResident === row;

            return (
              <tr
                key={`${
                  row.acctNo || row.acct || 'resident'
                }-${index}`}
                className={
                  isSelected ? 'is-selected' : ''
                }
                onClick={() =>
                  onSelectResident(row)
                }
              >
                <td>{row.acctNo || row.acct}</td>
                <td>{row.lastName}</td>
                <td>{row.firstName}</td>
                <td>{row.middleName}</td>
                <td>{row.prefix}</td>
                <td>{row.residence}</td>
                <td>{row.billingAddress}</td>
                <td>{row.city}</td>
                <td>{row.state || row.st}</td>
                <td>{row.zip}</td>

                <td>{row.phone || ''}</td>
                <td>{row.email || ''}</td>
                <td>{row.moveInDate || ''}</td>
                <td>{row.type || ''}</td>
                <td>{row.ach || ''}</td>

                <td>{row.addlFirst || ''}</td>
                <td>{row.addlMiddle || ''}</td>
                <td>{row.addlLast || ''}</td>
                <td>{row.bothFirst || ''}</td>
                <td>{row.primaryCell || ''}</td>

                <td>{row.secondaryCell || ''}</td>
                <td>{row.addlEmail || ''}</td>
                <td>{row.notes || ''}</td>
                <td>{row.annualRate || ''}</td>
                <td>{row.annualDues || ''}</td>

                <td>{row.specialRate || ''}</td>
                <td>{row.specialDues || ''}</td>
                <td>{row.nextAnnual || ''}</td>
                <td>{row.nextSpecial || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MainDirectoryGrid;