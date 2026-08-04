


function HeaderRow() {
  return (
    <thead>
      <tr>
        <th className="col-check">CHECK#</th>
        <th className="col-name">DEPOSITOR ACCOUNT NAME</th>
        <th className="col-amt">AMOUNT</th>
        <th className="col-banknm">
          BANK ACCT<br />
          $$ IS BEING<br />
          DEPOSITED INTO:
        </th>
        <th className="col-gl">
          GENERAL<br />
          LEDGER<br />
          ACCOUNT
        </th>
        <th className="col-date">
          DATE $ /<br />
          CHECK<br />
          DEPOSITED
        </th>
        <th className="col-date2">
          DATE $ /<br />
          CHECK<br />
          CLEARED
        </th>
        <th className="col-month">
          MONTH<br />
          CLEARED
        </th>
        <th className="col-acct">
          OWNER<br />
          ACCT#
        </th>
        <th className="col-vendor">
          VENDOR<br />
          ID
        </th>
        <th className="col-inv">
          RESIDENT<br />
          FINE / LATE FEE<br />
          INVOICE #
        </th>
        <th className="col-refcat">
          EXPENSE<br />
          REFUND<br />
          GL CATEGORY
        </th>
        <th className="col-refgl">
          EXPENSE<br />
          REFUND<br />
          GL #
        </th>
        <th className="col-gl2">GL ACCT#</th>
        <th className="col-txn">
          DEPOSIT<br />
          TRANSACTION #
        </th>
        <th className="col-note">DEPOSIT NOTATION</th>
        <th className="col-arbfine">
          ARB FINE $$<br />
          ASSIGNED
        </th>
        <th className="col-fine">
          FINE $$<br />
          ASSIGNED
        </th>
        <th className="col-upload">
          PAY'MT<br />
          UPLOADED
        </th>
        <th className="col-overflow">
          DEPOSIT $$<br />
          OVERFLOW
        </th>
        <th className="col-esc">
          ESCROW<br />
          FLAG
        </th>
      </tr>
    </thead>
  );
}

export default HeaderRow;





