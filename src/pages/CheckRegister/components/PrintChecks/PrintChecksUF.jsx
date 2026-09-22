

 
import React, { useEffect, useState } from 'react';
import './PrintChecksUF.css';
import { confirmPrinterReadyForPrint } from '../../../../engines/PrintEngine.js';

export default function PrintChecksUF({
  onClose,
  onChecksCreated
}) {
  const [eligibleChecks, setEligibleChecks] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [checksToPrint, setChecksToPrint] = useState([]);
  const [isCreatingChecks, setIsCreatingChecks] = useState(false);
  const [createChecksError, setCreateChecksError] = useState('');
  const [createChecksSuccess, setCreateChecksSuccess] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showPrintingInfo, setShowPrintingInfo] =
    useState(false);

  const [showSupervisorOverride, setShowSupervisorOverride] =
    useState(false);

  // TEMPORARY FRONTEND SECURITY HOOK.
  // Jose will later supply the authoritative logged-in
  // security level from the server/session.
  const supervisorAuthorized = true;
  useEffect(() => {
  const loadEligibleChecks = async () => {
    try {
      setLoadError('');

      const response = await fetch(
        'http://localhost:3011/api/check-register'
      );

      if (!response.ok) {
        throw new Error('Unable to load checks.');
      }

      const rows = await response.json();

      const eligible = rows.filter(
        (row) =>
          !row.date_issued &&
          !row.status
      );

      setEligibleChecks(eligible);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  loadEligibleChecks();
}, []);

        const createSelectedChecks = async () => {
      if (checksToPrint.length === 0) return;

      setIsCreatingChecks(true);
      setCreateChecksError('');
      setCreateChecksSuccess('');

      try {
        const printer = await confirmPrinterReadyForPrint();

        if (printer.status !== 'READY') {
          throw new Error(
            'PRINTER NOT READY. Turn on the authorized printer and try again.'
          );
        }

      for (const check of checksToPrint) {
        const response = await fetch(
          'http://localhost:3011/api/print-checks/pdf',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              transactionNumber: check.check_txn_num
            })
          }
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message || `Unable to create check ${check.check_number}.`
          );
        }
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      }
        setCreateChecksSuccess('CHECKS HAVE BEEN ISSUED AND PRINTED');
        setChecksToPrint([]);
        setSelectedCheck(null);
        if (onChecksCreated) {
          await onChecksCreated();
        }
      } catch (err) {
        setCreateChecksError(err.message);
      } finally {
        setIsCreatingChecks(false);
      }
    };

  return (
    <div className="print-checks-overlay">
      <div className="print-checks-uf">

        {/* =====================================================
            TITLE
        ===================================================== */}
        <div className="print-checks-title">
          CHECK CREATOR - SELECT ACCOUNTS TO BE PAID
        </div>

        {/* =====================================================
            MAIN SELECTION AREA
        ===================================================== */}
        <div className="print-checks-main-area">

          {/* ACCOUNTS NOT PAID */}
          <div className="print-checks-left-panel">
            <div className="print-checks-section-title">
              ACCOUNTS NOT PAID
            </div>

            <div className="print-checks-list-box">
              {loadError && <div>{loadError}</div>}

              {eligibleChecks.map((check) => (
                <div
                  key={check.check_txn_num}
                  onClick={() => setSelectedCheck(check)}
                  className={
                      selectedCheck?.check_txn_num === check.check_txn_num
                        ? 'selected'
                        : ''
                    }
                >
                  {check.check_number} - {check.payee_name}
                </div>
              ))}
            </div>
          </div>

          {/* ADD / REMOVE */}
          <div className="print-checks-move-buttons">
            <button
              type="button"
              className="print-checks-move-btn"
              onClick={() => {
                if (!selectedCheck) return;

                setChecksToPrint((current) => [
                  ...current,
                  selectedCheck
                ]);

                setEligibleChecks((current) =>
                  current.filter(
                    (check) =>
                      check.check_txn_num !==
                      selectedCheck.check_txn_num
                  )
                );
                setSelectedCheck(null);
                setCreateChecksError('');
              }}
            >
              ADD &gt;&gt;
            </button>

            <button
              type="button"
              className="print-checks-move-btn"
              onClick={() => {
                  if (!selectedCheck) return;

                  const isOnRight = checksToPrint.some(
                    (check) =>
                      check.check_txn_num === selectedCheck.check_txn_num
                  );

                  if (!isOnRight) return;

                  setEligibleChecks((current) => [
                    ...current,
                    selectedCheck
                  ]);

                  setChecksToPrint((current) =>
                    current.filter(
                      (check) =>
                        check.check_txn_num !== selectedCheck.check_txn_num
                    )
                  );

                  setSelectedCheck(null);
                }}
                 >
              &lt;&lt; REMOVE
            </button>
          </div>

          {/* CHECKS TO BE CREATED */}
          <div className="print-checks-right-panel">

            <div className="print-checks-paid-header">
              <div>CHECK #</div>
              <div>RESIDENT / VENDOR</div>
              <div>CHECK AMT</div>
            </div>

            <div className="print-checks-paid-list">
              {checksToPrint.map((check) => (
                <div
                    key={check.check_txn_num}
                    onClick={() => setSelectedCheck(check)}
                    className={
                      selectedCheck?.check_txn_num === check.check_txn_num
                        ? 'selected'
                        : ''
                    }
                  >
                  <span>{check.check_number}</span>
                  <span>{check.payee_name}</span>
                  <span>
                    ${Number(check.amount || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="print-checks-highlight-note">
              Highlight Checks Then Select Create Checks
            </div>
          </div>

        </div>

        {/* =====================================================
            CHECK DETAIL AREA
        ===================================================== */}
        <div className="print-checks-detail-area">

          <div className="print-checks-field-group payee-field">
            <label>Payee</label>
            <input
              type="text"
              value={selectedCheck?.payee_name || ''}
              readOnly
            />
          </div>

          <div className="print-checks-field-group amount-field">
            <label>Amount</label>
            <input
                type="text"
                value={
                  selectedCheck
                    ? `$${Number(selectedCheck.amount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`
                    : ''
                }
                readOnly
            />
          </div>

          <div className="print-checks-field-group gl-field">
            <label>GL#</label>
            <input
              type="text"
              value={selectedCheck?.gl_number || ''}
              readOnly
            />
          </div>

          <div className="print-checks-field-group notation-field">
            <label>Check Notation</label>
            <input
              type="text"
              value={selectedCheck?.note || ''}
              readOnly
            />
          </div>

        </div>

        {/* =====================================================
            COMBINE / ACTION BUTTONS
        ===================================================== */}
        <div className="print-checks-combine-row">

          <label className="print-checks-combine-label">
            <input type="checkbox" />
            <span>Combine</span>
          </label>

          <div className="print-checks-top-actions">
            <button
              type="button"
              className="print-checks-cancel-btn"
              onClick={onClose}
            >
              CANCEL
            </button>

             {createChecksError && (
                <div className="print-checks-create-error">
                  {createChecksError}
                </div>
              )}

             {createChecksSuccess && (
                <div className="print-checks-create-success">
                  {createChecksSuccess}
                </div>
              )}

            <button
              type="button"
              className="print-checks-create-btn"
              disabled={isCreatingChecks}
              onClick={() => {
                  if (checksToPrint.length === 0) {
                    setCreateChecksSuccess('');
                    setCreateChecksError(
                      'Select at least one check before creating checks.'
                    );

                    return;
                  }

                  setCreateChecksError('');
                  createSelectedChecks();
                }}
            >
              CREATE CHECKS
            </button>
          </div>

        </div>

        {/* =====================================================
            INFORMATION / SUPERVISOR BUTTONS
        ===================================================== */}
        <div className="print-checks-option-row">

          <button
            type="button"
            className="print-checks-info-btn"
            onClick={() => setShowPrintingInfo(true)}
          >
            PRINTING INFORMATION
          </button>

          <button
            type="button"
            className="print-checks-supervisor-btn"
            disabled={!supervisorAuthorized}
            onClick={() =>
              setShowSupervisorOverride(true)
            }
          >
            SUPERVISOR OVERRIDE
          </button>

        </div>

        {/* =====================================================
            PRINTING INFORMATION POPUP
        ===================================================== */}
        {showPrintingInfo && (
          <div className="print-checks-popup-overlay">
            <div className="print-checks-popup">

              <div className="print-checks-popup-title">
                PRINTING INFORMATION
              </div>

              <div className="print-checks-settings-grid">

                <div className="print-checks-setting-label">
                  Printing Mode:
                </div>

                <div className="print-checks-setting-value">
                  From Settings
                </div>

                <div className="print-checks-setting-label">
                  Check Printing Schedule:
                </div>

                <div className="print-checks-setting-value">
                  From Settings
                </div>

                <div className="print-checks-setting-label">
                  Selected Bank:
                </div>

                <div className="print-checks-setting-value">
                  From Check Register
                </div>

              </div>

              <div className="print-checks-popup-note">
                Bank routing number, account number and check
                numbering are controlled by the bank settings
                and the server printing process.
              </div>

              <div className="print-checks-popup-actions">

            <button
                type="button"
                className="print-checks-popup-close-btn"
                onClick={() => setShowPrintingInfo(false)}
                >
                        CANCEL
            </button>
            </div>

            </div>
          </div>
        )}

        {/* =====================================================
            SUPERVISOR OVERRIDE POPUP
        ===================================================== */}
        {showSupervisorOverride && (
          <div className="print-checks-popup-overlay">
            <div className="print-checks-popup supervisor-popup">

              <div className="print-checks-popup-title">
                SUPERVISOR OVERRIDE
              </div>

              <label className="print-checks-override-option">
                <input type="checkbox" />
                <span>
                  Override Remote Printing - Print Locally
                </span>
              </label>

              <label className="print-checks-override-option">
                <input type="checkbox" />
                <span>
                  Override Check Printing Schedule
                </span>
              </label>

              <div className="print-checks-override-note">
                Supervisor overrides apply to this print job only
                and do not change System Settings.
              </div>

              <div className="print-checks-supervisor-divider" />

              <div className="print-checks-reprint-title">
                REPRINT PENDING CHECK
              </div>

              <div className="print-checks-reprint-row">

                <div className="print-checks-field-group reprint-check-field">
                  <label>Check #</label>
                  <input type="text" />
                </div>

                <div className="print-checks-field-group reprint-reason-field">
                  <label>Reprint Reason</label>

                  <select defaultValue="">
                    <option value="">
                      Select Reason
                    </option>

                    <option value="printer-jam">
                      Printer Jam
                    </option>

                    <option value="damaged-check">
                      Damaged Check
                    </option>

                    <option value="lost-before-mailing">
                      Lost / Destroyed Before Mailing
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  className="print-checks-reprint-btn"
                >
                  REPRINT CHECK
                </button>

              </div>

              <div className="print-checks-field-group reprint-note-field">
                <label>Reprint Notation</label>
                <input type="text" />
              </div>

              <div className="print-checks-popup-actions">
                <button
                  type="button"
                  className="print-checks-popup-close-btn"
                  onClick={() =>
                    setShowSupervisorOverride(false)
                  }
                >
                  CANCEL
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
