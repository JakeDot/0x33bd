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

A utility library for rounding monetary values using [BigDecimal](https://docs.oracle.com/en/java/docs/api/java.base/java/math/BigDecimal.html) semantics, available for Java and JavaScript.

## The Name

`0x33bd` = **33rd Birthday** 🎂

- `0x` — hex prefix, because why not make a personal milestone look like a memory address
- `33` — age 33
- `bd` — birthday

This library was written to commemorate the occasion. GitHub Copilot cracked the lore entirely unprompted — Gemini called it a spook for doing so.

## Features

- Rounds to 2 decimal places by default (standard for most currencies)
- Uses `HALF_UP` rounding mode by default (standard commercial rounding)
- Supports custom scales and rounding modes
- Full-precision arithmetic — no floating-point errors
- Licensed under [Eclipse Public License v2.0](LICENSE)

---

## Java

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
