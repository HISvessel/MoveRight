# app/api/review_namespace.py
"""
Review API endpoints - CRUD operations for reviews
"""

from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.review import Review
from app.services.facade import Facade

# Create facade instance
facade = Facade()

# Review namespace - groups all review endpoints
review_api = Namespace('reviews', description='Review operations')

# Input model
review_input = review_api.model('ReviewInput', {
    'title': fields.String(required=True, description='Review Title'),
    'comment': fields.String(required=True, description='Review comment'),
    'rating': fields.Integer(required=True, description='Rating (0-5)')
})

# Output model
review_output = review_api.model('ReviewOutput', {
    'id': fields.String(description='Review UUID'),
    'title': fields.String(description='Review title'),
    'comment': fields.String(description='Review comment'),
    'rating': fields.Integer(description='Rating'),
    'user_id': fields.String(description='User who created it'),
    'created_at': fields.String(description='Creation timestamp'),
    'updated_at': fields.String(description='Last update timestamp')
})

@review_api.route('')
class ReviewList(Resource):
    """
    This class handles /api/reviews
    GET - shows all reviews
    POST - creates a new review
    """
    def get(self):
        """Returns a list of all reviews"""
        reviews = facade.get_all_reviews()
        list_of_reviews = [review.to_dict() for review in reviews]
        return list_of_reviews, 200
    
    @review_api.expect(review_input)
    @jwt_required()  # NEW: Requires login to create review
    def post(self):
        """Creates new review (requires login)"""
        # Get data from request
        data = request.json
        
        # NEW: Get current user ID from JWT token
        current_user_id = get_jwt_identity()
        
        try:
            # Validate rating
            rating = data.get('rating')
            if rating < 0 or rating > 5:
                return {'message': 'Rating must be between 0 and 5'}, 400
            
            # NEW: Add user_id from token to review data
            new_review = Review(
                title=data['title'],
                comment=data['comment'],
                rating=data['rating'],
                user_id=current_user_id  # From JWT token
            )
            
            # Save review to db using facade
            facade.review_service.add(new_review)
            
            return new_review.to_dict(), 201
        
        except KeyError as error:
            missing_field = str(error)
            return {'message': f'Missing required field: {missing_field}'}, 400
        
        except (TypeError, ValueError) as error:
            return {'message': str(error)}, 400

@review_api.route('/<string:review_id>')
class ReviewDetail(Resource):
    """
    Handles operations for a single review
    GET - retrieve one review
    PUT - update one review
    DELETE - delete one review
    """
    def get(self, review_id):
        """Get a review by ID (no login required)"""
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        return review.to_dict(), 200
    
    @review_api.expect(review_input)
    @jwt_required()  # NEW: Requires login to update
    def put(self, review_id):
        """Update an existing review (requires login, must own review)"""
        data = request.json
        
        # Get review
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        
        # NEW: Get current user from token
        current_user_id = get_jwt_identity()
        
        # NEW: Check ownership - only allow user to update their own review
        if review.user_id != current_user_id:
            return {'message': 'You can only update your own reviews'}, 403
        
        try:
            # Validate rating if provided
            if 'rating' in data:
                rating = data['rating']
                if rating < 0 or rating > 5:
                    return {'message': 'Rating must be between 0 and 5'}, 400
            
            facade.review_service.update(review_id, data)
            return {'message': 'Review updated successfully'}, 200
            
        except Exception as error:
            return {'message': str(error)}, 400
    
    @jwt_required()  # NEW: Requires login to delete
    def delete(self, review_id):
        """Delete a review by ID (requires login, must own review)"""
        # Get review
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        
        # NEW: Get current user from token
        current_user_id = get_jwt_identity()
        
        # NEW: Check ownership - only allow user to delete their own review
        if review.user_id != current_user_id:
            return {'message': 'You can only delete your own reviews'}, 403
        
        facade.review_service.delete(review_id)
        return '', 204