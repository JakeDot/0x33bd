# ADR-002: BigInt Arithmetic over Floating-Point in JavaScript

**Status:** Accepted  
**Date:** 2026-03-15  
**Context:** Issues #9, #14 — Precision loss and incomplete rounding modes in JavaScript

---

## Context

The original `SalesRoundingDecimal.js` used JavaScript's native `Number` type with `Math.round`, `Math.floor`, and `Math.ceil` for rounding. This caused well-known floating-point precision bugs:

```js
// Expected: 1.01  — Actual (float): 1.00
1.005 * 100  // → 100.49999999999999
Math.round(100.49999999999999) / 100  // → 1.00  ✗
```

The Java implementation delegates to `BigDecimal.setScale()` which uses exact decimal arithmetic and never exhibits this class of error.

---

## Decision

**Use string-based `BigInt` arithmetic for all rounding in JavaScript.**

The approach:
1. Accept `string | number` input; convert to canonical decimal string.
2. Parse the string into a `BigInt` scaled integer (e.g. `"1.235"` at scale 2 → `scaledInt = 123n`, `roundDigit = 5`).
3. Apply the rounding mode decision purely on integers — no floating-point operations at any step.
4. Format the resulting `BigInt` back to a fixed-scale decimal string.

This matches Java's `BigDecimal` semantics exactly and enables all seven `RoundingMode` values to be implemented correctly and efficiently.

---

## Alternatives Considered

| Alternative | Rejected because |
|---|---|
| `toFixed()` with float | `(1.005).toFixed(2)` → `"1.00"` on most engines — same bug |
| Third-party decimal library (`decimal.js`, `big.js`) | Adds a dependency; the logic is self-contained and small |
| Multiply-by-power, clamp to integer | Same float representation error before the BigInt step |

---

## Consequences

- Zero floating-point rounding errors for any representable decimal input.
- All seven `RoundingMode` values work correctly, including for negative values.
- Input must be a finite decimal string or number; `Infinity`, `NaN`, and non-numeric strings are returned as `NaN` (fail-fast, no silent zero).
- `BigInt` is available in Node.js ≥ 10.4 and all modern browsers — no polyfill required.
