#!/usr/bin/env python3
"""LaLiga Sports — Static file server with image upload support."""

import http.server
import os
import json
import uuid
import mimetypes

PORT = 5000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads', 'images')
os.makedirs(UPLOAD_DIR, exist_ok=True)


class LLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/upload':
            self._handle_upload()
        else:
            self.send_response(404)
            self.end_headers()

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _handle_upload(self):
        content_type = self.headers.get('Content-Type', '')
        if 'multipart/form-data' not in content_type:
            self._json({'ok': False, 'error': 'multipart required'}, 400)
            return

        boundary_part = [p for p in content_type.split(';') if 'boundary=' in p]
        if not boundary_part:
            self._json({'ok': False, 'error': 'no boundary'}, 400)
            return

        boundary = boundary_part[0].split('boundary=')[-1].strip().encode()
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        parts = body.split(b'--' + boundary)
        for part in parts[1:]:
            if part.strip() == b'--':
                continue
            sep = part.find(b'\r\n\r\n')
            if sep == -1:
                continue
            raw_headers = part[:sep].decode('utf-8', errors='replace')
            file_data = part[sep + 4:]
            if file_data.endswith(b'\r\n'):
                file_data = file_data[:-2]

            if 'filename=' not in raw_headers:
                continue

            orig_name = ''
            for line in raw_headers.split('\r\n'):
                if 'Content-Disposition' in line:
                    for seg in line.split(';'):
                        seg = seg.strip()
                        if seg.startswith('filename='):
                            orig_name = seg[9:].strip('"')

            ext = os.path.splitext(orig_name)[1].lower() or '.jpg'
            if ext not in ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'):
                ext = '.jpg'

            filename = uuid.uuid4().hex + ext
            path = os.path.join(UPLOAD_DIR, filename)
            with open(path, 'wb') as f:
                f.write(file_data)

            url = f'/uploads/images/{filename}'
            self._json({'ok': True, 'url': url})
            return

        self._json({'ok': False, 'error': 'no file found'}, 400)

    def _json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # suppress noisy access logs


if __name__ == '__main__':
    with http.server.ThreadingHTTPServer(('0.0.0.0', PORT), LLHandler) as srv:
        print(f'LaLiga Sports running on http://0.0.0.0:{PORT}')
        srv.serve_forever()
