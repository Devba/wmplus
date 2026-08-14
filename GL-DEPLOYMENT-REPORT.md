# Backend Deployment Report — GLAccounts Y/N Fields (Phases 1, 2, 3)

**To:** Frontend Team
**From:** Backend/Database Team
**Date:** 2026-08-10
**Status:** Deployed & verified in production ✅

---

📋 Copy the whole section below to share with your team:

---

## ✅ Phase 1 — Database + GL Mapping API (DONE)

- ✅ `ALTER TABLE GLAccounts` executed in production `hoamanager26`
  - `UseInCR CHAR(1) NOT NULL DEFAULT 'N'`
  - `UseInDP CHAR(1) NOT NULL DEFAULT 'N'`
  - `UseInAPR CHAR(1) NOT NULL DEFAULT 'N'`
  - `UseInBDC CHAR(1) NOT NULL DEFAULT 'N'`
  - `UseInXFER CHAR(1) NOT NULL DEFAULT 'N'`
- ✅ `GET /api/settings/gl-mapping` now returns the 5 `useIn*` fields
  - Sample keys: `id, glNumber, glName, sourceTable, description, bankType, bankId, pc, parentGl, consolidatedParentGl, dc, ar, effectiveDate, createdBy, createdDate, lastEditedBy, systemLocked, useInCR, useInDP, useInAPR, useInBDC, useInXFER`
- ✅ `PUT /api/settings/gl-mapping` now persists the 5 `useIn*` fields
- ✅ `SourceTable` left unchanged (still the master/original classification)
- ✅ Verified: all existing 134 GL rows keep `useIn* = 'N'` (no data touched)

## ✅ Phase 2 — New backend endpoint for filtered GL options (DONE)

- ✅ New endpoint deployed: `GET /api/gl-options`
- ✅ Query params: `screen` = `CR | DP | APR | BDC | XFER`, optional `bankId`
- ✅ Returns **full GL objects** including at least:
  ```
  glNumber
  glName
  bankType
  bankId
  sourceTable
  ```
- ✅ Filters by the matching `useIn*` flag, e.g.:
  - `screen=CR` → `UseInCR = 'Y'`
  - `screen=DP` → `UseInDP = 'Y'`
  - `screen=APR` → `UseInAPR = 'Y'`
  - `screen=BDC` → `UseInBDC = 'Y'`
  - `screen=XFER` → `UseInXFER = 'Y'`
- ✅ Bank-eligibility: **no strict server-side rule hard-coded** (as agreed). The bank info is returned with each GL option and the selection logic stays on the frontend for now. When the transaction UF sends the selected bank ID back, we finalize the permanent server-side bank matching.

## ✅ Phase 3 — Frontend migration (APPROVED — your work)

- ✅ Migration of the transaction entry screens (CR, DP, APR, BDC, XFER) to populate GL dropdowns from `GET /api/gl-options` instead of the hardcoded arrays is **approved**.
- ⏳ Backend is ready — waiting on frontend to wire up the dropdowns.

---

## 🔗 Verification in production

URLs (live on VPS `62.171.142.58`):

```
GET https://62.171.142.58/api/settings/gl-mapping
GET https://62.171.142.58/api/gl-options?screen=CR
GET https://62.171.142.58/api/gl-options?screen=CR&bankId=<id>
```

- ✅ PM2 process `wm-backend-api` → **online**
- ✅ `/api/settings/gl-mapping` returns all 18 keys per GL (incl. the 5 `useIn*`)
- ✅ `/api/gl-options?screen=CR` → `200`, `count: 0` (expected until a GL is flagged `Y`)

---

## 🚀 Next steps

1. **Frontend**: wire up the transaction UFs to `GET /api/gl-options`.
2. **Backend**: after receiving the selected bank ID from the UF, add the permanent server-side bank-matching rule.

Let us know if you need any adjustment.