import React, { useEffect, useState } from 'react';

import { loadGLMapping } from '../../../Settings/services/glMappingService';

import './BodyBox.css';

function BodyBox({
  selectedBankId,
  selectedFiscalYear,
  setCashFlowData: setParentCashFlowData,
  refreshKey
  }) {
  
    const [glMapping, setGLMapping] = useState({
  expenseRows: [],
  revenueRows: [],
  assetLiabilityRows: []
  });

  const [cashFlowData, setCashFlowData] = useState(null);

  const revenueRows = glMapping.revenueRows.filter(
    (row) => !String(row.glNumber).includes('-')
  );

  const expenseRows = glMapping.expenseRows.filter(
    (row) => !String(row.glNumber).includes('-')
  );

  const assetLiabilityRows = glMapping.assetLiabilityRows.filter(
  (row) => !String(row.glNumber).includes('-')
    );

  useEffect(() => {
    async function loadData() {
      try {
        const savedData = await loadGLMapping();
        setGLMapping({
        expenseRows: Array.isArray(savedData?.expenseRows)
          ? savedData.expenseRows
          : [],

        revenueRows: Array.isArray(savedData?.revenueRows)
          ? savedData.revenueRows
          : [],

        assetLiabilityRows: Array.isArray(savedData?.assetLiabilityRows)
          ? savedData.assetLiabilityRows
          : []
      });

      } catch (error) {
        console.error('Unable to load GL Mapping for Cash Flow:', error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadCashFlow() {
      if (!selectedBankId || !selectedFiscalYear) {
        setCashFlowData(null);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3011/api/cash-flow?bankId=${selectedBankId}&fiscalYear=${selectedFiscalYear}`
        );

        if (!response.ok) {
          throw new Error('Unable to load Cash Flow data.');
        }

        const data = await response.json();
        console.log('Cash Flow Data:', data);
        setCashFlowData(data);
        setParentCashFlowData(data);
      } catch (error) {
        console.error('Unable to load Cash Flow data:', error);
        setCashFlowData(null);
      }
    }

    loadCashFlow();
  }, [selectedBankId, selectedFiscalYear, refreshKey]);

  const monthKeys = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
  ];

  const formatMoney = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  const getCashFlowAmount = (glNumber, monthKey) => {
    const match = cashFlowData?.monthlyByGL?.find(
      (item) => Number(item.glNumber) === Number(glNumber)
    );

    return Number(match?.[monthKey] || 0);
  };

  const getCashFlowTotal = (glNumber) => {
    const match = cashFlowData?.monthlyByGL?.find(
      (item) => Number(item.glNumber) === Number(glNumber)
    );

    return Number(match?.total || 0);
  };

  const getSectionMonthTotal = (rows, monthKey) =>
    rows.reduce(
      (sum, row) => sum + getCashFlowAmount(row.glNumber, monthKey),
      0
    );

  const getSectionTotal = (rows) =>
    rows.reduce(
      (sum, row) => sum + getCashFlowTotal(row.glNumber),
      0
    );

  const openingBalance = Number(
    cashFlowData?.ledger?.openingBalance || 0
  );

  const monthlyNet = monthKeys.map((monthKey) =>
  getSectionMonthTotal(revenueRows, monthKey) +
  getSectionMonthTotal(expenseRows, monthKey) +
  getSectionMonthTotal(assetLiabilityRows, monthKey)
);

  const endingBalances = [];
  monthlyNet.reduce((runningBalance, amount, index) => {
    const nextBalance = runningBalance + amount;
    endingBalances[index] = nextBalance;
    return nextBalance;
  }, openingBalance);

  return (
    <div className="cf-bodybox">
      <div className="cf-table-wrap">
        <table className="cf-table">
          <thead>
            <tr>
              <th>GL#</th>
              <th>GL Name</th>
              <th>Jan</th>
              <th>Feb</th>
              <th>Mar</th>
              <th>Apr</th>
              <th>May</th>
              <th>Jun</th>
              <th>Jul</th>
              <th>Aug</th>
              <th>Sep</th>
              <th>Oct</th>
              <th>Nov</th>
              <th>Dec</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td></td>
              <td>Beginning Balance</td>

              {monthKeys.map((monthKey, index) => (
                <td key={monthKey}>
                  {index === 0
                    ? formatMoney(openingBalance)
                    : formatMoney(endingBalances[index - 1])}
                </td>
              ))}

              <td>{formatMoney(openingBalance)}</td>
            </tr>

            <tr className="cf-section-row">
              <td></td>
              <td>REVENUE</td>
              {monthKeys.map((monthKey) => (
                <td key={monthKey}></td>
              ))}
              <td></td>
            </tr>

            {revenueRows.map((row) => (
              <tr key={row.glNumber}>
                <td>{row.glNumber}</td>
                <td>{row.glName}</td>

                {monthKeys.map((monthKey) => (
                  <td key={monthKey}>
                    {formatMoney(
                      getCashFlowAmount(row.glNumber, monthKey)
                    )}
                  </td>
                ))}

                <td>{formatMoney(getCashFlowTotal(row.glNumber))}</td>
              </tr>
            ))}

            <tr className="cf-total-row">
              <td></td>
              <td>TOTAL REVENUE</td>

              {monthKeys.map((monthKey) => (
                <td key={monthKey}>
                  {formatMoney(
                    getSectionMonthTotal(revenueRows, monthKey)
                  )}
                </td>
              ))}

              <td>{formatMoney(getSectionTotal(revenueRows))}</td>
            </tr>

            <tr className="cf-section-row">
              <td></td>
              <td>EXPENSES</td>
              {monthKeys.map((monthKey) => (
                <td key={monthKey}></td>
              ))}
              <td></td>
            </tr>

            {expenseRows.map((row) => (
              <tr key={row.glNumber}>
                <td>{row.glNumber}</td>
                <td>{row.glName}</td>

                {monthKeys.map((monthKey) => (
                  <td key={monthKey}>
                    {formatMoney(
                      getCashFlowAmount(row.glNumber, monthKey)
                    )}
                  </td>
                ))}

                <td>{formatMoney(getCashFlowTotal(row.glNumber))}</td>
              </tr>
            ))}

            <tr className="cf-total-row">
              <td></td>
              <td>TOTAL EXPENSES</td>

              {monthKeys.map((monthKey) => (
                <td key={monthKey}>
                  {formatMoney(
                    getSectionMonthTotal(expenseRows, monthKey)
                  )}
                </td>
              ))}

              <td>{formatMoney(getSectionTotal(expenseRows))}</td>
            </tr>

           <tr className="cf-section-row">
  <td></td>
  <td>ASSET / LIABILITY</td>

  {monthKeys.map((monthKey) => (
    <td key={monthKey}></td>
  ))}

  <td></td>
</tr>

    {assetLiabilityRows.map((row) => (
      <tr key={row.glNumber}>
        <td>{row.glNumber}</td>
        <td>{row.glName}</td>

        {monthKeys.map((monthKey) => (
          <td key={monthKey}>
            {formatMoney(
              getCashFlowAmount(row.glNumber, monthKey)
            )}
          </td>
        ))}

        <td>
          {formatMoney(getCashFlowTotal(row.glNumber))}
        </td>
      </tr>
    ))}



            <tr className="cf-ending-balance-row">
              <td></td>
              <td>ENDING BALANCE</td>

              {endingBalances.map((balance, index) => (
                <td key={monthKeys[index]}>
                  {formatMoney(balance)}
                </td>
              ))}

              <td>
                {formatMoney(
                  endingBalances[endingBalances.length - 1] ||
                  openingBalance
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BodyBox;
