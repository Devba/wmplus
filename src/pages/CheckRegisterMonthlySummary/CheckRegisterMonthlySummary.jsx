


import '../CheckRegister/CheckRegister.css';
import './CheckRegisterMonthlySummary.css';
import CheckRegisterMonthlySummaryGrid from './components/CheckRegisterMonthlySummaryGrid';


import TopSection from './components/TopSection/TopSection';

function CheckRegisterMonthlySummary({ onSelectPage }) {
  return (
    <div className="checkreg-page">
      <div className="checkreg-shell">

        <div className="checkreg-fixed">
          <TopSection onSelectPage={onSelectPage} />
        </div>

        <CheckRegisterMonthlySummaryGrid />

      </div>
    </div>
  );
}

export default CheckRegisterMonthlySummary;