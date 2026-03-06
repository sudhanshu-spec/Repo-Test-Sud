package com.agecalculator.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

/**
 * Utility class for parsing date strings in DD/MM/YYYY format into
 * {@link java.time.LocalDate} objects.
 *
 * <p>This class uses a strict {@link DateTimeFormatter} configured with
 * {@link ResolverStyle#STRICT} to ensure robust validation that rejects
 * structurally invalid calendar dates such as {@code 31/02/2020},
 * {@code 00/13/1999}, or non-numeric input. The formatter is stored as an
 * immutable, thread-safe static constant for optimal performance and reuse.</p>
 *
 * <h3>Design Principles</h3>
 * <ul>
 *   <li><strong>Single Responsibility</strong>: This class handles ONLY
 *       date-string-to-{@code LocalDate} conversion. Business-rule validation
 *       (e.g., rejecting future dates) is the responsibility of
 *       {@code DateValidator}.</li>
 *   <li><strong>Encapsulation</strong>: The internal {@code DateTimeFormatter}
 *       is a private constant, not exposed to callers.</li>
 *   <li><strong>Stateless Utility</strong>: No mutable instance state; safe for
 *       concurrent use without synchronization.</li>
 * </ul>
 *
 * <h3>Usage Example</h3>
 * <pre>{@code
 *   DateParser parser = new DateParser();
 *   LocalDate dob = parser.parse("15/08/1995");
 *   // dob == LocalDate.of(1995, 8, 15)
 * }</pre>
 *
 * @see java.time.LocalDate
 * @see java.time.format.DateTimeFormatter
 * @see java.time.format.ResolverStyle#STRICT
 */
public class DateParser {

    /**
     * Date formatter configured for the {@code DD/MM/YYYY} input pattern with
     * strict calendar-date resolution.
     *
     * <p><strong>Pattern detail — {@code "dd/MM/uuuu"}:</strong></p>
     * <ul>
     *   <li>{@code dd}   — two-digit day of month (01–31, calendar-validated)</li>
     *   <li>{@code MM}   — two-digit month of year (01–12)</li>
     *   <li>{@code uuuu} — four-digit <em>proleptic</em> year</li>
     * </ul>
     *
     * <p><strong>Why {@code uuuu} instead of {@code yyyy}?</strong><br>
     * When {@link ResolverStyle#STRICT} is applied, the pattern letter
     * {@code y} represents "year-of-era" and <em>requires</em> an accompanying
     * era designator (AD/BC). Standard date input such as {@code "15/08/1995"}
     * lacks an era, causing a {@link DateTimeParseException}. The pattern
     * letter {@code u} represents the <em>proleptic year</em>, which works
     * correctly with {@code STRICT} mode without an era field.</p>
     *
     * <p><strong>Strict resolution guarantees:</strong></p>
     * <ul>
     *   <li>{@code 31/02/2020} is rejected (February never has 31 days)</li>
     *   <li>{@code 29/02/2000} is accepted (2000 is a leap year)</li>
     *   <li>{@code 29/02/1900} is rejected (1900 is NOT a leap year —
     *       divisible by 100 but not by 400)</li>
     *   <li>{@code 00/01/2020} is rejected (day zero is invalid)</li>
     *   <li>{@code 15/13/2020} is rejected (month 13 is invalid)</li>
     * </ul>
     */
    private static final DateTimeFormatter DATE_FORMATTER =
        DateTimeFormatter.ofPattern("dd/MM/uuuu")
            .withResolverStyle(ResolverStyle.STRICT);

    /**
     * Parses a date string in {@code DD/MM/YYYY} format into a
     * {@link LocalDate}.
     *
     * <p>The input string is trimmed of leading and trailing whitespace before
     * parsing, so {@code " 15/08/1995 "} will parse successfully. However,
     * the format must be exactly two-digit day, two-digit month, and four-digit
     * year separated by forward slashes — single-digit components (e.g.,
     * {@code "5/8/1995"}) and two-digit years (e.g., {@code "15/08/95"}) are
     * rejected.</p>
     *
     * <p>If parsing succeeds, a {@code LocalDate} representing the given
     * calendar date is returned. If parsing fails for any reason — malformed
     * structure, non-numeric characters, or an invalid calendar date — a
     * {@link DateTimeParseException} is thrown and allowed to propagate to the
     * caller for handling.</p>
     *
     * @param dateString the date string to parse; expected format is
     *                   {@code DD/MM/YYYY} (e.g., {@code "15/08/1995"}).
     *                   Leading/trailing whitespace is tolerated and trimmed
     *                   automatically.
     * @return the parsed {@link LocalDate} representing the supplied date
     * @throws IllegalArgumentException if {@code dateString} is {@code null},
     *         empty, or contains only whitespace
     * @throws DateTimeParseException   if {@code dateString} does not conform
     *         to the {@code DD/MM/YYYY} pattern or represents an invalid
     *         calendar date (e.g., {@code "31/02/2020"})
     */
    public LocalDate parse(String dateString) {
        // Guard clause: reject null or blank input with a descriptive message
        if (dateString == null || dateString.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Date input cannot be null or empty. "
                    + "Please enter a date in DD/MM/YYYY format.");
        }

        // Trim whitespace and delegate to the strict formatter.
        // LocalDate.parse() will throw DateTimeParseException for any
        // format mismatch or invalid calendar date (e.g., Feb 31).
        return LocalDate.parse(dateString.trim(), DATE_FORMATTER);
    }
}
