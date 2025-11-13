# app/__init__.py
"""
Application Factory for Move Right

This module creates and configures the Flask application.
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from app.models.db_model import db
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO 

# Create SocketIO instance
socketio = SocketIO(cors_allowed_origins="*")  # Allows browser from ANY origin to connect

def create_app():
    """
    Application factory function.

    Creates and configures a Flask application instance.

    Returns:
        Flask: Configured Flask application
    """

    # Step 1: Create Flask application instance
    app = Flask(__name__)

    # Step 2: Load configuration
    app.config.from_object(Config)

    # CORS Configuration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173", "https://moveright-frontend.ondis.co" ], 
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Step 3: Initialize database
    db.init_app(app)

    # Step 4: Initialize JWT Manager
    jwt = JWTManager(app)

    # Step 5: Initialize SocketIO
    socketio.init_app(app) #an error here, but why?

    # Import models BEFORE creating tables
    from app.models.user import User
    from app.models.review import Review
    from app.models.workout_result import WorkoutResult

    # Step 6: Create tables (if they don't exist)
    with app.app_context():
        db.create_all()

    # Swagger JWT Auth config (for testing in Swagger UI)
    authorizations = {
        'BearerAuth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Add: **Bearer &lt;your_JWT_token&gt;**'
        }
    }

    # Create API instance with JWT support in Swagger
    api = Api(
        app,
        title='Move Right API',
        version='1.0',
        description='Fitness form correction API',
        authorizations=authorizations,
        security='BearerAuth'
    )

    # Register namespaces
    from app.api.user_namespace import user_api
    from app.api.review_namespace import review_api
    from app.api.auth_namespace import auth_api
    from app.api.camera_namespace import camera_api
    from app.api.result_namespace import workout_api
    from app.api.pushup_camera_namespace import pushup_camera_api    
    from app.api.squat_camera_namespace import squat_camera_api
    api.add_namespace(user_api, path='/users')
    api.add_namespace(review_api, path='/reviews')
    api.add_namespace(auth_api, path='/auth')
    api.add_namespace(camera_api, path='/camera')
    api.add_namespace(pushup_camera_api, path='/pushup_camera')

    #added new namespaces. they replicate the original camera namespace for two different camera modes
    #they are inactive until called from front end
    api.add_namespace(squat_camera_api, path='/squat_camera')
    api.add_namespace(workout_api, path='/workout-results')

    # Test route for camera streaming
    @app.route('/camera-test')
    def camera_test():
        from flask import send_from_directory
        return send_from_directory('web', 'camera_test.html')

    # Return configured app
    return app
