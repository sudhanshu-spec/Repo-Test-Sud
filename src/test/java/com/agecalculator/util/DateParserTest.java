package com.agecalculator.util;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Comprehensive unit tests for the {@link DateParser} class.
 *
 * <p>This test class validates all aspects of the date parsing utility including
 * valid DD/MM/YYYY parsing, format rejection for non-conforming inputs, strict
 * calendar date validation (via {@code ResolverStyle.STRICT}), leap year handling,
 * null/empty input guards, whitespace trimming, and rejection of malformed
 * patterns such as single-digit components and two-digit years.</p>
 *
 * <h3>Test Framework</h3>
 * <ul>
 *   <li>Uses Java {@code assert} keyword exclusively — NO JUnit/TestNG</li>
 *   <li>Run with {@code -ea} (enable assertions) JVM flag</li>
 *   <li>Entry point: {@code public static void main(String[] args)}</li>
 * </ul>
 *
 * <h3>Compilation &amp; Execution</h3>
 * <pre>
 *   javac -d out -cp out src/test/java/com/agecalculator/util/DateParserTest.java
 *   java -cp out -ea com.agecalculator.util.DateParserTest
 * </pre>
 *
 * @see DateParser
 */
public class DateParserTest {

    /**
     * Main test runner — instantiates {@link DateParser} and executes all 11
     * test scenarios sequentially. If any assertion fails (with {@code -ea}
     * enabled), the JVM halts with an {@link AssertionError} pinpointing the
     * failure. On full success, prints a summary confirmation message.
     *
     * @param args command-line arguments (unused)
     */
    public static void main(String[] args) {
        DateParser parser = new DateParser();

        testValidDateParsing(parser);
        testInvalidFormatRejection(parser);
        testInvalidCalendarDate(parser);
        testLeapYearValidDate(parser);
        testLeapYearInvalidDate(parser);
        testEmptyInputHandling(parser);
        testNullInputHandling(parser);
        testWhitespaceTrimming(parser);
        testNonNumericInput(parser);
        testSingleDigitDayMonthRejection(parser);
        testTwoDigitYearRejection(parser);

        System.out.println("All DateParserTest tests passed!");
    }

    // -----------------------------------------------------------------------
    // Test 1: Valid DD/MM/YYYY Parsing
    // -----------------------------------------------------------------------

    /**
     * Verifies that a well-formed DD/MM/YYYY string is correctly parsed into
     * the corresponding {@link LocalDate}. Input {@code "15/08/1995"} must
     * produce {@code LocalDate.of(1995, 8, 15)}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testValidDateParsing(DateParser parser) {
        // Parse a standard valid date string in DD/MM/YYYY format
        LocalDate result = parser.parse("15/08/1995");

        // Assert the parsed LocalDate matches the expected year, month, and day
        assert result.equals(LocalDate.of(1995, 8, 15))
            : "Expected 1995-08-15 but got " + result;

        System.out.println("Test: Valid DD/MM/YYYY parsing... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 2: Invalid Format Rejection (ISO format)
    // -----------------------------------------------------------------------

    /**
     * Verifies that an ISO-8601 formatted date string ({@code "2020-01-01"})
     * is rejected with a {@link DateTimeParseException}. The parser only
     * accepts the {@code DD/MM/YYYY} format with forward-slash delimiters.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testInvalidFormatRejection(DateParser parser) {
        // Attempt to parse an ISO format string — must be rejected
        try {
            parser.parse("2020-01-01");
            assert false : "Should have thrown DateTimeParseException for ISO format";
        } catch (DateTimeParseException e) {
            // Expected — ISO format (yyyy-MM-dd) does not match DD/MM/YYYY pattern
        }

        System.out.println("Test: Invalid format rejection (ISO format)... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 3: Invalid Calendar Dates (STRICT resolver)
    // -----------------------------------------------------------------------

    /**
     * Verifies that the strict resolver rejects calendar-impossible dates.
     * February never has 31 days, so {@code "31/02/2020"} must trigger a
     * {@link DateTimeParseException}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testInvalidCalendarDate(DateParser parser) {
        // Attempt to parse February 31st — an impossible calendar date
        try {
            parser.parse("31/02/2020");
            assert false : "Should have thrown DateTimeParseException for invalid date 31/02/2020";
        } catch (DateTimeParseException e) {
            // Expected — February never has 31 days; STRICT resolver rejects it
        }

        System.out.println("Test: Invalid calendar date (31/02/2020)... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 4: Leap Year Valid Date
    // -----------------------------------------------------------------------

    /**
     * Verifies that February 29th is accepted for a genuine leap year.
     * The year 2000 is divisible by 400, making it a leap year despite
     * also being divisible by 100. Input {@code "29/02/2000"} must parse
     * to {@code LocalDate.of(2000, 2, 29)}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testLeapYearValidDate(DateParser parser) {
        // Parse February 29 for the year 2000 — a valid leap year date
        LocalDate leapDate = parser.parse("29/02/2000");

        // Assert the parsed date matches the expected leap year date
        assert leapDate.equals(LocalDate.of(2000, 2, 29))
            : "Expected 2000-02-29 but got " + leapDate;

        System.out.println("Test: Leap year valid date (29/02/2000)... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 5: Leap Year Invalid Date
    // -----------------------------------------------------------------------

    /**
     * Verifies that February 29th is rejected for a non-leap year. The year
     * 1900 is divisible by 100 but NOT by 400, so it is NOT a leap year.
     * Input {@code "29/02/1900"} must trigger a {@link DateTimeParseException}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testLeapYearInvalidDate(DateParser parser) {
        // Attempt to parse February 29 for 1900 — NOT a leap year
        try {
            parser.parse("29/02/1900");
            assert false : "Should have thrown DateTimeParseException for non-leap year date 29/02/1900";
        } catch (DateTimeParseException e) {
            // Expected — 1900 is NOT a leap year (divisible by 100 but NOT by 400)
        }

        System.out.println("Test: Leap year invalid date (29/02/1900)... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 6: Empty Input Handling
    // -----------------------------------------------------------------------

    /**
     * Verifies that an empty string input is rejected with an
     * {@link IllegalArgumentException}. The {@link DateParser} must guard
     * against blank input before attempting any format parsing.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testEmptyInputHandling(DateParser parser) {
        // Attempt to parse an empty string — must be rejected before parsing
        try {
            parser.parse("");
            assert false : "Should have thrown IllegalArgumentException for empty input";
        } catch (IllegalArgumentException e) {
            // Expected — empty input rejected with descriptive message
        }

        System.out.println("Test: Empty input handling... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 7: Null Input Handling
    // -----------------------------------------------------------------------

    /**
     * Verifies that a {@code null} input is rejected with an
     * {@link IllegalArgumentException}. The {@link DateParser} must perform
     * a null check before any string operations or format parsing.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testNullInputHandling(DateParser parser) {
        // Attempt to parse null — must be rejected before any processing
        try {
            parser.parse(null);
            assert false : "Should have thrown IllegalArgumentException for null input";
        } catch (IllegalArgumentException e) {
            // Expected — null input rejected with descriptive message
        }

        System.out.println("Test: Null input handling... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 8: Whitespace Trimming
    // -----------------------------------------------------------------------

    /**
     * Verifies that leading and trailing whitespace is stripped from the
     * input before parsing. The string {@code " 15/08/1995 "} (with spaces)
     * must produce the same result as {@code "15/08/1995"}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testWhitespaceTrimming(DateParser parser) {
        // Parse a whitespace-padded date string — whitespace should be trimmed
        LocalDate trimmedResult = parser.parse(" 15/08/1995 ");

        // Assert the parsed date matches the expected result after trimming
        assert trimmedResult.equals(LocalDate.of(1995, 8, 15))
            : "Expected 1995-08-15 after trimming but got " + trimmedResult;

        System.out.println("Test: Whitespace trimming... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 9: Non-Numeric Input
    // -----------------------------------------------------------------------

    /**
     * Verifies that completely non-numeric input is rejected with a
     * {@link DateTimeParseException}. The string {@code "abc"} has no
     * resemblance to the {@code DD/MM/YYYY} pattern.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testNonNumericInput(DateParser parser) {
        // Attempt to parse alphabetic garbage input — must be rejected
        try {
            parser.parse("abc");
            assert false : "Should have thrown DateTimeParseException for non-numeric input 'abc'";
        } catch (DateTimeParseException e) {
            // Expected — non-numeric input cannot be parsed as a date
        }

        System.out.println("Test: Non-numeric input rejection... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 10: Single-Digit Day/Month Rejection
    // -----------------------------------------------------------------------

    /**
     * Verifies that single-digit day and month components are rejected.
     * The pattern {@code dd/MM/uuuu} requires exactly two digits for both
     * day and month. Input {@code "5/8/1995"} must trigger a
     * {@link DateTimeParseException}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testSingleDigitDayMonthRejection(DateParser parser) {
        // Attempt to parse single-digit day and month — pattern requires two digits each
        try {
            parser.parse("5/8/1995");
            assert false : "Should have thrown DateTimeParseException for single-digit format '5/8/1995'";
        } catch (DateTimeParseException e) {
            // Expected — dd/MM pattern mandates exactly two digits for day and month
        }

        System.out.println("Test: Single-digit day/month rejection... PASSED");
    }

    // -----------------------------------------------------------------------
    // Test 11: Two-Digit Year Rejection
    // -----------------------------------------------------------------------

    /**
     * Verifies that a two-digit year is rejected. The pattern
     * {@code dd/MM/uuuu} requires exactly four digits for the year.
     * Input {@code "15/08/95"} must trigger a {@link DateTimeParseException}.
     *
     * @param parser the {@link DateParser} instance under test
     */
    private static void testTwoDigitYearRejection(DateParser parser) {
        // Attempt to parse a two-digit year — pattern requires four digits
        try {
            parser.parse("15/08/95");
            assert false : "Should have thrown DateTimeParseException for two-digit year '15/08/95'";
        } catch (DateTimeParseException e) {
            // Expected — uuuu pattern mandates exactly four digits for the year
        }

        System.out.println("Test: Two-digit year rejection... PASSED");
    }
}
