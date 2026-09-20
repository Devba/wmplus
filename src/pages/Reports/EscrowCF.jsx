import React from 'react';
import '../CashFlow/CashFlow.css';
import TopSection from '../CashFlow/components/TopSection/TopSection';
import BodyBox from '../CashFlow/components/BodyBox/BodyBox';

// Escrow Cash Flow: reusa /api/cash-flow?bankId=301 (BankID fijo, sin dropdown).
function EscrowCF() {
  const [selectedFiscalYear, setSelectedFiscalYear] = React.useState('2026');
  const [cashFlowData, setCashFlowData] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  // bankId fijo para Escrow
  const selectedBankId = '301';

  return (
    <div className="cash-flow-page">
      <div className="cash-flow-shell">
        <div className="cash-flow-fixed">
          <TopSection
            selectedBankId={selectedBankId}
            setSelectedBankId={() => {}}
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

export default EscrowCF;
