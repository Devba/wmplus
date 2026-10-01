

import MasterNavPanel from './MasterNavPanel';

import CheckRegister from './CheckRegister';
import CheckRegisterMonthlySummary from './CheckRegisterMonthlySummary';
import DepositRegister from './DepositRegister';
import DepositRegisterMonthlySummary from './DepositRegisterMonthlySummary';
import AssmtPaymtRegister from './AssmtPaymtRegister';
import MainDirectory from './MainDirectory';
import Settings from './Settings';
import VendorIdList from './VendorIdList';
import Login from './Login/Login';
import UserAdmin from './UserAdmin/UserAdmin';
import MyAccount from './MyAccount/MyAccount';
import GoldenSet from './GoldenSet/GoldenSet';
import LetterCodes from './Reports/LetterCodes';
import GLAccounts from './Reports/GLAccounts';
import DuesRates from './Reports/DuesRates';
import OpenChecks from './Reports/OpenChecks';
import PaymentSummary from './Reports/PaymentSummary';
import ARSummary from './Reports/ARSummary';
import ReceivablesSummary from './Reports/ReceivablesSummary';
import YTDCashFlow from './Reports/YTDCashFlow';
import MonthlyGL from './Reports/MonthlyGL';
import EscrowAccountSummary from './Reports/EscrowAccountSummary';
import EscrowCF from './Reports/EscrowCF';
import HistoricEscrow from './Reports/HistoricEscrow';
import CashFlow from './CashFlow';



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
  'login': Login,
  'user-admin': UserAdmin,
  'my-account': MyAccount,
  'golden-set': GoldenSet,
  'report-letter-codes': LetterCodes,
  'report-gl-accounts': GLAccounts,
  'report-dues-rates': DuesRates,
  'report-open-checks': OpenChecks,
  'report-payment-summary': PaymentSummary,
  'report-ar-summary': ARSummary,
  'report-receivables-summary': ReceivablesSummary,
  'report-ytd-cash-flow': YTDCashFlow,
  'report-monthly-gl': MonthlyGL,
  'escrow-account-summary': EscrowAccountSummary,
  'escrow-cf': EscrowCF,
  'historic-escrow': HistoricEscrow,
  'cash-flow': CashFlow,
  };

