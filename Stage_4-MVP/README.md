This is the repository for the project MVP. All ideas established and envisioned will be put forth here. This directory will be version 0.1 of the application, and in this, the following elements will be taken into consideration for MVP develpoments:

1. Prototyping CRUD and entity relations between user and app.
-> The following user interface requests and responses will be performed and perfected:
    a) Creating a profile
    b) Updating their profile
    c) accessing the library of their stored media.(**NOTE, media storage is an optional trait provided to the customer)
    d) creating a review(**Remember, this is a web app, so all reviews will be reviewed straight from the web app, until passed unto mobile with React Native. )

    These are the app behavior and the conditions for which a customer will keep sessions open and closed for services:
    a) reviews can only be left through a valid existing account
    b) only one review per account
    c) ensure that a valid email is used(no @example.com or any similar suffix)
    d) validate that emails are not duplicated(avoid duplication or spamming)
    e) ensure light password strength when creating account(safety first)
    f) when logged in, create a session. Sessions are necessary for using the web app's services(account management, video session for exercising feedback, etc)
    g) Maintain a short session token or cookie lifespan, add authentication if possible.
    h) TEST EVERYTHING.

2. websocket operations for camera live feed and exercise processing (eg. customer will record themselves doing an exercise).

3. video playback with feedback model and machine learning analysis, and user reviewing.(eg. result screen pops up to playback their exercise with the model telling them where they are breaking correct form for the chosen exercise)

4) Web app settings. Place, location, time, etc.(totally optional, meant for future implementation.)