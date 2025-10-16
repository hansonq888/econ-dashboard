from http.server import BaseHTTPRequestHandler
import json
import time
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # For Vercel, we'll return basic stats since we don't have persistent file storage
        # In a real implementation, you might want to use Vercel KV or another storage solution
        
        stats = {
            "total": 0,
            "valid": 0,
            "expired": 0,
            "size": 0,
            "oldestCache": "None",
            "newestCache": "None",
            "cacheDuration": "Serverless (no persistent cache)"
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        self.wfile.write(json.dumps(stats).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
