


import React from 'react';
import './CashFlow.css';
import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

function CashFlow() {
  const [selectedBankId, setSelectedBankId] = React.useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState('2026');
  const [cashFlowData, setCashFlowData] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  return (
    <div className="cash-flow-page">
      <div className="cash-flow-shell">

        <div className="cash-flow-fixed">
          <TopSection
            selectedBankId={selectedBankId}
            setSelectedBankId={setSelectedBankId}
            selectedFiscalYear={selectedFiscalYear}
            setSelectedFiscalYear={setSelectedFiscalYear}
            cashFlowData={cashFlowData}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}

            />
        </div>

        <div className="cash-flow-body">
            <BodyBox
                selectedBankId={selectedBankId}
                selectedFiscalYear={selectedFiscalYear}
                setCashFlowData={setCashFlowData}
                refreshKey={refreshKey}
                />
        </div>

      </div>
    </div>
  );
}

export default CashFlow;