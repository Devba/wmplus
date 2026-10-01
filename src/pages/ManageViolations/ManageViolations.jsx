



import React, { useState } from "react";
import "./ManageViolations.css";
import InspectionDateCalendarUF from "./InspectionDateCalendarUF";
import ViolationRegisterUF from "./ViolationRegisterUF";
// ============================================================
// W M+ MANAGE VIOLATIONS
// TEMPORARY HOLDING PAGE
// ============================================================
//
// PURPOSE:
// Reserved for the W M+ Manage Violations function.
//
// STATUS:
// Page structure and business logic to be developed later.
//
// IMPORTANT:
// This temporary component contains no business logic,
// database logic, or APR calculation logic.
//
// ============================================================

export default function ManageViolations() {
    const [inspectionDate, setInspectionDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
  return (
    <div className="manage-violations-page">
      <h1>MANAGE VIOLATIONS</h1>
      <p>W M+ — Function Under Development</p>
      {inspectionDate ? (
  <ViolationRegisterUF
    inspectionDate={inspectionDate}
    onShowCalendar={() => setShowCalendar(true)}
        />
        ) : (
        showCalendar && (
            <InspectionDateCalendarUF
            onDateSelected={(date) => {
                setInspectionDate(date);
                setShowCalendar(false);
            }}
            onClose={() => setShowCalendar(false)}
            />
        )
        )}
            
    </div>
  );
}