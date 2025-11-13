from mediapipe.python.solutions.pose import Pose
from mediapipe.python.solutions import drawing_utils, pose
import cv2 as cv
import numpy as np

class PoseModel():
    #def __init__(self):
    pose = Pose()
    draw = drawing_utils
    connections = frozenset([(11, 12), (11, 13), (13, 15), (12, 14), (14, 16), (11, 23),
                                      (12, 24), (23, 25), (24, 26), (25, 27), (26, 28)])

    @staticmethod
    def calculate_joint_angle(p1, p2, p3):
        """A sample test to compare agains the previous angle between function"""
        #importing our data to process into numpy arrays
        a = np.array(p1)
        b = np.array(p2)
        c = np.array(p3)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
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

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
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
                                     self.draw.DrawingSpec((112, 112, 112), 3, 3), #pose landmark drawings
                                     self.draw.DrawingSpec((100, 200, 20), 4, 4)) #pose connection drawings
        cv.rectangle(pose_frames, (0, 0), (250, 100), (70, 70, 70), -1)
        cv.putText(pose_frames, 'Exercise session', (100, 50),
                   cv.FONT_HERSHEY_SIMPLEX, 1, (25, 150, 10), 2)
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
            """
            left_arm_bending = PoseModel.calculate_joint_angle([l_shoulder.x, l_shoulder.y],
                                                               [l_elbow.x, l_elbow.y],
                                                               [l_wrist.x, l_wrist.y])

            right_arm_bending = PoseModel.calculate_joint_angle([r_shoulder.x, r_shoulder.y],
                                                                [r_elbow.x, r_elbow.y],
                                                                [r_wrist.x, r_wrist.y])

            left_arm_lateral_flare = PoseModel.calculate_joint_angle([l_hip.y, l_hip.x],
                                                                    [l_shoulder.y, l_shoulder.x],
                                                                    [l_elbow.y, l_elbow.x])

            right_arm_lateral_flare = PoseModel.calculate_joint_angle([r_hip.y, r_hip.x],
                                                                    [r_shoulder.y, r_shoulder.x],
                                                                    [r_elbow.y, r_elbow.x])

            #calculating body angle and comparing angles for imbalances
            pushup_body_angle_l = PoseModel.calculate_body_angle([l_wrist.y, l_wrist.x],
                                                               [l_hip.y, l_hip.x],
                                                               [l_ankle.y, l_ankle.x])

            pushup_body_angle_r = PoseModel.calculate_body_angle([l_wrist.y, l_wrist.x],
                                                               [l_hip.y, l_hip.x],
                                                               [l_ankle.y, l_ankle.x])
            """
            #drawingg an exclusive rectanlg eindicating the exercise to perform
            cv.rectangle(pose_frames, (0, 0), (200, 400), (90, 90, 90), -1)
            cv.putText(pose_frames, 'Pushup sesh', (100, 50),
                       cv.FONT_HERSHEY_SIMPLEX, 0.9, (40, 150, 10), 1)
            self.draw.draw_landmarks(pose_frames, #frames to draw on
                              process.pose_landmarks, #landmarks to draw, set to default
                                     self.connections, #chosen connections to draw(no face connections)
                                     self.draw.DrawingSpec((112, 112, 112), 2, 2), #pose landmark drawings
                                     self.draw.DrawingSpec((100, 200, 20), 4, 4)) #pose connection drawings

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

            """
            left_leg_bending = PoseModel.calculate_joint_angle([l_shoulder.x, l_shoulder.y],
                                                               [l_elbow.x, l_elbow.y],
                                                               [l_wrist.x, l_wrist.y])

            right_leg_bending = PoseModel.calculate_joint_angle([r_shoulder.x, r_shoulder.y],
                                                                [r_elbow.x, r_elbow.y],
                                                                [r_wrist.x, r_wrist.y])

            left_leg_lateral_flare = PoseModel.calculate_joint_angle([l_hip.y, l_hip.x],
                                                                    [l_shoulder.y, l_shoulder.x],
                                                                    [l_elbow.y, l_elbow.x])

            right_leg_lateral_flare = PoseModel.calculate_joint_angle([r_hip.y, r_hip.x],
                                                                    [r_shoulder.y, r_shoulder.x],
                                                                    [r_elbow.y, r_elbow.x])

            #calculating body angle and comparing angles for imbalances
            pushup_body_angle_l = PoseModel.calculate_body_angle([l_wrist.y, l_wrist.x],
                                                               [l_hip.y, l_hip.x],
                                                               [l_ankle.y, l_ankle.x])

            pushup_body_angle_r = PoseModel.calculate_body_angle([l_wrist.y, l_wrist.x],
                                                               [l_hip.y, l_hip.x],
                                                               [l_ankle.y, l_ankle.x])
                                                               """

            self.draw.draw_landmarks(pose_frames, #frames to draw on
                                     process.pose_landmarks, #landmarks to draw, set to default
                                     self.connections, #chosen connections to draw(no face connections)
                                     self.draw.DrawingSpec((112, 112, 112), 2, 2), #pose landmark drawings
                                     self.draw.DrawingSpec((100, 200, 20), 2, 2)) #pose connection drawings
        cv.rectangle(pose_frames, (0, 0), (200, 100), (90, 90, 90), -1)
        cv.putText(pose_frames, 'Squat sesh', (100, 50), cv.FONT_HERSHEY_SIMLEX,
                   0.9, (40, 150, 10), 1)

        return cv.cvtColor(pose_frames, cv.COLOR_RGB2BGR)
 
    def estimate():
        pass
