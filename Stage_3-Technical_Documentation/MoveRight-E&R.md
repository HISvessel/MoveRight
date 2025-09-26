## Diagram

```mermaid
classDiagram
class User{
    -String id
    -Datetime created_at
    -Datetime updated_at
    -String first_name
    -Strign last_name
    -String email
    -String password
    -Float weight
    -int feet_height
    -int inches_height
}
class Camera{
    -String id
    -Func open_camera(source)
    -Func capture_frames(camera)
    -Func display_frames(frames)
    -Func create_body_landmarks(frame)
    -Func process_body_landmarks(landmarks)
    -Func free_camera()
}
class Video{
    -String id
    -String filename
    -DateTime created_at
}
class Review{
    -String id
    -String title
    -String comment
    -int rating
    -Datetime created_at
    -Datetime updated_at
}
class Feedback{
    -String id
    -Object exercise_model
    -Object machine_learner
    -String filename
    -String created_at
}

class User
class Review
class Camera
class Video

User --> Review: writes
User --> Camera: uses object
Camera --> Video: generates
User <--o Video: saves
Feedback --o Video: pertains to accessed data
Feedback --> User: is about