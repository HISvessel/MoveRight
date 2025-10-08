from flask import Flask
from app.api.user_namespace import user_api
from app.api.review_namespace import review_api
from flask_restx import Api
from app.models.db_model import db
"""adding files for structure. This is where the create app function will be placed."""

def create_app():
    app = Flask(__name__)
    api = Api(app)

    #setting up the app configurations
    app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///move_right.db' 
    app.config('TESTING') = True

    #adding namespaces from the Flask_RESTx api
    api.add_namespace(user_api, path='/users')
    api.add_namespace(review_api, path='/reviews')
    
    #initializing the necessary concepts for the app function
    db.init_app(app)

    return app
