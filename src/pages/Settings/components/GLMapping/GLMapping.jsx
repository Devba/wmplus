import { useEffect, useMemo, useState } from 'react';

import './GLMapping.css';

import {
  loadGLMapping,
  saveGLMapping
} from '../../services/glMappingService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

const DEFAULT_EXPENSE_ROWS = [
  {
    "glNumber": "20000",
    "glName": "WATER",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "20000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "20001 - 20399",
    "glName": "Water Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "20000",
    "consolidatedParentGl": "20000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "20400",
    "glName": "ELECTRIC",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "20400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "20401 - 20799",
    "glName": "Electric Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "20400",
    "consolidatedParentGl": "20400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "20800",
    "glName": "GAS",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "20800",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "20801 - 21199",
    "glName": "Gas Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "20800",
    "consolidatedParentGl": "20800",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21200",
    "glName": "WASTE REMOVAL",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "21200",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21201 - 21399",
    "glName": "Watse Removal Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21200",
    "consolidatedParentGl": "21200",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21400",
    "glName": "OFFICE EXPENSES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "21400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21401 - 21499",
    "glName": "",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21400",
    "consolidatedParentGl": "21400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21500",
    "glName": "BANK CHARGES",
    "sourceTable": "Bank Debits & Credits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21512 - 21999",
    "glName": "Bank Charges Assignable Sub Headings",
    "sourceTable": "Bank Debits & Credits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21501",
    "glName": "Bank Service Charges",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21502",
    "glName": "Bank Charge Back Fee",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21503",
    "glName": "Bank Overdraft Charges",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21504",
    "glName": "Bank Checks & Deposit Slips & Stamps",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21505",
    "glName": "Bank Excess Transactions Charge",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21506",
    "glName": "Bank ACH Handling Charges",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21507",
    "glName": "Other Bank Charges",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21508",
    "glName": "Credit Card Service Fees",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21509",
    "glName": "Credit Card Service Fee Reduction",
    "sourceTable": "Credit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21510",
    "glName": "Credit Card Service Fee Additions",
    "sourceTable": "Debit",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21511",
    "glName": "Bank Merchant Banking Fee",
    "sourceTable": "",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21500",
    "consolidatedParentGl": "21500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "21999 - 22499",
    "glName": "RESERVED FOR FUTURE EXPENSE GL#s",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "21510",
    "consolidatedParentGl": "21510",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "22500",
    "glName": "INSURANCE",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "22500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "22501 - 22999",
    "glName": "Insurance Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "22500",
    "consolidatedParentGl": "22500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23000",
    "glName": "TAXES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23001 - 23199",
    "glName": "Taxes Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23000",
    "consolidatedParentGl": "23000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23200",
    "glName": "LEGAL",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23200",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23201 - 23299",
    "glName": "Legal Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23200",
    "consolidatedParentGl": "23200",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23300",
    "glName": "ACCOUNTANT SERVICES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23300",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23301 - 23399",
    "glName": "Accountant Services Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23300",
    "consolidatedParentGl": "23300",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23400",
    "glName": "ARB FEES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23401 - 23449",
    "glName": "ARB Fees Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23400",
    "consolidatedParentGl": "23400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23401",
    "glName": "Resident ARB Fees",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23400",
    "consolidatedParentGl": "23400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23402",
    "glName": "Construction ARB Fees",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23400",
    "consolidatedParentGl": "23400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23450",
    "glName": "MANAGEMENT CO.",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23450",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23451 - 23499",
    "glName": "Mgt. Co. Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23450",
    "consolidatedParentGl": "23450",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23500",
    "glName": "EVENTS & OUTINGS",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23501 - 23599",
    "glName": "Events & Outings Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23500",
    "consolidatedParentGl": "23500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23600",
    "glName": "SPECIAL PROJECTS",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "23600",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "23601 - 23999",
    "glName": "Special Projects Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "23600",
    "consolidatedParentGl": "23600",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "24000",
    "glName": "SALARIES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "24000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "24001 - 24199",
    "glName": "Salaries Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "24000",
    "consolidatedParentGl": "24000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "24500",
    "glName": "BUILDING / INFRASTRUCTURE",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "24500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "24501 - 24749",
    "glName": "Building / Infrastructure  Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "24500",
    "consolidatedParentGl": "24500",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "24750 - 24999",
    "glName": "RESERVED FOR FUTURE EXPENSE GL#s",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "24750 - 24999",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "25000",
    "glName": "LANDSCAPING",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "25000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "25001 - 25999",
    "glName": "Landscaping Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "25000",
    "consolidatedParentGl": "25000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  
  {
  "glNumber": "26000",
  "glName": "GUEST SUITES",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "P",
  "parentGl": "",
  "consolidatedParentGl": "26000",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26001 - 26499",
  "glName": "Guest Suites Assignable Sub Headings",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "C",
  "parentGl": "26000",
  "consolidatedParentGl": "26000",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26001",
  "glName": "Guest Suite Junior Rm",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "C",
  "parentGl": "26000",
  "consolidatedParentGl": "26000",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26002",
  "glName": "Guest Suite Primary Rm",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "C",
  "parentGl": "26000",
  "consolidatedParentGl": "26000",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26500",
  "glName": "HARBOR SIDE HOUSING",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "P",
  "parentGl": "",
  "consolidatedParentGl": "26500",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26501 - 26999",
  "glName": "Harbor Side Housing Assignable Sub Headings",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "C",
  "parentGl": "26500",
  "consolidatedParentGl": "26500",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},
{
  "glNumber": "26501",
  "glName": "Harbor Side Housing Bldg 1",
  "sourceTable": "Check Register",
  "description": "",
  "bankType": "Operating",
  "bankId": "OP_Bank_ID#1",
  "pc": "C",
  "parentGl": "26500",
  "consolidatedParentGl": "26500",
  "dc": "D",
  "ar": "A",
  "effectiveDate": "",
  "createdBy": "SYSTEM",
  "createdDate": "",
  "lastEditedBy": "",
  "systemLocked": true
},


  {
    "glNumber": "27000",
    "glName": "POOL / POND",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "27000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "27001 - 27999",
    "glName": "Pool / Pond Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "27000",
    "consolidatedParentGl": "27000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28000",
    "glName": "MISC EXPENSES",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "28000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28001 - 28399",
    "glName": "Misc Expenses Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "28000",
    "consolidatedParentGl": "28000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28400",
    "glName": "OTHER",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "28400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28401 - 28399",
    "glName": "Other Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "28400",
    "consolidatedParentGl": "28400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28400",
    "glName": "EXPENSE CREDIT REFUNDS",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "28400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "28401 - 28999",
    "glName": "RESERVED FOR FUTURE EXPENSE GL#s",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "28400",
    "consolidatedParentGl": "28400",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29000",
    "glName": "REFUNDS",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "29000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29005 - 29149",
    "glName": "Refunds Assignable Sub Headings",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "29000",
    "consolidatedParentGl": "29000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29001",
    "glName": "Construction ARB Refunds",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "29000",
    "consolidatedParentGl": "29000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29002",
    "glName": "Resident ARB Fee Refunds",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "29000",
    "consolidatedParentGl": "29000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29004",
    "glName": "Resident Credit Refunds",
    "sourceTable": "Check Register",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "29000",
    "consolidatedParentGl": "29000",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "29150 - 39999",
    "glName": "RESERVED FOR FUTURE EXPENSE GL#s",
    "sourceTable": "",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "29003",
    "consolidatedParentGl": "29003",
    "dc": "D",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  }
];

const DEFAULT_REVENUE_ROWS = [
  {
    "glNumber": "40000",
    "glName": "Assessment Dues",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40001-40019",
    "glName": "Assessment Dues  Assignable Sub Headings",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40000",
    "consolidatedParentGl": "40000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40020",
    "glName": "Special Assessment Dues",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40020",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40021 - 40039",
    "glName": "Special Assessment Dues   Assignable Sub Headings",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40020",
    "consolidatedParentGl": "40020",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40040",
    "glName": "Transfer & Working Capital Fees",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40040",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40043 - 40059",
    "glName": "Working Capital Fees  Assignable Sub Headings",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40040",
    "consolidatedParentGl": "40040",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40041",
    "glName": "Working Capital Fees",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40040",
    "consolidatedParentGl": "40040",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40042",
    "glName": "Transfer Fees",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40040",
    "consolidatedParentGl": "40040",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40060",
    "glName": "Recovery Ass'mt Deposits",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40060",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40063 - 40079",
    "glName": "Recovery Ass'mt Deposits  Assignable Sub Headings",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40060",
    "consolidatedParentGl": "40060",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40061",
    "glName": "Recovery Annual Dues",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40060",
    "consolidatedParentGl": "40060",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40062",
    "glName": "Recovery Special Assessments",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40060",
    "consolidatedParentGl": "40060",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40080",
    "glName": "Late Fees",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40080",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40081 - 40099",
    "glName": "Late Fees  Assignable Sub Headings",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40080",
    "consolidatedParentGl": "40080",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40100",
    "glName": "Fines / Violations",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40100",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40101 - 40199",
    "glName": "Fines / Violations  Assignable Sub Headings",
    "sourceTable": "Deposit Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40100",
    "consolidatedParentGl": "40100",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40200",
    "glName": "Interest Income",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40200",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40201 - 40299",
    "glName": "Interest Income  Assignable Sub Headings",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40200",
    "consolidatedParentGl": "40200",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40300",
    "glName": "Misc Income",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40300",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40301 - 40399",
    "glName": "Misc Income  Assignable Sub Headings",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40300",
    "consolidatedParentGl": "40300",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40400",
    "glName": "Misc Revenue",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40400",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40401 - 40499",
    "glName": "Misc Revenue  Assignable Sub Headings",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40400",
    "consolidatedParentGl": "40400",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40500",
    "glName": "Bank Charge Reversals",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40500",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40501 - 40599",
    "glName": "Bank Charge Reversal  Assignable Sub Headings",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40500",
    "consolidatedParentGl": "40500",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40501",
    "glName": "Credit Card Fee Reversal",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40500",
    "consolidatedParentGl": "40500",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40600",
    "glName": "Misc Inflow: Bank Deposits & Credits",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40600",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40601 - 40699",
    "glName": "Misc Inflow: Bank Deposits & Credits  Assignable Sub Headings",
    "sourceTable": "Bank Debit & Credits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40600",
    "consolidatedParentGl": "40600",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40700",
    "glName": "Reserved for Misc Revenue Assignments",
    "sourceTable": "",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "40700",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "40701 - 40999",
    "glName": "Misc Revenue Assignments Assignable Sub Headings",
    "sourceTable": "",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "40700",
    "consolidatedParentGl": "40700",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41000",
    "glName": "Transferred $ from Operating Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41001 - 41149",
    "glName": "Transferred $ from Operating Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41000",
    "consolidatedParentGl": "41000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41150",
    "glName": "Transferred $ To Operating Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41150",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41151 - 41199",
    "glName": "Transferred $ To Operating Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41150",
    "consolidatedParentGl": "41150",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41200",
    "glName": "Transferred $ from Money Market Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Money Market",
    "bankId": "MM_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41200",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41201 - 41249",
    "glName": "Transferred $ from Money Market Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Money Market",
    "bankId": "MM_Bank_ID#1",
    "pc": "C",
    "parentGl": "41200",
    "consolidatedParentGl": "41200",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41250",
    "glName": "Transferred $ To Money Market Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41250",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41251 - 41299",
    "glName": "Transferred $ To Money Market Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41250",
    "consolidatedParentGl": "41250",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41300",
    "glName": "Transferred $ from Capital Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Capital Acct",
    "bankId": "CAP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41300",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41301 - 41349",
    "glName": "Transferred $ from Capital Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Capital Acct",
    "bankId": "CAP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41300",
    "consolidatedParentGl": "41300",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41350",
    "glName": "Transferred $ To Capital Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41350",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41351 - 41399",
    "glName": "Transferred $ To Capital Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41350",
    "consolidatedParentGl": "41350",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41400",
    "glName": "Transferred $ from CD#x",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "CDx",
    "bankId": "CD_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41400",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41401 - 41449",
    "glName": "Transferred $ from CD#x  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "CDx",
    "bankId": "CD_Bank_ID#1",
    "pc": "C",
    "parentGl": "41400",
    "consolidatedParentGl": "41400",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41450",
    "glName": "Transferred $ To CD#x",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41450",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41451 - 41499",
    "glName": "Transferred $ To CD#x  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41450",
    "consolidatedParentGl": "41450",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41500",
    "glName": "Transfer $ From Savings Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "From Savings Acct",
    "bankId": "SAV_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41500",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41501 - 41599",
    "glName": "Transfer $ From Savings Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Savings",
    "bankId": "SAV_Bank_ID#1",
    "pc": "C",
    "parentGl": "41500",
    "consolidatedParentGl": "41500",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41600",
    "glName": "Transfer $ To Savings Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41600",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41601 - 41699",
    "glName": "Transfer $ To Savings Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41600",
    "consolidatedParentGl": "41600",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41700",
    "glName": "Transfer $ From Escrow Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Escrow",
    "bankId": "ES_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41700",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41701 - 41749",
    "glName": "Transfer $ From Escrow Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Escrow",
    "bankId": "ES_Bank_ID#1",
    "pc": "C",
    "parentGl": "41700",
    "consolidatedParentGl": "41700",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41750",
    "glName": "Transfer $ To Escrow Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41750",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41751 - 41799",
    "glName": "Transfer $ To Escrow Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41750",
    "consolidatedParentGl": "41750",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41800",
    "glName": "Transfer $ From Brokerage Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Brokerage Acct",
    "bankId": "BK_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41800",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41801 - 41849",
    "glName": "Transfer $ From Brokerage Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Brokerage Acct",
    "bankId": "BK_Bank_ID#1",
    "pc": "C",
    "parentGl": "41800",
    "consolidatedParentGl": "41800",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41850",
    "glName": "Transfer $ To Brokerage Acct",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41850",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41851 -41899",
    "glName": "Transfer $ To Brokerage Acct  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41850",
    "consolidatedParentGl": "41850",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41900",
    "glName": "Transfer $ Out To Other",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41900",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41901 - 41949",
    "glName": "Transfer $ Out To Other  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41900",
    "consolidatedParentGl": "41900",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41950",
    "glName": "Deposited $ from Other Source",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Other Source",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "41950",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "41951 - 41999",
    "glName": "Deposited $ from Other Source  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Other Source",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "41950",
    "consolidatedParentGl": "41950",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "42000",
    "glName": "Misc Bank Transfers",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "42000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "42001 - 42999",
    "glName": "Misc Bank Transfers  Assignable Sub Headings",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "Operating",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "42000",
    "consolidatedParentGl": "42000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "43000 - 43999",
    "glName": "Reserved for Misc Revenue Assignments",
    "sourceTable": "$$ Xfer & Intra Account Deposits",
    "description": "",
    "bankType": "All",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "43000 - 43999",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44000",
    "glName": "Pre-Paid Annual Dues",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "44000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44001 - 44019",
    "glName": "Pre-Paid Annual Dues  Assignable Sub Headings",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "44000",
    "consolidatedParentGl": "44000",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44120 - 44139",
    "glName": "Reserved for Misc Revenue Assignments",
    "sourceTable": "Ass'mt Pay'mt Register",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "44120 - 44139",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44140",
    "glName": "Pre-paid Ass'mt Refunds & Ass'mts/Fines Paid with Credit",
    "sourceTable": "",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "44140",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44141 - 44199",
    "glName": "Pre-paid Ass'mt Refunds & Ass'mts/Fines Paid with Credit  Assignable Sub Headings",
    "sourceTable": "",
    "description": "",
    "bankType": "Operating, Capital",
    "bankId": "OP_Bank_ID#1",
    "pc": "C",
    "parentGl": "44140",
    "consolidatedParentGl": "44140",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  },
  {
    "glNumber": "44200 - 49999",
    "glName": "Reserved for Misc Revenue Assignments",
    "sourceTable": "",
    "description": "",
    "bankType": "all",
    "bankId": "OP_Bank_ID#1",
    "pc": "P",
    "parentGl": "",
    "consolidatedParentGl": "44200 - 49999",
    "dc": "C",
    "ar": "A",
    "effectiveDate": "",
    "createdBy": "SYSTEM",
    "createdDate": "",
    "lastEditedBy": "",
    "systemLocked": true
  }
];

const BANK_TYPES = [
  'Operating',
  'Capital',
  'Savings',
  'Money Market',
  'Escrow',
  'CD',
  'Brokerage',
  'Operating, Capital',
  'All',
  'Other Source'
];

function cloneRows(rows) {
  return rows.map((row) => ({
    ...row,
    useInCR: row.useInCR || 'N',
    useInDP: row.useInDP || 'N',
    useInAPR: row.useInAPR || 'N',
    useInBDC: row.useInBDC || 'N',
    useInXfer: row.useInXfer || 'N'
  }));
}

function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  return `${month}/${day}/${year}`;
}

function isRangeRow(row) {
  return String(row?.glNumber || '').includes('-');
}

function parseGLRange(value) {
  const match =
    /^(\d+)\s*-\s*(\d+)$/.exec(String(value || ''));

  if (!match) {
    return null;
  }

  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}

function bankIdOptions(bankType) {
  const normalized = String(bankType || '').toLowerCase();
  const options = [];

  function add(prefix, count) {
    for (let number = 1; number <= count; number += 1) {
      options.push(`${prefix}${number}`);
    }
  }

  if (normalized === 'all') {
    add('OP_Bank_ID#', 10);
    add('MM_Bank_ID#', 10);
    add('CAP_Bank_ID#', 10);
    add('SAV_Bank_ID#', 10);
    add('ES_Bank_ID#', 10);
    add('CD_Bank_ID#', 30);
    add('BK_Bank_ID#', 10);
    return options;
  }

  if (normalized.includes('operating')) add('OP_Bank_ID#', 10);
  if (normalized.includes('money market')) add('MM_Bank_ID#', 10);
  if (normalized.includes('capital')) add('CAP_Bank_ID#', 10);
  if (normalized.includes('savings')) add('SAV_Bank_ID#', 10);
  if (normalized.includes('escrow')) add('ES_Bank_ID#', 10);
  if (normalized.includes('cd')) add('CD_Bank_ID#', 30);
  if (normalized.includes('brokerage')) add('BK_Bank_ID#', 10);

  if (normalized.includes('other source')) {
    return ['OTHER_SOURCE#1'];
  }

  return options.length > 0
    ? options
    : ['OP_Bank_ID#1'];
}

function GLMapping({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled
}) {
  const [activeSection, setActiveSection] =
    useState('expense');

  const [expenseRows, setExpenseRows] =
    useState(() => cloneRows(DEFAULT_EXPENSE_ROWS));

  const [revenueRows, setRevenueRows] =
    useState(() => cloneRows(DEFAULT_REVENUE_ROWS));

  const [selectedRowIndex, setSelectedRowIndex] =
    useState(null);

  const [editingRowIndex, setEditingRowIndex] =
    useState(null);

  const [editSnapshot, setEditSnapshot] =
    useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);

  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const [showUnsavedPrompt, setShowUnsavedPrompt] =
    useState(false);

  const [pendingDestinationType, setPendingDestinationType] =
    useState('');

  const [pendingDestination, setPendingDestination] =
    useState('');

    const [pendingRowIndex, setPendingRowIndex] =
    useState(null);

  const currentRows =
    activeSection === 'expense'
      ? expenseRows
      : revenueRows;

  const sectionTitle =
    activeSection === 'expense'
      ? 'EXPENSE GL# MAPPING'
      : 'REVENUE GL# MAPPING';

  const sectionNote =
    activeSection === 'expense'
      ? (
        'User / IT programming page for Expense GL# ' +
        'categories, bank assignment, parent/child ' +
        'hierarchy, and accounting behavior.'
      )
      : (
        'User / IT programming page for Revenue GL# ' +
        'categories, bank assignment, parent/child ' +
        'hierarchy, and accounting behavior.'
      );

  const selectedRow = useMemo(() => {
    if (selectedRowIndex === null) {
      return null;
    }

    return currentRows[selectedRowIndex] || null;
  }, [currentRows, selectedRowIndex]);

  useEffect(() => {
    let componentIsActive = true;

    async function loadSavedData() {
      try {
        const savedData = await loadGLMapping();

        if (!componentIsActive || !savedData) {
          return;
        }

        if (Array.isArray(savedData.expenseRows)) {
          setExpenseRows(cloneRows(savedData.expenseRows));
        }

        if (Array.isArray(savedData.revenueRows)) {
          setRevenueRows(cloneRows(savedData.revenueRows));
        }

        if (savedData.activeSection) {
          setActiveSection(savedData.activeSection);
        }
      } catch (error) {
        console.error(error);

        if (componentIsActive) {
          setSaveError(
            'The saved GL Mapping settings could not be loaded.'
          );
        }
      } finally {
        if (componentIsActive) {
          setIsLoading(false);
        }
      }
    }

    loadSavedData();

    return () => {
      componentIsActive = false;
    };
  }, []);

  useEffect(() => {
    if (!requestedSettingsPanel) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingDestinationType('settings-panel');
      setPendingDestination(requestedSettingsPanel);
      setShowUnsavedPrompt(true);
      return;
    }

    onSettingsNavigationApproved(requestedSettingsPanel);
  }, [
    requestedSettingsPanel,
    hasUnsavedChanges,
    onSettingsNavigationApproved
  ]);

  function setCurrentRows(nextRows) {
    if (activeSection === 'expense') {
      setExpenseRows(nextRows);
    } else {
      setRevenueRows(nextRows);
    }
  }

  function markChanged() {
    setHasUnsavedChanges(true);
    setSaveMessage('');
    setSaveError('');
  }

  function requestSection(sectionName) {
    if (sectionName === activeSection) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingDestinationType('section');
      setPendingDestination(sectionName);
      setShowUnsavedPrompt(true);
      return;
    }

    setActiveSection(sectionName);
    setSelectedRowIndex(null);
    setEditingRowIndex(null);
    setEditSnapshot(null);
    setSaveMessage('');
    setSaveError('');
  }

 function selectRow(index) {
  if (
    editingRowIndex !== null &&
    editingRowIndex !== index
  ) {
    setPendingDestinationType('row');
    setPendingRowIndex(index);
    setShowUnsavedPrompt(true);
    return;
  }

  setSelectedRowIndex(index);
}

  function updateRowField(index, fieldName, value) {
    const nextRows = cloneRows(currentRows);
    const row = nextRows[index];

    if (!row) {
      return;
    }

    let nextValue = value;

    if (
      [
        'glNumber',
        'parentGl',
        'consolidatedParentGl'
      ].includes(fieldName)
    ) {
      nextValue = digitsOnly(value);
    }

    row[fieldName] = nextValue;

    if (fieldName === 'bankType') {
      row.bankId = bankIdOptions(nextValue)[0];
    }

    if (fieldName === 'pc' && nextValue === 'P') {
      row.parentGl = '';
      row.consolidatedParentGl = row.glNumber || '';
    }

    setCurrentRows(nextRows);
    markChanged();
  }

  function beginEdit() {
    if (selectedRowIndex === null || !selectedRow) {
      window.alert('Select a row first.');
      return;
    }

    

    // if (selectedRow.systemLocked === true) {
    //   window.alert(
    //     'This is a fixed system GL# row and cannot be edited.'
    //   );
    //   return;
    // }

    setEditSnapshot(cloneRows(currentRows));
    setEditingRowIndex(selectedRowIndex);
    markChanged();
  }

function findParentRangeRow(rows, parentGl) {
  return (
    rows.find(
      (row) =>
        isRangeRow(row) &&
        String(row.parentGl || '') === String(parentGl || '')
    ) || null
  );
}

  function validateEditedRow() {
    if (editingRowIndex === null) {
      return true;
    }

    

    const row = currentRows[editingRowIndex];

    if (!row) {
      return true;
    }

    if (row.systemLocked === true) {
  return true;
}

    const glNumber = String(row.glNumber || '').trim();
    const glName = String(row.glName || '').trim();

    if (!glNumber) {
      setSaveError('GL# is required.');
      return false;
    }

    if (!glName) {
      setSaveError('GL# Name is required.');
      return false;
    }

    if (!/^\d+$/.test(glNumber)) {
      setSaveError('Enter a valid numeric GL#.');
      return false;
    }

    const duplicate = currentRows.some(
      (candidate, index) =>
        index !== editingRowIndex &&
        String(candidate.glNumber || '').trim() === glNumber
    );

    if (duplicate) {
      setSaveError('That GL# is already assigned.');
      return false;
    }

    if (row.pc === 'C') {
      const rangeRow =
         findParentRangeRow(currentRows, row.parentGl);

      const allowedRange =
        parseGLRange(rangeRow?.glNumber);

      const glNumberValue = Number(glNumber);

      if (
        allowedRange &&
        (
          glNumberValue < allowedRange.start ||
          glNumberValue > allowedRange.end
        )
      ) {
        setSaveError(
          "GL# must be within this section's allowed range."
        );
        return false;
      }
    }

    return true;
  }

  function determineParentForNewRow() {
    if (!selectedRow) return null;
    if (isRangeRow(selectedRow)) return selectedRow.parentGl;
    if (selectedRow.pc === 'P') return selectedRow.glNumber;
    if (selectedRow.pc === 'C') return selectedRow.parentGl;
    return null;
  }

  function addRow() {
    if (selectedRowIndex === null || !selectedRow) {
      window.alert('Select a GL# range or hierarchy row first.');
      return;
    }

    if (editingRowIndex !== null) {
      window.alert(
        'Save or discard the current edit before adding a row.'
      );
      return;
    }

    const parentGl = determineParentForNewRow();

    if (!parentGl) {
      window.alert(
        'Could not determine the Parent GL# for the new row.'
      );
      return;
    }

    const rangeRow = findParentRangeRow(currentRows, parentGl);

if (!rangeRow) {
  window.alert(
    'This heading does not have an assignable GL# range. Add Row is not allowed.'
  );
  return;
}

const allowedRange = parseGLRange(rangeRow.glNumber);

if (!allowedRange) {
  window.alert(
    'The assignable GL# range for this heading is invalid.'
  );
  return;
}

const usedGLNumbers = new Set(
  currentRows
    .filter(
      (row) =>
        row.pc === 'C' &&
        String(row.parentGl || '') === String(parentGl)
    )
    .map((row) => Number(row.glNumber))
    .filter((value) => Number.isFinite(value))
);

let hasAvailableGLNumber = false;

for (
  let gl = allowedRange.start;
  gl <= allowedRange.end;
  gl += 1
) {
  if (!usedGLNumbers.has(gl)) {
    hasAvailableGLNumber = true;
    break;
  }
}

if (!hasAvailableGLNumber) {
  window.alert(
    'No unused GL#s remain in this heading\'s assignable range.'
  );
  return;
}



    const nextRows = cloneRows(currentRows);
    let insertAt = selectedRowIndex + 1;

    while (
    insertAt < nextRows.length &&
    nextRows[insertAt].pc === 'C' &&
    String(nextRows[insertAt].parentGl) === String(parentGl) &&
    !isRangeRow(nextRows[insertAt])
  ) {
    insertAt += 1;
  }

    const parentRow = nextRows.find(
      (row) =>
        row.pc === 'P' &&
        String(row.glNumber) === String(parentGl)
    );


    nextRows.splice(insertAt, 0, {
      glNumber: '',
      glName: '',
      sourceTable: selectedRow.sourceTable || '',

      useInCR: 'N',
      useInDP: 'N',
      useInAPR: 'N',
      useInBDC: 'N',
      useInXfer: 'N',

      description: '',
      bankType: selectedRow.bankType || 'Operating',
      bankId:
        selectedRow.bankId ||
        bankIdOptions(
          selectedRow.bankType || 'Operating'
        )[0],
      pc: 'C',
      parentGl,
      consolidatedParentGl:
        parentRow?.consolidatedParentGl || parentGl,
      dc:
        selectedRow.dc ||
        (activeSection === 'expense' ? 'D' : 'C'),
      ar: 'A',
      effectiveDate: '',
      createdBy: 'USER',
      createdDate: todayString(),
      lastEditedBy: 'USER',
      systemLocked: false,
      isNew: true
    });

    setEditSnapshot(cloneRows(currentRows));
    setCurrentRows(nextRows);
    setSelectedRowIndex(insertAt);
    setEditingRowIndex(insertAt);
    markChanged();
  }

  function rowHasChildren(row) {
    const rowGl = String(row?.glNumber || '').trim();

    if (!rowGl) {
      return false;
    }

    return currentRows.some(
      (candidate) =>
        String(candidate.parentGl || '').trim() === rowGl
    );
  }

  function deleteRow() {
    if (selectedRowIndex === null || !selectedRow) {
      window.alert('Select a row to delete.');
      return;
    }

    if (editingRowIndex !== null) {
      window.alert(
        'Save or discard the current edit before deleting a row.'
      );
      return;
    }

    if (selectedRow.systemLocked === true) {
      window.alert('System GL# rows cannot be deleted.');
      return;
    }

    if (rowHasChildren(selectedRow)) {
      window.alert(
        'This row has child rows. Move or retire the child rows before deleting it.'
      );
      return;
    }

    const confirmed = window.confirm(
      'Delete this GL# Mapping row?\n\n' +
      `GL#: ${selectedRow.glNumber || '[blank]'}\n` +
      `Name: ${selectedRow.glName || '[blank]'}`
    );

    if (!confirmed) {
      return;
    }

    const nextRows = cloneRows(currentRows);
    nextRows.splice(selectedRowIndex, 1);

    setCurrentRows(nextRows);
    setSelectedRowIndex(null);
    markChanged();
  }

  function isMovableChild(row) {
    return (
      row &&
      row.pc === 'C' &&
      !isRangeRow(row) &&
      row.systemLocked !== true
    );
  }

  function moveRow(direction) {
    if (editingRowIndex !== null) {
      window.alert(
        'Save or discard the current edit before moving rows.'
      );
      return;
    }

    if (!isMovableChild(selectedRow)) {
      window.alert(
        'Move Up / Move Down works only on unlocked child GL# rows.'
      );
      return;
    }

    const neighborIndex = selectedRowIndex + direction;
    const neighbor = currentRows[neighborIndex];

    if (
      !isMovableChild(neighbor) ||
      String(neighbor.parentGl) !== String(selectedRow.parentGl)
    ) {
      window.alert(
        direction < 0
          ? 'This row is already the first child for this parent.'
          : 'This row is already the last child for this parent.'
      );
      return;
    }

    const nextRows = cloneRows(currentRows);
    nextRows[selectedRowIndex] = neighbor;
    nextRows[neighborIndex] = selectedRow;

    setCurrentRows(nextRows);
    setSelectedRowIndex(neighborIndex);
    markChanged();
  }

  function moveToParent() {
    if (editingRowIndex !== null) {
      window.alert(
        'Save or discard the current edit before moving rows.'
      );
      return;
    }

    if (!isMovableChild(selectedRow)) {
      window.alert(
        'Move To Parent works only on unlocked child GL# rows.'
      );
      return;
    }

    const targetEntry = window.prompt(
      'Enter the target Parent GL#:',
      selectedRow.parentGl || ''
    );

    if (targetEntry === null) {
      return;
    }

    const targetParentGl = digitsOnly(targetEntry);

    const targetIndex = currentRows.findIndex(
      (row) =>
        row.pc === 'P' &&
        String(row.glNumber) === targetParentGl
    );

    if (targetIndex < 0) {
      window.alert(
        'Target Parent GL# must be an existing parent row.'
      );
      return;
    }

    const nextRows = cloneRows(currentRows);
    const movedRow =
      nextRows.splice(selectedRowIndex, 1)[0];

    movedRow.parentGl = targetParentGl;
    movedRow.consolidatedParentGl =
      nextRows[targetIndex]?.consolidatedParentGl ||
      targetParentGl;

    const adjustedParentIndex =
      nextRows.findIndex(
        (row) =>
          row.pc === 'P' &&
          String(row.glNumber) === targetParentGl
      );

    let insertAt = adjustedParentIndex + 1;

    while (
      insertAt < nextRows.length &&
      nextRows[insertAt].pc === 'C' &&
      String(nextRows[insertAt].parentGl) === targetParentGl
    ) {
      insertAt += 1;
    }

    nextRows.splice(insertAt, 0, movedRow);

    setCurrentRows(nextRows);
    setSelectedRowIndex(insertAt);
    markChanged();
  }

  function buildCompleteData() {
    return {
      expenseRows,
      revenueRows,
      activeSection
    };
  }

  async function saveCurrentSettings() {
    if (!validateEditedRow()) {
      return false;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      const now = todayString();

      // -------------------------------------------------
      // ROW EDIT / NEW ROW
      // Existing row edits stay fast: save one row only.
      // New rows are structural changes: save the complete
      // ordered mapping so SortOrder matches the screen.
      // -------------------------------------------------
      if (editingRowIndex !== null) {
        const rowBeingSaved = currentRows[editingRowIndex];
        const isNewRow = rowBeingSaved?.isNew === true;

        const editedRow = {
          ...rowBeingSaved,
          effectiveDate: now,
          lastEditedBy: 'USER',
          createdBy: rowBeingSaved?.createdBy || 'USER',
          createdDate: rowBeingSaved?.createdDate || now
        };

        delete editedRow.isNew;
        delete editedRow.insertAfterId;
        delete editedRow.sortOrder;

        const updatedRows = [...currentRows];
        updatedRows[editingRowIndex] = editedRow;

        if (isNewRow) {
          // New P or C rows are saved individually.
          // The server assigns the new row's SortOrder; the GET query
          // then places P rows numerically and C rows under ParentGL.
          const saveData = {
            expenseRows:
              activeSection === 'expense'
                ? [editedRow]
                : [],
            revenueRows:
              activeSection === 'revenue'
                ? [editedRow]
                : [],
            activeSection,
            structuralSave: false
          };

          await saveGLMapping(saveData);

          // Reload once so the inserted row receives its database ID
          // and appears in the server-calculated hierarchy/order.
          const savedData = await loadGLMapping();

          setExpenseRows(
            Array.isArray(savedData?.expenseRows)
              ? cloneRows(savedData.expenseRows)
              : cloneRows(DEFAULT_EXPENSE_ROWS)
          );
          setRevenueRows(
            Array.isArray(savedData?.revenueRows)
              ? cloneRows(savedData.revenueRows)
              : cloneRows(DEFAULT_REVENUE_ROWS)
          );
        } else {
          const saveData = {
            expenseRows:
              activeSection === 'expense'
                ? [editedRow]
                : [],
            revenueRows:
              activeSection === 'revenue'
                ? [editedRow]
                : [],
            activeSection,
            structuralSave: false
          };

          await saveGLMapping(saveData);

          if (activeSection === 'expense') {
            setExpenseRows(updatedRows);
          } else {
            setRevenueRows(updatedRows);
          }
        }
      }

      // -------------------------------------------------
      // STRUCTURAL CHANGES
      // Move Up / Move Down / Move To Parent / Delete.
      // The ordered React arrays are the source of truth.
      // -------------------------------------------------
      else {
        const completeData = {
          expenseRows,
          revenueRows,
          activeSection,
          structuralSave: true
        };

        await saveGLMapping(completeData);

        const savedData = await loadGLMapping();

        setExpenseRows(
          Array.isArray(savedData?.expenseRows)
            ? cloneRows(savedData.expenseRows)
            : cloneRows(DEFAULT_EXPENSE_ROWS)
        );
        setRevenueRows(
          Array.isArray(savedData?.revenueRows)
            ? cloneRows(savedData.revenueRows)
            : cloneRows(DEFAULT_REVENUE_ROWS)
        );
      }

      setEditingRowIndex(null);
      setEditSnapshot(null);
      setHasUnsavedChanges(false);
      setSaveMessage('Changes saved.');

      return true;
    } catch (error) {
      console.error(error);

      setSaveError(
        error.message ||
        'Unable to save GL Mapping settings.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreLastSavedData() {
    const savedData = await loadGLMapping();

    if (!savedData) {
      setExpenseRows(cloneRows(DEFAULT_EXPENSE_ROWS));
      setRevenueRows(cloneRows(DEFAULT_REVENUE_ROWS));
      setActiveSection('expense');
    } else {
      setExpenseRows(
        Array.isArray(savedData.expenseRows)
          ? cloneRows(savedData.expenseRows)
          : cloneRows(DEFAULT_EXPENSE_ROWS)
      );

      setRevenueRows(
        Array.isArray(savedData.revenueRows)
          ? cloneRows(savedData.revenueRows)
          : cloneRows(DEFAULT_REVENUE_ROWS)
      );

      setActiveSection(
        savedData.activeSection || 'expense'
      );
    }

    setSelectedRowIndex(null);
    setEditingRowIndex(null);
    setEditSnapshot(null);
  }

  function discardCurrentEdit() {
    if (editSnapshot) {
      setCurrentRows(cloneRows(editSnapshot));
    }

    setEditingRowIndex(null);
    setEditSnapshot(null);
    setHasUnsavedChanges(false);
    setSaveMessage('');
    setSaveError('');
  }

  function completePendingNavigation() {
    if (pendingDestinationType === 'settings-panel') {
      onSettingsNavigationApproved(pendingDestination);
    } else {
      setActiveSection(pendingDestination);
      setSelectedRowIndex(null);
      setEditingRowIndex(null);
      setEditSnapshot(null);
    }

    setPendingDestinationType('');
    setPendingDestination('');
    setShowUnsavedPrompt(false);
  }

async function handlePromptYes() {
  const saveSucceeded =
    await saveCurrentSettings();

  if (!saveSucceeded) {
    return;
  }

  if (pendingDestinationType === 'row') {
    setPendingDestinationType('');
    setPendingRowIndex(null);
    setShowUnsavedPrompt(false);
    return;
  }

  completePendingNavigation();
}

  async function handlePromptNo() {

   if (pendingDestinationType === 'row') {
  discardCurrentEdit();

  setPendingDestinationType('');
  setPendingRowIndex(null);
  setShowUnsavedPrompt(false);

  return;
}

    setIsLoading(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await restoreLastSavedData();
      setHasUnsavedChanges(false);
      completePendingNavigation();
    } catch (error) {
      console.error(error);

      setSaveError(
        'The last saved GL Mapping settings could not be restored.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptCancel() {

    if (pendingDestinationType === 'row') {
  setPendingDestinationType('');
  setPendingRowIndex(null);
  setShowUnsavedPrompt(false);
  return;
}

    const wasSettingsNavigation =
      pendingDestinationType === 'settings-panel';

    setPendingDestinationType('');
    setPendingDestination('');
    setShowUnsavedPrompt(false);

    if (wasSettingsNavigation) {
      onSettingsNavigationCancelled();
    }
  }

  function openInstructionalVideo() {
    window.open(
      'https://player.vimeo.com/external/322334913.hd.mp4?s=01c0fa1f3b8924f16255fd0ae8fa488f43749b11&profile_id=174',
      '_blank',
      'noopener,noreferrer'
    );
  }

  function renderTextInput(
    row,
    index,
    fieldName,
    numericOnly = false,
    permanentlyReadOnly = false
  ) {
    const editable =
      editingRowIndex === index &&
      row.systemLocked !== true &&
      !permanentlyReadOnly;

    return (
      <input
        type="text"
        inputMode={numericOnly ? 'numeric' : undefined}
        value={row[fieldName] || ''}
        readOnly={!editable}
        onChange={(event) =>
          updateRowField(
            index,
            fieldName,
            event.target.value
          )
        }
      />
    );
  }

  return (
    <div className="settings-glmap-page">
      <div className="glmap-left">
        <div className="glmap-left-title">
          GL# Mapping
        </div>

        <button
          type="button"
          className={
            activeSection === 'expense'
              ? 'glmap-section-btn active'
              : 'glmap-section-btn'
          }
          onClick={() => requestSection('expense')}
        >
          Expense GL#s
        </button>

        <button
          type="button"
          className={
            activeSection === 'revenue'
              ? 'glmap-section-btn active'
              : 'glmap-section-btn'
          }
          onClick={() => requestSection('revenue')}
        >
          Revenue GL#s
        </button>

        <button
          type="button"
          className="glmap-section-btn disabled"
          disabled
        >
          Asset / Liability Later
        </button>
      </div>

      <div className="glmap-main">
        <div className="glmap-ts">
          <div className="glmap-title">
            {sectionTitle}
          </div>

          <div className="glmap-note">
            <strong>Purpose:</strong> {sectionNote}
          </div>

          <div className="glmap-actions">
            <button
              type="button"
              id="btnGLMapEdit"
              onClick={beginEdit}
            >
              Edit
            </button>

            <button
              type="button"
              id="btnGLMapAddRow"
              onClick={addRow}
            >
              Add Row
            </button>

            <button
              type="button"
              id="btnGLMapDeleteRow"
              onClick={deleteRow}
            >
              Delete Row
            </button>

            <button
              type="button"
              id="btnGLMapSave"
              onClick={saveCurrentSettings}
              disabled={isLoading || isSaving}
              style={{
                backgroundColor: hasUnsavedChanges ? 'red' : '',
                color: hasUnsavedChanges ? 'white' : ''
              }}
            >
              {isSaving
                ? 'Saving...'
                : hasUnsavedChanges
                  ? 'SAVE CHANGES'
                  : 'Save'}
            </button>

            <button
              type="button"
              id="btnGLMapMoveUp"
              onClick={() => moveRow(-1)}
            >
              Move Up
            </button>

            <button
              type="button"
              id="btnGLMapMoveDown"
              onClick={() => moveRow(1)}
            >
              Move Down
            </button>

            <button
              type="button"
              id="btnGLMapMoveToParent"
              onClick={moveToParent}
            >
              Move To Parent
            </button>

            {editingRowIndex !== null && (
              <button
                type="button"
                className="glmap-cancel-edit"
                onClick={discardCurrentEdit}
              >
                Cancel Edit
              </button>
            )}

            <button
              type="button"
              id="btnGLMapVideo"
              onClick={openInstructionalVideo}
            >
              Instructional Video
            </button>

            {hasUnsavedChanges && (
              <span className="glmap-save-message-visible">
                Save Changes
              </span>
            )}

            {saveError && (
              <span className="glmap-error-message">
                {saveError}
              </span>
            )}
          </div>
        </div>

        <div className="glmap-grid-wrap">
          <table className="glmap-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>GL#</th>
                <th style={{ width: '240px' }}>GL#_Name</th>
                <th style={{ width: '150px' }}>Bank_Acct_Type</th>
                <th style={{ width: '140px' }}>Bank_ID#</th>
                <th style={{ width: '110px' }}>P / C</th>
                <th style={{ width: '120px' }}>Parent GL#</th>
                <th style={{ width: '150px' }}>
                  Consolidated Parent GL#
                </th>
                <th style={{ width: '110px' }}>D/C</th>
                <th style={{ width: '110px' }}>A / R</th>
                <th style={{ width: '130px' }}>Effected Date</th>
                <th style={{ width: '120px' }}>Created By</th>
                <th style={{ width: '130px' }}>Created Date</th>
                <th style={{ width: '130px' }}>Last Edited By</th>
                <th style={{ width: '90px' }}>Use in CR</th>
                <th style={{ width: '90px' }}>Use in DP</th>
                <th style={{ width: '90px' }}>Use in APR</th>
                <th style={{ width: '90px' }}>Use in BDC</th>
                <th style={{ width: '100px' }}>Use in XFER</th>
                <th style={{ width: '180px' }}>
                  Table GL# Recorded
                </th>
              </tr>
            </thead>

            <tbody>
              {currentRows.map((row, index) => {
                const editable =
                  editingRowIndex === index &&
                  row.systemLocked !== true;

                  

                const usageEditable =
                  editingRowIndex === index;

                  const sourceTableName = String(
                  row.sourceTable || ''
                )
                  .trim()
                  .replace(/\s+/g, ' ')
                  .toLowerCase();

                
                const availableBankIds =
                  bankIdOptions(row.bankType);

                return (
                  <tr
                    key={`${activeSection}-${index}`}
                    className={
                      [
                        row.pc === 'P'
                          ? 'glmap-row-parent'
                          : 'glmap-row-child',
                        selectedRowIndex === index
                          ? 'selected'
                          : ''
                      ].join(' ')
                    }
                    onMouseDown={(event) => {
                      if (
                        editingRowIndex !== null &&
                        editingRowIndex !== index
                      ) {
                        event.preventDefault();
                      }
                    }}
                    onClick={() => selectRow(index)}
                  >
                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'glNumber',
                        true
                      )}
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'glName'
                      )}
                    </td>

                    <td>
                      <select
                        value={row.bankType || ''}
                        disabled={!editable}
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'bankType',
                            event.target.value
                          )
                        }
                      >
                        {BANK_TYPES.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        value={
                          availableBankIds.includes(row.bankId)
                            ? row.bankId
                            : availableBankIds[0]
                        }
                        disabled={!editable}
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'bankId',
                            event.target.value
                          )
                        }
                      >
                        {availableBankIds.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        value={row.pc || 'C'}
                        disabled={!editable}
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'pc',
                            event.target.value
                          )
                        }
                      >
                        <option value="P">P</option>
                        <option value="C">C</option>
                      </select>
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'parentGl',
                        true
                      )}
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'consolidatedParentGl',
                        true
                      )}
                    </td>

                    <td>
                      <select
                        value={row.dc || 'D'}
                        disabled={!editable}
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'dc',
                            event.target.value
                          )
                        }
                      >
                        <option value="D">D</option>
                        <option value="C">C</option>
                      </select>
                    </td>

                    <td>
                      <select
                        value={row.ar || 'A'}
                        disabled={!editable}
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'ar',
                            event.target.value
                          )
                        }
                      >
                        <option value="A">A</option>
                        <option value="R">R</option>
                      </select>
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'effectiveDate',
                        false,
                        true
                      )}
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'createdBy',
                        false,
                        true
                      )}
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'createdDate',
                        false,
                        true
                      )}
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'lastEditedBy',
                        false,
                        true
                      )}
                    </td>

                    <td>
                    <select
                      value={row.useInCR || 'N'}
                      disabled={!usageEditable}
                      // disabled={
                      //   !usageEditable ||
                      //   sourceTableName !== 'check register'
                      // }
                      onChange={(event) =>
                        updateRowField(
                          index,
                          'useInCR',
                          event.target.value
                        )
                      }
                    >
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.useInDP || 'N'}
                      // DP
                      disabled={!usageEditable}
                      // disabled={
                      //   !usageEditable ||
                      //   sourceTableName !== 'deposit register'
                      // }
                      onChange={(event) =>
                        updateRowField(
                          index,
                          'useInDP',
                          event.target.value
                        )
                      }
                    >
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.useInAPR || 'N'}
                      // APR
                      disabled={!usageEditable}
                        // disabled={
                        //   !usageEditable ||
                        //   sourceTableName !== "ass'mt pay'mt register"
                        // }
                      onChange={(event) =>
                        updateRowField(
                          index,
                          'useInAPR',
                          event.target.value
                        )
                      }
                    >
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </td>

                  <td>
                      <select
                        value={row.useInBDC || 'N'}
                        // BDC
                        disabled={!usageEditable}
                      // disabled={
                      //   !usageEditable ||
                      //   sourceTableName !== 'bank debit & credits'
                      // }
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'useInBDC',
                            event.target.value
                          )
                        }
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </td>

                    <td>
                      <select
                        value={row.useInXfer || 'N'}
                        // XFER
                        disabled={!usageEditable}
                      // disabled={
                      //   !usageEditable ||
                      //   sourceTableName !== '$$ xfer & intra account deposits'
                      // }
                        onChange={(event) =>
                          updateRowField(
                            index,
                            'useInXfer',
                            event.target.value
                          )
                        }
                      >
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </td>

                    <td>
                      {renderTextInput(
                        row,
                        index,
                        'sourceTable',
                        false,
                        true
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

<UnsavedChangesPrompt
  isOpen={showUnsavedPrompt}
  isSaving={isSaving}
  isLoading={isLoading}
  errorMessage={saveError}
  onYes={handlePromptYes}
  onNo={handlePromptNo}
  onCancel={handlePromptCancel}
yesLabel={
  pendingDestinationType === 'row'
    ? 'Save Row'
    : 'Yes'
}
noLabel={
  pendingDestinationType === 'row'
    ? 'Delete Row'
    : 'No'
}
cancelLabel={
  pendingDestinationType === 'row'
    ? 'Cancel'
    : 'Cancel'
}
/>
</div>
  );
}

export default GLMapping;
