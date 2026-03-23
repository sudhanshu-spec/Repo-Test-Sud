package com.agecalculator.util;

import java.time.LocalDate;

/**
 * Unit tests for the {@link DateValidator} class.
 * <p>
 * This test class exercises both public methods of DateValidator:
 * <ul>
 *   <li>{@code validate(LocalDate)} — throws {@link IllegalArgumentException}
 *       for null or future dates, returns normally for valid dates</li>
 *   <li>{@code isNotFutureDate(LocalDate)} — returns a boolean indicating
 *       whether the date is today or in the past</li>
 * </ul>
 * </p>
 * <p>
 * Uses the Java {@code assert} keyword exclusively for assertions.
 * Must be run with the {@code -ea} (enable assertions) JVM flag:
 * <pre>
 *   java -cp out -ea com.agecalculator.util.DateValidatorTest
 * </pre>
 * </p>
 * <p>
 * No JUnit, TestNG, or any third-party test framework is used.
 * </p>
 *
 * @see DateValidator
 */
public class DateValidatorTest {

    /**
     * Main entry point for running all DateValidator tests.
     * Instantiates a DateValidator and delegates to individual
     * private static test methods. If any assertion fails, the
     * JVM will throw an {@link AssertionError} and halt execution.
     *
     * @param args command-line arguments (not used)
     */
    public static void main(String[] args) {
        DateValidator validator = new DateValidator();

        // validate() method tests
        testFutureDateRejection(validator);
        testTodaysDateAcceptance(validator);
        testPastDateAcceptance(validator);
        testNullHandling(validator);

        // isNotFutureDate() method tests
        testIsNotFutureDateTrueForToday(validator);
        testIsNotFutureDateTrueForPast(validator);
        testIsNotFutureDateFalseForFuture(validator);
        testIsNotFutureDateFalseForNull(validator);

        // Boundary and edge case tests
        testFarFutureDateRejection(validator);
        testVeryOldDateAcceptance(validator);

        // Error message verification tests
        testErrorMessageForFutureDates(validator);
        testErrorMessageForNull(validator);

        System.out.println("All DateValidatorTest tests passed!");
    }

    /**
     * Test 1: validate() must reject tomorrow's date by throwing
     * an IllegalArgumentException. A future date is never a valid
     * Date of Birth.
     */
    private static void testFutureDateRejection(DateValidator validator) {
        try {
            validator.validate(LocalDate.now().plusDays(1));
            assert false : "Should have thrown IllegalArgumentException for future date";
        } catch (IllegalArgumentException e) {
            // Expected — future date correctly rejected
        }
        System.out.println("Test: Future date rejection via validate()... PASSED");
    }

    /**
     * Test 2: validate() must accept today's date without throwing
     * any exception. A person born today has a valid DOB of today.
     */
    private static void testTodaysDateAcceptance(DateValidator validator) {
        // Should NOT throw any exception — today is not in the future
        validator.validate(LocalDate.now());
        System.out.println("Test: Today's date acceptance via validate()... PASSED");
    }

    /**
     * Test 3: validate() must accept a clearly past date without
     * throwing any exception. June 15, 1990 is a valid DOB.
     */
    private static void testPastDateAcceptance(DateValidator validator) {
        // Should NOT throw any exception — 1990-06-15 is in the past
        validator.validate(LocalDate.of(1990, 6, 15));
        System.out.println("Test: Past date acceptance via validate()... PASSED");
    }

    /**
     * Test 4: validate() must reject null input by throwing an
     * IllegalArgumentException. Null is not a valid date.
     */
    private static void testNullHandling(DateValidator validator) {
        try {
            validator.validate(null);
            assert false : "Should have thrown IllegalArgumentException for null date";
        } catch (IllegalArgumentException e) {
            // Expected — null correctly rejected
        }
        System.out.println("Test: Null handling via validate()... PASSED");
    }

    /**
     * Test 5: isNotFutureDate() must return true for today's date.
     * Today is not in the future.
     */
    private static void testIsNotFutureDateTrueForToday(DateValidator validator) {
        assert validator.isNotFutureDate(LocalDate.now())
            : "Today should not be a future date";
        System.out.println("Test: isNotFutureDate() returns true for today... PASSED");
    }

    /**
     * Test 6: isNotFutureDate() must return true for a past date.
     * January 1, 2000 is clearly in the past.
     */
    private static void testIsNotFutureDateTrueForPast(DateValidator validator) {
        assert validator.isNotFutureDate(LocalDate.of(2000, 1, 1))
            : "Past date should not be future";
        System.out.println("Test: isNotFutureDate() returns true for past dates... PASSED");
    }

    /**
     * Test 7: isNotFutureDate() must return false for a future date.
     * Tomorrow is in the future.
     */
    private static void testIsNotFutureDateFalseForFuture(DateValidator validator) {
        assert !validator.isNotFutureDate(LocalDate.now().plusDays(1))
            : "Tomorrow should be a future date";
        System.out.println("Test: isNotFutureDate() returns false for future dates... PASSED");
    }

    /**
     * Test 8: isNotFutureDate() must return false for null input.
     * Null is not a valid date and the method should handle it
     * gracefully by returning false instead of throwing.
     */
    private static void testIsNotFutureDateFalseForNull(DateValidator validator) {
        assert !validator.isNotFutureDate(null)
            : "Null should return false from isNotFutureDate";
        System.out.println("Test: isNotFutureDate() returns false for null... PASSED");
    }

    /**
     * Test 9: validate() must reject a far-future date (year 2999).
     * Ensures that not just "tomorrow" but any future date is rejected.
     */
    private static void testFarFutureDateRejection(DateValidator validator) {
        try {
            validator.validate(LocalDate.of(2999, 12, 31));
            assert false : "Should have thrown IllegalArgumentException for far future date";
        } catch (IllegalArgumentException e) {
            // Expected — year 2999 is definitely in the future
        }
        System.out.println("Test: Far future date rejection (year 2999) via validate()... PASSED");
    }

    /**
     * Test 10: validate() must accept a very old date (year 1800).
     * There is no minimum date restriction in the validator; any
     * non-future date is acceptable.
     */
    private static void testVeryOldDateAcceptance(DateValidator validator) {
        // Should NOT throw — no minimum age restriction exists
        validator.validate(LocalDate.of(1800, 1, 1));
        System.out.println("Test: Very old date acceptance (year 1800) via validate()... PASSED");
    }

    /**
     * Test 11: Verifies the exact error message thrown by validate()
     * when a future date is provided. The message must be
     * "Date of birth cannot be in the future. Please enter a past date."
     * because AgeCalculatorApp displays it directly to the user via
     * e.getMessage().
     */
    private static void testErrorMessageForFutureDates(DateValidator validator) {
        try {
            validator.validate(LocalDate.now().plusDays(1));
            assert false : "Should have thrown IllegalArgumentException";
        } catch (IllegalArgumentException e) {
            assert "Date of birth cannot be in the future. Please enter a past date."
                .equals(e.getMessage())
                : "Unexpected error message: " + e.getMessage();
        }
        System.out.println("Test: Error message verification for future dates... PASSED");
    }

    /**
     * Test 12: Verifies the exact error message thrown by validate()
     * when null is provided. The message must be
     * "Date of birth cannot be null."
     * because AgeCalculatorApp displays it directly to the user via
     * e.getMessage().
     */
    private static void testErrorMessageForNull(DateValidator validator) {
        try {
            validator.validate(null);
            assert false : "Should have thrown IllegalArgumentException";
        } catch (IllegalArgumentException e) {
            assert "Date of birth cannot be null.".equals(e.getMessage())
                : "Unexpected error message: " + e.getMessage();
        }
        System.out.println("Test: Error message verification for null... PASSED");
    }
}
