import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Manual test suite for {@link SalesRoundingDecimal}.
 *
 * <p>Run from the repo root:
 * <pre>
 *   javac SalesRoundingDecimal.java tests/SalesRoundingDecimalTest.java
 *   java -cp .:tests SalesRoundingDecimalTest
 * </pre>
 */
public class SalesRoundingDecimalTest {

    private static int passed = 0;
    private static int failed = 0;

    // ─── Assertion helpers ────────────────────────────────────────────────────

    private static void assertEquals(String expected, String actual, String label) {
        if (expected.equals(actual)) {
            System.out.println("  ✔ " + label);
            passed++;
        } else {
            System.out.println("  ✘ " + label + " — expected: " + expected + ", got: " + actual);
            failed++;
        }
    }

    private static void assertThrows(Class<? extends Throwable> expectedType,
                                     Runnable action, String label) {
        try {
            action.run();
            System.out.println("  ✘ " + label + " — expected " + expectedType.getSimpleName() + " but no exception was thrown");
            failed++;
        } catch (Throwable t) {
            if (expectedType.isInstance(t)) {
                System.out.println("  ✔ " + label);
                passed++;
            } else {
                System.out.println("  ✘ " + label + " — expected " + expectedType.getSimpleName()
                        + " but got " + t.getClass().getSimpleName() + ": " + t.getMessage());
                failed++;
            }
        }
    }

    // ─── Test groups ──────────────────────────────────────────────────────────

    static void testConstructorFromString() {
        System.out.println("Constructor(String):");
        SalesRoundingDecimal d = new SalesRoundingDecimal("19.995");
        assertEquals("19.995", d.toPlainString(), "parses valid string");

        SalesRoundingDecimal zero = new SalesRoundingDecimal("0");
        assertEquals("0", zero.toPlainString(), "parses zero");

        SalesRoundingDecimal neg = new SalesRoundingDecimal("-5.5");
        assertEquals("-5.5", neg.toPlainString(), "parses negative");

        assertThrows(NumberFormatException.class,
                () -> new SalesRoundingDecimal((String) null), "null string throws");

        assertThrows(NumberFormatException.class,
                () -> new SalesRoundingDecimal("not-a-number"), "non-numeric string throws");
    }

    static void testConstructorFromNumber() {
        System.out.println("Constructor(Number):");
        SalesRoundingDecimal fromInt = new SalesRoundingDecimal((Number) 42);
        assertEquals("42", fromInt.toPlainString(), "constructs from Integer");

        SalesRoundingDecimal fromLong = new SalesRoundingDecimal((Number) 100L);
        assertEquals("100", fromLong.toPlainString(), "constructs from Long");

        SalesRoundingDecimal fromBD = new SalesRoundingDecimal((Number) new BigDecimal("19.995"));
        assertEquals("19.995", fromBD.toPlainString(), "constructs from BigDecimal via Number");

        assertThrows(NumberFormatException.class,
                () -> new SalesRoundingDecimal((Number) null), "null Number throws");
    }

    static void testWithSalesScaleDefaultMode() {
        System.out.println("withSalesScale (HALF_UP):");
        assertEquals("20.00",
                new SalesRoundingDecimal("19.995").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "19.995 → 20.00 (HALF_UP)");
        assertEquals("19.99",
                new SalesRoundingDecimal("19.994").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "19.994 → 19.99 (HALF_UP)");
        assertEquals("1.235",
                new SalesRoundingDecimal("1.2345").withSalesScale(3, RoundingMode.HALF_UP).toPlainString(),
                "1.2345 → 1.235 (HALF_UP, scale 3)");
        assertEquals("-20.00",
                new SalesRoundingDecimal("-19.995").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "-19.995 → -20.00 (HALF_UP)");
    }

    static void testRoundingModes() {
        System.out.println("Rounding modes:");

        // UP — always away from zero
        assertEquals("1.3",
                new SalesRoundingDecimal("1.21").withSalesScale(1, RoundingMode.UP).toPlainString(),
                "UP: 1.21 → 1.3");

        // DOWN — always towards zero (truncate)
        assertEquals("1.2",
                new SalesRoundingDecimal("1.29").withSalesScale(1, RoundingMode.DOWN).toPlainString(),
                "DOWN: 1.29 → 1.2");

        // CEILING — towards positive infinity
        assertEquals("1.3",
                new SalesRoundingDecimal("1.21").withSalesScale(1, RoundingMode.CEILING).toPlainString(),
                "CEILING: 1.21 → 1.3");
        assertEquals("-1.2",
                new SalesRoundingDecimal("-1.29").withSalesScale(1, RoundingMode.CEILING).toPlainString(),
                "CEILING: -1.29 → -1.2");

        // FLOOR — towards negative infinity
        assertEquals("1.2",
                new SalesRoundingDecimal("1.29").withSalesScale(1, RoundingMode.FLOOR).toPlainString(),
                "FLOOR: 1.29 → 1.2");
        assertEquals("-1.3",
                new SalesRoundingDecimal("-1.21").withSalesScale(1, RoundingMode.FLOOR).toPlainString(),
                "FLOOR: -1.21 → -1.3");

        // HALF_DOWN — ties towards zero
        assertEquals("1.2",
                new SalesRoundingDecimal("1.25").withSalesScale(1, RoundingMode.HALF_DOWN).toPlainString(),
                "HALF_DOWN: 1.25 → 1.2");
        assertEquals("1.3",
                new SalesRoundingDecimal("1.26").withSalesScale(1, RoundingMode.HALF_DOWN).toPlainString(),
                "HALF_DOWN: 1.26 → 1.3");

        // HALF_EVEN — banker's rounding
        assertEquals("1.2",
                new SalesRoundingDecimal("1.25").withSalesScale(1, RoundingMode.HALF_EVEN).toPlainString(),
                "HALF_EVEN: 1.25 → 1.2 (even)");
        assertEquals("1.4",
                new SalesRoundingDecimal("1.35").withSalesScale(1, RoundingMode.HALF_EVEN).toPlainString(),
                "HALF_EVEN: 1.35 → 1.4 (even)");
    }

    static void testStaticRoundWithDefaults() {
        System.out.println("round(String) / round(Number) — default scale & mode:");
        assertEquals("20.00",
                SalesRoundingDecimal.round("19.995").toPlainString(),
                "round(String) → 20.00");
        assertEquals("20.00",
                SalesRoundingDecimal.round((Number) new BigDecimal("19.995")).toPlainString(),
                "round(Number/BigDecimal) → 20.00");
        assertEquals("5.00",
                SalesRoundingDecimal.round((Number) 5).toPlainString(),
                "round(Integer 5) → 5.00");
    }

    static void testStaticRoundWithCustomScaleAndMode() {
        System.out.println("round(val, scale, mode):");
        assertEquals("1.235",
                SalesRoundingDecimal.round("1.2345", 3, RoundingMode.HALF_UP).toPlainString(),
                "round(String, 3, HALF_UP) → 1.235");
        assertEquals("1.2",
                SalesRoundingDecimal.round("1.25", 1, RoundingMode.HALF_DOWN).toPlainString(),
                "round(String, 1, HALF_DOWN) → 1.2");
    }

    static void testDefaultConstants() {
        System.out.println("Default constants:");
        assertEquals("2", String.valueOf(SalesRoundingDecimal.DEFAULT_SCALE), "DEFAULT_SCALE = 2");
        assertEquals(RoundingMode.HALF_UP.name(),
                SalesRoundingDecimal.DEFAULT_ROUNDING_MODE.name(),
                "DEFAULT_ROUNDING_MODE = HALF_UP");
    }

    static void testEdgeCases() {
        System.out.println("Edge cases:");
        assertEquals("0.00",
                new SalesRoundingDecimal("0").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "zero scales to 0.00");
        assertEquals("1000.00",
                new SalesRoundingDecimal("1000").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "large integer scales to 1000.00");
        assertEquals("1.00",
                new SalesRoundingDecimal("1.005").withSalesScale(2, RoundingMode.HALF_DOWN).toPlainString(),
                "1.005 → 1.00 (HALF_DOWN)");
        assertEquals("1.01",
                new SalesRoundingDecimal("1.005").withSalesScale(2, RoundingMode.HALF_UP).toPlainString(),
                "1.005 → 1.01 (HALF_UP)");
    }

    // ─── Entry point ──────────────────────────────────────────────────────────

    public static void main(String[] args) {
        System.out.println("=== SalesRoundingDecimalTest ===\n");

        testConstructorFromString();
        testConstructorFromNumber();
        testWithSalesScaleDefaultMode();
        testRoundingModes();
        testStaticRoundWithDefaults();
        testStaticRoundWithCustomScaleAndMode();
        testDefaultConstants();
        testEdgeCases();

        System.out.println("\n── Results ──────────────────────────────────────────");
        System.out.println("  Passed: " + passed);
        System.out.println("  Failed: " + failed);
        if (failed > 0) {
            System.exit(1);
        }
        System.out.println("  All tests passed ✔");
    }
}
