# run.py
"""
Application Entry Point for Move Right

This file serves as the starting point for the Flask application.
When you execute 'python run.py', this file:
1. Imports the app factory
2. Creates an app instance
3. Starts the development server
"""
from app import create_app, socketio

# create flask app instance
app = create_app()

if __name__ =='__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)