Entities:
1. User
2. Review(or Testimonial)
3. Appraisal(or Exercise Feedback, particularly the data provided by the MediaPipe data model object)
4. Camera
5. Recording(video film of the app user)

Entities for data storage:
1. Recording
2. User
3. Review
4. Appraisal(Feedback)

CRUD operations:
1. POST(Create)
    <ins>User</ins>
    <ins>Video</ins>
    <ins>Appraisal</ins>
    <ins>Review</ins>
2. PUT(Updating)
    <ins>User</ins>
    <ins>Review</ins>
3. GET(Retrieving)
    <ins>User</ins>: one at a time
    <ins>Review</ins>: one at a time, or many reviews
    <ins>Video</ins>: many videos, or one at a time(those that belong to the user being recorded), holds a list of Appraisal
    <ins>Appraisal</ins>: one or many, those that belong to the user, based on the recording. Contained as objects of Video
4. DELETE(Deleting)
    <ins>User</ins>: one at a time(admin only privleges)
    <ins>Video</ins>: one at a time(user only privileges, and only their own previously recorded videos)
    <ins>Appraisal</ins>: one at a time(when a video is deleted, so will the appraisal)
    <ins>Review</ins>: one or many at a time(user and admin privileges only, an admin can delete any review, a user can only delete his own.)