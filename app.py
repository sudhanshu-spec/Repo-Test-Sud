"""
Flask Tutorial Server
Educational demonstration of Flask web framework patterns
Equivalent to Node.js/Express.js tutorial implementation

Endpoints:
  GET /hello  - Returns "Hello world"
  GET /evening - Returns "Good evening"
"""

from flask import Flask

# Phase 1: Basic Flask application instance creation
app = Flask(__name__)

# Phase 2: Route definitions using decorator pattern


@app.route('/hello', methods=['GET'])
def hello():
    """
    Handle GET requests to /hello endpoint
    Returns: Plain text "Hello world"
    Equivalent to Express:
    app.get('/hello', (req, res) => res.send('Hello world'))
    """
    return 'Hello world'


@app.route('/evening', methods=['GET'])
def evening():
    """
    Handle GET requests to /evening endpoint
    Returns: Plain text "Good evening"
    Equivalent to Express:
    app.get('/evening', (req, res) => res.send('Good evening'))
    """
    return 'Good evening'


# Server initialization and startup
if __name__ == '__main__':
    port = 3000
    print(f'* Server running on http://127.0.0.1:{port}/')
    print(f'* Press CTRL+C to quit')
    app.run(host='127.0.0.1', port=port, debug=True)
