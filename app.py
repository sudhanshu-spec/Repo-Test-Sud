from flask import Flask
import os

app = Flask(__name__)


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    return response


@app.route('/hello')
def hello():
    return 'Hello world'


@app.route('/evening')
def evening():
    return 'Good evening'


if __name__ == '__main__':
    from werkzeug.serving import WSGIRequestHandler
    WSGIRequestHandler.version_string = lambda self: 'Flask'
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
