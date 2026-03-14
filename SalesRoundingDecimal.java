import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * <p><b>SalesRoundingDecimal</b> is a "KISS" decorator for {@link BigDecimal}.</p>
 *
 * <p>It provides a <b>Universal Normalization</b> constructor via internal coercion
 * and a fluent {@link #withSalesScale(int, RoundingMode)} method to keep logic in the Sales namespace.</p>
 *
 * <p><b>Example Usage:</b></p>
 * <pre>
 * SalesRoundingDecimal total = new SalesRoundingDecimal(price.add(tax))
 *                                  .withSalesScale(2, RoundingMode.HALF_UP);
 * </pre>
 *
 * @author JakeDot
 */
public class SalesRoundingDecimal extends BigDecimal {

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
     * @param mode the rounding strategy
     * @return a new, scaled {@link SalesRoundingDecimal}
     */
    public SalesRoundingDecimal withSalesScale(int scale, RoundingMode mode) {
        return new SalesRoundingDecimal(this.setScale(scale, mode));
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
