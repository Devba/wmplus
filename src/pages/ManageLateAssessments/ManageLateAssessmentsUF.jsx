




import React from "react";
import "./ManageLateAssessmentsUF.css";

export default function ManageLateAssessmentsUF() {
  return (
    <div className="mla-uf">

      <div className="mla-window-title">
        Manage+ Delinquent Assessments Manager
      </div>

      {/* TOP TITLE */}
      <div className="mla-main-title">
        CURRENT YEAR RESIDENT ASSESSMENT DELINQUENT LIST *
      </div>

      {/* DUES TYPE */}
        <div className="mla-dues-type-label">
        Select Dues Type
        </div>

        <select className="mla-frequency">
        <option></option>
        <option>Annual</option>
        <option>Special</option>
        </select>

      {/* LEFT RESIDENT LIST */}
      <div className="mla-left-instruction">
        Double-click on a record to move from one list to the other
      </div>

      <div className="mla-left-headings">
        <span>Resident</span>
        <span>Address</span>
        <span>Account #</span>
        <span>Amount $</span>
        <span>E-Mail (Y/N)</span>
      </div>

      <div className="mla-left-list"></div>

      {/* <div className="mla-left-bottom-instruction">
        Double-click on a record to move from one list to the other
      </div> */}

      <div className="mla-prior-instruction">
        Single-Click on a record to highlight prior reminders for selected resident
      </div>

      <div className="mla-move-all-left-text">
        Click on this button to move all of the above residents to the other list box:
      </div>

      <button className="mla-move-all-left">Move all</button>

      {/* RIGHT SELECTED RESIDENT LIST */}
      <div className="mla-selected-title">Selected Residents</div>

      <div className="mla-right-headings">
        <span>Resident</span>
        <span>Address</span>
        <span>Account #</span>
        <span>Amount $</span>
        <span>E-Mail (Y/N)</span>
      </div>

      <div className="mla-right-list"></div>

      <div className="mla-move-all-right-text">
        Click on this button to move all of the above residents to the other list box:
      </div>

      <button className="mla-move-all-right">Move all</button>

      {/* PRIOR REMINDERS */}
      <div className="mla-prior-title">Prior Reminder(s)</div>

      <div className="mla-prior-headings">
        <span>Invoice<br />Date</span>
        <span>Violation<br />Code</span>
        <span>Violation Description</span>
        <span>Invoice<br />$$</span>
      </div>

      <div className="mla-prior-grid"></div>

      <div className="mla-prior-note">
        * NOTE: Previous year's delinquent assessments are listed on the Manage Arrears
      </div>

      {/* INSTRUCTIONAL VIDEO */}
      <div className="mla-video-text">
        See Instructional<br />Video Here:
      </div>

      <button className="mla-video-button">i</button>

      {/* STEP 1 */}
      <div className="mla-step1">STEP 1:</div>

      <div className="mla-step1-text">
        Select action to be taken for above
      </div>

      <select className="mla-action-select">
        <option></option>
        <option>ANNUAL DUES FINAL LETTER - LEGAL EXPENSES (LIEN APPLIED)</option>
      </select>

      {/* STEP 2 */}
      <div className="mla-step2">STEP 2:</div>
      
      <div className="mla-step2-text">
        Select Optional Functions below for above
      </div>

      <button className="mla-letter-insert">
        OPTIONAL LETTER INSERT SELECTION
      </button>

      <label className="mla-email1">
        <input type="checkbox" />
        OPTIONAL E-MAIL
      </label>

      <label className="mla-email2">
        <input type="checkbox" />
        OPTIONAL E-MAIL
      </label>

      {/* STEP 3 */}
      <div className="mla-step3">STEP 3:</div>
      <div className="mla-step3-text">
        Select the delivery method below for above
      </div>

      <label className="mla-create-emails">
        <input type="radio" name="delivery" />
        Create E-mails
      </label>

      <label className="mla-create-letters">
        <input type="radio" name="delivery" />
        Create Letters to be mailed
      </label>

      {/* STEP 4 */}
      <div className="mla-step4">STEP 4:</div>

      <button className="mla-proceed" disabled>
        Proceed with above selected collection type action
      </button>

      {/* REMINDER BUTTONS */}
      <button className="mla-reminder1">
        Send Reminder Letter Type 1
      </button>

      <div className="mla-reminder1-text">
        Select this button to send batch Type 1<br />
        Reminder letters to all residents on the list
      </div>

      <button className="mla-reminder2">
        Send Reminder Letter Type 2
      </button>

      <div className="mla-reminder2-text">
        Select this button to send batch Type 2<br />
        Reminder letters to all residents on the list
      </div>

      <button className="mla-reminder-test">
        Issue Reminder Test Letter
      </button>

      <div className="mla-reminder-test-text">
        Select this button to issue a TEST Reminder<br />
        letter to the first resident on the list
      </div>

      {/* SUPPORT */}
      <div className="mla-support-title">
        For Assistance contact:
      </div>

      <button className="mla-support-button">
        Support@HOA-e-Solutions.com
      </button>

      <div className="mla-reminder-video-text">
        See Reminder Letter<br />Instructional Video Here:
      </div>

      <button className="mla-reminder-video-button">i</button>

    </div>
  );
}