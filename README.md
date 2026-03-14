# 0x33bd
0x33bd - Sales Rounding BigDecimal for Java and JS

A "KISS" decorator that provides a distinct namespace in the type system for decimals normalized specifically for sales logic.

---

## Java

```java
// Universal construction — accepts Number, String, or BigDecimal
SalesRoundingDecimal price = new SalesRoundingDecimal("19.995");

// Fluent chain method — stays in the Sales namespace
SalesRoundingDecimal total = price.withSalesScale(2, RoundingMode.HALF_UP);
// → 20.00

// Works with BigDecimal arithmetic
SalesRoundingDecimal result = new SalesRoundingDecimal(price.add(tax))
                                  .withSalesScale(2, RoundingMode.HALF_UP);
```

## JavaScript

```javascript
// Universal construction — accepts number, string, or numeric string
const price = new SalesRoundingDecimal("19.995");

// Fluent chain method — returns a new SalesRoundingDecimal (immutable)
const total = price.withSalesScale(2, RoundingMode.HALF_UP);
console.log(total.toString()); // "20"

// Fail-fast: bad strings produce NaN, never a silent 0
const bad = new SalesRoundingDecimal("not-a-number");
console.log(bad.withSalesScale(2).toString()); // "NaN"

// static coerce is available for pre-processing
console.log(SalesRoundingDecimal.coerce("19.995")); // 19.995
console.log(SalesRoundingDecimal.coerce(null));      // 0
```

---

## Design Principles

- **Universal Wrapper**: handles `String`, `Number`, and (Java) `BigDecimal` identically during construction.
- **Fluent API**: `withSalesScale` returns a `SalesRoundingDecimal`, keeping you in the Sales namespace.
- **Fail-Fast**: invalid string inputs propagate as `NaN` (JS) / throw `NumberFormatException` (Java) — no silent `0` masking of bad data. `null`/`undefined` normalize to `0` by convention (matching Java's `coerce` behaviour).
- **Immutable**: instances are frozen (`Object.freeze` in JS, `BigDecimal` semantics in Java).
- **KISS**: one constructor, one chain method, one coerce helper — nothing more.
