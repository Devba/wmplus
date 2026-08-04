


// 2026-03-08 15:00:00
// Shared Void Engine helpers for CR / DP loaders
(() => {
  "use strict";

  function closeVoidUF() {
    if (window.MPLUS && typeof window.MPLUS.closeOverlay === "function") {
      window.MPLUS.closeOverlay();
    }
  }

  function applyVoidStamp(tr, stampFields) {
    const tds = tr.querySelectorAll("td, .apr-cell");
    
    stampFields.forEach((rule) => {
      const idx = rule.column - 1;
      if (!tds[idx]) return;

      if (rule.action === "clear") {
        tds[idx].innerText = "";
      } else if (rule.action === "set") {
        tds[idx].innerText = rule.value ?? "";
      }
    });
  }

  function evaluateVoidEligibility(tr, statusColumn) {
    const tds = tr.querySelectorAll("td");
    const idx = statusColumn - 1;
    const raw = (tds[idx]?.innerText || "").trim().toUpperCase();

    if (raw === "VOID") {
      return { allowed:false, message:"Transaction already voided." };
    }

    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1 && n <= 12) {
      return { allowed:false, message:"This transaction already cleared the bank and cannot be voided." };
    }

    if (raw === "") {
      return { allowed:true };
    }

    return { allowed:false, message:"Transaction status not eligible for void." };
  }

  async function executeVoid(tr, config) {
  const txn = (config.getTransactionNo && typeof config.getTransactionNo === "function")
    ? config.getTransactionNo(tr)
    : "";

  if (!txn) {
    alert("Transaction # is required.");
    return false;
  }

  const ok = confirm(config.confirmMessage || "Are you sure you want to VOID this transaction?");
  if (!ok) return false;

  let resp;

//   try {
//     resp = await fetch("http://localhost:3011/api/void/execute", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         payload: {
//           transaction_no: txn,
//           page: config.page || ""
//         }
//       })
//     });
//   } catch (err) {
//     alert("Server request failed.");
//     console.error("VOID execute request failed:", err);
//     return false;
//   }

//   let data;
//   try {
//     data = await resp.json();
//   } catch (err) {
//     alert("Server returned invalid JSON.");
//     console.error("VOID execute JSON parse failed:", err);
//     return false;
//   }

// TEMPORARY REACT TEST MODE
const data = {
    ok: true,
    status: {
        message: "VOID successful."
    }
};






  if (!data || data.ok !== true) {
    alert((data && data.status && data.status.message) || "Void failed.");
    return false;
  }

  applyVoidStamp(tr, config.stampFields);
  closeVoidUF();
  return true;
}

  window.MPlusVoidEngine = {
    closeVoidUF,
    applyVoidStamp,
    evaluateVoidEligibility,
    executeVoid
  };
})();