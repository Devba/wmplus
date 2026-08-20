# Backend Response: GLAccounts Y/N Fields — Plan Approval

**To:** Frontend Team
**From:** Backend/Database Team
**Date:** 2026-08-10
**Status:** Approved contract — execution plan proposed, please validate

---

## 1. Contract confirmed (as you approved)

- JSON field names: `useInCR`, `useInDP`, `useInAPR`, `useInBDC`, `useInXFER`
- Values: uppercase strings `"Y"` / `"N"`
- The five fields are completely independent (a GL# may have more than one set to `"Y"`)
- `SourceTable` remains unchanged as the master/original classification and does NOT restrict the five new flags
- Read-only views: the five flags are needed only on the **GL Mapping Settings** page (GET/PUT `/api/settings/gl-mapping`)

## 2. Important finding before we implement dropdown filtering

You asked that **the backend perform the dropdown filtering** (permanent design), e.g.:
- Check Register Entry → `UseInCR = 'Y'`
- Deposit Register Entry → `UseInDP = 'Y'`
- APR Entry → `UseInAPR = 'Y'`
- Bank Debits & Credits → `UseInBDC = 'Y'`
- $$ XFER / Intra Account Deposits → `UseInXFER = 'Y'`

...plus the appropriate bank-account/bank-type eligibility rules for the selected bank.

While reviewing the code we found that **the GL dropdown options in the transaction entry screens are currently HARDCODED in the frontend**, not served by the backend. For example:

- `src/pages/CheckRegister/components/EnterCheckUF/EnterCheckUF.jsx` → `const glAccounts = [...]`
- `src/pages/DepositRegister/components/EnterDepositUF/EnterDepositUF.jsx` → `const glAccounts = [...]`

So "backend filtering" is not just filtering data we already send — it requires **migrating those dropdowns from the hardcoded frontend arrays to a backend endpoint**.

## 3. Proposed phased execution

### Phase 1 — Database + GL Mapping API (backend only, no frontend change)
1. Run `ALTER TABLE GLAccounts` to add the 5 columns (idempotent, safe for existing rows).
2. Update `GET /api/settings/gl-mapping` to return the 5 `useIn*` fields.
3. Update `PUT /api/settings/gl-mapping` to persist the 5 `useIn*` fields.

Result: the GL Mapping Settings page can display/edit the 5 flags.

### Phase 2 — New backend endpoint for filtered GL options
4. Add `GET /api/gl-options?screen=CR|DP|APR|BDC|XFER&bankId=<id>` returning GL accounts where the matching `useIn*='Y'`, plus bank-account/bank-type eligibility rules.
5. Leave the existing `SourceTable`-based behavior untouched as a fallback while migrating.

### Phase 3 — Frontend migration (requires your work)
6. Update the transaction entry screens (CR, DP, APR, BDC, XFER) to populate their GL dropdowns from `GET /api/gl-options` instead of the hardcoded arrays.
7. Coordinate with us so the endpoint contract matches what each screen needs.

---

## 4. Actions we need from you on this plan

1. **Validate the phased approach** (esp. that dropdown migration is Phase 3 and requires frontend work on your side).
2. **Confirm the shape of `GET /api/gl-options`**: should it return full GL objects (`glNumber`, `glName`, `bankType`, `bankId`, ...) or just `{ value, label }` pairs?
3. **Confirm the bank-eligibility rule source**: is the rule "bankId of the GL must equal the selected bank" the correct simple rule today, or do you need a more advanced bank-type matching?
4. Once you confirm, we proceed with Phase 1 immediately, then Phase 2, and we hand Phase 3 back to you with the endpoint documented.

Please reply; we proceed as soon as you validate.