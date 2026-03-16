import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * <p><b>SalesRoundingDecimal</b> is a "KISS" decorator for {@link BigDecimal}.</p>
 *
 * <p>It provides typed constructors for {@link String} and {@link Number}, a fluent
 * {@link #withSalesScale(int, RoundingMode)} instance method, and static
 * {@link #round} convenience factory methods so callers can round in a single
 * expression.</p>
 *
 * @author JakeDot
 */
public class SalesRoundingDecimal extends BigDecimal {

    /** Default scale for sales rounding (2 decimal places, i.e. cents). */
    public static final int DEFAULT_SCALE = 2;

    /** Default rounding mode for sales rounding (HALF_UP). */
    public static final RoundingMode DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * Constructs a {@code SalesRoundingDecimal} from a {@link String}.
     *
     * @param val the string representation of the decimal value
     * @throws NumberFormatException if {@code val} is {@code null} or not a valid decimal
     */
    public SalesRoundingDecimal(String val) {
        super(coerce(val));
    }

    /**
     * Constructs a {@code SalesRoundingDecimal} from a {@link Number}
     * (e.g. {@link Integer}, {@link Long}, {@link Double}, {@link BigDecimal}).
     * {@link BigDecimal} values use {@link BigDecimal#toPlainString()} to avoid
     * scientific-notation representation.
     *
     * @param val the numeric value
     * @throws NumberFormatException if {@code val} is {@code null}, {@link Double#NaN},
     *                               or non-finite (the latter two are detected by the
     *                               {@link BigDecimal} constructor)
     */
    public SalesRoundingDecimal(Number val) {
        super(coerce(val));
    }

    /**
     * <p>A fluent "Chain" method that applies a scale and returns a
     * <b>SalesRoundingDecimal</b> instead of a base {@link BigDecimal}.</p>
     *
     * @param scale the number of decimal places
     * @param mode  the rounding strategy
     * @return a new, scaled {@link SalesRoundingDecimal}
     */
    public SalesRoundingDecimal withSalesScale(int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(this.setScale(scale, mode));
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * default scale ({@value #DEFAULT_SCALE}) and rounding mode ({@link RoundingMode#HALF_UP}).</p>
     *
     * @param val the {@link String} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(String val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * default scale ({@value #DEFAULT_SCALE}) and rounding mode ({@link RoundingMode#HALF_UP}).</p>
     *
     * @param val the {@link Number} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(Number val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the {@link String} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(String val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the {@link Number} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(Number val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * Normalizes a {@link String} input to a canonical decimal string.
     * Throws {@link NumberFormatException} for {@code null} — matching
     * JavaScript's {@code coerce()} fail-fast contract.
     *
     * @param val the string representation of the decimal value
     * @return the validated string
     * @throws NumberFormatException if {@code val} is {@code null}
     */
    public static String coerce(String val) {
        if (val == null) throw new NumberFormatException("null is not a valid numeric value");
        return val;
    }

    /**
     * Normalizes a {@link Number} input to a canonical decimal string suitable
     * for passing to the {@link BigDecimal} constructor.
     * {@link BigDecimal} values use {@link BigDecimal#toPlainString()} to avoid
     * scientific-notation representation; all other {@link Number} subtypes use
     * {@link Object#toString()}.
     * Throws {@link NumberFormatException} for {@code null} — matching
     * JavaScript's {@code coerce()} fail-fast contract.
     *
     * @param val the numeric value
     * @return a plain decimal string
     * @throws NumberFormatException if {@code val} is {@code null}
     */
    public static String coerce(Number val) {
        if (val == null) throw new NumberFormatException("null is not a valid numeric value");
        if (val instanceof BigDecimal bd) return bd.toPlainString();
        return val.toString();
    }
}
