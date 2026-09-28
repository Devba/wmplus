# AI Router — golden set (QA, 2026-09-28)

Cada pregunta: ruta esperada + expectativa verificable a mano en QA.
`source` esperado: `router-local` (clasificador), `router-openrouter` (LLM),
`fallback`/`opencode` (legacy nivel 3, deprecated).

## Q1+Q2 — account-history (ready)
- `cuanto debe el residente 010003` (HOA 1) → `router-local` → `Saldo Test RL-03: 300 (1 pagos)`.
- Cross-HOA: mismo prompt con `X-HOA-ID: 4` → saldo null, 0 pagos (aislado).
- `as_of` histórico vía `/api/svc/account-history?resident=010003&as_of=2026-01-01` → 0 pagos.

## Q3 — outstanding-checks (ready)
- `cheques pendientes` (HOA 1) → 2 cheques, total 312.50.

## Q4 — period-diff (stub honesto)
- `que cambio entre 2026-01-01 y 2026-06-30 comparado con 2025-01-01 y 2025-06-30`
  → `not_yet_implemented` + ambas ventanas resueltas.

## Q5 — gl-transactions (ready)
- `transacciones del GL 41700` (HOA 4) → 4 movs, neto 12500 (= fixture).

## Q6 — violations (disabled)
- `residentes con multas` → **403** + mensaje FL-dependiente. Nunca datos.

## Q7 — vendor-invoices (ready)
- `facturas del vendor VEND-001` → vendor `VEND-001` (no truncar token).

## Q8 — anomalies (stub honesto)
- `algo inusual o atrasado` → `not_yet_implemented` + nota overdue→FL.

## Legacy preservado (nivel 3)
- `cuantos residentes hay` (sin residente) → `fallback` con tenant (11 en HOA5).
- `residentes de florida` → `fallback`/`opencode` con tenant.

## Reglas del router
- Local no clasifica → OpenRouter (solo prompt+catalogo) → null → legacy.
- El LLM jamas ve filas ni genera SQL. Q6 vetada tambien para el LLM.
- Presupuesto: local absorbe lo repetitivo; nivel 2 a ~$0.001/traduccion.
