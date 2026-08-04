


function TotalsRow() {
  return (
    <div className="apr-totals-row">

      <div className="apr-total-group">
        <span className="apr-total-label">
          TOTAL ANNUAL DUES $$ RECEIVED YTD: $
        </span>

        <input
          id="aprTotalDuesYTD"
          className="apr-total-input"
          value="1,665.00"
          readOnly
        />
      </div>

      <div className="apr-total-group">
        <span className="apr-total-label">
          TOTAL SPECIAL ASSESSMENT DUES RECEIVED: $
        </span>

        <input
          id="aprTotalSpecialDues"
          className="apr-total-input"
          value=""
          readOnly
        />
      </div>

      <div className="apr-total-group">
        <span className="apr-total-label">
          TOTAL CREDITS: $
        </span>

        <input
          id="aprTotalCredits"
          className="apr-total-input"
          value="0.00"
          readOnly
        />
      </div>

      <div className="apr-total-group">
        <span className="apr-total-label">
          Dues Paid:
        </span>

        <input
          id="aprDuesPaidType"
          className="apr-total-input apr-dues-paid-input"
          value="Monthly"
          readOnly
        />
      </div>

    </div>
  );
}

export default TotalsRow;