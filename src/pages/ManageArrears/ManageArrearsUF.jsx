




import React from "react";
import "./ManageArrearsUF.css";

export default function ManageArrearsUF() {
  return (
    <div className="ma-uf">

      {/* WINDOW TITLE */}
      <div className="ma-window-title">
        Manage+ Arrears Manager
      </div>

      {/* LEFT RESIDENT LIST */}

      <div className="ma-left-instruction">
        Double-click on a record to move from one list to the other.
      </div>

      <div className="ma-left-headings">
        <span className="ma-lh-name">Name</span>
        <span className="ma-lh-address">Address</span>
        <span className="ma-lh-acct">Acct#</span>
        <span className="ma-lh-total">Total $</span>
        <span className="ma-lh-email">E-Mail (Y/N)</span>
      </div>

      <div className="ma-left-list"></div>

      {/* RIGHT SELECTED RESIDENT LIST */}

      <div className="ma-selected-title">
        Selected Residents
      </div>

      <div className="ma-right-headings">
        <span className="ma-rh-name">Name</span>
        <span className="ma-rh-address">Address</span>
        <span className="ma-rh-acct">Acct#</span>
        <span className="ma-rh-total">Total $</span>
        <span className="ma-rh-email">E-Mail (Y/N)</span>
       </div>

      <div className="ma-right-list"></div>

      {/* INSTRUCTIONS BELOW RESIDENT LISTS */}

      <div className="ma-move-instruction">
        Double-click on a record to move from one list to the other.
      </div>

      <div className="ma-detail-instruction">
        Single-Click on a record to highlight details of violations for selected resident.
      </div>

      {/* DETAILS OF VIOLATIONS */}

      <div className="ma-details-title">
        Details of Violations
      </div>

      <div className="ma-details-headings">
        <span className="ma-dh-invoice">Invoice<br />Date</span>
        <span className="ma-dh-violation">Violation<br />Code</span>
        <span className="ma-dh-description">Violation<br />Description</span>
        <span className="ma-dh-amount">Invoice<br />$$</span>
       </div>

      <div className="ma-details-grid"></div>

      {/* INSTRUCTIONAL VIDEO */}

      <div className="ma-video-text">
        See<br />
        Instructional <br />
        Video
      </div>

      <button className="ma-video-button">
        i
      </button>

      {/* STEP 1 */}

      <div className="ma-step1">
        STEP 1:
      </div>

      <div className="ma-step1-text">
        Select Letter Type from list below for above Selected
      </div>

      <select className="ma-letter-type">
        <option></option>
      </select>

      {/* STEP 2 */}

      <div className="ma-step2">
        STEP 2:
      </div>

      <div className="ma-step2-text">
        Select Optional Functions below for above
      </div>

      <button className="ma-letter-insert">
        OPTIONAL LETTER INSERT SELECTION
      </button>

      <label className="ma-email1">
        <input type="checkbox" />
        OPTIONAL E-MAIL ATTACHMENT
      </label>

      <label className="ma-email2">
        <input type="checkbox" />
        OPTIONAL E-MAIL BCC
      </label>

      {/* STEP 3 */}

      <div className="ma-step3">
        STEP 3:
      </div>

      <div className="ma-step3-text">
        Select the delivery method below for above:
      </div>

      <label className="ma-create-emails">
        <input type="radio" name="arrearsDelivery" />
        Create E-mails
      </label>

      <label className="ma-create-letters">
        <input type="radio" name="arrearsDelivery" />
        Create Letters to be mailed
      </label>

      {/* STEP 4 */}

      <div className="ma-step4">
        STEP 4:
      </div>

      <button className="ma-proceed">
        Proceed With Selected Action
      </button>

      {/* SUPPORT */}

      <div className="ma-support-title">
        For Assistance contact:
      </div>

      <button className="ma-support-button">
        Support@HOA-e-Solutions.com
      </button>

    </div>
  );
}