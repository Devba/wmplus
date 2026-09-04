


import React from 'react';
import './CashFlow.css';
import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

function CashFlow() {
  const [selectedBankId, setSelectedBankId] = React.useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState('2026');
  return (
    <div className="cash-flow-page">
      <div className="cash-flow-shell">

        <div className="cash-flow-fixed">
          <TopSection
            selectedBankId={selectedBankId}
            setSelectedBankId={setSelectedBankId}
            selectedFiscalYear={selectedFiscalYear}
            setSelectedFiscalYear={setSelectedFiscalYear}
            />
        </div>

        <div className="cash-flow-body">
            <BodyBox
                selectedBankId={selectedBankId}
                selectedFiscalYear={selectedFiscalYear}
                />
        </div>

      </div>
    </div>
  );
}

export default CashFlow;