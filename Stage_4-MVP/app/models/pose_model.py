from mediapipe.python.solutions.pose import Pose
from mediapipe.python.solutions import drawing_utils, pose
import cv2 as cv

class PoseModel():
    def __init__(self):
        self.pose = Pose()
        self.draw = drawing_utils

    def draw_pose(self, frames):
        pose_frames = cv.cvtColor(frames, cv.COLOR_BGR2RGB)
        process = self.pose.process(pose_frames)
        if process.pose_landmarks:
            self.draw.draw_landmarks(pose_frames, 
                                     process.pose_landmarks, 
                                     pose.POSE_CONNECTIONS, 
                                     self.draw.DrawingSpec((200, 169, 0), 2, 1), 
                                     self.draw.DrawingSpec((112, 112, 112), 2))
        
        return cv.cvtColor(pose_frames, cv.COLOR_RGB2BGR)
    
    def estimate():
        pass