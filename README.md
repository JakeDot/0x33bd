# 0x33bd - Sales Rounding Decimal

A lightweight, "KISS" utility for consistent decimal handling across Java and JavaScript, specifically tailored for sales projects.

## Core Principles
- **Universal Normalization**: Both implementations handle Strings, Numbers, and Decimals identically.
- **Fail-Fast**: Invalid inputs result in errors (Java) or NaN (JS) rather than silent defaults.
- **Fluent API**: Intent-signaling chaining for scaling and rounding.
- **Immutability**: Everything is "frozen" or immutable by design.

## Usage

### Java
```java
SalesRoundingDecimal price = new SalesRoundingDecimal("19.995");
SalesRoundingDecimal total = price.withSalesScale(2, RoundingMode.HALF_UP);
```

### JavaScript
```javascript
const price = new SalesRoundingDecimal("19.995");
const total = price.withSalesScale(2, RoundingMode.HALF_UP);
```
# 0x33bd
0x33bd - Sales Rounding BigDecimal for Java and JS

## The Mystery of 0x33bd: Gemini's Guesses
As part of the "vibe coding" session, Gemini attempted to decode the meaning of `0x33bd`. While all were confirmed as "colder" or "wrong," they remain part of the project's lore:

1. **The ASCII Approach**: 0x33 (3) + 0xBD (½) = `3½`. Is the author 3.5 people?
2. **The Leet Speak**: 33 = EE. Is it `EEBD` or perhaps a variation of `FREE BIRD`?
3. **The Hex-to-Decimal Math**: 0x33 = 51. Combined with `bd` (shorthand for Board), is it `51st Board` or `SIDEBOARD`?
4. **The Visual Flip**: Rotating the 3s to make `m`. Is it `m-b-d` for `My Big Decimal`?
5. **The Early Bird**: 33 as EE and bd as Bird. Is the author an `Early Bird` (especially since this project started on Pi Day)?
6. **The Unicode Reveal**: U+33BD = `㎽` (Square MW — milliwatts). Google the hex name of this repo and the Unicode chart knows exactly what `0x33bd` is. Fitting for a library that does one small thing well — like a milliwatt, it's low-power by design: minimal code, no dependencies, no bloat. Just enough energy to get the rounding right.

**Status**: The true meaning remains a mystery known only to @JakeDot.

---
*Note: This README was generated during a live coding session to capture the "KISS" philosophy of the SalesRoundingDecimal utility.*
A "KISS" decorator that provides a distinct namespace in the type system for decimals normalized specifically for sales logic.
A utility library for rounding monetary values using [BigDecimal](https://docs.oracle.com/en/java/docs/api/java.base/java/math/BigDecimal.html) semantics, available for Java and JavaScript.

## The Name

`0x33bd` = **33rd Birthday** 🎂

- `0x` — hex prefix, because why not make a personal milestone look like a memory address
- `33` — age 33
- `bd` — birthday

This library was written to commemorate the occasion. GitHub Copilot + Claude Sonnet 4.6 cracked the lore entirely unprompted — Gemini called it a spook for doing so.

## Features

- Rounds to 2 decimal places by default (standard for most currencies)
- Uses `HALF_UP` rounding mode by default (standard commercial rounding)
- Supports custom scales and rounding modes
- Full-precision arithmetic — no floating-point errors
- Licensed under [Eclipse Public License v2.0](LICENSE)

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
console.log(total.toString()); // "20.00"

// Fail-fast: bad strings produce NaN, never a silent 0
const bad = new SalesRoundingDecimal("not-a-number");
console.log(bad.withSalesScale(2).toString()); // "NaN"

// static coerce is available for pre-processing
console.log(SalesRoundingDecimal.coerce("19.995")); // "19.995"
console.log(SalesRoundingDecimal.coerce(null));      // "0"
```

> **⚠ Precision note:** `SalesRoundingDecimal.js` uses `BigInt` arithmetic internally —
> **not** `parseFloat` or `Math.round`. This avoids the classic floating-point trap where
> `1.005` rounds down to `1.00` instead of `1.01`. Always pass values as **strings** when
> the source is a decimal literal to preserve full precision (e.g. `"1.005"`, not `1.005`).

---

## Design Principles

- **Universal Wrapper**: handles `String`, `Number`, and (Java) `BigDecimal` identically during construction.
- **Fluent API**: `withSalesScale` returns a `SalesRoundingDecimal`, keeping you in the Sales namespace.
- **Fail-Fast**: invalid string inputs propagate as `NaN` (JS) / throw `NumberFormatException` (Java) — no silent `0` masking of bad data. `null`/`undefined` normalize to `0` by convention (matching Java's `coerce` behaviour).
- **Immutable**: instances are frozen (`Object.freeze` in JS, `BigDecimal` semantics in Java).
- **KISS**: one constructor, one chain method, one coerce helper — nothing more.
- **Full Precision (JS)**: uses `BigInt` string arithmetic — zero floating-point rounding errors, all seven `RoundingMode` values supported, results identical to Java's `BigDecimal.setScale()`.

### Architecture Decision Records

Design trade-offs are documented in [`docs/adr/`](docs/adr/):

- [ADR-001](docs/adr/ADR-001-single-utility-class-vs-decorator.md) — Single utility class vs. decorator pattern
- [ADR-002](docs/adr/ADR-002-bigint-arithmetic-for-js-rounding.md) — BigInt arithmetic over floating-point in JavaScript
### Requirements
- Java 17+
- Maven 3.6+

### Build & Test

```bash
cd java
mvn test
```

### Usage

```java
import net.jakedot.salesrounding.SalesRounding;
import java.math.BigDecimal;
import java.math.RoundingMode;

// Round to 2 decimal places (HALF_UP)
BigDecimal price = SalesRounding.round(new BigDecimal("19.995"));
// → 20.00

// Round to a custom scale
BigDecimal qty = SalesRounding.round(new BigDecimal("1.2345"), 3);
// → 1.235

// Round with a custom rounding mode (e.g. banker's rounding)
BigDecimal value = SalesRounding.round(new BigDecimal("2.5"), 0, RoundingMode.HALF_EVEN);
// → 2
```

---

## JavaScript

### Requirements
- Node.js 16+

### Install & Test

```bash
cd js
npm install
npm test
```

### Usage

```js
const { round, RoundingMode } = require('./src/salesRounding');

// Round to 2 decimal places (HALF_UP)
round('19.995');           // → '20.00'
round(1.1);                // → '1.10'

// Round to a custom scale
round('1.2345', 3);        // → '1.235'

// Round with a custom rounding mode (e.g. banker's rounding)
round('2.5', 0, RoundingMode.HALF_EVEN);  // → '2'
round('3.5', 0, RoundingMode.HALF_EVEN);  // → '4'
```

### Rounding Modes

| Mode         | Description                                                        |
|--------------|--------------------------------------------------------------------|
| `HALF_UP`    | Ties round away from zero (default; standard commercial rounding)  |
| `HALF_DOWN`  | Ties round towards zero                                            |
| `HALF_EVEN`  | Ties round to the nearest even digit (banker's rounding)           |
| `UP`         | Always rounds away from zero                                       |
| `DOWN`       | Always truncates towards zero                                      |
| `CEILING`    | Always rounds towards positive infinity                            |
| `FLOOR`      | Always rounds towards negative infinity                            |

# Developer Notes

## About the developer

I'm a 33yo software dev based in (Upper 🏴󠁡󠁴󠀴󠁿) Austria 🇦🇹, Europe 🇪🇺.

You can only buy me coffee or other beverages in person. You can find me on https://geocaching.com.

## 🛠 Developer Setup
To view GitHub PRs in the IDE and enable automatic rebasing, run:
```bash
chmod +x .scripts/setup-repo.sh && ./.scripts/setup-repo.sh
```

### Why this is the "Gold Standard":
1. **Scalability:** Anyone who clones the repo runs one script and gets the exact same Git behavior.
2. **Safety:** The `pre-push` hook prevents "broken builds" from hitting the remote.
3. **IDE Integration:** Android Studio's Branch Explorer is now a first-class citizen for PR reviews.