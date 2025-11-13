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
from app.services.svm_classifier import SVMFormClassifier

camera_api = Namespace('camera', description='Camera operations')

# Dictionary to store active camera sessions
active_cameras = {}

# Dictionary to track active streaming tasks
active_streams = {}

# Dictionary to track which user owns which WebSocket session
session_to_user = {}

# CREATE POSE MODEL ONCE (reuse for all frames)
pose_model = PoseModel()

# Load SVM
try:
    svm_classifier = SVMFormClassifier()
except:
    svm_classifier = None
    print("⚠️ SVM not loaded")

# Camera start input model
camera_start_input = camera_api.model('CameraStart', {
    'source': fields.String(description='Camera source (e.g., http://... or 0). If omitted, will auto-detect webcam.', 
                           required=False) # <-- Make source optional
})

# Camera response model
camera_response = camera_api.model('CameraResponse', {
    'status': fields.String(description='Operation status'),
    'message': fields.String(description='Status message'),
    'fps': fields.Float(description='Current FPS')
})

def analyze_frame_with_svm(frame, exercise_type='pushup'):
    """Analyze frame with MediaPipe + SVM"""
    import cv2
    
    # MediaPipe pose detection
    pose_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose_model.pose.process(pose_frame)
    
    if not results.pose_landmarks:
        return None
    
    landmarks = results.pose_landmarks.landmark
    
    # Calculate angles based on exercise
    if exercise_type == 'pushup':
        l_shoulder = [landmarks[11].x, landmarks[11].y]
        l_elbow = [landmarks[13].x, landmarks[13].y]
        l_wrist = [landmarks[15].x, landmarks[15].y]
        l_hip = [landmarks[23].x, landmarks[23].y]
        l_ankle = [landmarks[27].x, landmarks[27].y]
        l_ear = [landmarks[7].x, landmarks[7].y]
        
        elbow_angle = pose_model.calculate_joint_angle(l_shoulder, l_elbow, l_wrist)
        body_angle = pose_model.calculate_joint_angle(l_shoulder, l_hip, l_ankle)
        shoulder_angle = pose_model.calculate_joint_angle(l_ear, l_shoulder, l_elbow)
        
        angles = [elbow_angle, body_angle, shoulder_angle]
        angle_dict = {
            'elbow': round(elbow_angle, 1),
            'body': round(body_angle, 1),
            'shoulder': round(shoulder_angle, 1)
        }
    else:  # squat
        l_hip = [landmarks[23].x, landmarks[23].y]
        l_knee = [landmarks[25].x, landmarks[25].y]
        l_ankle = [landmarks[27].x, landmarks[27].y]
        l_shoulder = [landmarks[11].x, landmarks[11].y]
        
        knee_angle = pose_model.calculate_joint_angle(l_hip, l_knee, l_ankle)
        hip_angle = pose_model.calculate_joint_angle(l_shoulder, l_hip, l_knee)
        back_angle = pose_model.calculate_joint_angle(l_shoulder, l_hip, l_ankle)
        
        angles = [knee_angle, hip_angle, back_angle]
        angle_dict = {
            'knee': round(knee_angle, 1),
            'hip': round(hip_angle, 1),
            'back': round(back_angle, 1)
        }
    
    # SVM prediction
    svm_result = None
    if svm_classifier:
        svm_result = svm_classifier.predict_form(exercise_type, angles)
    
    return {
        'angles': angle_dict,
        'svm': svm_result
    }
    
@camera_api.route('/start')
class CameraStart(Resource):
    """Start camera session"""

    @camera_api.expect(camera_start_input)
    @camera_api.marshal_with(camera_response)
    @jwt_required()
    def post(self):
        """Start camera for current user (requires login)"""
        current_user_id = get_jwt_identity()

        # 1. This is improved logic: Stop the user's old camera if they start a new one.
        if current_user_id in active_cameras:
            print(f"[API] Stopping existing camera for user {current_user_id}")
            active_cameras[current_user_id].stop()
            del active_cameras[current_user_id]

        data = request.json or {}
        
        # 2. This is the dynamic source fix:
        # 'source' will be None if not provided, triggering auto-detect in camera.py.
        source = data.get('source') 

        try:
            # Create camera instance
            # The Camera's __init__ method AUTOMATICALLY starts its own thread.
            camera = Camera(source=source, user_id=current_user_id)
            
            # Store in active cameras
            active_cameras[current_user_id] = camera

            print(f"[API] Camera started for user {current_user_id} with source: {camera.source}")
            return {
                'status': 'started',
                'message': f'Camera started successfully with source: {camera.source}',
                'fps': camera.get_fps()
            }, 200

        except Exception as e:
            # 4. CRITICAL BUG FIX (This is still correct):
            # Removed camera.stop(). If camera = Camera(...) fails,
            # 'camera' does not exist, and calling camera.stop() crashes.
            print(f"[API] Error starting camera for user {current_user_id}: {str(e)}")
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

# Handle WebSocket connection
@socketio.on('connect', namespace='/camera')
def handle_connect():
    print('[WEBSOCKET] Client connected to camera namespace')

# Handle WebSocket disconnection
@socketio.on('disconnect', namespace='/camera')
def handle_disconnect():
    print('[WEBSOCKET] Client disconnected from camera namespace')

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
@socketio.on('request_frame', namespace='/camera')
def handle_frame_request(data):
    """Send a single frame to the requesting client"""
    try:
        user_id = data.get('user_id')
        exercise_type = data.get('exercise', 'pushup')  # NEW: get exercise type

        if user_id not in active_cameras:
            socketio.emit('error', {'message': 'No active camera session'}, namespace='/camera')
            return

        camera = active_cameras[user_id]

        if not camera.is_running():
            socketio.emit('error', {'message': 'Camera not running'}, namespace='/camera')
            return

        # NEW: Analyze raw frame with SVM
        raw_frame = camera.get_frame()
        analysis = None
        if raw_frame is not None:
            analysis = analyze_frame_with_svm(raw_frame, exercise_type)

        # Get JPEG frame (same as before)
        frame = camera.get_jpeg_frame()

        if frame is None:
            socketio.emit('error', {'message': 'No frame available'}, namespace='/camera')
            return

        # Encode to base64 (same as before)
        frame_base64 = base64.b64encode(frame).decode('utf-8')
        
        # NEW: Send frame + analysis
        socketio.emit('frame', {
            'image': frame_base64,
            'analysis': analysis  # NEW: include SVM results
        }, namespace='/camera')

    except Exception as e:
        print(f'[ERROR] {e}')
        socketio.emit('error', {'message': str(e)}, namespace='/camera')
# Background task for continuous streaming
def stream_frames(user_id, exercise_type='pushup'):
    """Continuously capture and send frames for a user's camera"""
    print(f"[STREAM] Starting stream_frames for user {user_id}, exercise: {exercise_type}")  # ADD THIS
    
    if user_id not in active_cameras:
        print(f"[STREAM] ERROR: User {user_id} not in active_cameras")  # ADD THIS
        return

    camera = active_cameras[user_id]

    while camera.is_running() and active_streams.get(user_id, False):
        try:  # ADD THIS
            # Get raw frame for analysis
            raw_frame = camera.get_frame()
            
            # Analyze with SVM
            analysis = None
            if raw_frame is not None:
                analysis = analyze_frame_with_svm(raw_frame, exercise_type)
                print(f"[STREAM] Analysis result: {analysis}")  # ADD THIS
            
            # Get JPEG frame
            frame = camera.get_jpeg_frame()
            if frame is None:
                continue

            frame_base64 = base64.b64encode(frame).decode('utf-8')
            socketio.emit('frame', {
                'image': frame_base64,
                'analysis': analysis
            }, namespace='/camera')
            socketio.sleep(0.033)
            
        except Exception as e:  # ADD THIS
            print(f"[STREAM] ERROR in loop: {e}")  # ADD THIS
            import traceback  # ADD THIS
            traceback.print_exc()  # ADD THIS
            break  # ADD THIS

# Start continuous video streaming
@socketio.on('start_stream', namespace='/camera')
def handle_start_stream(data):
    """Start continuous frame streaming for user's camera"""
    try:
        user_id = data.get('user_id')
        exercise_type = data.get('exercise')
        if not exercise_type:
            socketio.emit('error', {'message': 'Exercise type required'}, namespace='/camera')
            return

        # Track which session belongs to this user
        session_to_user[request.sid] = user_id

        if user_id not in active_cameras:
            socketio.emit('error', {'message': 'No active camera session'}, namespace='/camera')
            return

        camera = active_cameras[user_id]
        active_streams[user_id] = True
        socketio.start_background_task(stream_frames, user_id, exercise_type)

        socketio.emit('stream_started', {'status': 'streaming'}, namespace='/camera')

    except Exception as e:
        socketio.emit('error', {'message': str(e)}, namespace='/camera')

# Stop continuous video streaming
@socketio.on('stop_stream', namespace='/camera')
def handle_stop_stream(data):
    """Stop continuous frame streaming for user's camera"""
    try:
        user_id = data.get('user_id')

        if user_id in active_streams:
            del active_streams[user_id]

        socketio.emit('stream_stopped', {'status': 'stopped'}, namespace='/camera')

    except Exception as e:
        socketio.emit('error', {'message': str(e)}, namespace='/camera')
