import java.math.RoundingMode;

/**
 * Sample application demonstrating the SalesRoundingDecimal utility.
 *
 * <p>Run from the repository root:</p>
 * <pre>
 *   javac SalesRoundingDecimal.java sample/java/SalesRoundingDecimalApp.java -d sample/java/out
 *   java -cp sample/java/out SalesRoundingDecimalApp
 * </pre>
 */
public class SalesRoundingDecimalApp {

    public static void main(String[] args) {
        System.out.println("=== SalesRoundingDecimal — Java Sample ===\n");

        // 1. Construct from a String
        SalesRoundingDecimal price = new SalesRoundingDecimal("19.995");
        System.out.println("Price (raw):          " + price);

        // 2. Round using the fluent chain method
        SalesRoundingDecimal rounded = price.withSalesScale(2, RoundingMode.HALF_UP);
        System.out.println("Price (HALF_UP  ×2):  " + rounded);   // 20.00

        // 3. Static convenience factory
        SalesRoundingDecimal quick = SalesRoundingDecimal.round("19.994");
        System.out.println("Quick round 19.994:   " + quick);      // 19.99

        // 4. Construct from a Number and add tax
        SalesRoundingDecimal tax  = new SalesRoundingDecimal((Number) 1.50);
        SalesRoundingDecimal total = new SalesRoundingDecimal(price.add(tax))
                .withSalesScale(2, RoundingMode.HALF_UP);
        System.out.println("Price + tax (HALF_UP): " + total);     // 21.50

        // 5. Negative value with CEILING
        SalesRoundingDecimal refund = new SalesRoundingDecimal("-19.995");
        System.out.println("Refund (CEILING ×2):  "
                + refund.withSalesScale(2, RoundingMode.CEILING)); // -19.99

        // 6. Fail-fast: null input
        try {
            new SalesRoundingDecimal((String) null);
        } catch (NumberFormatException e) {
            System.out.println("Expected error (null): " + e.getMessage());
        }

        // 7. Fail-fast: non-numeric string
        try {
            new SalesRoundingDecimal("not-a-number");
        } catch (NumberFormatException e) {
            System.out.println("Expected error (NaN string): " + e.getMessage());
        }

        System.out.println("\nDone.");
    }
}
