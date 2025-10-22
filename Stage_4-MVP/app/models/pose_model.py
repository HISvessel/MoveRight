from mediapipe.python.solutions.pose import Pose
from mediapipe.python.solutions import drawing_utils, pose
import cv2 as cv
import numpy as np

class PoseModel():
    def __init__(self):
        self.pose = Pose()
        self.draw = drawing_utils
        self.connections = frozenset([(11, 12), (11, 13), (13, 15), (12, 14), (14, 16), (11, 23),
                                      (12, 24), (23, 25), (24, 26), (25, 27), (26, 28)])

    @staticmethod
    def calculate_joint_angle(p1, p2, p3):
        """A sample test to compare agains the previous angle between function"""
        #importing our data to process into numpy arrays
        a = np.array(p1)
        b = np.array(p2)
        c = np.array(p3)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b [0])
        angle = np.abs(radians * 180.0/np.pi)

        if angle > 180.0:
            angle = 360 - angle
        return angle

    @staticmethod
    def calculate_body_angle(p1, p2, p3):
        """A sample test to compare agains the previous angle between function"""
        #importing our data to process into numpy arrays
        a = np.array(p1)
        b = np.array(p2)
        c = np.array(p3)

        radians = np.arctan2(c[1] - b[1], c[0], - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0/np.pi)
        return angle
    
    def draw_pose(self, frames):
        """Function to draw standardized frames for testing mediapipe"""
        pose_frames = cv.cvtColor(frames, cv.COLOR_BGR2RGB)
        process = self.pose.process(pose_frames)
        if process.pose_landmarks:
            landmarks = process.pose_landmarks.landmark
            l_ear = landmarks[7]
            r_ear = landmarks[8]
            l_shoulder = landmarks[11]
            r_shoulder = landmarks[12]
            l_elbow = landmarks[13]
            l_wrist = landmarks[15]
            r_elbow = landmarks[14]
            r_wrist = landmarks[16]
            l_hip = landmarks[23]
            r_hip = landmarks[24]
            l_knee = landmarks[25]
            r_knee = landmarks[26]
            l_ankle = landmarks[27]
            r_ankle = landmarks[28]
            self.draw.draw_landmarks(pose_frames, #frames to draw on
                                     process.pose_landmarks, #landmarks to draw, set to default
                                     self.connections, #chosen connections to draw(no face connections)
                                     self.draw.DrawingSpec((112, 112, 112), 2, 2), #pose landmark drawings
                                     self.draw.DrawingSpec((0, 200, 50), 3, 3)) #pose connection drawings
        
        return cv.cvtColor(pose_frames, cv.COLOR_RGB2BGR)

    def draw_pushup_pose(self, frames):
        """Function that draws the frames for a client getting ready to perform a pushup.

        Takes the frames as a single argument."""

        pose_frames = cv.cvtColor(frames, cv.COLOR_BGR2RGB)
        process = self.pose.process(pose_frames)
        if process.pose_landmarks:
            landmarks = process.pose_landmarks.landmark
            l_ear = landmarks[7]
            r_ear = landmarks[8]
            l_shoulder = landmarks[11]
            r_shoulder = landmarks[12]
            l_elbow = landmarks[13]
            l_wrist = landmarks[15]
            r_elbow = landmarks[14]
            r_wrist = landmarks[16]
            l_hip = landmarks[23]
            r_hip = landmarks[24]
            l_knee = landmarks[25]
            r_knee = landmarks[26]
            l_ankle = landmarks[27]
            r_ankle = landmarks[28]
            self.draw.draw_landmarks(pose_frames, #frames to draw on
                                     process.pose_landmarks, #landmarks to draw, set to default
                                     self.connections, #chosen connections to draw(no face connections)
                                     self.draw.DrawingSpec((112, 112, 112), 2, 2), #pose landmark drawings
                                     self.draw.DrawingSpec((0, 200, 50), 3, 3)) #pose connection drawings

        return cv.cvtColor(pose_frames, cv.COLOR_RGB2BGR)

    def draw_squat_pose(self, frames):
        """Function that draws the frames for a client getting ready to perform a squat.

        Takes the frames as a single argument."""

        pose_frames = cv.cvtColor(frames, cv.COLOR_BGR2RGB)
        process = self.pose.process(pose_frames)
        if process.pose_landmarks:
            landmarks = process.pose_landmarks.landmark
            l_ear = landmarks[7]
            r_ear = landmarks[8]
            l_shoulder = landmarks[11]
            r_shoulder = landmarks[12]
            l_elbow = landmarks[13]
            l_wrist = landmarks[15]
            r_elbow = landmarks[14]
            r_wrist = landmarks[16]
            l_hip = landmarks[23]
            r_hip = landmarks[24]
            l_knee = landmarks[25]
            r_knee = landmarks[26]
            l_ankle = landmarks[27]
            r_ankle = landmarks[28]
            self.draw.draw_landmarks(pose_frames, #frames to draw on
                                     process.pose_landmarks, #landmarks to draw, set to default
                                     self.connections, #chosen connections to draw(no face connections)
                                     self.draw.DrawingSpec((112, 112, 112), 2, 2), #pose landmark drawings
                                     self.draw.DrawingSpec((0, 200, 50), 3, 3)) #pose connection drawings

        return cv.cvtColor(pose_frames, cv.COLOR_RGB2BGR)
 
    def estimate():
        pass