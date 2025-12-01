CREATE TABLE users(
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100)
);

INSERT INTO users VALUES (1,'John','a@b.com');
INSERT INTO users VALUES (2,'Mary','x@y.com');
SELECT * FROM users;
