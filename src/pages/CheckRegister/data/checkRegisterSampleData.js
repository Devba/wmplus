const checkRegisterSampleData = [
  {
    checkNo: 1075,
    payeeName: "Charles Schwab Insurance Capital Acct",
    amount: "$7,777.00",
    dateIssued: "3/3/2025",
    dateCleared: "",
    monthCleared: "",
    glAccount: "Insurance Deductible Expense",
    vendorOrResidentAcct: "148",
    vendorInvoiceNo: "5473786",
    vendorInvoiceDate: "03/03/2026",
    vendorInvoiceAmount: "4300",
    checkNotation: "Monthly Ground Maintenance",
    bankAcct: "1",
    checkAllowed: "Y",
    glNo: "6020",
    transactionNo: "CHK03042025-152252",
    escrowFlag: "Y",
    bankAccount: "OPERATING ACCOUNT"
  },

  {
    checkNo: 1076,
    payeeName: "Charles Schwab dump Acct",
    amount: "$6,666.00",
    dateIssued: "3/3/2025",
    dateCleared: "",
    monthCleared: "",
    glAccount: "Insurance Deductible Expense",
    vendorOrResidentAcct: "150",
    vendorInvoiceNo: "5473786",
    vendorInvoiceDate: "03/03/2025",
    vendorInvoiceAmount: "4300",
    checkNotation: "Monthly Ground Maintenance",
    bankAcct: "1",
    checkAllowed: "Y",
    glNo: "6025",
    transactionNo: "CHK03042025-152253",
    escrowFlag: "Y",
    bankAccount: "OPERATING ACCOUNT"
  },

  {
    checkNo: 1077,
    payeeName: "Charles Acct",
    amount: "$6,000.00",
    dateIssued: "3/3/2025",
    dateCleared: "",
    monthCleared: "",
    glAccount: "Insurance Deductible Expense",
    vendorOrResidentAcct: "151",
    vendorInvoiceNo: "5473786",
    vendorInvoiceDate: "03/03/2025",
    vendorInvoiceAmount: "4300",
    checkNotation: "Party Expense",
    bankAcct: "1",
    checkAllowed: "Y",
    glNo: "6020",
    transactionNo: "CHK03042025-152254",
    escrowFlag: "Y",
    bankAccount: "OPERATING ACCOUNT"
  },

  {
    checkNo: 1200,
    payeeName: "Rick Riccoboni",
    amount: "$365.00",
    dateIssued: "3/25/2025",
    dateCleared: "",
    monthCleared: "",
    glAccount: "Expense Refund",
    vendorOrResidentAcct: "17777",
    vendorInvoiceNo: "5473876",
    vendorInvoiceDate: "03/03/2025",
    vendorInvoiceAmount: "4300",
    checkNotation: "Office Supplies",
    bankAcct: "1",
    checkAllowed: "Y",
    glNo: "6067",
    transactionNo: "CHK03042025-152255",
    escrowFlag: "Y",
    bankAccount: "OPERATING ACCOUNT"
  },

  {
    checkNo: 1201,
    payeeName: "Alex Wenger",
    amount: "$1,999.00",
    dateIssued: "3/23/2025",
    dateCleared: "3/25/2026",
    monthCleared: "3",
    glAccount: "Expense Refund",
    vendorOrResidentAcct: "17776",
    vendorInvoiceNo: "5473876",
    vendorInvoiceDate: "03/03/2025",
    vendorInvoiceAmount: "4300",
    checkNotation: "Repair Expense",
    bankAcct: "1",
    checkAllowed: "Y",
    glNo: "6020",
    transactionNo: "CHK03042025-152256",
    escrowFlag: "Y",
    bankAccount: "OPERATING ACCOUNT"
  }
];

// Duplicate the five sample records until we have 25 rows.
while (checkRegisterSampleData.length < 60) {
  const base = checkRegisterSampleData[checkRegisterSampleData.length % 5];
  const next = {
    ...base,
    checkNo: 1075 + checkRegisterSampleData.length,
    transactionNo: `CHK03042025-${152252 + checkRegisterSampleData.length}`
  };
  checkRegisterSampleData.push(next);
}

export default checkRegisterSampleData;