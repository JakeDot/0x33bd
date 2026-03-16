import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * <p><b>SalesRoundingDecimal</b> is a "KISS" decorator for {@link BigDecimal}.</p>
 *
 * <p>It provides typed constructors for {@link String}, {@code int}, {@code long},
 * {@code double}, and {@link BigDecimal}, a fluent
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
     * A {@code null} value is treated as {@code "0"}.
     *
     * @param val the string representation of the decimal value
     */
    public SalesRoundingDecimal(String val) {
        super(val != null ? val : "0");
    }

    /**
     * Constructs a {@code SalesRoundingDecimal} from an {@code int}.
     *
     * @param val the integer value
     */
    public SalesRoundingDecimal(int val) {
        super(val);
    }

    /**
     * Constructs a {@code SalesRoundingDecimal} from a {@code long}.
     *
     * @param val the long value
     */
    public SalesRoundingDecimal(long val) {
        super(val);
    }

    /**
     * Constructs a {@code SalesRoundingDecimal} from a {@code double}.
     * Uses {@link Double#toString(double)} to avoid floating-point imprecision.
     *
     * @param val the double value
     */
    public SalesRoundingDecimal(double val) {
        super(Double.toString(val));
    }

    /**
     * Constructs a {@code SalesRoundingDecimal} from a {@link BigDecimal}.
     * A {@code null} value is treated as {@code "0"}.
     *
     * @param val the {@link BigDecimal} value
     */
    public SalesRoundingDecimal(BigDecimal val) {
        super(val != null ? val.toPlainString() : "0");
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
     * @param val the {@code int} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(int val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * default scale ({@value #DEFAULT_SCALE}) and rounding mode ({@link RoundingMode#HALF_UP}).</p>
     *
     * @param val the {@code long} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(long val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * default scale ({@value #DEFAULT_SCALE}) and rounding mode ({@link RoundingMode#HALF_UP}).</p>
     *
     * @param val the {@code double} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(double val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * default scale ({@value #DEFAULT_SCALE}) and rounding mode ({@link RoundingMode#HALF_UP}).</p>
     *
     * @param val the {@link BigDecimal} value to round
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(BigDecimal val) {
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
     * @param val   the {@code int} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(int val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the {@code long} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(long val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the {@code double} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(double val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the {@link BigDecimal} value to round
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(BigDecimal val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }
}
