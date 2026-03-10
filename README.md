# Repo-Test-Sud

Testing Existing and New Projects - Flask Implementation

## Description

This is a Flask tutorial project demonstrating fundamental server-side Python concepts through practical implementation. The project showcases the progression from vanilla Flask server implementation to framework-based development patterns.

## Prerequisites

- Python 3.9 or higher
- pip (Python package installer)
- Virtual environment support (venv module)

## Setup Instructions

### Create Virtual Environment

```bash
python3 -m venv venv
```

### Activate Virtual Environment

**macOS/Linux**:

```bash
source venv/bin/activate
```

**Windows**:

```cmd
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Run the Application

```bash
python app.py
```

Or using Flask CLI:

```bash
flask run --port 3000
```

The server will start on `http://127.0.0.1:3000/`.

## Testing Endpoints

### Using cURL

```bash
curl http://localhost:3000/hello
# Returns: Hello world

curl http://localhost:3000/evening
# Returns: Good evening
```

### Using a Browser

Navigate to the following URLs in your browser:

- [http://localhost:3000/hello](http://localhost:3000/hello) — Returns "Hello world"
- [http://localhost:3000/evening](http://localhost:3000/evening) — Returns "Good evening"

## Endpoints

| Method | Path       | Response       |
|--------|------------|----------------|
| GET    | `/hello`   | Hello world    |
| GET    | `/evening` | Good evening   |

## Project Structure

```
Repo-Test-Sud/
├── app.py              # Main Flask application with route definitions
├── requirements.txt    # Python package dependencies
├── .python-version     # Python version specification
├── .gitignore          # Git exclusion patterns
└── README.md           # Project documentation
```
