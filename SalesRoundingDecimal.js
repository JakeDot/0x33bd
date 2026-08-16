import { RoundingMode } from './RoundingMode.js';

/**
 * SalesRoundingDecimal — a "KISS" decorator for decimal values normalized for
 * sales logic. Mirrors the contract of the Java {@code SalesRoundingDecimal
 * extends BigDecimal} companion class.
 *
 * Uses BigInt arithmetic internally — no floating-point rounding errors.
 */
class SalesRoundingDecimal {
    /** Default scale for sales rounding (2 decimal places, i.e. cents). */
    static DEFAULT_SCALE = 2;

    /** Default rounding mode for sales rounding (HALF_UP). */
    static DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * @param {string|number} val
     * @throws {RangeError} if val is not a valid finite decimal
     */
    constructor(val) {
        this.value = SalesRoundingDecimal.coerce(val);
        Object.freeze(this);
    }

    /**
     * Normalizes any input to a canonical decimal string.
     * Throws {@link RangeError} for {@code null}, {@code undefined}, NaN,
     * non-finite numbers, and any non-numeric string — matching Java's
     * {@link NumberFormatException} fail-fast contract.
     *
     * @param {*} val
     * @returns {string}
     * @throws {RangeError}  if val is null, undefined, or cannot be interpreted as a finite decimal
     */
    static coerce(val) {
        if (val === null || val === undefined) {
            throw new RangeError('SalesRoundingDecimal: null/undefined is not a valid numeric value');
        }
        if (typeof val === 'number') {
            if (!Number.isFinite(val)) {
                throw new RangeError(`SalesRoundingDecimal: invalid numeric value: "${val}"`);
            }
        }
        const str = String(val).trim();
        const match = str.match(/^([+-])?(?:(\d+)\.?(\d*)|(\.\d+))(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            throw new RangeError(`SalesRoundingDecimal: invalid numeric value: "${str}"`);
        }

        const sign = match[1] === '-' ? '-' : '';
        let intDigits = match[2] !== undefined ? match[2] : '0';
        let fracDigits = match[2] !== undefined ? (match[3] || '') : match[4].slice(1);
        const exp = match[5] ? parseInt(match[5], 10) : 0;

        if (exp !== 0) {
            const allDigits = intDigits + fracDigits;
            const newDot = intDigits.length + exp;
            if (newDot <= 0) {
                intDigits = '0';
                fracDigits = '0'.repeat(-newDot) + allDigits;
            } else if (newDot >= allDigits.length) {
                intDigits = allDigits + '0'.repeat(newDot - allDigits.length);
                fracDigits = '';
            } else {
                intDigits = allDigits.slice(0, newDot);
                fracDigits = allDigits.slice(newDot);
            }
        }

        intDigits = intDigits.replace(/^0+/, '') || '0';
        const hasNonZeroFrac = /[1-9]/.test(fracDigits);
        const canonicalSign = (sign === '-' && (intDigits !== '0' || hasNonZeroFrac)) ? '-' : '';

        return canonicalSign + intDigits + (fracDigits ? '.' + fracDigits : '');
    }

    /**
     * Fluent chain method — applies a scale and returns a new
     * SalesRoundingDecimal (immutable). Uses BigInt arithmetic.
     *
     * @param {number} newScale                           - decimal places (≥ 0)
     * @param {string} [roundingMode=RoundingMode.HALF_UP]
     * @returns {SalesRoundingDecimal}
     */
    withSalesScale(newScale, roundingMode = RoundingMode.HALF_UP) {
        const { scaledIntPart, roundDigit, hasRemainder, hasMoreDigitsAfterRoundDigit, isNegative } =
            SalesRoundingDecimal.#parseForRounding(this.value, newScale);
        const rounded =
            SalesRoundingDecimal.#applyRounding(
                scaledIntPart, roundDigit, hasRemainder, hasMoreDigitsAfterRoundDigit, isNegative, roundingMode
            );
        return new SalesRoundingDecimal(
            SalesRoundingDecimal.#formatResult(rounded, isNegative, newScale)
        );
    }

    /**
     * Static convenience factory — construct and round in a single call.
     *
     * @param {*}      val
     * @param {number} [scale=DEFAULT_SCALE]
     * @param {string} [roundingMode=DEFAULT_ROUNDING_MODE]
     * @returns {SalesRoundingDecimal}
     */
    static round(
        val,
        scale        = SalesRoundingDecimal.DEFAULT_SCALE,
        roundingMode = SalesRoundingDecimal.DEFAULT_ROUNDING_MODE
    ) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, roundingMode);
    }

    toString() {
        return this.value;
    }

    valueOf() {
        return Number(this.value);
    }

    // ─── Private BigInt helpers ───────────────────────────────────────────────

    /**
     * Parses a decimal string into its scaled integer representation.
     *
     * @param {string} valueStr
     * @param {number} scale
     * @returns {{ scaledIntPart: bigint, roundDigit: number, hasRemainder: boolean, hasMoreDigitsAfterRoundDigit: boolean, isNegative: boolean }}
     */
    static #parseForRounding(valueStr, scale) {
        const isNegative = valueStr.startsWith('-');
        const absStr     = isNegative ? valueStr.slice(1) : valueStr;

        const dotIndex   = absStr.indexOf('.');
        const intDigits  = dotIndex === -1 ? absStr : absStr.slice(0, dotIndex);
        const fracDigits = dotIndex === -1 ? '' : absStr.slice(dotIndex + 1);

        const keepFrac   = fracDigits.slice(0, scale).padEnd(scale, '0');
        const remainderDigits = fracDigits.slice(scale);

        const roundDigit = remainderDigits.length > 0 ? parseInt(remainderDigits[0], 10) : 0;
        const hasRemainder = /[1-9]/.test(remainderDigits);
        const hasMoreDigitsAfterRoundDigit = /[1-9]/.test(remainderDigits.slice(1));

        const scaledIntPart = BigInt(intDigits + keepFrac);
        return { scaledIntPart, roundDigit, hasRemainder, hasMoreDigitsAfterRoundDigit, isNegative };
    }

    /**
     * Applies the rounding mode decision to produce the final scaled integer.
     *
     * @param {bigint}  scaledIntPart
     * @param {number}  roundDigit
     * @param {boolean} hasRemainder
     * @param {boolean} hasMoreDigitsAfterRoundDigit
     * @param {boolean} isNegative
     * @param {string}  roundingMode
     * @returns {bigint}
     */
    static #applyRounding(scaledIntPart, roundDigit, hasRemainder, hasMoreDigitsAfterRoundDigit, isNegative, roundingMode) {
        const roundUp = () => scaledIntPart + 1n;
        const keep    = () => scaledIntPart;

        switch (roundingMode) {
            case RoundingMode.DOWN:
                return keep();
            case RoundingMode.UP:
                return hasRemainder ? roundUp() : keep();
            case RoundingMode.CEILING:
                return (!isNegative && hasRemainder) ? roundUp() : keep();
            case RoundingMode.FLOOR:
                return (isNegative && hasRemainder) ? roundUp() : keep();
            case RoundingMode.HALF_UP:
                return roundDigit >= 5 ? roundUp() : keep();
            case RoundingMode.HALF_DOWN:
                return (roundDigit > 5 || (roundDigit === 5 && hasMoreDigitsAfterRoundDigit)) ? roundUp() : keep();
            case RoundingMode.HALF_EVEN: {
                if (roundDigit > 5 || (roundDigit === 5 && hasMoreDigitsAfterRoundDigit)) return roundUp();
                if (roundDigit < 5) return keep();
                return scaledIntPart % 2n === 0n ? keep() : roundUp();
            }
            default:
                throw new Error(`Unsupported RoundingMode: ${roundingMode}`);
        }
    }

    /**
     * Formats a scaled integer back to a fixed-point decimal string.
     *
     * @param {bigint}  scaledInt
     * @param {boolean} isNegative
     * @param {number}  scale
     * @returns {string}
     */
    static #formatResult(scaledInt, isNegative, scale) {
        const str      = scaledInt.toString().padStart(scale + 1, '0');
        const intPart  = str.slice(0, str.length - scale) || '0';
        const fracPart = str.slice(str.length - scale);
        const absResult = scale > 0 ? `${intPart}.${fracPart}` : intPart;
        return (isNegative && scaledInt !== 0n) ? `-${absResult}` : absResult;
    }
}

export { SalesRoundingDecimal, RoundingMode };
