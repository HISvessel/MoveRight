Entities:
1. User
2. Review(or Testimonial)
3. Feedback(or Exercise Appraisal, particularly the data provided by the MediaPipe data model object)
4. Camera
5. Recording(video film of the app user)

Entities for data storage:
1. Recording
2. User
3. Review
4. Feedback

CRUD operations:
1. POST(Create)
    <ins>User</ins> MoveRight.com/POST/user
    <ins>Video</ins>: MoveRight.com/POST/video
    <ins>Feedback</ins>: MoveRight.com/POST/Feedback
    <ins>Review</ins>: MoveRight.com/POST/Review


2. PUT(Updating)
    <ins>User</ins>: 
    MoveRight.com/PUT/user/_id

    <ins>Review</ins>: 
    MoveRIght.com/PUT/review/_id


3. GET(Retrieving)
    <ins>User</ins>: 
    one at a time-> MoveRight.com/GET/user_id
    many at a time-> MoveRight.com/GET/users **NOTE: admin only operation(option)
    
    <ins>Review</ins>: 
    one review -> MoveRight.com/GET/review_id
    many reviews -> MoveRight.com/GET/reviews
    
    <ins>Video</ins>: many videos, or one at a time(those that belong to the user being recorded), holds a list of Appraisal
    many videos-> MoveRight.com/user_id/videos
    one video -> MoveRight.com/user_id/video_id
    
    <ins>Feedback</ins>: one or many, those that belong to the user, based on the recording. Contained as objects of Video


4. DELETE(Deleting)
    <ins>User</ins>: one at a time(admin only privleges)
    MoveRight.com/DELETE/user/_id

    <ins>Video</ins>: one at a time(user only privileges, and only their own previously recorded videos)
    MoveRight.com/DELETE/video/_id

    <ins>Appraisal</ins>: one at a time(when a video is deleted, so will the appraisal)
    MoveRIght.com/DELETE/appraisal/_id

    <ins>Review</ins>: one or many at a time(user and admin privileges only, an admin can delete any review, a user can only delete his own.)
    MoveRight.com/DELETE/review_id


Sequence diagrams scenarios:
1. User signup diagram(Request, API, server, database, back to API, response)
2. User exercising diagram(Request, API, server code, back to API, response)
3. User fetching stored data(request, API, server database, back to API, response)
