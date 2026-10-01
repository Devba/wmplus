





import './BankDebitsCredits.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

function BankDebitsCredits({ onSelectPage }) {
  return (
    <div className="bankdc-page">
      <div className="bankdc-shell">
        <TopSection onSelectPage={onSelectPage} />
        <BodyBox />
      </div>
    </div>
  );
}

export default BankDebitsCredits;