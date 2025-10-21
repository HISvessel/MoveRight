from app.models.base_class import BaseClass
from app.models.db_model import db

class WorkoutResult(BaseClass):
    """
    WorkoutResult model - stores completed workout session data.
    
    This model handles ALL exercise types (squat & pushup for now)
    and stores both summary stats and detailed rep-by-rep data.
    """
    __tablename__ = 'workout_results'
    
    # Columns
    # Link to user who did the workout
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    # Exercise type (squat, pushup, etc.)
    exercise_type = db.Column(db.String(20), nullable=False)
    # Workout summary statistics
    total_reps = db.Column(db.Integer, nullable=False)
    average_form_score = db.Column(db.Float, nullable=False)
    session_duration = db.Column(db.Integer, nullable=False)
    # Detailed rep-by-rep data
    rep_details = db.Column(db.JSON, nullable=False)
    
    def __init__(self, user_id, exercise_type, total_reps, average_form_score, session_duration, rep_details):
        """
        Initialize a new WorkoutResult instance.
        
        Args:
            user_id: ID of the user who did the workout
            exercise_type: Type of exercise ('squat', 'pushup', etc.)
            total_reps: Total number of reps completed
            average_form_score: Average form score across all reps
            session_duration: Duration of workout in seconds
            rep_details: List of dictionaries containing rep-by-rep data
        """
        super().__init__()
        self.user_id = user_id
        self.exercise_type = exercise_type
        self.total_reps = total_reps
        self.average_form_score = average_form_score
        self.session_duration = session_duration
        self.rep_details = rep_details
    
    def to_dict(self):
        """
        Convert WorkoutResult to dictionary for JSON responses.
        
        Returns:
            dict: Dictionary containing all workout data
        """
        data = super().to_dict()
        
        data.update({
            'user_id': self.user_id,
            'exercise_type': self.exercise_type,
            'total_reps': self.total_reps,
            'average_form_score': self.average_form_score,
            'session_duration': self.session_duration,
            'rep_details': self.rep_details
        })
        
        return data
    
    def __repr__(self):
        """
        String representation for debugging.
        
        Returns:
            str: Human-readable description of the workout
        """
        return f"<WorkoutResult {self.exercise_type} - {self.total_reps} reps by user {self.user_id}>"