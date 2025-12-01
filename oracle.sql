CREATE TABLE employees(
  id NUMBER PRIMARY KEY,
  name VARCHAR2(50),
  salary NUMBER
);

INSERT INTO employees VALUES (1, 'John', 50000);
INSERT INTO employees VALUES (2, 'Mary', 60000);
INSERT INTO employees VALUES (3, 'David', 55000);

SELECT * FROM employees;
