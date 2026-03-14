'use strict';

const { round, RoundingMode, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE } = require('../src/salesRounding');

describe('round(value)', () => {
    test('rounds to two decimal places by default', () => {
        expect(round('1.235')).toBe('1.24');
        expect(round('2.345')).toBe('2.35');
        expect(round('0.005')).toBe('0.01');
    });

    test('rounds up at halfway (HALF_UP default)', () => {
        expect(round('0.545')).toBe('0.55');
        expect(round('9.985')).toBe('9.99');
        expect(round('9.995')).toBe('10.00');
    });

    test('rounds down below halfway', () => {
        expect(round('1.234')).toBe('1.23');
        expect(round('0.004')).toBe('0.00');
    });

    test('exact value is unchanged', () => {
        expect(round('1.23')).toBe('1.23');
        expect(round('0.00')).toBe('0.00');
        expect(round('100.00')).toBe('100.00');
    });

    test('whole number gets two decimal places', () => {
        expect(round('5')).toBe('5.00');
        expect(round('0')).toBe('0.00');
    });

    test('negative value at halfway rounds away from zero', () => {
        expect(round('-1.235')).toBe('-1.24');
        expect(round('-0.005')).toBe('-0.01');
    });

    test('accepts numeric input', () => {
        expect(round(1.1)).toBe('1.10');
        expect(round(0)).toBe('0.00');
    });

    test('returns NaN for null', () => {
        expect(round(null)).toBeNaN();
    });

    test('returns NaN for undefined', () => {
        expect(round(undefined)).toBeNaN();
    });

    test('returns NaN for non-numeric string', () => {
        expect(round('abc')).toBeNaN();
    });
});

describe('round(value, scale)', () => {
    test('scale 0 rounds to integer', () => {
        expect(round('2.5', 0)).toBe('3');
        expect(round('2.4', 0)).toBe('2');
        expect(round('-2.5', 0)).toBe('-3');
    });

    test('scale 3 rounds to three decimal places', () => {
        expect(round('1.2345', 3)).toBe('1.235');
        expect(round('1.2344', 3)).toBe('1.234');
    });

    test('scale 4 rounds to four decimal places', () => {
        expect(round('1.23456', 4)).toBe('1.2346');
    });

    test('negative scale throws RangeError', () => {
        expect(() => round('1.5', -1)).toThrow(RangeError);
    });

    test('non-integer scale throws RangeError', () => {
        expect(() => round('1.5', 1.5)).toThrow(RangeError);
    });
});

describe('round(value, scale, roundingMode)', () => {
    test('HALF_EVEN uses banker\'s rounding', () => {
        // 2.5 -> nearest even is 2
        expect(round('2.5', 0, RoundingMode.HALF_EVEN)).toBe('2');
        // 3.5 -> nearest even is 4
        expect(round('3.5', 0, RoundingMode.HALF_EVEN)).toBe('4');
        // 1.45 -> nearest even (hundredths): 1.4 (4 is even)
        expect(round('1.45', 1, RoundingMode.HALF_EVEN)).toBe('1.4');
        // 1.55 -> nearest even (hundredths): 1.6 (6 is even)
        expect(round('1.55', 1, RoundingMode.HALF_EVEN)).toBe('1.6');
    });

    test('FLOOR rounds towards negative infinity', () => {
        expect(round('1.239', 2, RoundingMode.FLOOR)).toBe('1.23');
        expect(round('-1.231', 2, RoundingMode.FLOOR)).toBe('-1.24');
        expect(round('2.999', 2, RoundingMode.FLOOR)).toBe('2.99');
    });

    test('CEILING rounds towards positive infinity', () => {
        expect(round('1.231', 2, RoundingMode.CEILING)).toBe('1.24');
        expect(round('-1.239', 2, RoundingMode.CEILING)).toBe('-1.23');
    });

    test('DOWN truncates towards zero', () => {
        expect(round('1.999', 2, RoundingMode.DOWN)).toBe('1.99');
        expect(round('-1.999', 2, RoundingMode.DOWN)).toBe('-1.99');
    });

    test('UP rounds away from zero', () => {
        expect(round('1.001', 2, RoundingMode.UP)).toBe('1.01');
        expect(round('-1.001', 2, RoundingMode.UP)).toBe('-1.01');
        expect(round('1.000', 2, RoundingMode.UP)).toBe('1.00');
    });

    test('HALF_DOWN rounds to nearest; ties round toward zero', () => {
        expect(round('2.5', 0, RoundingMode.HALF_DOWN)).toBe('2');
        expect(round('2.6', 0, RoundingMode.HALF_DOWN)).toBe('3');
        expect(round('2.4', 0, RoundingMode.HALF_DOWN)).toBe('2');
    });

    test('unknown rounding mode throws Error', () => {
        expect(() => round('1.5', 2, 'UNKNOWN')).toThrow(Error);
    });
});

describe('constants', () => {
    test('DEFAULT_SCALE is 2', () => {
        expect(DEFAULT_SCALE).toBe(2);
    });

    test('DEFAULT_ROUNDING_MODE is HALF_UP', () => {
        expect(DEFAULT_ROUNDING_MODE).toBe(RoundingMode.HALF_UP);
    });

    test('RoundingMode is frozen', () => {
        expect(Object.isFrozen(RoundingMode)).toBe(true);
    });
});
