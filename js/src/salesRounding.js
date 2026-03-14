'use strict';

/**
 * Rounding modes for sales rounding.
 */
const RoundingMode = Object.freeze({
    /** Round towards positive infinity. */
    CEILING: 'CEILING',
    /** Round towards negative infinity. */
    FLOOR: 'FLOOR',
    /** Round towards zero (truncate). */
    DOWN: 'DOWN',
    /** Round away from zero. */
    UP: 'UP',
    /** Round towards nearest neighbour; ties round away from zero (standard commercial rounding). */
    HALF_UP: 'HALF_UP',
    /** Round towards nearest neighbour; ties round towards zero. */
    HALF_DOWN: 'HALF_DOWN',
    /** Round towards nearest neighbour; ties round towards the nearest even number (banker's rounding). */
    HALF_EVEN: 'HALF_EVEN',
});

/** Default scale for sales rounding (2 decimal places, i.e. cents). */
const DEFAULT_SCALE = 2;

/** Default rounding mode for sales rounding. */
const DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

/**
 * Shifts a decimal string value by the given number of decimal places,
 * returning an integer represented as a string (no decimal point).
 *
 * @param {string} valueStr - The decimal string (e.g. "1.235")
 * @param {number} scale    - Number of decimal places to keep before rounding
 * @returns {{ intPart: bigint, remainder: bigint, isNegative: boolean, divisor: bigint }}
 */
function parseForRounding(valueStr, scale) {
    const isNegative = valueStr.startsWith('-');
    const absStr = isNegative ? valueStr.slice(1) : valueStr;

    const dotIndex = absStr.indexOf('.');
    const intDigits = dotIndex === -1 ? absStr : absStr.slice(0, dotIndex);
    const fracDigits = dotIndex === -1 ? '' : absStr.slice(dotIndex + 1);

    // Pad or truncate fractional digits to (scale + 1) digits for rounding decision
    const needed = scale + 1;
    const paddedFrac = fracDigits.padEnd(needed, '0').slice(0, needed);

    const keepFrac = paddedFrac.slice(0, scale);
    const roundDigit = paddedFrac[scale] ? parseInt(paddedFrac[scale], 10) : 0;

    const scaledIntPart = BigInt(intDigits + keepFrac);
    const divisor = BigInt(1); // scaledIntPart already represents value * 10^scale

    return { scaledIntPart, roundDigit, isNegative, scale };
}

/**
 * Applies the rounding decision to produce the final rounded scaled integer.
 *
 * @param {bigint}  scaledIntPart - The value multiplied by 10^scale, truncated
 * @param {number}  roundDigit    - The first dropped digit (0-9)
 * @param {boolean} isNegative    - Whether the original value was negative
 * @param {string}  roundingMode  - One of the RoundingMode constants
 * @returns {bigint} The rounded value multiplied by 10^scale
 */
function applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode) {
    const roundUp = () => scaledIntPart + 1n;
    const keep = () => scaledIntPart;

    switch (roundingMode) {
        case RoundingMode.DOWN:
            return keep();

        case RoundingMode.UP:
            return roundDigit !== 0 ? roundUp() : keep();

        case RoundingMode.CEILING:
            // Towards +infinity: round up if positive and any remainder, keep if negative
            return (!isNegative && roundDigit !== 0) ? roundUp() : keep();

        case RoundingMode.FLOOR:
            // Towards -infinity: round up (in magnitude) if negative and any remainder, keep if positive
            return (isNegative && roundDigit !== 0) ? roundUp() : keep();

        case RoundingMode.HALF_UP:
            return roundDigit >= 5 ? roundUp() : keep();

        case RoundingMode.HALF_DOWN:
            return roundDigit > 5 ? roundUp() : keep();

        case RoundingMode.HALF_EVEN: {
            if (roundDigit > 5) return roundUp();
            if (roundDigit < 5) return keep();
            // Exactly halfway: round to even
            return scaledIntPart % 2n === 0n ? keep() : roundUp();
        }

        default:
            throw new Error(`Unknown rounding mode: ${roundingMode}`);
    }
}

/**
 * Formats a scaled integer (value * 10^scale) back to a decimal string.
 *
 * @param {bigint}  scaledInt  - The value * 10^scale (always non-negative here)
 * @param {boolean} isNegative - Whether the result is negative
 * @param {number}  scale      - Number of decimal places
 * @returns {string}
 */
function formatResult(scaledInt, isNegative, scale) {
    const str = scaledInt.toString().padStart(scale + 1, '0');
    const intPart = str.slice(0, str.length - scale) || '0';
    const fracPart = str.slice(str.length - scale);
    const absResult = scale > 0 ? `${intPart}.${fracPart}` : intPart;
    if (isNegative && scaledInt !== 0n) {
        return `-${absResult}`;
    }
    return absResult;
}

/**
 * Rounds a numeric value to the specified number of decimal places using
 * the given rounding mode, with full decimal precision (no floating-point errors).
 *
 * @param {string|number} value        - The value to round
 * @param {number}        [scale=2]    - Number of decimal places (must be >= 0)
 * @param {string}        [roundingMode=RoundingMode.HALF_UP] - The rounding mode to use
 * @returns {string} The rounded value as a decimal string
 * @throws {TypeError}  if value is null or undefined
 * @throws {RangeError} if scale is negative
 * @throws {Error}      if an unknown roundingMode is provided
 */
function round(value, scale = DEFAULT_SCALE, roundingMode = DEFAULT_ROUNDING_MODE) {
    if (value === null || value === undefined) {
        throw new TypeError('value must not be null or undefined');
    }
    if (scale < 0 || !Number.isInteger(scale)) {
        throw new RangeError(`scale must be a non-negative integer, got: ${scale}`);
    }

    const valueStr = typeof value === 'number' ? value.toString() : String(value);

    // Validate that valueStr is a valid decimal number
    if (!/^-?\d+(\.\d+)?$/.test(valueStr)) {
        throw new TypeError(`value is not a valid decimal number: ${valueStr}`);
    }

    const { scaledIntPart, roundDigit, isNegative } = parseForRounding(valueStr, scale);
    const rounded = applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode);
    return formatResult(rounded, isNegative, scale);
}

module.exports = { round, RoundingMode, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE };
