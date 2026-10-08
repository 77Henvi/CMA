import os
import sys
import json
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

# Ensure local imports work smoothly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.pipeline import ContentCreationPipeline
from src.formatters import format_production_pack_markdown

# Ensure UTF-8 output
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

pipeline = ContentCreationPipeline()

class VirtualOfficeRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.path.dirname(__file__), "web"), **kwargs)

    def do_POST(self):
        if self.path == "/api/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}

            topic = data.get("topic", "ปลานีออนไม่ยอมรวมฝูง")
            user_notes = data.get("user_notes", "")

            try:
                production_pack = pipeline.run(topic, user_notes)
                saved_path = pipeline.save_output(production_pack)

                response_data = {
                    "status": "success",
                    "saved_file": saved_path,
                    "pack": production_pack.model_dump(),
                    "markdown": format_production_pack_markdown(production_pack)
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8080):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, VirtualOfficeRequestHandler)
    url = f"http://127.0.0.1:{port}"
    print("=" * 65)
    print("🏢  Virtual Office AI Agent Platform  🏢")
    print(f"👉 เปิดใช้งานเว็บแอปที่: {url}")
    print("=" * 65)
    
    # Auto open in browser
    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 หยุดการทำงานของเซิร์ฟเวอร์")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
