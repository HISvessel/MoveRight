from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.workout_result import WorkoutResult
from app.models.db_model import db

# Create the namespace
workout_api = Namespace('workout-results', description='Workout result operations')

# Input model
workout_input = workout_api.model('WorkoutInput', {
    'exercise_type': fields.String(required=True, description='Type of exercise (squat, pushup, etc.)'),
    'total_reps': fields.Integer(required=True, description='Total number of reps completed'),
    'average_form_score': fields.Float(required=True, description='Average form score across all reps'),
    'session_duration': fields.Integer(required=True, description='Duration of workout in seconds'),
    'rep_details': fields.Raw(required=True, description='Array of rep-by-rep data')
})

# Output model
workout_output = workout_api.model('WorkoutOutput', {
    'id': fields.String(description='Unique workout ID'),
    'user_id': fields.String(description='ID of user who did the workout'),
    'exercise_type': fields.String(description='Type of exercise'),
    'total_reps': fields.Integer(description='Total reps completed'),
    'average_form_score': fields.Float(description='Average form score'),
    'session_duration': fields.Integer(description='Workout duration in seconds'),
    'rep_details': fields.Raw(description='Detailed rep data'),
    'created_at': fields.String(description='When workout was created'),
    'updated_at': fields.String(description='When workout was last updated')
})

@workout_api.route('/')
class WorkoutList(Resource):
    """
    Handles workout result collection operations.
    POST - save a new workout result
    GET - retrieve workout results (we'll add this next)
    """
    
    @workout_api.expect(workout_input)
    @workout_api.response(201, 'Workout saved successfully', workout_output)
    @workout_api.response(400, 'Validation error')
    @workout_api.response(401, 'Unauthorized - login required')
    @jwt_required()
    def post(self):
        """
        Save a new workout result.
        
        Saves workout data (squat, pushup, etc.) for the logged-in user.
        The user_id is automatically extracted from the JWT token.
        """
        # Get the logged-in user's ID from JWT token
        user_id = get_jwt_identity()
        
        # Get the workout data from the request
        data = request.json
        
        try:
            # Create new workout result
            workout = WorkoutResult(
                user_id=user_id,
                exercise_type=data['exercise_type'],
                total_reps=data['total_reps'],
                average_form_score=data['average_form_score'],
                session_duration=data['session_duration'],
                rep_details=data['rep_details']
            )
            
            # Save to database
            db.session.add(workout)
            db.session.commit()
            
            # Return the saved workout data
            return workout.to_dict(), 201
            
        except KeyError as e:
            return {'message': f'Missing required field: {str(e)}'}, 400
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error saving workout: {str(e)}'}, 500
        
    @workout_api.marshal_list_with(workout_output)
    @workout_api.response(200, 'Success')
    @workout_api.response(401, 'Unauthorized - login required')
    @jwt_required()
    def get(self):
        """
        Retrieve workout results for the logged-in user.
        
        Can filter by exercise type using query parameter:
        - GET /api/workout-results (all workouts)
        - GET /api/workout-results?exercise_type=pushup (only pushups)
        - GET /api/workout-results?exercise_type=squat (only squats)
        """
        # Get the logged-in user's ID from JWT token
        user_id = get_jwt_identity()
        
        # Get optional filter from query parameters
        exercise_type = request.args.get('exercise_type')
        
        try:
            # Start with base query for this user
            query = WorkoutResult.query.filter_by(user_id=user_id)
            
            # Add exercise type filter if provided
            if exercise_type:
                query = query.filter_by(exercise_type=exercise_type)
            
            # Get all matching workouts
            workouts = query.all()
            
            # Convert to list of dictionaries
            return [workout.to_dict() for workout in workouts], 200
            
        except Exception as e:
            return {'message': f'Error retrieving workouts: {str(e)}'}, 500