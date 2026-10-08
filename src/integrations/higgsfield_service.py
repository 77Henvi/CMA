"""Higgsfield AI Integration Service

Provides integration with Higgsfield AI API for cinematic video generation
(Text-to-Video via Kling / Soul / Wan) and visual asset synthesis for both
virtual studio environments and real TikTok video production concepts.
"""

import os
import json
import logging
from typing import Dict, Any, Optional

def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and not os.environ.get(k):
                            os.environ[k] = v
        except Exception:
            pass

load_env_file()

logger = logging.getLogger(__name__)

# Higgsfield client endpoints
DEFAULT_VIDEO_MODEL = "kling-video/v3.0/pro/text-to-video"
DEFAULT_IMAGE_MODEL = "higgsfield-ai/soul/v2/standard"

class HiggsfieldService:
    def __init__(self, api_key: Optional[str] = None, api_secret: Optional[str] = None):
        self.api_key = api_key or os.getenv("HIGGSFIELD_API_KEY", "")
        self.api_secret = api_secret or os.getenv("HIGGSFIELD_API_SECRET", "")
        
        # Format credential key
        if self.api_key and self.api_secret:
            self.credential_key = f"{self.api_key}:{self.api_secret}"
            os.environ["HF_KEY"] = self.credential_key
        else:
            self.credential_key = os.getenv("HF_KEY", "")

    def is_configured(self) -> bool:
        """Check if credentials are present."""
        return bool(self.credential_key)

    def generate_office_visual(self, prompt: Optional[str] = None, mode: str = "video") -> Dict[str, Any]:
        """Generate virtual office cinematic visual or background video loop."""
        if not prompt:
            prompt = (
                "Cinematic high-angle camera pan of an architectural Japanese minimalist creative studio. "
                "Warm honey oak long wooden table with miniature aquascaped nano planted aquarium, "
                "soft diffused natural daylight through rice-paper blinds, clean organized laptops, "
                "lush indoor ficus plants, cozy espresso bar corner, warm earth tones, serene aesthetic, 4k ultra-detailed."
            )

        model = DEFAULT_VIDEO_MODEL if mode == "video" else DEFAULT_IMAGE_MODEL
        return self._submit_generation(
            model=model,
            arguments={
                "prompt": prompt,
                "aspect_ratio": "16:9"
            },
            task_type="office_visual"
        )

    def generate_broll_scene(self, scene_description: str, camera_movement: str = "slow pan") -> Dict[str, Any]:
        """Generate TikTok scene B-roll video clip based on the Shot Director's instructions."""
        prompt = (
            f"Macro cinematic close-up shot: {scene_description}. "
            f"Camera movement: {camera_movement}. "
            "Crystal clear water, lush aquatic plants, vibrant ornamental fish, "
            "natural lighting, 4k 60fps cinematic shallow depth of field."
        )

        return self._submit_generation(
            model=DEFAULT_VIDEO_MODEL,
            arguments={
                "prompt": prompt,
                "aspect_ratio": "9:16"
            },
            task_type="broll_video"
        )

    def _submit_generation(self, model: str, arguments: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        """Submits job to Higgsfield SDK with graceful fallback and mock simulation when credits are depleted."""
        if not self.is_configured():
            return {
                "status": "error",
                "message": "Higgsfield API credentials not configured in .env",
                "simulated": False
            }

        try:
            import higgsfield_client
            # Attempt to submit to Higgsfield AI
            controller = higgsfield_client.submit(
                application=model,
                arguments=arguments
            )
            return {
                "status": "submitted",
                "request_id": controller.request_id,
                "status_url": controller.status_url,
                "model": model,
                "task_type": task_type,
                "simulated": False
            }
        except Exception as e:
            err_msg = str(e)
            logger.warning(f"Higgsfield API call encountered: {err_msg}")
            
            # If not enough credits or network issues, return informative payload
            is_credit_issue = "not_enough_credits" in err_msg or "403" in err_msg
            return {
                "status": "insufficient_credits" if is_credit_issue else "error",
                "message": (
                    "Higgsfield API connected successfully, but account requires prepaid credits to generate live video. "
                    "(Top up credits at console.higgsfield.ai)" if is_credit_issue else err_msg
                ),
                "model": model,
                "task_type": task_type,
                "prompt": arguments.get("prompt"),
                "sample_preview_url": "https://assets.mixkit.co/videos/preview/mixkit-bright-neon-tetra-fish-in-an-aquarium-43254-large.mp4" if "fish" in arguments.get("prompt", "") else "https://assets.mixkit.co/videos/preview/mixkit-modern-office-with-large-windows-and-chairs-41619-large.mp4",
                "simulated": True
            }
