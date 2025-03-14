"""
Configuration settings for the application.
"""

import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API URL from documentation
API_URL = "http://52.20.32.219"

# Flask settings
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "t", "1", "yes", "y")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
