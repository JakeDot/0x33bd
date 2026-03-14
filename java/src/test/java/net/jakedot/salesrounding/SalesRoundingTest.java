package net.jakedot.salesrounding;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

class SalesRoundingTest {

    // --- round(BigDecimal) ---

    @Test
    void round_roundsToTwoDecimalPlaces() {
        assertEquals(new BigDecimal("1.24"), SalesRounding.round(new BigDecimal("1.235")));
        assertEquals(new BigDecimal("2.35"), SalesRounding.round(new BigDecimal("2.345")));
        assertEquals(new BigDecimal("0.01"), SalesRounding.round(new BigDecimal("0.005")));
    }

    @Test
    void round_roundsUpAtHalfway() {
        assertEquals(new BigDecimal("0.55"), SalesRounding.round(new BigDecimal("0.545")));
        assertEquals(new BigDecimal("9.99"), SalesRounding.round(new BigDecimal("9.985")));
        assertEquals(new BigDecimal("10.00"), SalesRounding.round(new BigDecimal("9.995")));
    }

    @Test
    void round_roundsDownBelowHalfway() {
        assertEquals(new BigDecimal("1.23"), SalesRounding.round(new BigDecimal("1.234")));
        assertEquals(new BigDecimal("0.00"), SalesRounding.round(new BigDecimal("0.004")));
    }

    @Test
    void round_exactValue_unchanged() {
        assertEquals(new BigDecimal("1.23"), SalesRounding.round(new BigDecimal("1.23")));
        assertEquals(new BigDecimal("0.00"), SalesRounding.round(new BigDecimal("0.00")));
        assertEquals(new BigDecimal("100.00"), SalesRounding.round(new BigDecimal("100.00")));
    }

    @Test
    void round_wholeNumber_addsTwoDecimalPlaces() {
        assertEquals(new BigDecimal("5.00"), SalesRounding.round(new BigDecimal("5")));
        assertEquals(new BigDecimal("0.00"), SalesRounding.round(new BigDecimal("0")));
    }

    @Test
    void round_negativeValue_halfwayRoundsAwayFromZero() {
        assertEquals(new BigDecimal("-1.24"), SalesRounding.round(new BigDecimal("-1.235")));
        assertEquals(new BigDecimal("-0.01"), SalesRounding.round(new BigDecimal("-0.005")));
    }

    @Test
    void round_null_throwsNullPointerException() {
        assertThrows(NullPointerException.class, () -> SalesRounding.round(null));
    }

    // --- round(BigDecimal, int) ---

    @Test
    void round_withScale0_roundsToInteger() {
        assertEquals(new BigDecimal("3"), SalesRounding.round(new BigDecimal("2.5"), 0));
        assertEquals(new BigDecimal("2"), SalesRounding.round(new BigDecimal("2.4"), 0));
        assertEquals(new BigDecimal("-3"), SalesRounding.round(new BigDecimal("-2.5"), 0));
    }

    @Test
    void round_withScale3_roundsToThreeDecimalPlaces() {
        assertEquals(new BigDecimal("1.235"), SalesRounding.round(new BigDecimal("1.2345"), 3));
        assertEquals(new BigDecimal("1.234"), SalesRounding.round(new BigDecimal("1.2344"), 3));
    }

    @Test
    void round_withScaleNegative_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class,
                () -> SalesRounding.round(new BigDecimal("1.5"), -1));
    }

    @Test
    void round_withScale_null_throwsNullPointerException() {
        assertThrows(NullPointerException.class, () -> SalesRounding.round(null, 2));
    }

    // --- round(BigDecimal, int, RoundingMode) ---

    @Test
    void round_withHalfEven_usesRoundHalfEven() {
        // Banker's rounding: 2.5 rounds to 2 (nearest even), 3.5 rounds to 4 (nearest even)
        assertEquals(new BigDecimal("2"), SalesRounding.round(new BigDecimal("2.5"), 0, RoundingMode.HALF_EVEN));
        assertEquals(new BigDecimal("4"), SalesRounding.round(new BigDecimal("3.5"), 0, RoundingMode.HALF_EVEN));
    }

    @Test
    void round_withFloor_roundsDown() {
        assertEquals(new BigDecimal("1.23"), SalesRounding.round(new BigDecimal("1.239"), 2, RoundingMode.FLOOR));
        assertEquals(new BigDecimal("-1.24"), SalesRounding.round(new BigDecimal("-1.231"), 2, RoundingMode.FLOOR));
    }

    @Test
    void round_withCeiling_roundsUp() {
        assertEquals(new BigDecimal("1.24"), SalesRounding.round(new BigDecimal("1.231"), 2, RoundingMode.CEILING));
        assertEquals(new BigDecimal("-1.23"), SalesRounding.round(new BigDecimal("-1.239"), 2, RoundingMode.CEILING));
    }

    @Test
    void round_withNullRoundingMode_throwsNullPointerException() {
        assertThrows(NullPointerException.class,
                () -> SalesRounding.round(new BigDecimal("1.5"), 2, null));
    }

    // --- constants ---

    @Test
    void defaultScale_isTwoDecimalPlaces() {
        assertEquals(2, SalesRounding.DEFAULT_SCALE);
    }

    @Test
    void defaultRoundingMode_isHalfUp() {
        assertEquals(RoundingMode.HALF_UP, SalesRounding.DEFAULT_ROUNDING_MODE);
    }

    // --- instantiation prevention ---

    @Test
    void constructor_throwsUnsupportedOperationException() {
        assertThrows(UnsupportedOperationException.class, () -> {
            var constructor = SalesRounding.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            try {
                constructor.newInstance();
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw e.getCause();
            }
        });
    }
}
