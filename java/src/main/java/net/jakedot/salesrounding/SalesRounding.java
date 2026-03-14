package net.jakedot.salesrounding;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utility class for sales rounding of {@link BigDecimal} values.
 *
 * <p>Sales rounding uses {@link RoundingMode#HALF_UP} by default, which is the
 * standard commercial rounding mode where a value exactly halfway between two
 * neighbours is rounded up (away from zero).
 *
 * <p>The default scale is 2 decimal places, suitable for most currencies.
 */
public final class SalesRounding {

    /** Default scale for sales rounding (2 decimal places, i.e. cents). */
    public static final int DEFAULT_SCALE = 2;

    /** Default rounding mode for sales rounding (HALF_UP). */
    public static final RoundingMode DEFAULT_ROUNDING_MODE = RoundingMode.HALF_UP;

    private SalesRounding() {
        throw new UnsupportedOperationException("SalesRounding is a utility class");
    }

    /**
     * Rounds the given value to 2 decimal places using {@link RoundingMode#HALF_UP}.
     *
     * @param value the value to round; must not be {@code null}
     * @return the rounded value
     * @throws NullPointerException if {@code value} is {@code null}
     */
    public static BigDecimal round(BigDecimal value) {
        return round(value, DEFAULT_SCALE, DEFAULT_ROUNDING_MODE);
    }

    /**
     * Rounds the given value to the specified number of decimal places using
     * {@link RoundingMode#HALF_UP}.
     *
     * @param value the value to round; must not be {@code null}
     * @param scale the number of decimal places; must be &ge; 0
     * @return the rounded value
     * @throws NullPointerException     if {@code value} is {@code null}
     * @throws IllegalArgumentException if {@code scale} is negative
     */
    public static BigDecimal round(BigDecimal value, int scale) {
        return round(value, scale, DEFAULT_ROUNDING_MODE);
    }

    /**
     * Rounds the given value to the specified number of decimal places using
     * the given rounding mode.
     *
     * @param value        the value to round; must not be {@code null}
     * @param scale        the number of decimal places; must be &ge; 0
     * @param roundingMode the rounding mode to apply; must not be {@code null}
     * @return the rounded value
     * @throws NullPointerException     if {@code value} or {@code roundingMode} is {@code null}
     * @throws IllegalArgumentException if {@code scale} is negative
     */
    public static BigDecimal round(BigDecimal value, int scale, RoundingMode roundingMode) {
        if (value == null) {
            throw new NullPointerException("value must not be null");
        }
        if (roundingMode == null) {
            throw new NullPointerException("roundingMode must not be null");
        }
        if (scale < 0) {
            throw new IllegalArgumentException("scale must be >= 0, got: " + scale);
        }
        return value.setScale(scale, roundingMode);
    }
}
