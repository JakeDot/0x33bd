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
 * SalesRoundingDecimal - Typeless String/Float Representation
 * A lightweight recreation of our Java BigDecimal decorator.
 */
class SalesRoundingDecimal {
    constructor(val) {
        this.value = SalesRoundingDecimal.coerce(val);
        Object.freeze(this);
    }

    /**
     * Internal coercion logic to ensure any numeric or string input is 
     * converted to a format JS can safely use.
     */
    static coerce(val) {
        if (val === null || val === undefined) return 0;
        return typeof val === "number" ? val : parseFloat(val);
    }

    /**
     * A fluent "Chain" method that applies a scale and returns a 
     * new SalesRoundingDecimal instead of a raw number.
     */
    withSalesScale(newScale, roundingMode = RoundingMode.HALF_UP) {
        const factor = Math.pow(10, newScale);
        let result;

        switch (roundingMode) {
            case RoundingMode.HALF_UP:
                result = Math.round(this.value * factor) / factor;
                break;

            case RoundingMode.HALF_EVEN: {
                const i = this.value * factor;
                const rounded = Math.round(i);
                if (Math.abs(i % 1) === 0.5) {
                    result = (rounded % 2 === 0) ? rounded : (rounded - 1);
                    result /= factor;
                } else {
                    result = rounded / factor;
                }
                break;
            }

            case RoundingMode.DOWN:
                result = (this.value > 0 ? Math.floor(this.value * factor) : Math.ceil(this.value * factor)) / factor;
                break;

            default:
                throw new Error(`Unsupported RoundingMode: ${roundingMode}`);
        }

        return new SalesRoundingDecimal(result.toFixed(newScale));
    }

    toString() {
        return this.value.toString();
    }

    valueOf() {
        return this.value;
    }
}
