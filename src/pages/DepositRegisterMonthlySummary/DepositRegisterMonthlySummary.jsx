


import '../DepositRegister/DepositRegister.css';
import './DepositRegisterMonthlySummary.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from '../DepositRegister/components/BodyBox/BodyBox';

function DepositRegisterMonthlySummary({ onSelectPage }) {
  return (
    <div className="depreg-page">
      <div className="depreg-shell">

        <div className="depreg-fixed">
          <TopSection onSelectPage={onSelectPage} />
        </div>

        <BodyBox depositRows={[]} />

      </div>
    </div>
  );
}

export default DepositRegisterMonthlySummary;