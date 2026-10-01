





import BankRow from './BankRow';
import ButtonRow from './ButtonRow';
import { useState } from 'react';
import EnterBankAction from '../EnterBankActionUF/EnterBankAction';

function TopSection({ onSelectPage }) {
const [showEnterBankAction, setShowEnterBankAction] = useState(false);    
  return (
    <div className="bankdc-topsection">
      <BankRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        onEnterBankAction={() => setShowEnterBankAction(true)}
        />

        {showEnterBankAction && (
        <EnterBankAction
            onClose={() => setShowEnterBankAction(false)}
        />
        )}
            </div>
  );
}

export default TopSection;