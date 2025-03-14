"""
Main application module - Simplified version.
"""

from flask import Flask

import app.routes as routes
from app.config import DEBUG, HOST, PORT


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, template_folder="app/templates", static_folder="app/static")

    # Register routes
    routes.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=DEBUG, host=HOST, port=PORT)
