# app/models/camera.py
"""
Camera model for real-time video streaming.

Uses threading to continuously capture frames in the background,
allowing non-blocking video streaming to the frontend.
"""

import cv2 as cv
import threading
import time
from datetime import datetime
from app.models.video_source import VideoSource
from app.models.pose_model import PoseModel


class Camera:
    """
    Threaded camera for continuous frame capture.

    Runs in background thread to avoid blocking the Flask server.
    Provides frames for real-time streaming via WebSocket.
    """

    def __init__(self, source=None, user_id=None):
        """
        Initialize camera with video source.

        Args:
            source: Camera source (0 for webcam, URL for IP camera, or video file path)
            user_id: Optional user ID to associate recordings with a user
        """
        if source is None:
            print("[CAMERA] No source provided, attempting to auto-find local webcam...")
            source = VideoSource.find_source()
            if source is None:
                raise RuntimeError("No video source provided and no local camera found!")
        self.source = source
        self.user_id = user_id

        # OpenCV video capture
        self.capture = cv.VideoCapture(self.source)

        # Frame buffer (latest frame)
        self.frame = None

        # Threading controls
        self.running = True
        self.lock = threading.Lock()  # Thread-safe access to frame

        # FPS tracking
        self._fps = 0.0
        self._frame_count = 0
        self._last_time = time.time()

        # Start background thread
        self.thread = threading.Thread(target=self._update_frame, daemon=True)
        self.thread.start()
        self.pose = PoseModel()

    def _update_frame(self):
        """
        Background thread that continuously captures frames.

        Runs in infinite loop until stop() is called.
        Updates self.frame with latest frame from camera.
        """
        while self.running:
            success, frame = self.capture.read()

            if success and frame is not None:
                # Thread-safe frame update
                with self.lock:
                    self.frame = frame

                # Track FPS
                self._frame_count += 1
                now = time.time()
                if now - self._last_time >= 1.0:
                    self._fps = self._frame_count / (now - self._last_time)
                    self._frame_count = 0
                    self._last_time = now
            else:
                print(f'Attempting to read from source: {self.source}')
                print(f"[CAMERA] Frame capture failed at {datetime.now()}")
                time.sleep(0.1)  # Brief pause before retry

    def get_frame(self):
        """
        Get the latest frame as numpy array.

        Returns:
            numpy.ndarray: Latest captured frame, or None if not available
        """
        with self.lock:
            return self.frame.copy() if self.frame is not None else None

    def get_jpeg_frame(self, quality=85):
        """
        Get latest frame encoded as JPEG bytes.

        Used for streaming frames over HTTP/WebSocket.

        Args:
            quality: JPEG quality (1-100, default 85)

        Returns:
            bytes: JPEG-encoded frame, or None if frame not available
        """
        frame = self.get_frame()

        if frame is None:
            return None

        #drawing landmarks
        pose_frame = self.pose.draw_pose(frame)

        # Encode pose frame as JPEG
        success, buffer = cv.imencode(
            '.jpg', 
            pose_frame, 
            [cv.IMWRITE_JPEG_QUALITY, quality]
        )

        if not success:
            print(f"[CAMERA] Frame encoding failed at {datetime.now()}")
            return None

        return buffer.tobytes()

    #designing camera frames with drawings for pushups
    def get_pushup_frames(self, quality=85):
        """
        Get latest frame encoded as JPEG bytes.

        Used for streaming frames over HTTP/WebSocket.

        These frames now port personalized logic for pushups, 
        including their own drawings, HUDs and math heuristics

        Args:
            quality: JPEG quality (1-100, default 85)

        Returns:
            bytes: JPEG-encoded frame, or None if frame not available
        """
        frame = self.get_frame()

        if frame is None:
            return None

        #drawing personalized pushup landmarks
        pushup_pose_frame = self.pose.draw_pushup_pose(frame)

        # Encode pose frame as JPEG
        success, buffer = cv.imencode(
            '.jpg', 
            pushup_pose_frame, 
            [cv.IMWRITE_JPEG_QUALITY, quality]
        )

        if not success:
            print(f"[CAMERA] Frame encoding failed at {datetime.now()}")
            return None

        return buffer.tobytes()

    #designing camera frames with squat drawings
    def get_squat_frame(self, quality=85):
        """
        Get latest frame encoded as JPEG bytes.

        Used for streaming frames over HTTP/WebSocket.

        Args:
            quality: JPEG quality (1-100, default 85)

        Returns:
            bytes: JPEG-encoded frame, or None if frame not available
        """
        frame = self.get_frame()

        if frame is None:
            return None

        #drawing landmarks
        squat_pose_frame = self.pose.draw_squat_pose(frame)

        # Encode pose frame as JPEG
        success, buffer = cv.imencode(
            '.jpg', 
            squat_pose_frame, 
            [cv.IMWRITE_JPEG_QUALITY, quality]
        )

        if not success:
            print(f"[CAMERA] Frame encoding failed at {datetime.now()}")
            return None

        return buffer.tobytes()

    def take_picture(self, filename=None):
        """
        Save current frame as image file.

        Args:
            filename: Optional custom filename. If None, generates from user_id and timestamp.

        Returns:
            str: Filename if successful, None otherwise
        """
        frame = self.get_frame()

        if frame is None:
            print("[CAMERA] No frame available for picture")
            return None

        # Generate filename
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"user_{self.user_id}_{timestamp}.jpg" if self.user_id else f"capture_{timestamp}.jpg"

        # Save image
        success = cv.imwrite(filename, frame)

        if success:
            print(f"[CAMERA] Picture saved: {filename}")
            return filename
        else:
            print(f"[CAMERA] Failed to save picture: {filename}")
            return None

    def get_fps(self):
        """
        Get current frames per second.

        Returns:
            float: Current FPS
        """
        return round(self._fps, 2)

    def is_running(self):
        """
        Check if camera is currently running.

        Returns:
            bool: True if camera thread is active
        """
        return self.running

    def stop(self):
        """
        Stop camera capture and cleanup resources.
        
        Stops background thread, releases camera, and closes windows.
        """
        print("[CAMERA] Stopping camera...")
        self.running = False

        # Wait for thread to finish
        if self.thread.is_alive():
            self.thread.join(timeout=2.0)

        # Release resources
        if self.capture.isOpened():
            self.capture.release()

        cv.destroyAllWindows()
        print("[CAMERA] Camera stopped")

    def __del__(self):
        """Destructor - ensure camera is stopped when object is deleted."""
        self.stop()
