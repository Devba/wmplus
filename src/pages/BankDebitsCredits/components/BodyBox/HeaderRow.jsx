





function HeaderRow() {
  return (
    <thead>
      <tr>
        <th className="bankdc-col-bank">
          BANK ACCT<br />
          (NAME / TYPE / BANK ID#)
        </th>

        <th className="bankdc-col-type">
          DEBIT / CREDIT
        </th>

        <th className="bankdc-col-amount">
          AMOUNT
        </th>

        <th className="bankdc-col-date">
          DATE DEBITED / CREDITED<br />
          (mm/dd/yyyy)
        </th>

        <th className="bankdc-col-notation">
          NOTATION
        </th>

        <th className="bankdc-col-gl">
          GL#
        </th>

        <th className="bankdc-col-transaction">
          TRANSACTION #
        </th>
      </tr>
    </thead>
  );
}

export default HeaderRow;