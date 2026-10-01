





import HeaderRow from './HeaderRow';
const BLANK_ROWS = Array.from({ length: 16 });
function BodyBox() {
  return (
    <div className="bankdc-bodybox">
      <div className="bankdc-table-scroll">
        <table className="bankdc-table">
          <colgroup>
            <col className="bankdc-col-bank" />
            <col className="bankdc-col-type" />
            <col className="bankdc-col-amount" />
            <col className="bankdc-col-date" />
            <col className="bankdc-col-notation" />
            <col className="bankdc-col-gl" />
            <col className="bankdc-col-transaction" />
          </colgroup>

          <HeaderRow />
           <tbody>
            {BLANK_ROWS.map((_, index) => (
                <tr key={index}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>
            ))}
            </tbody>
          
        </table>
      </div>
    </div>
  );
}

export default BodyBox;