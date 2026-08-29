


function TotalsRow({
  selectedPaymentRow,
  allResidentTotals
}) {

const displayAnnual = selectedPaymentRow
  ? Number(selectedPaymentRow.totalAnnual || 0)
  : Number(allResidentTotals?.annual || 0);

const displaySpecial = selectedPaymentRow
  ? Number(selectedPaymentRow.totalSpecial || 0)
  : Number(allResidentTotals?.special || 0);

const displayCredits = selectedPaymentRow
  ? Number(selectedPaymentRow.totalCredits || 0)
  : Number(allResidentTotals?.credits || 0);


  return (
    <div className="apr-totals-row">

      <div className="apr-total-group">
        <span className="apr-total-label">
          TOTAL ANNUAL DUES $$ RECEIVED YTD: $
        </span>

        <input
          id="aprTotalDuesYTD"
          className="apr-total-input"
          value={displayAnnual.toFixed(2)}
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
          value={displaySpecial.toFixed(2)}
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
          value={displayCredits.toFixed(2)}
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