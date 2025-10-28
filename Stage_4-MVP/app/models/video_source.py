#!/usr/bin/env python3
import cv2
from datetime import datetime

class VideoSource:
    @staticmethod
    def find_source():
        """
        Intelligently searches for a working *local* video source.
        
        Tries in order:
        1. Default webcam (index 0)
        2. Secondary cameras (index 1, 2)
        
        Returns:
            Working source (int), or None if nothing found
        """
        # Removed all hardcoded IP sources.
        # This function will only find local system cameras.
        sources_to_try = [0, 1, 2] 
        
        print("[VideoSource] Searching for local video source...")
        
        for source in sources_to_try:
            print(f"[VideoSource] Trying: {source}")
            
            cap = cv2.VideoCapture(source)
            
            if cap.isOpened():
                # Try to read a frame to make sure it's working
                success, frame = cap.read()
                cap.release()
                
                if success and frame is not None:
                    print(f"[VideoSource] ✅ Success! Using local: {source}")
                    return source
                else:
                    print(f"[VideoSource] ❌ Opened but no frames from: {source}")
            else:
                print(f"[VideoSource] ❌ Failed to open: {source}")
        
        print("[VideoSource] 🛑 No working local video source detected.")
        return None