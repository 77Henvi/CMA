import json
import os
import sys
import threading
import traceback
import urllib.parse
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from src.env import load_env

load_env()

from src.formatters import format_production_pack_markdown
from src.integrations.higgsfield_service import HiggsfieldService
from src.pipeline import ContentCreationPipeline

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
MAX_BODY = 1_000_000  # 1 MB

pipeline = ContentCreationPipeline()
higgsfield = HiggsfieldService()
pipeline_lock = threading.Lock()  # the LLM pipeline is not re-entrant; run one job at a time


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    # ---- helpers ----
    def _json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        if length > MAX_BODY:
            raise ValueError("request body too large")
        raw = self.rfile.read(length).decode("utf-8") if length else ""
        data = json.loads(raw) if raw else {}
        if not isinstance(data, dict):
            raise ValueError("JSON body must be an object")
        return data

    # ---- routes ----
    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/health":
            return self._json({"ok": True, "higgsfield_configured": higgsfield.is_configured(), "llm_configured": pipeline.llm_client.is_configured()})
        if url.path == "/api/higgsfield/status":
            rid = urllib.parse.parse_qs(url.query).get("request_id", [""])[0]
            if not rid:
                return self._json({"status": "error", "message": "missing request_id"}, 400)
            result = higgsfield.check_status(rid)
            result.pop("raw", None)
            return self._json(result)
        if url.path == "/api/topics":
            query_params = urllib.parse.parse_qs(url.query)
            try:
                count = int(query_params.get("count", ["4"])[0])
            except ValueError:
                count = 4
            count = max(1, min(count, 8))
            exclude_raw = query_params.get("exclude", [""])[0]
            exclude = [x.strip() for x in exclude_raw.split(",") if x.strip()]
            topics = pipeline.strategist.brainstorm_topics(count=count, exclude=exclude)
            return self._json({"status": "success", "topics": topics})
        return super().do_GET()

    def do_POST(self):
        try:
            data = self._read_json()
        except (ValueError, json.JSONDecodeError) as e:
            return self._json({"status": "error", "message": f"bad request: {e}"}, 400)

        try:
            if self.path == "/api/generate":
                topic = str(data.get("topic") or "ปลานีออนไม่ยอมรวมฝูง")[:300]
                notes = str(data.get("user_notes") or "")[:1000]
                with pipeline_lock:
                    pack = pipeline.run(topic, notes)
                    saved = pipeline.save_output(pack)
                return self._json({
                    "status": "success",
                    "saved_file": saved,
                    "pack": pack.model_dump(),
                    "markdown": format_production_pack_markdown(pack),
                })

            if self.path == "/api/higgsfield/generate-office":
                return self._json(higgsfield.generate_office_visual(prompt=data.get("prompt"), mode=data.get("mode", "video")))

            if self.path == "/api/higgsfield/generate-broll":
                return self._json(higgsfield.generate_broll_scene(
                    scene_description=data.get("scene_description") or "ฝูงปลานีออนแหวกว่ายในตู้ไม้น้ำ",
                    camera_movement=data.get("camera_movement") or "slow pan",
                ))

            if self.path == "/api/higgsfield/generate-agent":
                return self._json(higgsfield.generate_agent_portrait(role=str(data.get("role", "creative agent")), outfit=str(data.get("outfit", ""))))
        except Exception as e:  # noqa: BLE001
            traceback.print_exc()
            return self._json({"status": "error", "message": str(e)}, 500)

        self._json({"status": "error", "message": "not found"}, 404)

    def end_headers(self):
        # never cache the front-end while developing, so edits show up immediately
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def run_server(port=8080, open_browser=True):
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}"
    print("=" * 65)
    print("🏢  Virtual Office AI Agent Platform")
    print(f"👉  เปิดใช้งานที่: {url}")
    print(f"    LLM: {'พร้อมใช้งาน' if pipeline.llm_client.is_configured() else 'Offline engine'}"
          f"  |  Higgsfield: {'พร้อมใช้งาน' if higgsfield.is_configured() else 'ยังไม่ตั้งค่า'}")
    print("=" * 65)
    if open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 หยุดการทำงานของเซิร์ฟเวอร์")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    run_server(port)
