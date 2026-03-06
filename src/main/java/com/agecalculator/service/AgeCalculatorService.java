package com.agecalculator.service;

import com.agecalculator.model.AgeResult;
import com.agecalculator.util.DateParser;
import com.agecalculator.util.DateValidator;
import java.time.LocalDate;
import java.time.Period;

/**
 * Service class that encapsulates the core age calculation business logic.
 *
 * <p>This class orchestrates the complete age calculation workflow by
 * coordinating three distinct concerns:</p>
 * <ol>
 *   <li><strong>Parsing</strong> — delegated to {@link DateParser}, which
 *       converts a {@code DD/MM/YYYY} string into a {@link LocalDate} using
 *       a strict {@link java.time.format.DateTimeFormatter}.</li>
 *   <li><strong>Validation</strong> — delegated to {@link DateValidator},
 *       which enforces business rules such as rejecting future dates.</li>
 *   <li><strong>Computation</strong> — performed internally using
 *       {@link Period#between(LocalDate, LocalDate)} to determine the exact
 *       age in years, months, and days.</li>
 * </ol>
 *
 * <h3>Design Principles</h3>
 * <ul>
 *   <li><strong>Service Pattern</strong>: Encapsulates business logic behind
 *       a clean public API with two overloaded {@code calculateAge()} methods.</li>
 *   <li><strong>Single Responsibility</strong>: Orchestrates the workflow;
 *       each step is delegated to the appropriate utility class.</li>
 *   <li><strong>Separation of Concerns</strong>: Parsing, validation, and
 *       computation are handled by distinct, focused components.</li>
 *   <li><strong>Encapsulation</strong>: Internal utility instances are
 *       private and final, not exposed to callers.</li>
 * </ul>
 *
 * <h3>Usage Example</h3>
 * <pre>{@code
 *   AgeCalculatorService service = new AgeCalculatorService();
 *
 *   // From a string (full pipeline: parse → validate → compute)
 *   AgeResult result = service.calculateAge("15/08/1995");
 *   System.out.println(result);
 *   // Output: Your age is X years, Y months, and Z days.
 *
 *   // From a pre-parsed LocalDate (compute only)
 *   AgeResult result2 = service.calculateAge(LocalDate.of(1995, 8, 15));
 * }</pre>
 *
 * @author Age Calculator Application
 * @version 1.0
 * @see AgeResult
 * @see DateParser
 * @see DateValidator
 */
public class AgeCalculatorService {

    /** Parser instance for converting DD/MM/YYYY strings to LocalDate objects. */
    private final DateParser dateParser;

    /** Validator instance for enforcing business rules on parsed dates. */
    private final DateValidator dateValidator;

    /**
     * Constructs an {@code AgeCalculatorService} with default {@link DateParser}
     * and {@link DateValidator} instances.
     *
     * <p>Both utility objects are stateless, so creating fresh instances in the
     * constructor is safe and straightforward. The utilities are stored as
     * {@code private final} fields, ensuring immutability and encapsulation.</p>
     */
    public AgeCalculatorService() {
        this.dateParser = new DateParser();
        this.dateValidator = new DateValidator();
    }

    /**
     * Calculates the exact age from a date of birth string in {@code DD/MM/YYYY} format.
     *
     * <p>This method executes the complete age calculation pipeline in three
     * sequential steps:</p>
     * <ol>
     *   <li><strong>Parse</strong>: Converts the input string to a {@link LocalDate}
     *       via {@link DateParser#parse(String)}. If the string is malformed, empty,
     *       or represents an invalid calendar date (e.g., {@code "31/02/2020"}),
     *       an appropriate exception is thrown.</li>
     *   <li><strong>Validate</strong>: Checks the parsed date against business rules
     *       via {@link DateValidator#validate(LocalDate)}. If the date is in the
     *       future, an {@link IllegalArgumentException} is thrown.</li>
     *   <li><strong>Compute</strong>: Delegates to {@link #calculateAge(LocalDate)}
     *       to perform the actual period calculation and return the result.</li>
     * </ol>
     *
     * <p>Exceptions from the parsing and validation steps are intentionally
     * <strong>not caught</strong> within this method — they propagate directly
     * to the caller (typically {@code AgeCalculatorApp}), which is responsible
     * for displaying user-friendly error messages.</p>
     *
     * @param dobString the date of birth string in {@code DD/MM/YYYY} format
     *                  (e.g., {@code "15/08/1995"})
     * @return an {@link AgeResult} containing the computed age in years, months,
     *         and days
     * @throws java.time.format.DateTimeParseException if the string does not
     *         conform to the {@code DD/MM/YYYY} pattern or represents an invalid
     *         calendar date
     * @throws IllegalArgumentException if the input is {@code null}, empty,
     *         or represents a future date
     */
    public AgeResult calculateAge(String dobString) {
        // Step 1: Parse the DD/MM/YYYY string into a LocalDate
        LocalDate dob = dateParser.parse(dobString);

        // Step 2: Validate the parsed date against business rules (no future dates)
        dateValidator.validate(dob);

        // Step 3: Compute age using the overloaded LocalDate method and return
        return calculateAge(dob);
    }

    /**
     * Calculates the exact age from a pre-parsed {@link LocalDate} date of birth.
     *
     * <p>This method uses {@link Period#between(LocalDate, LocalDate)} to compute
     * the elapsed time between the given date of birth and the current system date
     * ({@link LocalDate#now()}). The result is decomposed into years, months, and
     * days and encapsulated in an immutable {@link AgeResult} object.</p>
     *
     * <p>Key behaviors of the underlying {@code Period.between()} calculation:</p>
     * <ul>
     *   <li>Correctly handles month-length variations (28/29/30/31-day months)</li>
     *   <li>Correctly handles leap years and day carry-over</li>
     *   <li>Returns {@code 0 years, 0 months, 0 days} when DOB equals today
     *       (valid same-day birth scenario)</li>
     *   <li>Always returns non-negative values when DOB is before or equal to
     *       the current date</li>
     * </ul>
     *
     * @param dob the date of birth as a {@link LocalDate}; must not be {@code null}
     * @return an {@link AgeResult} containing the computed age in years, months,
     *         and days
     * @throws IllegalArgumentException if {@code dob} is {@code null}
     */
    public AgeResult calculateAge(LocalDate dob) {
        // Guard clause: reject null date of birth
        if (dob == null) {
            throw new IllegalArgumentException("Date of birth cannot be null.");
        }

        // Obtain the current system date for age computation
        LocalDate currentDate = LocalDate.now();

        // Compute the period between the date of birth and today, decomposed
        // into years, months, and days by the Period class
        Period period = Period.between(dob, currentDate);

        // Extract the individual components from the computed period
        int years = period.getYears();
        int months = period.getMonths();
        int days = period.getDays();

        // Encapsulate and return the result as an immutable AgeResult
        return new AgeResult(years, months, days);
    }
}
