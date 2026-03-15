/**
 * java.math.RoundingMode emulation - Frozen for financial consistency
 */
const RoundingMode = Object.freeze({
    UP: 'UP',
    DOWN: 'DOWN',
    CEILING: 'CEILING',
    FLOOR: 'FLOOR',
    HALF_UP: 'HALF_UP',
    HALF_DOWN: 'HALF_DOWN',
    HALF_EVEN: 'HALF_EVEN'
});

/**
 * Parses a decimal string into its scaled integer representation for
 * full-precision rounding using BigInt arithmetic (no floating-point errors).
 *
 * @param {string} valueStr - normalised decimal string (e.g. "1.235")
 * @param {number} scale    - number of decimal places to retain before rounding
 * @returns {{ scaledIntPart: bigint, roundDigit: number, isNegative: boolean }}
 */
function _parseForRounding(valueStr, scale) {
    const isNegative = valueStr.startsWith('-');
    const absStr = isNegative ? valueStr.slice(1) : valueStr;

    const dotIndex = absStr.indexOf('.');
    const intDigits = dotIndex === -1 ? absStr : absStr.slice(0, dotIndex);
    const fracDigits = dotIndex === -1 ? '' : absStr.slice(dotIndex + 1);

    const needed = scale + 1;
    const paddedFrac = fracDigits.padEnd(needed, '0').slice(0, needed);

    const keepFrac = paddedFrac.slice(0, scale);
    const roundDigit = paddedFrac[scale] ? parseInt(paddedFrac[scale], 10) : 0;

    const scaledIntPart = BigInt(intDigits + keepFrac);
    return { scaledIntPart, roundDigit, isNegative };
}

/**
 * Applies the selected rounding mode to produce the final rounded scaled integer.
 *
 * @param {bigint}  scaledIntPart - the value × 10^scale, truncated
 * @param {number}  roundDigit    - the first dropped digit (0–9)
 * @param {boolean} isNegative    - whether the original value was negative
 * @param {string}  roundingMode  - one of the RoundingMode constants
 * @returns {bigint}
 */
function _applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode) {
    const roundUp = () => scaledIntPart + 1n;
    const keep    = () => scaledIntPart;

    switch (roundingMode) {
        case RoundingMode.DOWN:
            return keep();

        case RoundingMode.UP:
            return roundDigit !== 0 ? roundUp() : keep();

        case RoundingMode.CEILING:
            return (!isNegative && roundDigit !== 0) ? roundUp() : keep();

        case RoundingMode.FLOOR:
            return (isNegative && roundDigit !== 0) ? roundUp() : keep();

        case RoundingMode.HALF_UP:
            return roundDigit >= 5 ? roundUp() : keep();

        case RoundingMode.HALF_DOWN:
            return roundDigit > 5 ? roundUp() : keep();

        case RoundingMode.HALF_EVEN: {
            if (roundDigit > 5) return roundUp();
            if (roundDigit < 5) return keep();
            return scaledIntPart % 2n === 0n ? keep() : roundUp();
        }

        default:
            throw new Error(`Unsupported RoundingMode: ${roundingMode}`);
    }
}

/**
 * Formats a scaled integer (value × 10^scale) back to a fixed-point decimal string.
 *
 * @param {bigint}  scaledInt  - non-negative scaled integer
 * @param {boolean} isNegative - whether the result is negative
 * @param {number}  scale      - number of decimal places
 * @returns {string}
 */
function _formatResult(scaledInt, isNegative, scale) {
    const str     = scaledInt.toString().padStart(scale + 1, '0');
    const intPart = str.slice(0, str.length - scale) || '0';
    const fracPart = str.slice(str.length - scale);
    const absResult = scale > 0 ? `${intPart}.${fracPart}` : intPart;
    return (isNegative && scaledInt !== 0n) ? `-${absResult}` : absResult;
}

/**
 * SalesRoundingDecimal - Typeless String/Float Representation
 * A lightweight recreation of our Java BigDecimal decorator.
 *
 * Uses BigInt arithmetic internally to avoid floating-point precision loss.
 */
class SalesRoundingDecimal {
    /** Default scale for sales rounding (2 decimal places, i.e. cents). */
    static DEFAULT_SCALE = 2;

    /** Default rounding mode for sales rounding (HALF_UP). */
    static DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    constructor(val) {
        this.value = SalesRoundingDecimal.coerce(val);
        Object.freeze(this);
    }

    /**
     * Internal coercion logic: normalises any input to a decimal string.
     * null/undefined → "0"; numbers use their string representation;
     * non-numeric strings become "NaN" so callers can detect bad input.
     *
     * @param {*} val
     * @returns {string}
     */
    static coerce(val) {
        if (val === null || val === undefined) return '0';
        const str = typeof val === 'number' ? val.toString() : String(val);
        return /^-?\d+(\.\d+)?$/.test(str) ? str : 'NaN';
    }

    /**
     * A fluent "Chain" method that applies a scale and returns a
     * new SalesRoundingDecimal instead of a raw number.
     * Uses full-precision BigInt arithmetic — no floating-point errors.
     *
     * @param {number} newScale     - number of decimal places (must be >= 0)
     * @param {string} [roundingMode=RoundingMode.HALF_UP]
     * @returns {SalesRoundingDecimal}
     */
    withSalesScale(newScale, roundingMode = RoundingMode.HALF_UP) {
        if (this.value === 'NaN') {
            return new SalesRoundingDecimal('NaN');
        }

        const { scaledIntPart, roundDigit, isNegative } =
            _parseForRounding(this.value, newScale);
        const rounded = _applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode);
        return new SalesRoundingDecimal(_formatResult(rounded, isNegative, newScale));
    }

    toString() {
        return this.value;
    }

    valueOf() {
        return this.value === 'NaN' ? NaN : Number(this.value);
    }
}
