# app/api/camera_namespace.py
"""
Camera API endpoints - manage camera sessions and streaming
"""

from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.camera import Camera
from app.models.user import User
from app import socketio
import base64
from flask_socketio import emit
from app.models.pose_model import PoseModel

pushup_camera_api = Namespace('pushup_camera', description='Pushup Camera operations')

# Dictionary to store active camera sessions
active_cameras = {}

# Dictionary to track active streaming tasks
active_streams = {}

# Dictionary to track which user owns which WebSocket session
session_to_user = {}

# CREATE POSE MODEL ONCE (reuse for all frames)
pose_model = PoseModel()

# Camera start input model
camera_start_input = pushup_camera_api.model('PushupCameraStart', {
    'source': fields.String(description='Camera source', 
                           example='http://192.168.0.8:4747/video')
})

# Camera response model
camera_response = pushup_camera_api.model('PushupCameraResponse', {
    'status': fields.String(description='Operation status'),
    'message': fields.String(description='Status message'),
    'fps': fields.Float(description='Current FPS')
})

@pushup_camera_api.route('/start')
class CameraStart(Resource):
    """Start camera session"""

    @pushup_camera_api.expect(camera_start_input)
    @pushup_camera_api.marshal_with(camera_response)
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
        #changed the previous IP address with a new one
        data = request.json or {}
        source = data.get('source', 'http://192.168.0.8:4747/video') #changed IP for my own source
        #source = data.get('source', 'http://192.168.0.6:8080/video')
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

@pushup_camera_api.route('/stop')
class CameraStop(Resource):
    """Stop camera session"""

    @pushup_camera_api.marshal_with(camera_response)
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

@pushup_camera_api.route('/capture')
class CameraCapture(Resource):
    """Capture picture from active camera"""

    @pushup_camera_api.marshal_with(camera_response)
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

@pushup_camera_api.route('/status')
class CameraStatus(Resource):
    """Check camera status"""

    @pushup_camera_api.marshal_with(camera_response)
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

# Handle WebSocket connection
@socketio.on('connect', namespace='/pushup_camera')
def handle_connect():
    print('[WEBSOCKET] Client connected to pushup camera namespace.')

# Handle WebSocket disconnection
@socketio.on('disconnect', namespace='/pushup_camera')
def handle_disconnect():
    print('[WEBSOCKET] Client disconnected from pushup camera namespace.')

    # Get the session ID of disconnected client
    session_id = request.sid

    # Check if we know which user this session belongs to
    if session_id not in session_to_user:
        print(f'[WEBSOCKET] Unknown session disconnected: {session_id}')
        return

    user_id = session_to_user[session_id]
    print(f'[WEBSOCKET] User {user_id} disconnected')

    # Stop streaming if active
    if user_id in active_streams:
        del active_streams[user_id]
        print(f'[WEBSOCKET] Stopped streaming for user {user_id}')

    # Stop camera if running
    if user_id in active_cameras:
        camera = active_cameras[user_id]
        camera.stop()
        del active_cameras[user_id]
        print(f'[WEBSOCKET] Stopped camera for user {user_id}')

    # Remove session mapping
    del session_to_user[session_id]
    print(f'[WEBSOCKET] Cleanup complete for user {user_id}')

# Handle frame request from client
@socketio.on('request_frame', namespace='/pushup_camera')
def handle_frame_request(data):
    """Send a single frame to the requesting client"""
    try:
        user_id = data.get('user_id')

        if user_id not in active_cameras:
            socketio.emit('error', {'message': 'No active camera session'}, namespace='/pushup_camera')
            return

        camera = active_cameras[user_id]

        if not camera.is_running():
            socketio.emit('error', {'message': 'Camera not running'}, namespace='/pushup_camera')
            return

        #interchanging regular frames with pushup frames
        frame = camera.get_pushup_frames()

        if frame is None:
            socketio.emit('error', {'message': 'No frame available'}, namespace='/pushup_camera')
            return
        #convert to 64 bytes->string-> and send to browser

        try:
            #convert to 64 bytes-> string and send to the browser
            frame_base64 = base64.b64encode(frame).decode('utf-8')
        except Exception as e:
            print(f'[POSE] Error in request_frame: {e}')
            socketio.emit('error', {'message': str(e)}, namespace='/pushup_camera')
            return
        socketio.emit('frame', {'image': frame_base64}, namespace='/pushup_camera')

    except Exception as e:
        socketio.emit('error', {'message': str(e)}, namespace='/pushup_camera')
# Background task for continuous streaming
def stream_frames(user_id):
    """Continuously capture and send frames for a user's camera"""
    if user_id not in active_cameras:
        return

    camera = active_cameras[user_id]

    while camera.is_running() and active_streams.get(user_id, False):
        frame = camera.get_pushup_frames()
        if frame is None:
            continue

        frame_base64 = base64.b64encode(frame).decode('utf-8') #replaced buffer.to_bytes()
        socketio.emit('frame', {'image': frame_base64}, namespace='/pushup_camera')
        socketio.sleep(0.033)

# Start continuous video streaming
@socketio.on('start_stream', namespace='/pushup_camera')
def handle_start_stream(data):
    """Start continuous frame streaming for user's camera"""
    try:
        user_id = data.get('user_id')

        # Track which session belongs to this user
        session_to_user[request.sid] = user_id

        if user_id not in active_cameras:
            socketio.emit('error', {'message': 'No active camera session'}, namespace='/pushup_camera')
            return

        camera = active_cameras[user_id]
        active_streams[user_id] = True
        socketio.start_background_task(stream_frames, user_id)

        socketio.emit('stream_started', {'status': 'streaming'}, namespace='/pushup_camera')

    except Exception as e:
        socketio.emit('error', {'message': str(e)}, namespace='/pushup_camera')

# Stop continuous video streaming
@socketio.on('stop_stream', namespace='/pushup_camera')
def handle_stop_stream(data):
    """Stop continuous frame streaming for user's camera"""
    try:
        user_id = data.get('user_id')

        if user_id in active_streams:
            del active_streams[user_id]

        socketio.emit('stream_stopped', {'status': 'stopped'}, namespace='/pushup_camera')

    except Exception as e:
        socketio.emit('error', {'message': str(e)}, namespace='/pushup_camera')
