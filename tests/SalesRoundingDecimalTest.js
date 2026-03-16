/**
 * Manual test suite for SalesRoundingDecimal (JavaScript).
 *
 * Vanilla JS — no test framework, no external dependencies.
 *
 * Run from the repo root:
 *   node tests/SalesRoundingDecimalTest.js
 */

import { SalesRoundingDecimal, RoundingMode } from '../SalesRoundingDecimal.js';

let passed = 0;
let failed = 0;

// ─── Assertion helpers ────────────────────────────────────────────────────────

function assertEquals(expected, actual, label) {
    if (expected === actual) {
        console.log('  ✔ ' + label);
        passed++;
    } else {
        console.log('  ✘ ' + label + ' — expected: ' + expected + ', got: ' + actual);
        failed++;
    }
}

function assertTrue(value, label) {
    if (value) {
        console.log('  ✔ ' + label);
        passed++;
    } else {
        console.log('  ✘ ' + label + ' — expected truthy, got: ' + value);
        failed++;
    }
}

function assertThrows(expectedType, fn, label) {
    try {
        fn();
        console.log('  ✘ ' + label + ' — expected ' + expectedType.name + ' but no error was thrown');
        failed++;
    } catch (e) {
        if (e instanceof expectedType) {
            console.log('  ✔ ' + label);
            passed++;
        } else {
            console.log('  ✘ ' + label + ' — expected ' + expectedType.name
                + ' but got ' + e.constructor.name + ': ' + e.message);
            failed++;
        }
    }
}

// ─── Test groups ──────────────────────────────────────────────────────────────

function testConstructor() {
    console.log('Constructor:');
    assertEquals('19.995', new SalesRoundingDecimal('19.995').toString(), 'parses valid decimal string');
    assertEquals('42', new SalesRoundingDecimal('42').toString(), 'parses integer string');
    assertEquals('0', new SalesRoundingDecimal('0').toString(), 'parses zero');
    assertEquals('-5.5', new SalesRoundingDecimal('-5.5').toString(), 'parses negative decimal string');
    assertEquals('19', new SalesRoundingDecimal(19).toString(), 'parses number primitive');

    assertThrows(RangeError, () => new SalesRoundingDecimal(null), 'null throws');
    assertThrows(RangeError, () => new SalesRoundingDecimal(undefined), 'undefined throws');
    assertThrows(RangeError, () => new SalesRoundingDecimal('not-a-number'), 'non-numeric string throws');
    assertThrows(RangeError, () => new SalesRoundingDecimal(NaN), 'NaN throws');
    assertThrows(RangeError, () => new SalesRoundingDecimal(Infinity), 'Infinity throws');
    assertTrue(Object.isFrozen(new SalesRoundingDecimal('1.5')), 'instance is frozen (immutable)');
}

function testCoerce() {
    console.log('coerce (static):');
    assertEquals('19.995', SalesRoundingDecimal.coerce('19.995'),
        'returns canonical string for a valid decimal string');
    assertEquals('7', SalesRoundingDecimal.coerce(7), 'returns string for a number');

    assertThrows(RangeError, () => SalesRoundingDecimal.coerce(null), 'null throws');
    assertThrows(RangeError, () => SalesRoundingDecimal.coerce(undefined), 'undefined throws');
}

function testWithSalesScale() {
    console.log('withSalesScale (HALF_UP):');
    assertEquals('20.00',
        new SalesRoundingDecimal('19.995').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        '19.995 → 20.00 (HALF_UP)');
    assertEquals('19.99',
        new SalesRoundingDecimal('19.994').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        '19.994 → 19.99 (HALF_UP)');
    assertEquals('1.235',
        new SalesRoundingDecimal('1.2345').withSalesScale(3, RoundingMode.HALF_UP).toString(),
        '1.2345 → 1.235 (HALF_UP, scale 3)');
    assertEquals('-20.00',
        new SalesRoundingDecimal('-19.995').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        '-19.995 → -20.00 (HALF_UP)');
    assertTrue(
        new SalesRoundingDecimal('1.5').withSalesScale(2, RoundingMode.HALF_UP) instanceof SalesRoundingDecimal,
        'returns a SalesRoundingDecimal instance');
    assertEquals('2.00',
        new SalesRoundingDecimal('1.995').withSalesScale(2).toString(),
        'defaults to HALF_UP when no mode provided');
}

function testRoundingModes() {
    console.log('Rounding modes:');

    // UP — always away from zero
    assertEquals('1.3',
        new SalesRoundingDecimal('1.21').withSalesScale(1, RoundingMode.UP).toString(),
        'UP: 1.21 → 1.3');
    assertEquals('1.2',
        new SalesRoundingDecimal('1.2').withSalesScale(1, RoundingMode.UP).toString(),
        'UP: no rounding when exact');

    // DOWN — always towards zero (truncate)
    assertEquals('1.2',
        new SalesRoundingDecimal('1.29').withSalesScale(1, RoundingMode.DOWN).toString(),
        'DOWN: 1.29 → 1.2');

    // CEILING — towards positive infinity
    assertEquals('1.3',
        new SalesRoundingDecimal('1.21').withSalesScale(1, RoundingMode.CEILING).toString(),
        'CEILING: 1.21 → 1.3');
    assertEquals('-1.2',
        new SalesRoundingDecimal('-1.29').withSalesScale(1, RoundingMode.CEILING).toString(),
        'CEILING: -1.29 → -1.2');

    // FLOOR — towards negative infinity
    assertEquals('1.2',
        new SalesRoundingDecimal('1.29').withSalesScale(1, RoundingMode.FLOOR).toString(),
        'FLOOR: 1.29 → 1.2');
    assertEquals('-1.3',
        new SalesRoundingDecimal('-1.21').withSalesScale(1, RoundingMode.FLOOR).toString(),
        'FLOOR: -1.21 → -1.3');

    // HALF_UP — ties away from zero
    assertEquals('1.3',
        new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_UP).toString(),
        'HALF_UP: 1.25 → 1.3');

    // HALF_DOWN — ties towards zero
    assertEquals('1.2',
        new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_DOWN).toString(),
        'HALF_DOWN: 1.25 → 1.2');
    assertEquals('1.3',
        new SalesRoundingDecimal('1.26').withSalesScale(1, RoundingMode.HALF_DOWN).toString(),
        'HALF_DOWN: 1.26 → 1.3');

    // HALF_EVEN — banker's rounding
    assertEquals('1.2',
        new SalesRoundingDecimal('1.25').withSalesScale(1, RoundingMode.HALF_EVEN).toString(),
        'HALF_EVEN: 1.25 → 1.2 (even)');
    assertEquals('1.4',
        new SalesRoundingDecimal('1.35').withSalesScale(1, RoundingMode.HALF_EVEN).toString(),
        'HALF_EVEN: 1.35 → 1.4 (even)');
}

function testStaticRoundWithDefaults() {
    console.log('round(String) / round(number) — default scale & mode:');
    assertEquals('20.00', SalesRoundingDecimal.round('19.995').toString(), 'round(String) → 20.00');
    assertEquals('5.00', SalesRoundingDecimal.round(5).toString(), 'round(number 5) → 5.00');
}

function testStaticRoundWithCustomScaleAndMode() {
    console.log('round(val, scale, mode):');
    assertEquals('1.235',
        SalesRoundingDecimal.round('1.2345', 3, RoundingMode.HALF_UP).toString(),
        'round(String, 3, HALF_UP) → 1.235');
    assertEquals('1.2',
        SalesRoundingDecimal.round('1.25', 1, RoundingMode.HALF_DOWN).toString(),
        'round(String, 1, HALF_DOWN) → 1.2');
    assertTrue(SalesRoundingDecimal.round('1.5') instanceof SalesRoundingDecimal,
        'round returns a SalesRoundingDecimal instance');
}

function testDefaultConstants() {
    console.log('Default constants:');
    assertEquals(2, SalesRoundingDecimal.DEFAULT_SCALE, 'DEFAULT_SCALE = 2');
    assertEquals(RoundingMode.HALF_UP, SalesRoundingDecimal.DEFAULT_ROUNDING_MODE,
        'DEFAULT_ROUNDING_MODE = HALF_UP');
}

function testToStringAndValueOf() {
    console.log('toString / valueOf:');
    assertEquals('19.99', new SalesRoundingDecimal('19.99').toString(),
        'toString returns the decimal string representation');
    assertEquals(19.99, +new SalesRoundingDecimal('19.99'), 'valueOf returns a Number');
}

function testEdgeCases() {
    console.log('Edge cases:');
    assertEquals('0.00',
        new SalesRoundingDecimal('0').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        'zero scales to 0.00');
    assertEquals('1000.00',
        new SalesRoundingDecimal('1000').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        'large integer scales to 1000.00');
    assertEquals('1.00',
        new SalesRoundingDecimal('1.005').withSalesScale(2, RoundingMode.HALF_DOWN).toString(),
        '1.005 → 1.00 (HALF_DOWN)');
    assertEquals('1.01',
        new SalesRoundingDecimal('1.005').withSalesScale(2, RoundingMode.HALF_UP).toString(),
        '1.005 → 1.01 (HALF_UP)');
    assertEquals('3',
        new SalesRoundingDecimal('2.7').withSalesScale(0, RoundingMode.HALF_UP).toString(),
        'scale 0 rounds to integer');
}

// ─── Entry point ──────────────────────────────────────────────────────────────

console.log('=== SalesRoundingDecimalTest (JS) ===\n');

testConstructor();
testCoerce();
testWithSalesScale();
testRoundingModes();
testStaticRoundWithDefaults();
testStaticRoundWithCustomScaleAndMode();
testDefaultConstants();
testToStringAndValueOf();
testEdgeCases();

console.log('\n── Results ──────────────────────────────────────────');
console.log('  Passed: ' + passed);
console.log('  Failed: ' + failed);
if (failed > 0) {
    process.exit(1);
}
console.log('  All tests passed ✔');
