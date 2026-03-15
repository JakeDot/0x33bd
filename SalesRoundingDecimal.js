/**
 * java.math.RoundingMode emulation — frozen for financial consistency.
 */
const RoundingMode = Object.freeze({
    UP:        'UP',
    DOWN:      'DOWN',
    CEILING:   'CEILING',
    FLOOR:     'FLOOR',
    HALF_UP:   'HALF_UP',
    HALF_DOWN: 'HALF_DOWN',
    HALF_EVEN: 'HALF_EVEN',
});

/**
 * SalesRoundingDecimal — a "KISS" decorator for decimal values normalised for
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
     * @param {string|number|null|undefined} val
     * @throws {TypeError} if val is not a valid finite decimal
     */
    constructor(val) {
        this.value = SalesRoundingDecimal.coerce(val);
        Object.freeze(this);
    }

    /**
     * Normalises any input to a canonical decimal string.
     * {@code null}/{@code undefined} → {@code "0"}; numeric strings and finite
     * numbers are accepted; anything else throws {@link TypeError} — matching
     * Java's {@code NumberFormatException} fail-fast contract.
     *
     * @param {*} val
     * @returns {string}
     * @throws {TypeError} if val cannot be interpreted as a finite decimal
     */
    static coerce(val) {
        if (val === null || val === undefined) return '0';
        const str = typeof val === 'number' ? val.toString() : String(val);
        if (!/^-?\d+(\.\d+)?$/.test(str)) {
            throw new TypeError(`SalesRoundingDecimal: invalid numeric value: "${str}"`);
        }
        return str;
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
        const { scaledIntPart, roundDigit, isNegative } =
            SalesRoundingDecimal.#parseForRounding(this.value, newScale);
        const rounded =
            SalesRoundingDecimal.#applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode);
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
     * @returns {{ scaledIntPart: bigint, roundDigit: number, isNegative: boolean }}
     */
    static #parseForRounding(valueStr, scale) {
        const isNegative = valueStr.startsWith('-');
        const absStr     = isNegative ? valueStr.slice(1) : valueStr;

        const dotIndex   = absStr.indexOf('.');
        const intDigits  = dotIndex === -1 ? absStr : absStr.slice(0, dotIndex);
        const fracDigits = dotIndex === -1 ? '' : absStr.slice(dotIndex + 1);

        const needed     = scale + 1;
        const paddedFrac = fracDigits.padEnd(needed, '0').slice(0, needed);

        const keepFrac   = paddedFrac.slice(0, scale);
        const roundDigit = paddedFrac[scale] ? parseInt(paddedFrac[scale], 10) : 0;

        const scaledIntPart = BigInt(intDigits + keepFrac);
        return { scaledIntPart, roundDigit, isNegative };
    }

    /**
     * Applies the rounding mode decision to produce the final scaled integer.
     *
     * @param {bigint}  scaledIntPart
     * @param {number}  roundDigit
     * @param {boolean} isNegative
     * @param {string}  roundingMode
     * @returns {bigint}
     */
    static #applyRounding(scaledIntPart, roundDigit, isNegative, roundingMode) {
        const roundUp = () => scaledIntPart + 1n;
        const keep    = () => scaledIntPart;

        switch (roundingMode) {
            case RoundingMode.DOWN:      return keep();
            case RoundingMode.UP:        return roundDigit !== 0 ? roundUp() : keep();
            case RoundingMode.CEILING:   return (!isNegative && roundDigit !== 0) ? roundUp() : keep();
            case RoundingMode.FLOOR:     return (isNegative  && roundDigit !== 0) ? roundUp() : keep();
            case RoundingMode.HALF_UP:   return roundDigit >= 5 ? roundUp() : keep();
            case RoundingMode.HALF_DOWN: return roundDigit >  5 ? roundUp() : keep();
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

module.exports = { SalesRoundingDecimal, RoundingMode };
