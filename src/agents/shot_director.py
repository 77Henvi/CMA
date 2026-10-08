import json
from typing import Dict, Any, List
from ..models import TikTokScript, ScriptScene
from ..llm import LLMClient

class ShotDirectorAgent:
    """
    Agent 3: Visual & Camera Shot Director
    Plans real-world camera filming angles, lighting setups, and B-roll for the fish shop.
    """
    def __init__(self, brand_config: Dict[str, Any], llm_client: LLMClient):
        self.brand_config = brand_config
        self.llm_client = llm_client

    def enrich_script_with_shot_guide(self, script: TikTokScript) -> TikTokScript:
        system_prompt = """
        You are the Visual & Camera Shot Director for an ornamental fish shop TikTok channel.
        Your job is to provide practical, high-aesthetic filming instructions (มุมกล้อง, แสง, B-roll) for real-world filming in the store.
        Examples of shots:
        - มุม Macro ซูมเกล็ดปลา หรือการขยับเหงือก
        - มุม Top-down ส่องผิวน้ำตอนให้อาหาร
        - มุม Wide ตู้ปลาภาพรวมแบบคลีนๆ ปิดไฟรอบห้องเปิดเฉพาะไฟตู้
        - มุม Medium เจาะทิศทางกระแสน้ำและระบบกรอง

        Return JSON matching this exact structure:
        {
          "scenes": [
            {
              "scene_number": 1,
              "camera_shot_guide": "คำแนะนำมุมกล้องสำหรับถ่ายจริงในร้าน..."
            }
          ]
        }
        """

        scenes_summary = [
            {"scene_number": s.scene_number, "action": s.visual_action_description, "voiceover": s.voiceover_th}
            for s in script.scenes
        ]
        user_prompt = f"Topic: {script.concept.title_th}\nScenes to direct shots for:\n{json.dumps(scenes_summary, ensure_ascii=False)}"

        if self.llm_client.is_configured():
            result = self.llm_client.generate_json(system_prompt, user_prompt)
            if result and "scenes" in result:
                guide_map = {item["scene_number"]: item["camera_shot_guide"] for item in result["scenes"]}
                for scene in script.scenes:
                    if scene.scene_number in guide_map:
                        scene.camera_shot_guide = guide_map[scene.scene_number]
                return script

        # High-quality fallback shot suggestions
        fallback_shots = {
            1: "🎥 [Hook Shot] มุม Medium ด้านหน้าตู้ปลา ใช้ไฟตู้ส่องนำสายตา ถ่ายตอนปลาว่ายกระจายตัวเพื่อดึงดูดสายตาทันที",
            2: "🔬 [Insight Shot] มุม Macro Close-up เจาะพฤติกรรมการขยับครีบและทิศทางสายตาของปลาในระยะประชิด",
            3: "✨ [Action Tip Shot] มุมกว้าง 45 องศา (Isometric Real-Life) โชว์การจัดเลย์เอาต์ตู้ปลาที่โปร่งโล่ง และฝูงปลาว่ายพร้อมกัน",
            4: "🛋️ [CTA Shot] มุมไกล Slow Pan เห็นตู้ปลาวางบนโต๊ะทำงานคลีนๆ ในบรรยากาศห้องที่ผ่อนคลาย"
        }

        for scene in script.scenes:
            scene.camera_shot_guide = fallback_shots.get(
                scene.scene_number,
                "🎥 มุมถ่ายเจาะตู้ปลาแบบคลีนๆ ปิดไฟรอบห้อง เปิดเฉพาะไฟตู้เพื่อความคมชัด"
            )

        return script
