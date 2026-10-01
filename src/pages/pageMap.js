

import MasterNavPanel from './MasterNavPanel';

import CheckRegister from './CheckRegister';
import CheckRegisterMonthlySummary from './CheckRegisterMonthlySummary';
import DepositRegister from './DepositRegister';
import DepositRegisterMonthlySummary from './DepositRegisterMonthlySummary';
import AssmtPaymtRegister from './AssmtPaymtRegister';
import MainDirectory from './MainDirectory';
import Settings from './Settings';
import VendorIdList from './VendorIdList';
import CashFlow from './CashFlow';
import ManageViolations from './ManageViolations/ManageViolations.jsx';
import ManageLateAssessments from './ManageLateAssessments/ManageLateAssessments.jsx';
import ManageArrears from './ManageArrears/ManageArrears.jsx';
import AccountsReceivableAging from './AccountsReceivableAging/AccountsReceivableAging.jsx';
import ViolationsRegister from './ViolationsRegister/ViolationsRegister.jsx';
import OpenCheckRegisterReport from './OpenCheckRegisterReport/OpenCheckRegisterReport.jsx';
import BankDebitsCredits from './BankDebitsCredits/BankDebitsCredits.jsx';

export const pageMap = {
  'master-navigation-panel': MasterNavPanel,
  'check-register': CheckRegister,
  'check-register-monthly-summary': CheckRegisterMonthlySummary,
  'deposit-register': DepositRegister,
  'deposit-register-monthly-summary': DepositRegisterMonthlySummary,
  'assmt-paymt-register': AssmtPaymtRegister,
  'main-directory': MainDirectory,
  'settings': Settings,
  'vendor-id-list': VendorIdList,
  'cash-flow': CashFlow,
  'manage-violations': ManageViolations,
  'manage-late-assessments': ManageLateAssessments,
  'manage-arrears': ManageArrears,
  'accounts-receivable-aging': AccountsReceivableAging,
  'violation-register': ViolationsRegister,
  'open-check-register-report': OpenCheckRegisterReport,
  'bank-debits-credits': BankDebitsCredits,
  };

