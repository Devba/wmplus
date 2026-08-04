


const assmtPaymtRegisterSampleData = [
  {
    ownerAcct: '17770',
    ownerName: 'Rick Riccoboni',
    address: '22 Pine Rd',
    amount: '$500.00',
    dateDeposited: '04/28/2026',
    dateCleared: '',
    monthCleared: '',
    annualPayment: '$500.00',
    specialPayment: '',
    credit: '',
    totalPaidYTD: '$500.00',
    totalAnnual: '$500.00',
    totalSpecial: '$0.00',
    totalCredits: '$0.00',
    transaction: 'APR250428001',
    yeCreditUsed: '',
    yeAnnual: '',
    yeSpecial: '',
    paidPrior: '',
    excessCredit: '',
    annualRate: '$500.00',
    specialRate: '$0.00',
    depositInvoice: '',
    electronic: 'No',
    uploaded: 'No'
  }
];

const originalRows = [...assmtPaymtRegisterSampleData];

while (assmtPaymtRegisterSampleData.length < 60) {
  const source =
    originalRows[
      assmtPaymtRegisterSampleData.length % originalRows.length
    ];

  assmtPaymtRegisterSampleData.push({
    ...source,
    transaction: `${source.transaction}-${assmtPaymtRegisterSampleData.length + 1}`
  });
}

export default assmtPaymtRegisterSampleData;