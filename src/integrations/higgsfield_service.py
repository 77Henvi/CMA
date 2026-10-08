"""Higgsfield AI integration (image + video generation).

Flow:  submit()  ->  request_id  ->  check_status(request_id) (polled by the web UI)
Credentials (any one of these):
    HIGGSFIELD_API_KEY + HIGGSFIELD_API_SECRET      (recommended, put in .env)
    HF_KEY                                          ("key:secret")
    HF_API_KEY + HF_API_SECRET
"""

import logging
import os
import re
from typing import Any, Dict, List, Optional

from ..env import load_env

load_env()
logger = logging.getLogger(__name__)

DEFAULT_VIDEO_MODEL = os.getenv("HIGGSFIELD_VIDEO_MODEL", "kling-video/v3.0/pro/text-to-video")
DEFAULT_IMAGE_MODEL = os.getenv("HIGGSFIELD_IMAGE_MODEL", "higgsfield-ai/soul/v2/standard")

# Same look as the in-app 3D scene, so generated visuals match the web UI.
OFFICE_STYLE = (
    "soft pastel 3D clay render, isometric diorama of a minimalist creative studio, "
    "long white desk with four small round-headed chibi characters in matte clay style sitting on "
    "slate-blue, coral, mint and sage chairs, tiny aquascape aquarium on the desk, light tiled wall, "
    "oak slat panels, floating shelf with colourful books, pinboard with sticky notes, "
    "warm soft studio light, gentle shadows, clean cream background, high detail, no text"
)
AGENT_STYLE = (
    "cute matte clay 3D character, round head, simple dot eyes, soft blush, pastel outfit, "
    "standing pose, full body, soft studio lighting, clean cream background, minimal, no text"
)

_URL_RE = re.compile(r"^https?://", re.I)
_MEDIA_RE = re.compile(r"\.(mp4|webm|mov|png|jpe?g|webp|gif)(\?|$)", re.I)


def _find_urls(obj: Any, out: Optional[List[str]] = None) -> List[str]:
    """Collect media URLs from an arbitrary JSON result."""
    out = [] if out is None else out
    if isinstance(obj, str):
        if _URL_RE.match(obj) and (_MEDIA_RE.search(obj) or "higgsfield" in obj.lower()):
            if obj not in out:
                out.append(obj)
    elif isinstance(obj, dict):
        for v in obj.values():
            _find_urls(v, out)
    elif isinstance(obj, list):
        for v in obj:
            _find_urls(v, out)
    return out


class HiggsfieldService:
    def __init__(self, api_key: Optional[str] = None, api_secret: Optional[str] = None):
        self.api_key = api_key or os.getenv("HIGGSFIELD_API_KEY", "") or os.getenv("HF_API_KEY", "")
        self.api_secret = api_secret or os.getenv("HIGGSFIELD_API_SECRET", "") or os.getenv("HF_API_SECRET", "")
        if self.api_key and self.api_secret:
            self.credential_key = f"{self.api_key}:{self.api_secret}"
            os.environ["HF_KEY"] = self.credential_key
        else:
            self.credential_key = os.getenv("HF_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.credential_key)

    # ---- public generators -------------------------------------------------
    def generate_office_visual(self, prompt: Optional[str] = None, mode: str = "video") -> Dict[str, Any]:
        base = prompt or OFFICE_STYLE
        if mode == "video":
            return self._submit(DEFAULT_VIDEO_MODEL, {"prompt": base + ", slow gentle camera orbit", "aspect_ratio": "16:9"}, "office_video")
        return self._submit(DEFAULT_IMAGE_MODEL, {"prompt": base, "aspect_ratio": "16:9"}, "office_image")

    def generate_agent_portrait(self, role: str, outfit: str = "") -> Dict[str, Any]:
        prompt = f"{AGENT_STYLE}, role: {role}, {outfit}".strip(", ")
        return self._submit(DEFAULT_IMAGE_MODEL, {"prompt": prompt, "aspect_ratio": "1:1"}, "agent_portrait")

    def generate_broll_scene(self, scene_description: str, camera_movement: str = "slow pan") -> Dict[str, Any]:
        prompt = (
            f"Macro cinematic close-up: {scene_description}. Camera: {camera_movement}. "
            "Crystal clear water, lush aquatic plants, vibrant ornamental fish, "
            "soft natural light, shallow depth of field, 4k."
        )
        return self._submit(DEFAULT_VIDEO_MODEL, {"prompt": prompt, "aspect_ratio": "9:16"}, "broll_video")

    # ---- plumbing ----------------------------------------------------------
    def _submit(self, model: str, arguments: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "error", "message": "ยังไม่ได้ตั้งค่า HIGGSFIELD_API_KEY / HIGGSFIELD_API_SECRET ในไฟล์ .env"}
        try:
            import higgsfield_client
        except ImportError:
            return {"status": "error", "message": "ยังไม่ได้ติดตั้ง SDK: pip install higgsfield-client"}
        try:
            ctl = higgsfield_client.submit(application=model, arguments=arguments)
            return {"status": "submitted", "request_id": ctl.request_id, "model": model, "task_type": task_type}
        except Exception as e:  # noqa: BLE001 - surface any SDK/network error to the UI
            return self._error(e, model, task_type)

    def check_status(self, request_id: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "error", "message": "Higgsfield credentials not configured"}
        try:
            import higgsfield_client
            st = higgsfield_client.status(request_id)
            name = type(st).__name__.lower()          # queued / inprogress / completed / failed / nsfw / cancelled
            if name == "completed":
                result = higgsfield_client.result(request_id)
                return {"status": "completed", "urls": _find_urls(result), "raw": result}
            if name in ("failed", "nsfw", "cancelled"):
                return {"status": "failed", "message": f"Higgsfield job ended with status: {name}"}
            return {"status": "queued" if name == "queued" else "in_progress"}
        except Exception as e:  # noqa: BLE001
            return {"status": "error", "message": str(e)}

    @staticmethod
    def _error(e: Exception, model: str, task_type: str) -> Dict[str, Any]:
        msg = str(e)
        logger.warning("Higgsfield call failed: %s", msg)
        low = msg.lower()
        if "credit" in low or "402" in low or "403" in low:
            return {
                "status": "insufficient_credits",
                "message": "เชื่อมต่อ Higgsfield สำเร็จ แต่เครดิตไม่พอ (เติมที่ console.higgsfield.ai)",
                "model": model, "task_type": task_type,
            }
        return {"status": "error", "message": msg, "model": model, "task_type": task_type}
