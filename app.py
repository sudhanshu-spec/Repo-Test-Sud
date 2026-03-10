from flask import Flask
import os

app = Flask(__name__)


@app.route('/hello')
def hello():
    return 'Hello world'


@app.route('/evening')
def evening():
    return 'Good evening'


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
