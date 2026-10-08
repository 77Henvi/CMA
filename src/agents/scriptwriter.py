import json
from typing import Dict, Any, List
from ..models import ContentConcept, TikTokScript, ScriptScene
from ..llm import LLMClient

class ScriptwriterAgent:
    """
    Agent 2: TikTok Retention Scriptwriter
    Produces high-retention 15-45s scripts with precise timing, voiceover, and on-screen text.
    """
    def __init__(self, brand_config: Dict[str, Any], llm_client: LLMClient):
        self.brand_config = brand_config
        self.llm_client = llm_client

    def generate_script(self, concept: ContentConcept, feedback_notes: str = "") -> TikTokScript:
        system_prompt = f"""
        You are a Master TikTok Retention Scriptwriter for an Ornamental Fish channel.
        Formula for viral retention:
        - 00:00 - 00:03: Visual & Verbal Hook (หยุดนิ้วคนดูทันที)
        - 00:04 - 00:15: Core Value & Insight (กระชับ ไม่น้ำท่วมทุ่ง)
        - 00:16 - 00:25: Actionable Tip (นำไปใช้ได้ทันที)
        - 00:26 - 00:30: Comment Trigger (คำถามชวนคอมเมนต์/ปักหมุด)

        Language: Natural, conversational Thai (for creator to voiceover themselves).
        Tone: Friendly, authoritative, calm, engaging.

        Generate JSON matching this exact structure:
        {{
            "hook_3sec": "ประโยค Hook สั้นๆ 3 วินาทีแรก",
            "scenes": [
                {{
                    "scene_number": 1,
                    "time_range": "00:00 - 00:03",
                    "voiceover_th": "บทพูดพากย์ภาษาไทย...",
                    "on_screen_text": "ข้อความบนจอ...",
                    "visual_action_description": "คำอธิบายภาพ 3D ในฉาก..."
                }}
            ],
            "caption_th": "แคปชันโพสต์ TikTok พร้อมกระตุ้นให้เซฟหรือแชร์",
            "hashtags": ["#ปลาสวยงาม", "#ตู้ปลา", "..."],
            "pinned_comment": "คำถามชวนคนดูคอมเมนต์ตอบ..."
        }}
        """
        user_prompt = f"""
        Concept Title: {concept.title_th}
        Pillar: {concept.pillar}
        Target Emotion: {concept.target_emotion}
        Core Problem: {concept.core_problem}
        Revision/Feedback Notes: {feedback_notes if feedback_notes else 'None'}
        """

        if self.llm_client.is_configured():
            result = self.llm_client.generate_json(system_prompt, user_prompt)
            if result:
                scenes = [ScriptScene(**s) for s in result.get("scenes", [])]
                return TikTokScript(
                    concept=concept,
                    hook_3sec=result.get("hook_3sec", ""),
                    scenes=scenes,
                    caption_th=result.get("caption_th", ""),
                    hashtags=result.get("hashtags", []),
                    pinned_comment=result.get("pinned_comment", "")
                )

        # High-quality fallback script generator
        return self._smart_fallback(concept)

    def _smart_fallback(self, concept: ContentConcept) -> TikTokScript:
        if "นีออน" in concept.title_th:
            scenes = [
                ScriptScene(
                    scene_number=1,
                    time_range="00:00 - 00:03",
                    voiceover_th="เคยสงสัยมั้ยครับ? ซื้อปลานีออนมาทีไร ทำไมมันไม่ยอมว่ายเป็นฝูงเหมือนในคลิป...",
                    on_screen_text="ทำไมปลานีออน 'ไม่ยอมรวมฝูง'?",
                    visual_action_description="โมเดล 3D ตู้ปลาใสทรงสี่เหลี่ยมคลีนๆ มีปลานีออนเรืองแสงว่ายกระจายตัวคนละทิศละทางอย่างเคว้งคว้าง",
                ),
                ScriptScene(
                    scene_number=2,
                    time_range="00:04 - 00:14",
                    voiceover_th="ความจริงคือ ปลานีออนจะว่ายรวมฝูง ก็ต่อเมื่อมัน 'รู้สึกไม่ปลอดภัย' หรือมีพื้นที่เปิดโล่งกว้างๆ เท่านั้นครับ ถ้าในตู้ไม่มีปลาตัวใหญ่ หรือมีขอนไม้บังทัศนวิสัย มันจะรู้สึกชิลล์จนแยกย้ายกันว่ายเดี่ยว",
                    on_screen_text="ปลานีออนรวมฝูง = สัญชาตญาณระวังภัย!",
                    visual_action_description="มุมมอง 3D Cutaway โชว์ให้เห็นเส้นสายตากราฟิก 3D แสงนีออนสีฟ้า-แดง เมื่อปลาเริ่มตรวจจับสภาพแวดล้อมรอบตัว",
                ),
                ScriptScene(
                    scene_number=3,
                    time_range="00:15 - 00:24",
                    voiceover_th="ถ้าอยากให้ว่ายรวมฝูงสวยๆ แนะนำ 2 ทริคครับ: 1. เลี้ยงอย่างน้อย 10-15 ตัวขึ้นไป และ 2. จัดพื้นที่ตรงกลางตู้ให้โล่ง เพื่อให้ปลาว่ายเป็นกระแสน้ำเดียวกันได้",
                    on_screen_text="2 ทริค: เลี้ยง 10+ ตัว & เปิดพื้นที่กลางตู้",
                    visual_action_description="ภาพ 3D Isometric ฝูงปลานีออน 15 ตัวว่ายวนพร้อมกันเป็นระเบียบสวยงาม แสงสะท้อนผิวน้ำนุ่มนวลสไตล์ Minimal",
                ),
                ScriptScene(
                    scene_number=4,
                    time_range="00:25 - 00:30",
                    voiceover_th="ตู้ที่บ้านเพื่อนๆ เลี้ยงปลานีออนไว้กี่ตัวครับ? ว่ายรวมฝูงกันมั้ย ลองคอมเมนต์บอกกันหน่อยครับ",
                    on_screen_text="ที่บ้านเลี้ยงกี่ตัว? คอมเมนต์เลย 👇",
                    visual_action_description="ตู้ปลา 3D สไตล์ Zen วางบนโต๊ะทำงานคลีนๆ พร้อมกล่องข้อความคอมเมนต์เด้งขึ้นมาเบาๆ",
                )
            ]
            return TikTokScript(
                concept=concept,
                hook_3sec="ทำไมปลานีออนในตู้คุณ 'ไม่ยอมว่ายเป็นฝูง'?",
                scenes=scenes,
                caption_th="ความลับของพฤติกรรมปลานีออนที่หลายคนเข้าใจผิด! 🐟✨ ใครที่เลี้ยงแล้วว่ายแตกฝูง ดูคลิปนี้จบเก็ททันที #ปลาสวยงาม #ปลานีออน #ตู้ปลา #จัดตู้ปลา #ความรู้สัตว์เลี้ยง",
                hashtags=["#ปลาสวยงาม", "#ปลานีออน", "#ตู้ปลามินิมอล", "#Aquascaping", "#TikTokUni"],
                pinned_comment="ที่บ้านใครเลี้ยงปลานีออนแล้วว่ายแตกฝูงบ้าง? มีกี่ตัวในตู้ ลองบอกขนาดตู้กับจำนวนปลามาได้เลยครับ เดี๋ยวช่วยดูให้!"
            )
        else:
            scenes = [
                ScriptScene(
                    scene_number=1,
                    time_range="00:00 - 00:03",
                    voiceover_th=f"ถ้าคุณเลี้ยงปลา ต้องรู้สิ่งนี้ก่อนจะสายเกินไป...",
                    on_screen_text=f"ความลับของ {concept.title_th[:20]}...",
                    visual_action_description="โมเดล 3D ตู้ปลาแบบ Minimalist ผ่าครึ่ง (Cross-section) มีแสงไฟนุ่มๆ ส่องลงมา",
                ),
                ScriptScene(
                    scene_number=2,
                    time_range="00:04 - 00:15",
                    voiceover_th=f"สาเหตุหลักที่ {concept.core_problem} เพราะระบบในตู้ยังไม่สมดุลครับ",
                    on_screen_text="สาเหตุที่หลายคนมองข้าม!",
                    visual_action_description="อนิเมชั่น 3D แสดงโมเลกุลน้ำและฟองอากาศแบบคลีนๆ สีพาสเทล",
                ),
                ScriptScene(
                    scene_number=3,
                    time_range="00:16 - 00:24",
                    voiceover_th="วิธีแก้ง่ายที่สุดคือปรับระบบนิเวศน์ทีละจุด ค่อยๆ ปรับสภาพน้ำ และให้อาหารแต่พอดีครับ",
                    on_screen_text="วิธีแก้: ปรับสมดุลระบบนิเวศน์",
                    visual_action_description="ภาพ 3D ตู้ปลาที่กลับมาใสสะอาด ผิวน้ำสะท้อนแสงนวลตา ปลารูปร่างสวยว่ายอย่างสบายใจ",
                ),
                ScriptScene(
                    scene_number=4,
                    time_range="00:25 - 00:30",
                    voiceover_th="ใครเคยเจอปัญหานี้บ้างมั้ยครับ? แก้กันยังไง ลองพิมพ์แชร์ประสบการณ์ไว้ในคอมเมนต์ได้เลยครับ",
                    on_screen_text="เคยเจอปัญหานี้มั้ย? แชร์กันในคอมเมนต์ 👇",
                    visual_action_description="ภาพ 3D Minimal Room มุมกว้าง สบายตา พร้อมไอคอนคอมเมนต์",
                )
            ]
            return TikTokScript(
                concept=concept,
                hook_3sec=f"ถ้าคุณเลี้ยงปลา ต้องรู้สิ่งนี้...",
                scenes=scenes,
                caption_th=f"{concept.title_th} 🐠💡 เทคนิคที่คนรักปลาห้ามพลาด เซฟไว้ดูย้อนหลังได้เลยครับ #ปลาสวยงาม #ตู้ปลา #สัตว์เลี้ยง",
                hashtags=["#ปลาสวยงาม", "#ตู้ปลา", "#สัตว์เลี้ยงน่ารัก", "#ความรู้ดีๆ", "#จัดตู้ปลา"],
                pinned_comment="ใครมีวิธีดูแลแบบไหนเป็นพิเศษ มาแชร์ให้เพื่อนๆ มือใหม่ในคอมเมนต์กันได้เลยนะครับ!"
            )
