Feature: User Login

  Scenario: Valid Login
    Given the login page is open
    When the user enters valid credentials
    And clicks the login button
    Then the user should be redirected

  Scenario: Invalid Login
    Given the login page is open
    When the user enters invalid credentials
    Then an error message should appear