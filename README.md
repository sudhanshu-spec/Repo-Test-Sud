# Repo-Test-Sud

A simple Python 3 Flask tutorial server application demonstrating basic HTTP endpoint routing.

## Description

Repo-Test-Sud is a lightweight web server built with Python and the Flask framework. It serves as a beginner-friendly tutorial and demo application, exposing two GET endpoints that return plain-text greetings. The project showcases fundamental Flask concepts including route registration, request handling, and server configuration.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Python 3.9+** (Python 3.11 recommended)
- **pip** (Python package manager, included with Python 3.9+)

You can verify your Python installation by running:

```bash
python --version
```

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Repo-Test-Sud
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:

   - **Linux / macOS**:

     ```bash
     source venv/bin/activate
     ```

   - **Windows**:

     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the server using one of the following methods:

- **Using Python directly**:

  ```bash
  python app.py
  ```

- **Using the Flask CLI**:

  ```bash
  flask run --port 3000
  ```

The server runs on **port 3000** by default and will be accessible at `http://localhost:3000`.

## API Reference

The application exposes the following endpoints:

| Endpoint       | Method | Response         | Status Code |
|----------------|--------|------------------|-------------|
| `/hello`       | GET    | `Hello world`    | 200 OK      |
| `/evening`     | GET    | `Good evening`   | 200 OK      |

### Examples

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
| `PORT`   | Override the port the server runs on | `3000`  |

To start the server on a custom port, set the `PORT` environment variable:

```bash
PORT=5000 python app.py
```

## Project Structure

```
Repo-Test-Sud/
├── app.py               # Main Flask application
├── requirements.txt     # Python dependencies
├── .python-version      # Python version specification
├── .gitignore           # Git ignore patterns
└── README.md            # Project documentation
```
