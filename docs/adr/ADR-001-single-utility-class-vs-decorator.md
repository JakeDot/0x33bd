# ADR-001: Single Utility Class vs. Decorator Pattern

**Status:** Superseded — decorator pattern adopted as sole implementation  
**Date:** 2026-03-15  
**Context:** PR #7 — Consolidation of Java and JavaScript implementations; updated when `java/` and `js/` subdirectories were removed

---

## Context

During the consolidation PR (#7) two distinct API shapes were available for the Java implementation:

1. **Decorator pattern** (`SalesRoundingDecimal extends BigDecimal`) — wraps `BigDecimal` with a constructor that accepts any `Object`, plus a fluent `withSalesScale()` chain method.
2. **Static utility class** (`SalesRounding`) — a `final` class with private constructor and static `round()` overloads, accepting `BigDecimal` directly.

Both shapes shipped in the repository (root-level `SalesRoundingDecimal.java` and `java/src/…/SalesRounding.java`) and each had distinct ergonomic trade-offs.

---

## Decision

**The decorator pattern (`SalesRoundingDecimal`) is retained as the sole implementation. The static utility class (`SalesRounding`) and the `java/` and `js/` subdirectories have been removed.**

| Concern | `SalesRoundingDecimal` (decorator) |
|---|---|
| Input type | Any `Object` (coerced to String) |
| Null handling | `null` → `"0"` (silent normalisation) |
| Invalid input | throws `NumberFormatException` (Java) / `TypeError` (JS) |
| Chaining | Fluent — stays in Sales namespace |
| Static factory | `SalesRoundingDecimal.round(val)` for single-expression use |

Static `round()` convenience methods were added (Issue #11) so callers can round in a single expression without constructing an instance manually.

---

## Consequences

- A single, consistent API surface in both Java and JavaScript.
- Callers that deal with raw strings or numbers use `SalesRoundingDecimal.round("19.995")` directly.
- The `SalesRounding` utility class is no longer available; any call-sites using it should migrate to `SalesRoundingDecimal.round()`.
