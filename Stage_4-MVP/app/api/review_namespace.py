from flask import request
from flask_restx import Namespace, Resource, fields
from app.models.review import Review
from app.services.facade import Facade

# creates instance
facade = Facade() 

# review namespace - groups all review endpoints
review_api = Namespace('reviews', description='Review operations')

review_input = review_api.model('ReviewInput', {
    'title': fields.String(required=True, description='Review Title'),
    'comment': fields.String(required=True, description='Review comment'),
    'rating': fields.Integer(required=True, description='Rating (0-5)')
})

review_output = review_api.model('ReviewOutput', {
    'id': fields.String(description='Review UUID'),
    'title': fields.String(description='Review title'),
    'comment': fields.String(description='Review comment'),
    'rating': fields.Integer(description='Rating'),
    'created at': fields.String(description='Creation timestamp'),
    'updated at': fields.String(description='Last update timestamp')
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
    
    def post(self):
        """Creates new review"""
        # gets data from request
        data = request.json
        
        try:
            
            new_review = Review(
                title=data['title'],
                comment=data['comment'],
                rating=data['rating']
            )
            
            # save review to db
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
        """Get a review by ID"""
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        return review.to_dict(), 200
    
    def put(self, review_id):
        """Update an existing review"""
        data = request.json
        
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        
        facade.review_service.update(review_id, data)
        return {'message': 'Review updated successfully'}, 200
    
    def delete(self, review_id):
        """Delete a review by ID"""
        review = facade.review_service.get(review_id)
        if not review:
            return {'message': f'Review with ID {review_id} not found'}, 404
        
        facade.review_service.delete(review_id)
        return '', 204