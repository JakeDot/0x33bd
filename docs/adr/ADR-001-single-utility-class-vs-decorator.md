# ADR-001: Single Utility Class vs. Decorator Pattern

**Status:** Accepted  
**Date:** 2026-03-15  
**Context:** PR #7 — Consolidation of Java and JavaScript implementations

---

## Context

During the consolidation PR (#7) two distinct API shapes were available for the Java implementation:

1. **Decorator pattern** (`SalesRoundingDecimal extends BigDecimal`) — wraps `BigDecimal` with a constructor that accepts any `Object`, plus a fluent `withSalesScale()` chain method.
2. **Static utility class** (`SalesRounding`) — a `final` class with private constructor and static `round()` overloads, accepting `BigDecimal` directly.

Both shapes shipped in the repository (root-level `SalesRoundingDecimal.java` and `java/src/…/SalesRounding.java`) and each had distinct ergonomic trade-offs.

---

## Decision

**Both APIs are retained and serve complementary purposes.**

| Concern | `SalesRoundingDecimal` (decorator) | `SalesRounding` (utility) |
|---|---|---|
| Input type | Any `Object` (coerced to String) | Strict `BigDecimal` |
| Null handling | `null` → `"0"` (silent normalisation) | throws `NullPointerException` (fail-fast) |
| Chaining | Fluent — stays in Sales namespace | Single expression — concise for one-off use |
| Type safety | Looser | Stricter |
| Typical caller | Code that receives mixed data types | Code that already uses `BigDecimal` |

`SalesRoundingDecimal.round(Object)` static convenience methods were added (Issue #11) so callers can round in a single expression without constructing an instance manually.

---

## Consequences

- Existing call-sites using `SalesRounding.round()` are unaffected.
- New call-sites that deal with raw strings or numbers can use `SalesRoundingDecimal.round("19.995")` directly.
- The decorator's coerce-to-zero behaviour for `null` intentionally differs from the utility's NPE: match whichever contract is appropriate for the use-case.
