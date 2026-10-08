import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

class LLMClient:
    """
    Unified LLM Client supporting Google Gemini, OpenAI, Groq, or Smart Simulation Fallback.
    """
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")

    def is_configured(self) -> bool:
        return bool(self.gemini_api_key or self.openai_api_key or self.groq_api_key)

    def generate_json(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        """
        Attempts to call the configured LLM API. Returns parsed JSON or None if no API is available.
        """
        if self.gemini_api_key:
            return self._call_gemini(system_prompt, user_prompt)
        elif self.openai_api_key:
            return self._call_openai(system_prompt, user_prompt)
        elif self.groq_api_key:
            return self._call_groq(system_prompt, user_prompt)
        return None

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"System Instructions:\n{system_prompt}\n\nUser Request:\n{user_prompt}\n\nIMPORTANT: Return ONLY valid, parseable JSON with no markdown backticks."}
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content.strip())
        except Exception as e:
            print(f"[LLM] Gemini API call error: {e}")
            return None

    def _call_openai(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }
        payload = {
            "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{user_prompt}\n\nReturn pure JSON format."}
            ],
            "response_format": {"type": "json_object"}
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text_content = res_data["choices"][0]["message"]["content"]
                return json.loads(text_content.strip())
        except Exception as e:
            print(f"[LLM] OpenAI API call error: {e}")
            return None

    def _call_groq(self, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.groq_api_key}"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{user_prompt}\n\nReturn pure JSON format."}
            ],
            "response_format": {"type": "json_object"}
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                text_content = res_data["choices"][0]["message"]["content"]
                return json.loads(text_content.strip())
        except Exception as e:
            print(f"[LLM] Groq API call error: {e}")
            return None
