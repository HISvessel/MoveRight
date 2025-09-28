# MoveRight UI Diagram

```mermaid
flowchart TD
    A[App Entry] --> B{User Status}
    
    B -->|New User| C[Landing Page]
    B -->|Returning User| D[Log In Page]
    B -->|Authenticated| E[Homepage Dashboard]
    
    C --> I[Welcome Message/Get Started CTA]
      
    I --> O[Sign Up Button]
    
    O --> P[Sign Up Form]
    D --> Q[Log In Form]
    
    P --> R[Email Field]
    P --> S[Password Field]
    P --> T[Confirm Password]
    P --> U[Create Account Button]
    
    Q --> V[Email/Username]
    Q --> W[Password Field]
    Q --> X[Log In Button]
    Q --> Y[Forgot Password]
    
    U --> Z{Account Created?}
    X --> AA{Login Success?}
    
    Z -->|No| BB[Registration Errors]
    Z -->|Yes| E
    
    AA -->|Yes|E
    AA -->|No|CC[Login Errors]

    BB -->|Return to Sign in Form| P
    CC -->|Return to Login Form| Q

    E --> DD[Welcome Header]
    E --> FF[View Workouts]
    
    DD --> HH[User Avatar]
    DD --> II[Greeting Message]
    DD --> JJ[Settings Menu]
       
    FF --> NN[Choose Workout]
    
    NN --> QQ[Exercise Page Phase 1]
    
    QQ --> RR[Exercise Instructions]
    QQ --> TT[Start Recording Button]
    
    RR --> VV[Step-by-Step Guide]
    RR --> WW[Form Tips]
    RR --> XX[Muscle Groups Targeted]
    
    TT --> YY[Exercise Page Phase 2 - Recording]
    
    YY --> ZZ[Live Video Feed]
    YY --> AAA[Recording Timer]
    YY --> BBB[Form Analysis Overlay]
    YY --> CCC[Pause/Stop Controls]
    
    ZZ --> DDD[User Camera View]
    ZZ --> EEE[Posture Detection]
    
    BBB --> FFF[Form Corrections]
    BBB --> GGG[Rep Counter]
    BBB --> HHH[Performance Metrics]
    
    CCC --> III[Exercise Page Phase 3 - Results] 

    III --> LLL[Form Analysis Summary]
    III --> MMM[Progress Comparison]
    III --> NNN[Action Buttons]
    
    NNN --> SSS[Save Workout]
    NNN --> UUU[Next Exercise]
    NNN --> VVV[Return to Dashboard]
    
    VVV --> E
    UUU --> QQ     
