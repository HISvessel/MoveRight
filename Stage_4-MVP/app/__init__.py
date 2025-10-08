from flask import Flask
from app.api.user_namespace import user_api
from flask_restx import add_namespace
"""adding files for structure. This is where the create app function will be placed."""

def create_app():
    app = Flask()
    app.add_namespace(user_api)

    return app
