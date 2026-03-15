import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * <p><b>SalesRoundingDecimal</b> is a "KISS" decorator for {@link BigDecimal}.</p>
 *
 * <p>It provides a <b>Universal Normalization</b> constructor via internal coercion,
 * a fluent {@link #withSalesScale(int, RoundingMode)} instance method, and static
 * {@link #round(Object)} / {@link #round(Object, int, RoundingMode)} convenience
 * factory methods so callers can round in a single expression.</p>
 *
 * @author JakeDot
 */
public class SalesRoundingDecimal extends BigDecimal {

    /** Default scale for sales rounding (2 decimal places, i.e. cents). */
    public static final int DEFAULT_SCALE = 2;

    /** Default rounding mode for sales rounding (HALF_UP). */
    public static final RoundingMode DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * <p>Universal constructor that coerces any {@link Object} into a normalized string
     * before calling the {@link BigDecimal} constructor.</p>
     *
     * @param val supports {@link Number}, {@link String}, or {@link BigDecimal}
     */
    public SalesRoundingDecimal(Object val) {
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
     * @param val the value to round; supports {@link Number}, {@link String}, or {@link BigDecimal}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(Object val) {
        return round(val, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * <p>Static convenience factory: construct and round in a single call using the
     * specified scale and rounding mode.</p>
     *
     * @param val   the value to round; supports {@link Number}, {@link String}, or {@link BigDecimal}
     * @param scale the number of decimal places; must be &ge; 0
     * @param mode  the rounding strategy; must not be {@code null}
     * @return a rounded {@link SalesRoundingDecimal}
     */
    public static SalesRoundingDecimal round(Object val, int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(val).withSalesScale(scale, mode);
    }

    /**
     * Internal coercion logic to ensure any numeric or string input is
     * converted to a format {@link BigDecimal} can safely parse.
     */
    static final String coerce(Object val) {
        if (val == null) return "0";
        return val instanceof Number ? val.toString() : String.valueOf(val);
    }
}
