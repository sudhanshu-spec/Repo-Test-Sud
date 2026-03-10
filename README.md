# Repo-Test-Sud

A simple Python 3 Flask tutorial server application demonstrating basic HTTP route handling. This lightweight server exposes two GET endpoints and serves as a beginner-friendly introduction to building web applications with Flask.

## Description

Repo-Test-Sud is a minimal Flask web server designed as a tutorial and demo project. It showcases how to define routes, return responses, and configure a Flask application. The server provides two endpoints that return plain text greetings, making it an ideal starting point for learning Python web development with Flask.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Python 3.9+** (Python 3.11 recommended)
- **pip** (Python package manager, included with Python 3.9+)

You can verify your Python installation by running:

```bash
python --version
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Repo-Test-Sud
   ```

2. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   - On Linux / macOS:

     ```bash
     source venv/bin/activate
     ```

   - On Windows:

     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the Flask server using one of the following methods:

- **Using Python directly:**

  ```bash
  python app.py
  ```

- **Using the Flask CLI:**

  ```bash
  flask run --port 3000
  ```

The server runs on **port 3000** by default. Once started, you can access it at [http://localhost:3000](http://localhost:3000).

## API Reference

The server exposes the following endpoints:

| Endpoint       | Method | Response         | Status Code |
|----------------|--------|------------------|-------------|
| `/hello`       | GET    | `Hello world`    | 200 OK      |
| `/evening`     | GET    | `Good evening`   | 200 OK      |

### Example Requests

**GET /hello** — Returns a hello greeting:

```bash
curl http://localhost:3000/hello
```

Response:

```
Hello world
```

**GET /evening** — Returns an evening greeting:

```bash
curl http://localhost:3000/evening
```

Response:

```
Good evening
```

## Environment Variables

| Variable | Description                          | Default |
|----------|--------------------------------------|---------|
| `PORT`   | Override the default server port     | `3000`  |

### Example: Running on a Custom Port

```bash
PORT=5000 python app.py
```

This starts the server on port 5000 instead of the default 3000.
