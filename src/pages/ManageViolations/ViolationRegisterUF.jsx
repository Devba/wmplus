




import React from "react";
import "./ViolationRegisterUF.css";

export default function ViolationRegisterUF({
  inspectionDate,
  onShowCalendar,
}) {
  const formattedInspectionDate = inspectionDate
    ? inspectionDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="violation-register-uf">
      <div className="violation-register-title">
        Manage + Violation Register
      </div>

      <button
        type="button"
        className="violation-register-close"
      >
        Cancel/Close
      </button>

      <div className="violation-register-body">

        {/* LEFT RESIDENT / VIOLATION SECTION */}
        <div className="vr-left-section">

          <div className="vr-field-row">
            <label>Inspection Date</label>
            <input
              type="text"
              value={formattedInspectionDate}
              readOnly
            />
            <button
              type="button"
              className="vr-show-calendar"
              onClick={onShowCalendar}
            >
              Show Calendar
            </button>
          </div>

          <div className="vr-field-row">
            <label>Property Address</label>
            <select defaultValue="">
              <option value=""></option>
            </select>
          </div>

          <div className="vr-field-row">
            <label>Resident Name</label>
            <input type="text" readOnly />
          </div>

          <div className="vr-field-row">
            <label>Resident Address</label>
            <input type="text" readOnly />
          </div>

          <div className="vr-field-row">
            <label>E-Mail Address</label>
            <input type="text" readOnly />
          </div>

          <div className="vr-field-row vr-violation-type-row">
            <label>Violation Type</label>
            <select defaultValue="">
              <option value=""></option>
            </select>

            <button
              type="button"
              className="vr-letter-insert-button"
            >
              OPTIONAL LETTER INSERT SELECTION
            </button>
          </div>

          <div className="vr-note-row">
            <label>Note</label>
            <textarea />
          </div>
        </div>

        {/* INSTRUCTIONAL VIDEO */}
        <div className="vr-video-area">
          <div className="vr-video-text">
            See Instructional
            <br />
            Video Here:
          </div>

          <button type="button" className="vr-video-button">
            i
          </button>
        </div>

        {/* 3-WAY RESIDENT SEARCH */}
        <div className="vr-search-section">
          <div className="vr-search-title">
            Resident Account ID Search - 3 Way
          </div>

          <div className="vr-search-top-row">
            <div className="vr-search-name">
              <label>Resident Name</label>
              <select defaultValue="">
                <option value=""></option>
              </select>
            </div>

            <div className="vr-search-account">
              <label>ACCOUNT #</label>
              <input type="text" readOnly />
            </div>
          </div>

          <div className="vr-search-address">
            <label>Resident Address</label>
            <select defaultValue="">
              <option value=""></option>
            </select>
          </div>
        </div>

        {/* RENTER INFORMATION */}
        <fieldset className="vr-renter-section">
          <legend>Property rented by:</legend>
          <input type="text" readOnly />
          <input type="text" readOnly />
        </fieldset>

        {/* PREVIOUS VIOLATIONS */}
        <div className="vr-history-section">
          <div className="vr-history-caption">
            Previous Violations
          </div>

          <div className="vr-history-headings">
            <div className="vr-h-acct">
              ACCT #
            </div>

            <div className="vr-h-date">
              Inspection
              <br />
              Date
            </div>

            <div className="vr-h-description">
              Violation Description
            </div>

            <div className="vr-h-letter">
              Letter
              <br />
              Code
            </div>

            <div className="vr-h-warning">
              Warning
              <br />
              or Fine
            </div>

            <div className="vr-h-amount">
              Amount
              <br />$
            </div>

            <div className="vr-h-issued">
              Letter
              <br />
              Issue Date
            </div>

            <div className="vr-h-notes">
              NOTES
            </div>

            <div className="vr-h-invoice">
              INV #
            </div>

            <div className="vr-h-status">
              Paid/Void/Bal Due
            </div>

            <div className="vr-h-due">
              $$ DUE
            </div>
          </div>

          <div className="vr-history-grid">
            {/* Previous violation rows will be populated later */}
          </div>

          <div className="vr-history-note">
            <label>Note</label>
            <input type="text" />
          </div>
        </div>

        {/* ACTION TAKEN */}
        <div className="vr-action-section">
          <div className="vr-action-title">
            Action Taken
          </div>

          <div className="vr-action-options">
            <label>
              <input
                type="radio"
                name="violationAction"
              />
              Issued Warning Type
            </label>

            <label>
              <input
                type="radio"
                name="violationAction"
              />
              Levied Fine - Amount $
            </label>

            <input
              type="text"
              className="vr-fine-amount"
            />
          </div>

          <button
            type="button"
            className="vr-create-letter"
            disabled
          >
            Create Violation Letter
          </button>
          
            <div className="vr-letter-code-label">Letter Code</div>


          <input
            type="text"
            className="vr-letter-code-box"
            readOnly
          />
        </div>

      </div>
    </div>
  );
}

