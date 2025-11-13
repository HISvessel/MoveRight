# config.py
"""Configuration for Move Right app"""

from datetime import timedelta


class Config:
    """Settings for our Flask app"""
    
    # Database location
    SQLALCHEMY_DATABASE_URI = 'sqlite:///move_right.db'
    
    # Turn off modification tracking (saves memory)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = '123'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)