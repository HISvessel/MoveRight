from flask import Flask
from app.api.user_namespace import user_api
from flask_restx import Api
from app.models.db_model import db
"""adding files for structure. This is where the create app function will be placed."""

def create_app():
    app = Flask()
    api = Api(app)

    #setting up the app configurations
    """app.config[] ='None'"""

    #adding namespaces from the Flask_RESTx api
    api.add_namespace(user_api, path='/user')

    #initializing the necessary concepts for the app function
    db.init_app(app)

    return app
