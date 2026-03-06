package com.agecalculator.service;

import com.agecalculator.model.AgeResult;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Comprehensive unit tests for the {@link AgeCalculatorService} class.
 *
 * <p>This test class validates all aspects of the core age calculation service,
 * including valid age computation, leap year handling, boundary transitions,
 * invalid input rejection, future date rejection, null handling, and output
 * format verification.</p>
 *
 * <h3>Test Framework</h3>
 * <p>Uses the Java {@code assert} keyword exclusively for assertions — no
 * JUnit, TestNG, or other test framework dependencies. Tests must be executed
 * with the {@code -ea} (enable assertions) JVM flag:</p>
 * <pre>{@code
 *   javac -d out -cp out src/test/java/com/agecalculator/service/AgeCalculatorServiceTest.java
 *   java -cp out -ea com.agecalculator.service.AgeCalculatorServiceTest
 * }</pre>
 *
 * <h3>Test Coverage</h3>
 * <ol>
 *   <li>Valid age calculation with a known past date</li>
 *   <li>Leap year DOB handling (29/02/2000)</li>
 *   <li>Same-day birth (DOB = today → 0, 0, 0)</li>
 *   <li>Boundary month/day transitions</li>
 *   <li>Invalid input string propagation (DateTimeParseException)</li>
 *   <li>Future date rejection (IllegalArgumentException)</li>
 *   <li>Null LocalDate input handling</li>
 *   <li>Null and empty string input handling</li>
 *   <li>AgeResult toString() format verification</li>
 * </ol>
 *
 * @author Age Calculator Application
 * @version 1.0
 * @see AgeCalculatorService
 * @see AgeResult
 */
public class AgeCalculatorServiceTest {

    /**
     * Main test runner entry point. Instantiates the service under test and
     * executes all test methods sequentially. If any assertion fails (with
     * {@code -ea} enabled), the JVM throws an {@link AssertionError} and halts
     * immediately, indicating the failing test.
     *
     * @param args command-line arguments (not used)
     */
    public static void main(String[] args) {
        // Instantiate the service under test using the no-arg constructor
        AgeCalculatorService service = new AgeCalculatorService();

        // Execute all test cases sequentially
        testValidAgeCalculation(service);
        testLeapYearDOB(service);
        testSameDayBirth(service);
        testBoundaryMonthDayTransitions(service);
        testInvalidInputStringPropagation(service);
        testFutureDateRejection(service);
        testNullLocalDateInput(service);
        testNullAndEmptyStringInput(service);
        testToStringFormatVerification(service);

        // All tests passed without assertion errors
        System.out.println("All AgeCalculatorServiceTest tests passed!");
    }

    /**
     * Test 1: Validates that a known past date ("15/08/1995") produces a valid
     * AgeResult with non-negative years, months in [0,11], and days in [0,30].
     */
    private static void testValidAgeCalculation(AgeCalculatorService service) {
        // Calculate age for a known past date using the String overload
        AgeResult result = service.calculateAge("15/08/1995");

        // Verify result is not null
        assert result != null : "Result should not be null for valid date 15/08/1995";

        // Verify years is non-negative (at least 29 years as of 2025+)
        assert result.getYears() >= 0 : "Years should be non-negative, got: " + result.getYears();

        // Verify months is in valid range [0, 11]
        assert result.getMonths() >= 0 && result.getMonths() < 12
            : "Months should be 0-11, got: " + result.getMonths();

        // Verify days is in valid range [0, 30]
        assert result.getDays() >= 0 && result.getDays() < 31
            : "Days should be 0-30, got: " + result.getDays();

        System.out.println("Test: Valid age calculation with known past date... PASSED");
    }

    /**
     * Test 2: Validates that a leap year DOB ("29/02/2000") is correctly parsed
     * and produces a valid AgeResult. Year 2000 is a leap year (divisible by 400),
     * so February 29th is a valid calendar date.
     */
    private static void testLeapYearDOB(AgeCalculatorService service) {
        // Calculate age for a leap year date — 29 Feb 2000 is valid (2000 % 400 == 0)
        AgeResult leapResult = service.calculateAge("29/02/2000");

        // Verify result is not null
        assert leapResult != null : "Leap year DOB result should not be null";

        // Verify years is non-negative (at least 25 years as of 2025+)
        assert leapResult.getYears() >= 0
            : "Years should be non-negative for leap year DOB, got: " + leapResult.getYears();

        // Verify months is in valid range [0, 11]
        assert leapResult.getMonths() >= 0 && leapResult.getMonths() < 12
            : "Months should be 0-11, got: " + leapResult.getMonths();

        // Verify days is in valid range [0, 30]
        assert leapResult.getDays() >= 0 && leapResult.getDays() < 31
            : "Days should be 0-30, got: " + leapResult.getDays();

        System.out.println("Test: Leap year DOB handling (29/02/2000)... PASSED");
    }

    /**
     * Test 3: Validates that when DOB equals today's date, the calculated age
     * is exactly 0 years, 0 months, and 0 days. Uses the calculateAge(LocalDate)
     * overload to avoid date string formatting complications.
     */
    private static void testSameDayBirth(AgeCalculatorService service) {
        // Use today's date via the LocalDate overload to avoid DD/MM/YYYY formatting issues
        LocalDate today = LocalDate.now();
        AgeResult todayResult = service.calculateAge(today);

        // Period.between(today, today) must return exactly zero for all components
        assert todayResult.getYears() == 0
            : "Years should be 0 for today's date, got " + todayResult.getYears();
        assert todayResult.getMonths() == 0
            : "Months should be 0 for today's date, got " + todayResult.getMonths();
        assert todayResult.getDays() == 0
            : "Days should be 0 for today's date, got " + todayResult.getDays();

        System.out.println("Test: Same-day birth (DOB = today)... PASSED");
    }

    /**
     * Test 4: Validates age calculation across month and year boundaries.
     * Tests two scenarios:
     * <ul>
     *   <li>One year and one day ago — should yield exactly 1 year and at least 1 day</li>
     *   <li>Exactly one month ago — should yield exactly 0 years, 1 month, 0 days</li>
     * </ul>
     */
    private static void testBoundaryMonthDayTransitions(AgeCalculatorService service) {
        // Scenario A: A date exactly 1 year and 1 day ago
        LocalDate oneYearOneDayAgo = LocalDate.now().minusYears(1).minusDays(1);
        AgeResult boundaryResult = service.calculateAge(oneYearOneDayAgo);

        assert boundaryResult.getYears() == 1
            : "Expected 1 year for date 1 year and 1 day ago, got " + boundaryResult.getYears();
        assert boundaryResult.getDays() >= 1
            : "Expected at least 1 day for date 1 year and 1 day ago, got " + boundaryResult.getDays();

        // Scenario B: A date exactly 1 month ago
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);
        AgeResult monthBoundary = service.calculateAge(oneMonthAgo);

        assert monthBoundary.getYears() == 0
            : "Expected 0 years for 1 month ago, got " + monthBoundary.getYears();
        assert monthBoundary.getMonths() == 1
            : "Expected 1 month for 1 month ago, got " + monthBoundary.getMonths();
        assert monthBoundary.getDays() == 0
            : "Expected 0 days for exactly 1 month ago, got " + monthBoundary.getDays();

        System.out.println("Test: Boundary month/day transitions... PASSED");
    }

    /**
     * Test 5: Validates that invalid date strings cause DateTimeParseException
     * to propagate through AgeCalculatorService from the underlying DateParser.
     * Tests three invalid input categories:
     * <ul>
     *   <li>Invalid calendar date: "31/02/2020" (February never has 31 days)</li>
     *   <li>Non-date string: "abc" (non-numeric, completely invalid)</li>
     *   <li>Wrong format: "2020-01-15" (ISO format instead of DD/MM/YYYY)</li>
     * </ul>
     */
    private static void testInvalidInputStringPropagation(AgeCalculatorService service) {
        // Sub-test A: Invalid calendar date — February 31 does not exist
        try {
            service.calculateAge("31/02/2020");
            assert false : "Should have thrown DateTimeParseException for invalid date 31/02/2020";
        } catch (DateTimeParseException e) {
            // Expected — invalid calendar date rejected by STRICT formatter
        }

        // Sub-test B: Non-date string — completely non-numeric input
        try {
            service.calculateAge("abc");
            assert false : "Should have thrown DateTimeParseException for 'abc'";
        } catch (DateTimeParseException e) {
            // Expected — non-date input rejected by formatter
        }

        // Sub-test C: Wrong format — ISO format (yyyy-MM-dd) instead of DD/MM/YYYY
        try {
            service.calculateAge("2020-01-15");
            assert false : "Should have thrown DateTimeParseException for ISO format '2020-01-15'";
        } catch (DateTimeParseException e) {
            // Expected — wrong date format rejected by formatter
        }

        System.out.println("Test: Invalid input string propagation (DateTimeParseException)... PASSED");
    }

    /**
     * Test 6: Validates that a future date (tomorrow) is rejected with an
     * IllegalArgumentException. The tomorrow date string is constructed
     * dynamically to ensure the test works regardless of the current date.
     * Also verifies that the error message contains "future" for user-friendliness.
     */
    private static void testFutureDateRejection(AgeCalculatorService service) {
        // Dynamically construct tomorrow's date in DD/MM/YYYY format
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        String tomorrowStr = String.format("%02d/%02d/%04d",
            tomorrow.getDayOfMonth(), tomorrow.getMonthValue(), tomorrow.getYear());

        try {
            service.calculateAge(tomorrowStr);
            assert false : "Should have thrown IllegalArgumentException for future date: " + tomorrowStr;
        } catch (IllegalArgumentException e) {
            // Verify the error message mentions "future" for clear user guidance
            assert e.getMessage().contains("future")
                : "Error message should mention 'future', got: " + e.getMessage();
        }

        System.out.println("Test: Future date rejection (IllegalArgumentException)... PASSED");
    }

    /**
     * Test 7: Validates that passing null to calculateAge(LocalDate) throws
     * IllegalArgumentException with the exact message "Date of birth cannot be null."
     * The explicit (LocalDate) cast is required to disambiguate the method overload
     * between calculateAge(String) and calculateAge(LocalDate).
     */
    private static void testNullLocalDateInput(AgeCalculatorService service) {
        try {
            // Explicit cast to LocalDate needed to resolve overload ambiguity with null
            service.calculateAge((LocalDate) null);
            assert false : "Should have thrown IllegalArgumentException for null LocalDate";
        } catch (IllegalArgumentException e) {
            // Verify exact error message from AgeCalculatorService.calculateAge(LocalDate)
            assert "Date of birth cannot be null.".equals(e.getMessage())
                : "Unexpected error message: " + e.getMessage();
        }

        System.out.println("Test: Null LocalDate input to calculateAge(LocalDate)... PASSED");
    }

    /**
     * Test 8: Validates that null and empty string inputs to calculateAge(String)
     * are rejected with IllegalArgumentException. These are handled by the
     * DateParser's input guard clause before any date parsing is attempted.
     */
    private static void testNullAndEmptyStringInput(AgeCalculatorService service) {
        // Sub-test A: Null string input — explicit cast to String for overload resolution
        try {
            service.calculateAge((String) null);
            assert false : "Should have thrown IllegalArgumentException for null string";
        } catch (IllegalArgumentException e) {
            // Expected — null string rejected by DateParser guard clause
        }

        // Sub-test B: Empty string input
        try {
            service.calculateAge("");
            assert false : "Should have thrown IllegalArgumentException for empty string";
        } catch (IllegalArgumentException e) {
            // Expected — empty string rejected by DateParser guard clause
        }

        System.out.println("Test: Null and empty string input handling... PASSED");
    }

    /**
     * Test 9: Validates that AgeResult.toString() produces output in the exact
     * required format: "Your age is X years, Y months, and Z days."
     * Checks the prefix, suffix, and key format tokens within the output string.
     */
    private static void testToStringFormatVerification(AgeCalculatorService service) {
        // Calculate age for a well-known past date to verify toString() output format
        AgeResult formatResult = service.calculateAge("01/01/2000");
        String output = formatResult.toString();

        // Verify the output starts with the required prefix
        assert output.startsWith("Your age is ")
            : "Output should start with 'Your age is ', got: " + output;

        // Verify the output ends with the required suffix
        assert output.endsWith(" days.")
            : "Output should end with ' days.', got: " + output;

        // Verify the output contains the years separator
        assert output.contains("years,")
            : "Output should contain 'years,', got: " + output;

        // Verify the output contains the months-and-days conjunction
        assert output.contains("months, and")
            : "Output should contain 'months, and', got: " + output;

        System.out.println("Test: AgeResult toString() format verification... PASSED");
    }
}
