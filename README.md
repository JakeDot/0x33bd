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
