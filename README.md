# Age Calculator

A Java console application that calculates a user's exact age in years, months, and days from their entered Date of Birth (DOB). Built using the Java `java.time` API — specifically `java.time.LocalDate`, `java.time.Period`, and `java.time.format.DateTimeFormatter` — the application provides precise age computation with robust input validation and clear, user-friendly output.

## Features

- Accepts Date of Birth in `DD/MM/YYYY` format
- Calculates exact age in years, months, and days
- Robust input validation (rejects future dates, invalid calendar dates like `31/02/2020`)
- Handles leap year dates correctly (e.g., `29/02/2000` is accepted, `29/02/1900` is rejected)
- User-friendly error messages for all invalid input scenarios
- Object-Oriented Design with clean separation of concerns

## Prerequisites

- **Java 17** or higher (OpenJDK 17+ recommended)
- No external dependencies required (uses only the Java Standard Library)

## Project Structure

```
├── src/
│   ├── main/java/com/agecalculator/
│   │   ├── AgeCalculatorApp.java          (Entry point)
│   │   ├── model/
│   │   │   └── AgeResult.java             (Result model)
│   │   ├── service/
│   │   │   └── AgeCalculatorService.java  (Business logic)
│   │   └── util/
│   │       ├── DateParser.java            (Date parsing)
│   │       └── DateValidator.java         (Date validation)
│   └── test/java/com/agecalculator/
│       ├── service/
│       │   └── AgeCalculatorServiceTest.java
│       └── util/
│           ├── DateParserTest.java
│           └── DateValidatorTest.java
├── docs/
│   └── USAGE.md
├── .gitignore
└── README.md
```

## Build and Run Instructions

### Step 1: Compile the Source Files

From the project root directory, compile all Java source files into the `out/` output directory:

```bash
javac -d out src/main/java/com/agecalculator/model/AgeResult.java \
             src/main/java/com/agecalculator/util/DateParser.java \
             src/main/java/com/agecalculator/util/DateValidator.java \
             src/main/java/com/agecalculator/service/AgeCalculatorService.java \
             src/main/java/com/agecalculator/AgeCalculatorApp.java
```

### Step 2: Run the Application

```bash
java -cp out com.agecalculator.AgeCalculatorApp
```

### Step 3 (Optional): Compile and Run Tests

Compile the test files:

```bash
javac -d out -cp out src/test/java/com/agecalculator/util/DateParserTest.java \
                     src/test/java/com/agecalculator/util/DateValidatorTest.java \
                     src/test/java/com/agecalculator/service/AgeCalculatorServiceTest.java
```

Run the tests with assertions enabled:

```bash
java -cp out -ea com.agecalculator.util.DateParserTest
java -cp out -ea com.agecalculator.util.DateValidatorTest
java -cp out -ea com.agecalculator.service.AgeCalculatorServiceTest
```

## Usage Example

### Successful Age Calculation

```
Enter your Date of Birth (DD/MM/YYYY): 15/08/1995
Your age is 30 years, 6 months, and 19 days.
```

### Invalid Calendar Date

```
Enter your Date of Birth (DD/MM/YYYY): 31/02/2020
Error: Invalid date format. Please enter date in DD/MM/YYYY format.
```

### Future Date

```
Enter your Date of Birth (DD/MM/YYYY): 25/12/2030
Error: Date of birth cannot be in the future. Please enter a past date.
```

## Documentation

For detailed usage documentation, including all supported input scenarios and error messages, see [docs/USAGE.md](docs/USAGE.md).
