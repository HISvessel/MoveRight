graph TB
    %% Frontend Layer
    subgraph "Frontend Layer"
        UI[Web Interface<br/>HTML/CSS/JavaScript]
        Camera[Camera Feed<br/>WebRTC/MediaDevices API]
        Display[Real-time Display<br/>Canvas/Video Elements]
    end

    %% Backend Services Layer  
    subgraph "Backend Services Layer"
        API[Flask REST API<br/>Endpoints & Routes]
        Auth[Authentication<br/>JWT Tokens]
        FileUpload[File Upload Handler<br/>Video/Image Processing]
    end

    %% AI/ML Processing Layer
    subgraph "AI/ML Processing Layer"
        PoseDetection[Pose Detection Engine<br/>MediaPipe]
        FormAnalysis[Form Analysis Algorithm<br/>Custom Python Logic]
        AngleCalc[Angle Calculation<br/>NumPy/Mathematical Processing]
        Scoring[Scoring System<br/>Scikit-learn ML Model]
    end

    %% Data Layer
    subgraph "Data Layer"
        DB[(PostgreSQL Database<br/>User Data & Sessions)]
        Cache[(Redis Cache<br/>Session Storage)]
        FileStorage[File Storage<br/>Video/Image Files]
    end

    %% External Services
    subgraph "External Services"
        MediaPipe[MediaPipe API<br/>Google's Pose Detection]
    end

    %% Data Flow Connections
    UI -->|HTTP Requests| API
    Camera -->|Video Stream| UI
    UI -->|Real-time Data| Display
    
    API -->|Authentication| Auth
    API -->|File Uploads| FileUpload
    API -->|Process Request| PoseDetection
    
    PoseDetection -->|Pose Landmarks| FormAnalysis
    PoseDetection -.->|External API| MediaPipe
    FormAnalysis -->|Joint Coordinates| AngleCalc
    AngleCalc -->|Angle Data| Scoring
    Scoring -->|Form Score| API
    
    API -->|Store Data| DB
    API -->|Cache Sessions| Cache
    FileUpload -->|Save Files| FileStorage
    
    API -->|JSON Response| UI
    Display <-->|Real-time Updates| UI

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef ai fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef external fill:#ffebee

    class UI,Camera,Display frontend
    class API,Auth,FileUpload backend
    class PoseDetection,FormAnalysis,AngleCalc,Scoring ai
    class DB,Cache,FileStorage data
    class MediaPipe external
