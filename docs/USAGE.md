# Age Calculator — Usage Guide

This document provides detailed usage instructions for the **Age Calculator** Java console application. The Age Calculator computes a user's exact age in **years**, **months**, and **days** from their entered Date of Birth (DOB). It accepts input via the console, validates the date, and displays the calculated age in a clear, human-readable format.

---

## Prerequisites

Before compiling and running the Age Calculator, ensure the following requirements are met:

- **Java Development Kit (JDK) 17 or higher** is required. OpenJDK 17+ is recommended.

Verify your Java installation by running the following commands in your terminal:

```bash
java -version
```

Expected output (version number should be **17 or higher**):

```
openjdk version "17.0.x" 2024-xx-xx
OpenJDK Runtime Environment (build 17.0.x+xx)
OpenJDK 64-Bit Server VM (build 17.0.x+xx, mixed mode, sharing)
```

Also verify the Java compiler:

```bash
javac -version
```

Expected output:

```
javac 17.0.x
```

**No external dependencies are required.** The application uses only the Java Standard Library (`java.time.*`, `java.util.Scanner`). There is no need for any third-party libraries or package managers.

**No build tools are needed.** The project uses direct `javac` compilation — no additional tooling is necessary.

---

## How to Compile

Follow these steps to compile the Age Calculator from source:

**1. Navigate to the project root directory:**

```bash
cd /path/to/project-root
```

**2. Create the output directory** (if it does not already exist):

```bash
mkdir -p out
```

**3. Compile all Java source files:**

```bash
javac -d out src/main/java/com/agecalculator/*.java src/main/java/com/agecalculator/model/*.java src/main/java/com/agecalculator/service/*.java src/main/java/com/agecalculator/util/*.java
```

**Explanation of the compile command:**

- `-d out` — Directs all compiled `.class` files to the `out/` directory, preserving the package directory structure.
- `src/main/java/com/agecalculator/*.java` — Compiles the main entry point class (`AgeCalculatorApp.java`).
- `src/main/java/com/agecalculator/model/*.java` — Compiles the model class (`AgeResult.java`).
- `src/main/java/com/agecalculator/service/*.java` — Compiles the service class (`AgeCalculatorService.java`).
- `src/main/java/com/agecalculator/util/*.java` — Compiles the utility classes (`DateParser.java`, `DateValidator.java`).

The project follows a standard Java package structure: `com.agecalculator` is the base package, with sub-packages `model`, `service`, and `util` organizing the code by responsibility.

**Expected result:** After successful compilation, the `out/` directory will contain the following compiled class files:

```
out/
└── com/
    └── agecalculator/
        ├── AgeCalculatorApp.class
        ├── model/
        │   └── AgeResult.class
        ├── service/
        │   └── AgeCalculatorService.class
        └── util/
            ├── DateParser.class
            └── DateValidator.class
```

---

## How to Run

After compiling, run the application using the following command:

```bash
java -cp out com.agecalculator.AgeCalculatorApp
```

**Explanation of the run command:**

- `-cp out` — Sets the classpath to the `out/` directory where the compiled `.class` files reside.
- `com.agecalculator.AgeCalculatorApp` — The fully qualified name of the main class containing the `main()` method.

The application will start and prompt you to enter your Date of Birth.

---

## Input Format

The Date of Birth must be entered in the **`DD/MM/YYYY`** format exclusively:

| Component | Description           | Range   |
|-----------|-----------------------|---------|
| `DD`      | Two-digit day         | 01–31   |
| `MM`      | Two-digit month       | 01–12   |
| `YYYY`    | Four-digit year       | 0001–9999 |
| `/`       | Forward slash separator | —     |

**Examples of valid input:**

- `15/08/1995` — August 15, 1995
- `01/01/2000` — January 1, 2000
- `29/02/2000` — February 29, 2000 (valid leap year date)

**Examples of invalid input:**

- `2020-01-01` — Wrong format (uses hyphens instead of forward slashes and wrong field order)
- `8/5/1995` — Missing leading zeros (the strict formatter expects exactly two digits for day and month)
- `15-08-1995` — Wrong separator (uses hyphens instead of forward slashes)
- `hello` — Non-date text input

---

## Output Format

Upon successful calculation, the application displays the result in the **exact format**:

```
Your age is X years, Y months, and Z days.
```

Where:

- **X** = number of complete years
- **Y** = number of additional complete months
- **Z** = number of additional days

The period (`.`) at the end is part of the format.

---

## Usage Examples

### Standard Calculation

```
Enter your Date of Birth (DD/MM/YYYY): 15/08/1995
Your age is 30 years, 6 months, and 19 days.
```

> **Note:** The actual age values displayed will vary depending on the current system date when you run the application. The values shown above are illustrative examples only.

### Another Example

```
Enter your Date of Birth (DD/MM/YYYY): 01/01/2000
Your age is 26 years, 2 months, and 5 days.
```

> **Note:** Actual output values depend on the current system date.

---

## Error Scenarios

The application validates all user input and displays clear, user-friendly error messages when invalid data is entered. Below are all documented error scenarios.

### Invalid Date Format

When the user enters a date that does not conform to the `DD/MM/YYYY` format, the application displays an error message.

**Example — wrong date format (ISO format):**

```
Enter your Date of Birth (DD/MM/YYYY): 2020-01-01
Error: Invalid date format. Please enter date in DD/MM/YYYY format.
```

**Example — non-date text input:**

```
Enter your Date of Birth (DD/MM/YYYY): hello
Error: Invalid date format. Please enter date in DD/MM/YYYY format.
```

### Invalid Calendar Date

When the user enters a date that uses the correct format but does not exist on the calendar, the application rejects it.

**Example — February 31st does not exist:**

```
Enter your Date of Birth (DD/MM/YYYY): 31/02/2020
Error: Invalid date. The date 31/02/2020 does not exist. Please enter a valid date in DD/MM/YYYY format.
```

**Example — month 13 does not exist:**

```
Enter your Date of Birth (DD/MM/YYYY): 00/13/1999
Error: Invalid date format. Please enter date in DD/MM/YYYY format.
```

### Future Date

When the user enters a date that is in the future (after the current system date), the application rejects it.

**Example:**

```
Enter your Date of Birth (DD/MM/YYYY): 25/12/2030
Error: Date of birth cannot be in the future. Please enter a past date.
```

---

## Edge Cases

### Leap Year Dates

The application correctly handles leap year validation:

- **`29/02/2000` is a valid date** — The year 2000 is a leap year because it is divisible by 400.
- **`29/02/1900` is NOT a valid date** — The year 1900 is not a leap year because, although it is divisible by 100, it is not divisible by 400.

**Example — valid leap year date:**

```
Enter your Date of Birth (DD/MM/YYYY): 29/02/2000
Your age is 26 years, 0 months, and 5 days.
```

> **Note:** Actual output values depend on the current system date.

**Example — invalid leap year date:**

```
Enter your Date of Birth (DD/MM/YYYY): 29/02/1900
Error: Invalid date. The date 29/02/1900 does not exist. Please enter a valid date in DD/MM/YYYY format.
```

### Born Today

If the user enters today's date as their Date of Birth, the application correctly calculates an age of zero:

```
Enter your Date of Birth (DD/MM/YYYY): [today's date in DD/MM/YYYY]
Your age is 0 years, 0 months, and 0 days.
```

This is valid output — the application handles this edge case gracefully.

---

## Project Structure

The Age Calculator application is organized into the following source files within the `src/main/java/com/agecalculator/` directory:

| File | Package | Role |
|------|---------|------|
| `AgeCalculatorApp.java` | `com.agecalculator` | Entry point — contains the `main()` method, handles console I/O and user interaction |
| `AgeCalculatorService.java` | `com.agecalculator.service` | Core business logic — orchestrates date parsing, validation, and age computation |
| `AgeResult.java` | `com.agecalculator.model` | Model class — encapsulates the result as years, months, and days with formatted output |
| `DateParser.java` | `com.agecalculator.util` | Utility — parses `DD/MM/YYYY` date strings into `LocalDate` objects using strict formatting |
| `DateValidator.java` | `com.agecalculator.util` | Utility — validates parsed dates, rejecting future dates and other invalid inputs |

**Directory layout:**

```
src/
└── main/
    └── java/
        └── com/
            └── agecalculator/
                ├── AgeCalculatorApp.java
                ├── model/
                │   └── AgeResult.java
                ├── service/
                │   └── AgeCalculatorService.java
                └── util/
                    ├── DateParser.java
                    └── DateValidator.java
```

---

## Troubleshooting

### "Error: Could not find or load main class"

This error occurs when Java cannot locate the compiled class files.

**Solution:** Ensure you compiled the source files with the `-d out` flag and are running the application with the `-cp out` classpath option:

```bash
javac -d out src/main/java/com/agecalculator/*.java src/main/java/com/agecalculator/model/*.java src/main/java/com/agecalculator/service/*.java src/main/java/com/agecalculator/util/*.java
java -cp out com.agecalculator.AgeCalculatorApp
```

Also verify that the `out/` directory contains the expected `.class` files with the correct package directory structure.

### "javac: command not found"

This error means the Java Development Kit is not installed or not in your system PATH.

**Solution:** Install Java JDK 17 or higher and ensure `JAVA_HOME` is set correctly:

```bash
# Check if JAVA_HOME is set
echo $JAVA_HOME

# On Linux (Ubuntu/Debian), install OpenJDK 17:
sudo apt-get install -y openjdk-17-jdk-headless

# Set JAVA_HOME (add to ~/.bashrc for persistence):
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

### Unexpected Date Parsing Behavior

If the application is not parsing your date input as expected:

- Ensure you are using the exact **`DD/MM/YYYY`** format.
- Day and month must have **leading zeros** (e.g., `01` not `1`, `08` not `8`).
- Use **forward slashes** (`/`) as separators — not hyphens (`-`), dots (`.`), or spaces.
- The year must be a **four-digit** number (e.g., `1995` not `95`).

**Correct:** `05/03/1990`
**Incorrect:** `5/3/1990`, `05-03-1990`, `1990/03/05`
