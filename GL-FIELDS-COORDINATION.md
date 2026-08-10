# Backend ↔ Frontend Coordination: Y/N Fields in GLAccounts

**To:** Frontend Team
**From:** Backend/Database Team
**Date:** 2026-08-10
**Status:** Coordination proposal (pending your OK)

---

## 1. Context

We received your request to add 5 independent Y/N fields to `hoamanager26`.`GLAccounts`:

```sql
ALTER TABLE GLAccounts
  ADD COLUMN UseInCR   CHAR(1) NOT NULL DEFAULT 'N',
  ADD COLUMN UseInDP   CHAR(1) NOT NULL DEFAULT 'N',
  ADD COLUMN UseInAPR  CHAR(1) NOT NULL DEFAULT 'N',
  ADD COLUMN UseInBDC  CHAR(1) NOT NULL DEFAULT 'N',
  ADD COLUMN UseInXFER CHAR(1) NOT NULL DEFAULT 'N';
```

These fields will control whether each GL# appears in the dropdowns for **CR**, **DP**, **APR**, **Bank Debits & Credits (BDC)** and **$$ XFER / Intra Account Deposits**. `SourceTable` stays unchanged as the master/original classification.

The backend agrees with the proposal. Before running the `ALTER` and adjusting the APIs, we need to confirm the **data contract** between backend and frontend.

---

## 2. Proposed data contract (JSON)

The existing endpoint is **`GET/PUT /api/settings/gl-mapping`**.

### GET (response)

Each object in `glAccounts` will now include **5 new fields** (in addition to the existing ones). Proposed field naming (camelCase, no acronyms mangled):

```json
{
  "id": 12,
  "glNumber": "5000",
  "glName": "Management Fee Expense",
  "sourceTable": "Check Register",
  "description": "…",
  "...existing fields...",

  "useInCR": "Y",
  "useInDP": "N",
  "useInAPR": "N",
  "useInBDC": "N",
  "useInXFER": "N"
}
```

- Possible values: `"Y"` / `"N"` (uppercase string, same as `SourceTable`/`AR`/`DC` are handled today).
- A GL# can have more than one field set to `"Y"` (they are independent of each other).

### PUT (update request)

The frontend can send those same 5 fields within each object of `glAccounts`:

```json
{
  "glAccounts": [
    {
      "id": 12,
      "glNumber": "5000",
      "...existing fields...",
      "useInCR": "Y",
      "useInDP": "N",
      "useInAPR": "N",
      "useInBDC": "N",
      "useInXFER": "N"
    }
  ]
}
```

The backend will store exactly `Y`/`N` (normalizing to uppercase if needed).

---

## 3. Questions we need you to confirm

1. **JSON field names**: do `useInCR`, `useInDP`, `useInAPR`, `useInBDC`, `useInXFER` work for you?
   - Common alternatives: `use_in_cr` (snake_case) or `UseInCR` (same as the column). Tell us your preference and we'll align EVERYTHING (backend + JSON) to a single convention.

2. **Values**: do `"Y"`/`"N"` (string) work for you, or do you prefer booleans `true`/`false` in the JSON?
   - Keep in mind the DB columns are `CHAR(1)`, so the backend would handle the conversion. Either one is viable.

3. **Read-only optional**: do you also need them in **read-only views** (e.g. when a GL# is already selected on a check), or only on the **GL Mapping / Settings** screen?

4. **Dropdowns**: do you want the filtering by these fields **on the frontend** (over the data `GET /api/settings/gl-mapping` already returns), or do you also need the backend to filter in some specific pre-select endpoint? (By default we assume frontend-side filtering.)

---

## 4. Execution plan (once the contract is confirmed)

1. Run the `ALTER TABLE GLAccounts` in production (idempotent, safe for the current 134 rows).
2. Update `GET /api/settings/gl-mapping` to include the 5 fields.
3. Update `PUT /api/settings/gl-mapping` to persist the 5 fields.
4. Leave `SourceTable` and the rest of the fields **unchanged**.
5. Test in staging and deploy.

---

**Expected response:** confirm naming convention + value type + answers to questions 3 and 4. With that, backend locks the work and proceeds.