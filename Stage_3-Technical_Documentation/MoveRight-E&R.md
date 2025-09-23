## Diagram

```mermaid
classDiagram
class User{
    -String id
    -String first_name
    -Strign last_name
    -String email
    -String password
    -Float weight
    -int feet(height)
    -int inches(height)

}
class Camera{
    -String id
    -Func open_camera()
    -Func capture_frames()
    -Func display_frames()
    -Func free_camera()
    -Func destroy windows()
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

class User
class Review
class Camera
class Video

User --> Review: writes
User -- Camera: uses object
Camera --> Video: generates
User --> Video: saves