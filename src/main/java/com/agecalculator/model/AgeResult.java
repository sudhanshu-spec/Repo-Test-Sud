package com.agecalculator.model;

/**
 * Immutable value object representing the result of an age calculation.
 * Encapsulates the age broken down into years, months, and days.
 *
 * <p>This class follows the Value Object design pattern — instances are
 * immutable data carriers with no identity beyond their field values.
 * All fields are set once during construction and cannot be modified.</p>
 *
 * <p>The {@link #toString()} method produces the exact output format
 * required by the Age Calculator application:
 * {@code "Your age is X years, Y months, and Z days."}</p>
 *
 * @author Age Calculator Application
 * @version 1.0
 */
public class AgeResult {

    /** The number of complete years in the calculated age. */
    private final int years;

    /** The number of complete months beyond the years in the calculated age. */
    private final int months;

    /** The number of remaining days beyond the months in the calculated age. */
    private final int days;

    /**
     * Constructs an AgeResult with the specified years, months, and days.
     *
     * <p>The caller (typically the service layer) is responsible for ensuring
     * that the provided values are valid and non-negative before constructing
     * this object.</p>
     *
     * @param years  the number of complete years
     * @param months the number of complete months beyond the years
     * @param days   the number of remaining days beyond the months
     */
    public AgeResult(int years, int months, int days) {
        this.years = years;
        this.months = months;
        this.days = days;
    }

    /**
     * Returns the number of complete years in the calculated age.
     *
     * @return the years component of the age
     */
    public int getYears() {
        return years;
    }

    /**
     * Returns the number of complete months beyond the years in the calculated age.
     *
     * @return the months component of the age
     */
    public int getMonths() {
        return months;
    }

    /**
     * Returns the number of remaining days beyond the months in the calculated age.
     *
     * @return the days component of the age
     */
    public int getDays() {
        return days;
    }

    /**
     * Returns a formatted string representation of the age.
     *
     * <p>The output format is exactly:
     * {@code "Your age is X years, Y months, and Z days."}
     * where X, Y, and Z are the years, months, and days values respectively.</p>
     *
     * @return the formatted age string in the required output format
     */
    @Override
    public String toString() {
        return String.format("Your age is %d years, %d months, and %d days.", years, months, days);
    }
}
