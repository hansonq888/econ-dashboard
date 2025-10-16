from http.server import BaseHTTPRequestHandler
import json
import time
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = {
            "status": "healthy",
            "message": "Backend is running",
            "timestamp": time.time(),
            "environment": os.getenv("VERCEL_ENV", "development"),
            "python_version": "3.9"
        }
        
        self.wfile.write(json.dumps(response).encode())
        return
