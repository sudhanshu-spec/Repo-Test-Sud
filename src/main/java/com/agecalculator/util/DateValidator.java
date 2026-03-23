package com.agecalculator.util;

import java.time.LocalDate;

/**
 * Utility class for validating dates against business rules.
 * <p>
 * Ensures that dates used as Date of Birth are valid according
 * to application requirements. The primary business rule enforced
 * is that a Date of Birth must not be in the future (i.e., must
 * be today or earlier).
 * </p>
 * <p>
 * This class follows the Single Responsibility Principle: it handles
 * ONLY date validation rules, NOT date parsing (which is the
 * responsibility of {@code DateParser}).
 * </p>
 * <p>
 * Design: Stateless utility — no mutable fields. Methods can be
 * called on an instance without side effects.
 * </p>
 *
 * @see java.time.LocalDate
 */
public class DateValidator {

    /**
     * Validates that the given date is acceptable as a Date of Birth.
     * <p>
     * A valid Date of Birth must satisfy two conditions:
     * <ol>
     *   <li>It must not be {@code null}.</li>
     *   <li>It must not be in the future (i.e., must be today or earlier).</li>
     * </ol>
     * If either condition is violated, an {@link IllegalArgumentException}
     * is thrown with a user-friendly message suitable for display to the
     * end user.
     * </p>
     *
     * @param date the date to validate; must not be {@code null}
     * @throws IllegalArgumentException if the date is {@code null} or
     *         represents a future date (after today)
     */
    public void validate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date of birth cannot be null.");
        }
        if (date.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Date of birth cannot be in the future. Please enter a past date.");
        }
    }

    /**
     * Checks whether the given date is not in the future.
     * <p>
     * Returns {@code true} if the date is today or in the past,
     * {@code false} if the date is in the future or {@code null}.
     * Unlike {@link #validate(LocalDate)}, this method does not throw
     * an exception — it returns a boolean for conditional checking.
     * </p>
     *
     * @param date the date to check; may be {@code null}
     * @return {@code true} if the date is today or earlier;
     *         {@code false} if the date is in the future or {@code null}
     */
    public boolean isNotFutureDate(LocalDate date) {
        if (date == null) {
            return false;
        }
        // LocalDate.isAfter() returns true only if date is strictly after now;
        // negating it means today and all past dates return true.
        return !date.isAfter(LocalDate.now());
    }
}
