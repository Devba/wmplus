


function HeaderRow() {
  return (
    <thead>
      <tr>
        <th className="col-check">CHECK#</th>
        <th className="col-name">PAYEE NAME</th>
        <th className="col-amt">AMOUNT</th>
        <th className="col-date">
          DATE CHK<br />ISSUED
        </th>
        <th className="col-date2">
          DATE CHK<br />CLEARED
        </th>
        <th className="col-month">
          MO. CHK<br />CLEARED
        </th>
        <th className="col-gl">GENERAL LEDGER ACCOUNT</th>
        <th className="col-acct">
          VENDOR ID# or<br />Resident ACCT#
        </th>
        <th className="col-inv">VENDOR INVOICE #</th>
        <th className="col-invdt">
          VENDOR INVOICE<br />DATE
        </th>
        <th className="col-invamt">
          VENDOR<br />INVOICE $$$
        </th>
        <th className="col-note">CHECK NOTATION</th>
        <th className="col-bank">
          BANK<br />ACCT
        </th>
        <th className="col-allowed">
          CHECK ALLOWED<br />Y/N
        </th>
        <th className="col-gl2">GL #</th>
        <th className="col-txn">CHECK TRANSACTION #</th>
        <th className="col-esc">ESCROW FLAG</th>
        <th className="col-banknm">BANK ACCOUNT</th>
      </tr>
    </thead>
  );
}

export default HeaderRow;