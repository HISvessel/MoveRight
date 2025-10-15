# app/api/camera_namespace.py
"""
Camera API endpoints - manage camera sessions and streaming
"""

from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.camera import Camera
from app.models.user import User

camera_api = Namespace('camera', description='Camera operations')

# Dictionary to store active camera sessions
active_cameras = {}

# Camera start input model
camera_start_input = camera_api.model('CameraStart', {
    'source': fields.String(description='Camera source', 
                           example='http://192.168.0.7:8080/video')
})

# Camera response model
camera_response = camera_api.model('CameraResponse', {
    'status': fields.String(description='Operation status'),
    'message': fields.String(description='Status message'),
    'fps': fields.Float(description='Current FPS')
})

@camera_api.route('/start')
class CameraStart(Resource):
    """Start camera session"""
    
    @camera_api.expect(camera_start_input)
    @camera_api.marshal_with(camera_response)
    @jwt_required()
    def post(self):
        """Start camera for current user (requires login)"""
        # Get current user from token
        current_user_id = get_jwt_identity()
        
        # Check if user already has active camera
        if current_user_id in active_cameras:
            return {
                'status': 'error',
                'message': 'Camera already running for this user'
            }, 400
            
        # Get camera source from request (optional)
        data = request.json or {}
        source = data.get('source', 'http://192.168.0.7:8080/video')

        try:
            # Create camera instance for this user
            camera = Camera(source=source, user_id=current_user_id)
            
            # Store in active cameras
            active_cameras[current_user_id] = camera
            
            return {
                'status': 'started',
                'message': 'Camera started successfully',
                'fps': camera.get_fps()
            }, 200
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to start camera: {str(e)}'
            }, 500

@camera_api.route('/stop')
class CameraStop(Resource):
    """Stop camera session"""
    
    @camera_api.marshal_with(camera_response)
    @jwt_required()
    def post(self):
        """Stop camera for current user (requires login)"""
        # Get current user from token
        current_user_id = get_jwt_identity()
        
        # Check if user has active camera
        if current_user_id not in active_cameras:
            return {
                'status': 'error',
                'message': 'No active camera session'
            }, 404
        
        try:
            # Get camera instance
            camera = active_cameras[current_user_id]
            
            # Stop camera
            camera.stop()
            
            # Remove from active cameras
            del active_cameras[current_user_id]
            
            return {
                'status': 'stopped',
                'message': 'Camera stopped successfully'
            }, 200
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to stop camera: {str(e)}'
            }, 500
            
@camera_api.route('/capture')
class CameraCapture(Resource):
    """Capture picture from active camera"""
    
    @camera_api.marshal_with(camera_response)
    @jwt_required()
    def post(self):
        """Take picture from current user's camera (requires login)"""
        # Get current user from token
        current_user_id = get_jwt_identity()
        
        # Check if user has active camera
        if current_user_id not in active_cameras:
            return {
                'status': 'error',
                'message': 'No active camera session. Start camera first.'
            }, 404
        
        try:
            # Get camera instance
            camera = active_cameras[current_user_id]
            
            # Take picture
            filename = camera.take_picture()
            
            if filename:
                return {
                    'status': 'success',
                    'message': f'Picture saved: {filename}'
                }, 200
            else:
                return {
                    'status': 'error',
                    'message': 'Failed to capture picture'
                }, 500
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error capturing picture: {str(e)}'
            }, 500
            
@camera_api.route('/status')
class CameraStatus(Resource):
    """Check camera status"""
    
    @camera_api.marshal_with(camera_response)
    @jwt_required()
    def get(self):
        """Get camera status for current user (requires login)"""
        # Get current user from token
        current_user_id = get_jwt_identity()
        
        # Check if user has active camera
        if current_user_id in active_cameras:
            camera = active_cameras[current_user_id]
            return {
                'status': 'running',
                'message': 'Camera is active',
                'fps': camera.get_fps()
            }, 200
        else:
            return {
                'status': 'stopped',
                'message': 'No active camera session'
            }, 200