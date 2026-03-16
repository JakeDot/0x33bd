/**
 * Test suite for SalesRoundingDecimal (JavaScript).
 *
 * Uses the Node.js built-in test runner (node:test) — no external dependencies.
 *
 * Run from the repo root:
 *   node --test tests/SalesRoundingDecimalTest.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SalesRoundingDecimal, RoundingMode } from '../SalesRoundingDecimal.js';

// ─── Constructor ─────────────────────────────────────────────────────────────

test('Constructor: parses a valid decimal string', () => {
    const d = new SalesRoundingDecimal('19.995');
    assert.equal(d.toString(), '19.995');
});

test('Constructor: parses an integer string', () => {
    const d = new SalesRoundingDecimal('42');
    assert.equal(d.toString(), '42');
});

test('Constructor: parses zero', () => {
    const d = new SalesRoundingDecimal('0');
    assert.equal(d.toString(), '0');
});

test('Constructor: parses a negative decimal string', () => {
    const d = new SalesRoundingDecimal('-5.5');
    assert.equal(d.toString(), '-5.5');
});

test('Constructor: parses a number primitive', () => {
    const d = new SalesRoundingDecimal(19);
    assert.equal(d.toString(), '19');
});

test('Constructor: throws RangeError for null', () => {
    assert.throws(() => new SalesRoundingDecimal(null), RangeError);
});

test('Constructor: throws RangeError for undefined', () => {
    assert.throws(() => new SalesRoundingDecimal(undefined), RangeError);
});

test('Constructor: throws RangeError for non-numeric string', () => {
    assert.throws(() => new SalesRoundingDecimal('not-a-number'), RangeError);
});

test('Constructor: throws RangeError for NaN', () => {
    assert.throws(() => new SalesRoundingDecimal(NaN), RangeError);
});

test('Constructor: throws RangeError for Infinity', () => {
    assert.throws(() => new SalesRoundingDecimal(Infinity), RangeError);
});

test('Constructor: instance is frozen (immutable)', () => {
    const d = new SalesRoundingDecimal('1.5');
    assert.ok(Object.isFrozen(d));
});

// ─── coerce (static) ─────────────────────────────────────────────────────────

test('coerce: returns canonical string for a valid decimal string', () => {
    assert.equal(SalesRoundingDecimal.coerce('19.995'), '19.995');
});

test('coerce: returns string for a number', () => {
    assert.equal(SalesRoundingDecimal.coerce(7), '7');
});

test('coerce: throws RangeError for null', () => {
    assert.throws(() => SalesRoundingDecimal.coerce(null), RangeError);
});

test('coerce: throws RangeError for undefined', () => {
    assert.throws(() => SalesRoundingDecimal.coerce(undefined), RangeError);
});

// ─── withSalesScale ───────────────────────────────────────────────────────────

test('withSalesScale: 19.995 → 20.00 (HALF_UP, scale 2)', () => {
    const result = new SalesRoundingDecimal('19.995').withSalesScale(2, RoundingMode.HALF_UP);
    assert.equal(result.toString(), '20.00');
});

test('withSalesScale: 19.994 → 19.99 (HALF_UP, scale 2)', () => {
    const result = new SalesRoundingDecimal('19.994').withSalesScale(2, RoundingMode.HALF_UP);
    assert.equal(result.toString(), '19.99');
});

test('withSalesScale: 1.2345 → 1.235 (HALF_UP, scale 3)', () => {
    const result = new SalesRoundingDecimal('1.2345').withSalesScale(3, RoundingMode.HALF_UP);
    assert.equal(result.toString(), '1.235');
});

test('withSalesScale: -19.995 → -20.00 (HALF_UP, scale 2)', () => {
    const result = new SalesRoundingDecimal('-19.995').withSalesScale(2, RoundingMode.HALF_UP);
    assert.equal(result.toString(), '-20.00');
});

test('withSalesScale: returns a SalesRoundingDecimal instance', () => {
    const result = new SalesRoundingDecimal('1.5').withSalesScale(2, RoundingMode.HALF_UP);
    assert.ok(result instanceof SalesRoundingDecimal);
});

test('withSalesScale: defaults to HALF_UP when no mode provided', () => {
    const result = new SalesRoundingDecimal('1.995').withSalesScale(2);
    assert.equal(result.toString(), '2.00');
});

// ─── Rounding modes ───────────────────────────────────────────────────────────

test('RoundingMode UP: 1.21 → 1.3', () => {
    assert.equal(new SalesRoundingDecimal('1.21').withSalesScale(1, RoundingMode.UP).toString(), '1.3');
});

test('RoundingMode UP: no rounding when exact', () => {
    assert.equal(new SalesRoundingDecimal('1.2').withSalesScale(1, RoundingMode.UP).toString(), '1.2');
});

test('RoundingMode DOWN: 1.29 → 1.2 (truncate)', () => {
    assert.equal(new SalesRoundingDecimal('1.29').withSalesScale(1, RoundingMode.DOWN).toString(), '1.2');
});

test('RoundingMode CEILING: 1.21 → 1.3 (positive)', () => {
    assert.equal(new SalesRoundingDecimal('1.21').withSalesScale(1, RoundingMode.CEILING).toString(), '1.3');
});

test('RoundingMode CEILING: -1.29 → -1.2 (negative, towards +∞)', () => {
    assert.equal(new SalesRoundingDecimal('-1.29').withSalesScale(1, RoundingMode.CEILING).toString(), '-1.2');
});

test('RoundingMode FLOOR: 1.29 → 1.2 (positive)', () => {
    assert.equal(new SalesRoundingDecimal('1.29').withSalesScale(1, RoundingMode.FLOOR).toString(), '1.2');
});

test('RoundingMode FLOOR: -1.21 → -1.3 (negative, towards -∞)', () => {
    assert.equal(new SalesRoundingDecimal('-1.21').withSalesScale(1, RoundingMode.FLOOR).toString(), '-1.3');
});

test('RoundingMode HALF_UP: 1.25 → 1.3 (tie rounds up)', () => {
    assert.equal(new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_UP).toString(), '1.3');
});

test('RoundingMode HALF_DOWN: 1.25 → 1.2 (tie rounds down)', () => {
    assert.equal(new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_DOWN).toString(), '1.2');
});

test('RoundingMode HALF_DOWN: 1.26 → 1.3', () => {
    assert.equal(new SalesRoundingDecimal('1.26').withSalesScale(1, RoundingMode.HALF_DOWN).toString(), '1.3');
});

test('RoundingMode HALF_EVEN: 1.25 → 1.2 (tie to even)', () => {
    assert.equal(new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_EVEN).toString(), '1.2');
});

test('RoundingMode HALF_EVEN: 1.35 → 1.4 (tie to even)', () => {
    assert.equal(new SalesRoundingDecimal('1.35').withSalesScale(1, RoundingMode.HALF_EVEN).toString(), '1.4');
});

// ─── Static round factory ────────────────────────────────────────────────────

test('round(String): uses default scale=2 and HALF_UP', () => {
    assert.equal(SalesRoundingDecimal.round('19.995').toString(), '20.00');
});

test('round(number): rounds integer to 2 decimal places', () => {
    assert.equal(SalesRoundingDecimal.round(5).toString(), '5.00');
});

test('round(val, scale, mode): custom scale 3 with HALF_UP', () => {
    assert.equal(SalesRoundingDecimal.round('1.2345', 3, RoundingMode.HALF_UP).toString(), '1.235');
});

test('round(val, scale, mode): custom scale 1 with HALF_DOWN', () => {
    assert.equal(SalesRoundingDecimal.round('1.25', 1, RoundingMode.HALF_DOWN).toString(), '1.2');
});

test('round returns a SalesRoundingDecimal instance', () => {
    assert.ok(SalesRoundingDecimal.round('1.5') instanceof SalesRoundingDecimal);
});

// ─── Default constants ────────────────────────────────────────────────────────

test('DEFAULT_SCALE is 2', () => {
    assert.equal(SalesRoundingDecimal.DEFAULT_SCALE, 2);
});

test('DEFAULT_ROUNDING_MODE is HALF_UP', () => {
    assert.equal(SalesRoundingDecimal.DEFAULT_ROUNDING_MODE, RoundingMode.HALF_UP);
});

// ─── toString / valueOf ───────────────────────────────────────────────────────

test('toString returns the decimal string representation', () => {
    assert.equal(new SalesRoundingDecimal('19.99').toString(), '19.99');
});

test('valueOf returns a Number', () => {
    assert.equal(+new SalesRoundingDecimal('19.99'), 19.99);
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

test('Edge: zero scales to 0.00', () => {
    assert.equal(new SalesRoundingDecimal('0').withSalesScale(2, RoundingMode.HALF_UP).toString(), '0.00');
});

test('Edge: large integer scales to two decimal places', () => {
    assert.equal(new SalesRoundingDecimal('1000').withSalesScale(2, RoundingMode.HALF_UP).toString(), '1000.00');
});

test('Edge: 1.005 → 1.00 (HALF_DOWN avoids floating-point trap)', () => {
    assert.equal(new SalesRoundingDecimal('1.005').withSalesScale(2, RoundingMode.HALF_DOWN).toString(), '1.00');
});

test('Edge: 1.005 → 1.01 (HALF_UP avoids floating-point trap)', () => {
    assert.equal(new SalesRoundingDecimal('1.005').withSalesScale(2, RoundingMode.HALF_UP).toString(), '1.01');
});

test('Edge: scale 0 rounds to integer', () => {
    assert.equal(new SalesRoundingDecimal('2.7').withSalesScale(0, RoundingMode.HALF_UP).toString(), '3');
});
