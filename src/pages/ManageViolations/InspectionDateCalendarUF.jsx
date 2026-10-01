




import React, { useState } from "react";
import "./InspectionDateCalendarUF.css";

export default function InspectionDateCalendarUF({ onDateSelected, onClose }) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
    ];
  const today = new Date();

    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState(null);
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const mondayOffset = (firstDay.getDay() + 6) % 7;

    const calendarDays = [
    ...Array(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];

    while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
    }
  
    return (
    <div className="inspection-date-calendar-uf">
        <button
        type="button"
        className="inspection-date-calendar-close"
        onClick={onClose}
        >
        X
        </button>
      <div className="inspection-date-calendar-title">
        Inspection Date
      </div>
    <div className="inspection-date-calendar-controls">
  <input
    className="inspection-date-calendar-month"
    type="text"
    value={monthNames[month]}
    readOnly
  />

  <div className="inspection-date-calendar-spinner">
  {!(year === today.getFullYear() && month === today.getMonth()) && (
  <button
    type="button"
    onClick={() => {
     setSelectedDay(null);   
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }}
  >
    ▲
  </button>
 )} 
  {!(year === today.getFullYear() - 1 && month === 11) && (
  <button
    type="button"
    onClick={() => {
        setSelectedDay(null);
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    }}
  >
    ▼
  </button>
  )}
</div>

  <input
    className="inspection-date-calendar-year"
    type="text"
    value={year}
    readOnly
  />

   <div className="inspection-date-calendar-spinner">
  {year < today.getFullYear() && (
  <button
    type="button"
    onClick={() => {
    setSelectedDay(null);    
    setYear(year + 1);
    setMonth(today.getMonth());
    }}
  >
    ▲
  </button>
)}
{year > today.getFullYear() - 1 && (
  <button
    type="button"
    onClick={() => {
    setSelectedDay(null);
    setYear(year - 1);
    setMonth(11);
    }}
  >
    ▼

  </button>
 )}
</div>

</div>  
   <div className="inspection-date-calendar-weekdays">
  <div>Mon</div>
  <div>Tue</div>
  <div>Wed</div>
  <div>Thu</div>
  <div>Fri</div>
  <div>Sat</div>
  <div>Sun</div>
</div>

<div className="inspection-date-calendar-grid">
  {calendarDays.map((day, index) => {
  const isFutureDay =
    day !== null &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day > today.getDate();

  return (
    <div
      key={index}
      className={`inspection-date-calendar-day${isFutureDay ? " future-day" : ""}${selectedDay === day && day !== null ? " selected-day" : ""}`}
      onClick={() => {
    if (day !== null && !isFutureDay) {
        setSelectedDay(day);
    }
    }}

    onDoubleClick={() => {
  if (day !== null && !isFutureDay) {
    setSelectedDay(day);
    onDateSelected?.(new Date(year, month, day));
  }
  }}

    >
  {day}
    </div>
   ); 
  })}
</div>




    </div>
  );
}