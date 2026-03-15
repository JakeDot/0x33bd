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

describe('floating-point precision', () => {
    test('avoids classic 1.005 floating-point trap', () => {
        // With parseFloat: (1.005 * 100) = 100.49999... → HALF_UP rounds DOWN to 1.00
        // BigInt arithmetic must give the correct 1.01
        expect(round('1.005')).toBe('1.01');
    });

    test('avoids precision error on 2.675 at scale 2', () => {
        // (2.675 * 100) = 267.49999... in floating point, but string-parsed correctly
        expect(round('2.675')).toBe('2.68');
    });

    test('large values preserve precision', () => {
        expect(round('9999999.995')).toBe('10000000.00');
        expect(round('123456789.125', 2, RoundingMode.HALF_UP)).toBe('123456789.13');
    });

    test('many decimal places without precision loss', () => {
        expect(round('1.00000000005', 10)).toBe('1.0000000001');
        expect(round('0.999999999999', 11)).toBe('1.00000000000');
    });
});

describe('all rounding modes — negative values', () => {
    test('HALF_UP: negative ties round away from zero', () => {
        expect(round('-2.5', 0, RoundingMode.HALF_UP)).toBe('-3');
        expect(round('-1.235', 2, RoundingMode.HALF_UP)).toBe('-1.24');
    });

    test('HALF_DOWN: negative ties round toward zero', () => {
        expect(round('-2.5', 0, RoundingMode.HALF_DOWN)).toBe('-2');
        expect(round('-2.6', 0, RoundingMode.HALF_DOWN)).toBe('-3');
    });

    test('HALF_EVEN: negative ties round to even', () => {
        expect(round('-2.5', 0, RoundingMode.HALF_EVEN)).toBe('-2');
        expect(round('-3.5', 0, RoundingMode.HALF_EVEN)).toBe('-4');
    });

    test('CEILING: negative rounds toward zero (less negative)', () => {
        expect(round('-1.999', 2, RoundingMode.CEILING)).toBe('-1.99');
        expect(round('-1.001', 2, RoundingMode.CEILING)).toBe('-1.00');
    });

    test('FLOOR: negative rounds away from zero (more negative)', () => {
        expect(round('-1.001', 2, RoundingMode.FLOOR)).toBe('-1.01');
        expect(round('-1.999', 2, RoundingMode.FLOOR)).toBe('-2.00');
    });

    test('UP: negative rounds away from zero', () => {
        expect(round('-1.001', 2, RoundingMode.UP)).toBe('-1.01');
        expect(round('-1.999', 2, RoundingMode.UP)).toBe('-2.00');
    });

    test('DOWN: negative truncates toward zero', () => {
        expect(round('-1.999', 2, RoundingMode.DOWN)).toBe('-1.99');
        expect(round('-1.001', 2, RoundingMode.DOWN)).toBe('-1.00');
    });
});

describe('all rounding modes — scale 0 (integer rounding)', () => {
    test('HALF_UP', () => {
        expect(round('0.5', 0, RoundingMode.HALF_UP)).toBe('1');
        expect(round('0.4', 0, RoundingMode.HALF_UP)).toBe('0');
        expect(round('-0.5', 0, RoundingMode.HALF_UP)).toBe('-1');
    });

    test('HALF_DOWN', () => {
        expect(round('0.5', 0, RoundingMode.HALF_DOWN)).toBe('0');
        expect(round('0.6', 0, RoundingMode.HALF_DOWN)).toBe('1');
        expect(round('-0.5', 0, RoundingMode.HALF_DOWN)).toBe('0');
    });

    test('HALF_EVEN', () => {
        expect(round('0.5', 0, RoundingMode.HALF_EVEN)).toBe('0');
        expect(round('1.5', 0, RoundingMode.HALF_EVEN)).toBe('2');
        expect(round('2.5', 0, RoundingMode.HALF_EVEN)).toBe('2');
        expect(round('3.5', 0, RoundingMode.HALF_EVEN)).toBe('4');
    });

    test('CEILING', () => {
        expect(round('0.1', 0, RoundingMode.CEILING)).toBe('1');
        expect(round('-0.1', 0, RoundingMode.CEILING)).toBe('0');
        expect(round('1.0', 0, RoundingMode.CEILING)).toBe('1');
    });

    test('FLOOR', () => {
        expect(round('0.9', 0, RoundingMode.FLOOR)).toBe('0');
        expect(round('-0.1', 0, RoundingMode.FLOOR)).toBe('-1');
        expect(round('1.0', 0, RoundingMode.FLOOR)).toBe('1');
    });

    test('UP', () => {
        expect(round('0.1', 0, RoundingMode.UP)).toBe('1');
        expect(round('-0.1', 0, RoundingMode.UP)).toBe('-1');
        expect(round('1.0', 0, RoundingMode.UP)).toBe('1');
    });

    test('DOWN', () => {
        expect(round('0.9', 0, RoundingMode.DOWN)).toBe('0');
        expect(round('-0.9', 0, RoundingMode.DOWN)).toBe('0');
        expect(round('1.0', 0, RoundingMode.DOWN)).toBe('1');
    });
});

describe('all rounding modes — scale 3', () => {
    test('HALF_UP at scale 3', () => {
        expect(round('1.2345', 3, RoundingMode.HALF_UP)).toBe('1.235');
        expect(round('1.2344', 3, RoundingMode.HALF_UP)).toBe('1.234');
    });

    test('CEILING at scale 3', () => {
        expect(round('1.2341', 3, RoundingMode.CEILING)).toBe('1.235');
        expect(round('-1.2349', 3, RoundingMode.CEILING)).toBe('-1.234');
    });

    test('FLOOR at scale 3', () => {
        expect(round('1.2349', 3, RoundingMode.FLOOR)).toBe('1.234');
        expect(round('-1.2341', 3, RoundingMode.FLOOR)).toBe('-1.235');
    });

    test('DOWN at scale 3', () => {
        expect(round('1.2349', 3, RoundingMode.DOWN)).toBe('1.234');
        expect(round('-1.2349', 3, RoundingMode.DOWN)).toBe('-1.234');
    });

    test('UP at scale 3', () => {
        expect(round('1.2341', 3, RoundingMode.UP)).toBe('1.235');
        expect(round('-1.2341', 3, RoundingMode.UP)).toBe('-1.235');
    });
});

describe('Java parity — results must match java.math.BigDecimal.setScale()', () => {
    // Values verified against BigDecimal.setScale() with each RoundingMode
    const cases = [
        // [value, scale, mode, expected]
        ['19.995', 2, RoundingMode.HALF_UP,   '20.00'],
        ['19.995', 2, RoundingMode.HALF_DOWN, '19.99'],
        ['19.995', 2, RoundingMode.HALF_EVEN, '20.00'],
        ['19.994', 2, RoundingMode.HALF_EVEN, '19.99'],
        ['1.005',  2, RoundingMode.HALF_UP,   '1.01'],
        ['2.555',  2, RoundingMode.HALF_UP,   '2.56'],
        ['2.545',  2, RoundingMode.HALF_UP,   '2.55'],
        ['-19.995', 2, RoundingMode.HALF_UP,  '-20.00'],
        ['5',      2, RoundingMode.HALF_UP,   '5.00'],
        ['0',      2, RoundingMode.HALF_UP,   '0.00'],
    ];

    test.each(cases)(
        'round(%s, %i, %s) → %s',
        (value, scale, mode, expected) => {
            expect(round(value, scale, mode)).toBe(expected);
        }
    );
});
