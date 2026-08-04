



const depositRegisterSampleData = [
  {
    date: '03/01/2025',
    depositAmount: '$1,250.00',
    checkAmount: '$1,000.00',
    cashAmount: '$250.00',
    glAccount: 'Operating Income',
    vendorAcct: '17776',
    bankAcct: '1',
    status: 'Pending',
    transaction: 'DP250301001',
    notation: 'Monthly Dues'
  },
  {
    date: '03/02/2025',
    depositAmount: '$875.00',
    checkAmount: '$875.00',
    cashAmount: '$0.00',
    glAccount: 'Operating Income',
    vendorAcct: '17776',
    bankAcct: '1',
    status: 'Cleared',
    transaction: 'DP250302001',
    notation: 'Resident Payment'
  },
  {
    date: '03/03/2025',
    depositAmount: '$450.00',
    checkAmount: '$450.00',
    cashAmount: '$0.00',
    glAccount: 'Late Fees',
    vendorAcct: '17776',
    bankAcct: '1',
    status: 'Pending',
    transaction: 'DP250303001',
    notation: 'Late Fees'
  },
  {
    date: '03/04/2025',
    depositAmount: '$2,100.00',
    checkAmount: '$1,900.00',
    cashAmount: '$200.00',
    glAccount: 'Special Assessment',
    vendorAcct: '17777',
    bankAcct: '1',
    status: 'Cleared',
    transaction: 'DP250304001',
    notation: 'Special Assessment'
  },
  {
    date: '03/05/2025',
    depositAmount: '$980.00',
    checkAmount: '$980.00',
    cashAmount: '$0.00',
    glAccount: 'Operating Income',
    vendorAcct: '17777',
    bankAcct: '1',
    status: 'Pending',
    transaction: 'DP250305001',
    notation: 'Resident Payment'
  }
];



const originalRows = [...depositRegisterSampleData];

while (depositRegisterSampleData.length < 60) {
  const source = originalRows[depositRegisterSampleData.length % originalRows.length];

  depositRegisterSampleData.push({
    ...source,
    transaction: `${source.transaction}-${depositRegisterSampleData.length + 1}`
  });
}

export default depositRegisterSampleData;