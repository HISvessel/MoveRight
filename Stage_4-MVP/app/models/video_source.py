#!/usr/bin/env python3
import cv2
from datetime import datetime

class VideoSource:
    @staticmethod
    def find_source():
        """
        Intelligently searches for a working video source.
        
        Tries in order:
        1. IP Webcam stream (if available)
        2. Default webcam (index 0)
        3. Secondary cameras (index 1, 2)
        
        Returns:
            Working source (int or str), or None if nothing found
        """
        # UPDATE THIS with IP Webcam URL
        # ip_source = 'http://192.168.0.7:8080/video' Kevin IP
        ip_source = 'http://192.168.0.6:8080/video' #Joe IP
        
        sources_to_try = [ip_source, 0, 1, 2]
        
        print("[VideoSource] Searching for video source...")
        
        for source in sources_to_try:
            print(f"[VideoSource] Trying: {source}")
            
            cap = cv2.VideoCapture(source)
            
            if cap.isOpened():
                # Try to read a frame to make sure it's really working
                success, frame = cap.read()
                cap.release()
                
                if success and frame is not None:
                    print(f"[VideoSource] ✅ Success! Using: {source}")
                    return source
                else:
                    print(f"[VideoSource] ❌ Opened but no frames from: {source}")
            else:
                print(f"[VideoSource] ❌ Failed to open: {source}")
        
        print("[VideoSource] ⚠️ No working source found!")
        return None