package com.agecalculator;

import com.agecalculator.service.AgeCalculatorService;
import com.agecalculator.model.AgeResult;
import java.time.format.DateTimeParseException;
import java.util.Scanner;

/**
 * Main entry point for the Age Calculator console application.
 *
 * <p>This class is responsible exclusively for console I/O interaction with the
 * user. It reads a Date of Birth from standard input, delegates all business
 * logic (parsing, validation, and age computation) to {@link AgeCalculatorService},
 * and displays the formatted result or a user-friendly error message.</p>
 *
 * <h3>Design Principles</h3>
 * <ul>
 *   <li><strong>Separation of Concerns</strong>: This class handles ONLY console
 *       I/O — no date parsing, validation, or calculation logic resides here.</li>
 *   <li><strong>OOP Encapsulation</strong>: Business logic is fully encapsulated
 *       within {@link AgeCalculatorService} and its dependencies.</li>
 *   <li><strong>Resource Management</strong>: The {@link Scanner} is managed via
 *       try-with-resources to guarantee proper closure of the {@code System.in}
 *       stream wrapper.</li>
 *   <li><strong>Robust Error Handling</strong>: All exceptions are caught and
 *       translated into descriptive, user-friendly messages — raw stack traces
 *       are never exposed to the user.</li>
 * </ul>
 *
 * <h3>Usage</h3>
 * <pre>{@code
 *   // Compile (from project root):
 *   javac -d out src/main/java/com/agecalculator/model/AgeResult.java
 *   javac -d out -cp out src/main/java/com/agecalculator/util/DateParser.java \
 *                        src/main/java/com/agecalculator/util/DateValidator.java
 *   javac -d out -cp out src/main/java/com/agecalculator/service/AgeCalculatorService.java
 *   javac -d out -cp out src/main/java/com/agecalculator/AgeCalculatorApp.java
 *
 *   // Run:
 *   java -cp out com.agecalculator.AgeCalculatorApp
 *
 *   // Example interaction:
 *   Enter your Date of Birth (DD/MM/YYYY): 15/08/1995
 *   Your age is 30 years, 6 months, and 19 days.
 * }</pre>
 *
 * @author Age Calculator Application
 * @version 1.0
 * @see AgeCalculatorService
 * @see AgeResult
 */
public class AgeCalculatorApp {

    /**
     * Application entry point. Prompts the user for their Date of Birth in
     * {@code DD/MM/YYYY} format, computes the exact age, and displays the
     * result as years, months, and days.
     *
     * <p>The method follows this execution flow:</p>
     * <ol>
     *   <li>Opens a {@link Scanner} on {@code System.in} via try-with-resources</li>
     *   <li>Prompts the user with {@code "Enter your Date of Birth (DD/MM/YYYY): "}</li>
     *   <li>Reads and trims the input line</li>
     *   <li>Validates that the input is not empty</li>
     *   <li>Delegates to {@link AgeCalculatorService#calculateAge(String)} for
     *       parsing, validation, and computation</li>
     *   <li>Displays the result via {@link AgeResult#toString()}</li>
     * </ol>
     *
     * <p>Error handling catches three exception tiers:</p>
     * <ul>
     *   <li>{@link DateTimeParseException} — malformed or invalid calendar dates</li>
     *   <li>{@link IllegalArgumentException} — business rule violations (e.g., future dates)</li>
     *   <li>{@link Exception} — safety net for any unexpected runtime errors</li>
     * </ul>
     *
     * @param args command-line arguments (not used by this application)
     */
    public static void main(String[] args) {
        // Use try-with-resources to ensure the Scanner is properly closed
        try (Scanner scanner = new Scanner(System.in)) {

            // Prompt the user for input (print without newline so cursor stays on same line)
            System.out.print("Enter your Date of Birth (DD/MM/YYYY): ");

            // Read and trim the user's input
            String dobInput = scanner.nextLine().trim();

            // Validate that the user provided non-empty input
            if (dobInput.isEmpty()) {
                System.out.println("Error: No input provided. Please enter a date in DD/MM/YYYY format.");
                return;
            }

            // Instantiate the age calculation service (encapsulates all business logic)
            AgeCalculatorService service = new AgeCalculatorService();

            // Attempt to calculate age and display the result
            try {
                // Delegate parsing, validation, and computation to the service
                AgeResult result = service.calculateAge(dobInput);

                // Display the formatted age result
                System.out.println(result.toString());

            } catch (DateTimeParseException e) {
                // Handle malformed or invalid date input (e.g., "31/02/2020", "abc", "2020-01-01")
                System.out.println("Error: Invalid date format. Please enter date in DD/MM/YYYY format.");

            } catch (IllegalArgumentException e) {
                // Handle business rule violations (e.g., future date, null input)
                // The exception message from DateValidator is already user-friendly
                System.out.println("Error: " + e.getMessage());

            } catch (Exception e) {
                // Safety net for any unexpected runtime errors
                System.out.println("Error: An unexpected error occurred. " + e.getMessage());
            }
        }
    }
}
