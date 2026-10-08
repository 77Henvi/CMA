import json
from typing import Dict, Any, List
from ..models import ContentConcept
from ..llm import LLMClient

class StrategistAgent:
    """
    Agent 1: Audience & Trend Strategist
    Analyzes customer pain points, fish species traits, and creates viral content angles.
    """
    def __init__(self, brand_config: Dict[str, Any], llm_client: LLMClient):
        self.brand_config = brand_config
        self.llm_client = llm_client

    def generate_concept(self, topic_or_species: str, user_preference: str = "") -> ContentConcept:
        system_prompt = f"""
        You are the Lead TikTok Growth Strategist for an Ornamental Fish Shop.
        Brand Context:
        - Niche: {self.brand_config.get('niche')}
        - Target Audience: {self.brand_config.get('target_audience', {}).get('primary')}
        - Common Pain Points: {json.dumps(self.brand_config.get('target_audience', {}).get('pain_points', []), ensure_ascii=False)}

        Create a high-impact TikTok content concept about: "{topic_or_species}".
        Additional Preference: "{user_preference}"

        Return JSON matching this exact structure:
        {{
            "title_th": "ชื่อคลิปภาษาไทยที่น่าดึงดูดและมีพลังหยุดนิ้ว",
            "pillar": "mythbuster" or "aquascape_design" or "species_anatomy" or "interactive_quiz",
            "target_emotion": "ความรู้สึกหลัก เช่น สงสัย, ว้าว, สบายใจ",
            "core_problem": "ปัญหาหรือความเข้าใจผิดที่คลิปนี้จะเฉลย",
            "estimated_duration_sec": 30
        }}
        """
        user_prompt = f"Topic/Species: {topic_or_species}\nDetails: {user_preference}"

        if self.llm_client.is_configured():
            result = self.llm_client.generate_json(system_prompt, user_prompt)
            if result:
                return ContentConcept(**result)

        # Fallback smart generator for ornamental fish domain
        return self._smart_fallback(topic_or_species, user_preference)

    def _smart_fallback(self, topic: str, preference: str) -> ContentConcept:
        topic_lower = topic.lower()
        if "นีออน" in topic_lower or "tetra" in topic_lower:
            return ContentConcept(
                title_th="ทำไมปลานีออนในตู้คุณ 'ไม่ยอมว่ายเป็นฝูง' เหมือนในคลิป?",
                pillar="species_anatomy",
                target_emotion="ไขข้อสงสัย & ได้ความรู้ใหม่",
                core_problem="คนเลี้ยงสงสัยว่าทำไมซื้อปลานีออนมาแล้วว่ายสะเปะสะปะ ไม่เกาะกลุ่ม",
                estimated_duration_sec=30
            )
        elif "กัด" in topic_lower or "betta" in topic_lower:
            return ContentConcept(
                title_th="3 ความเข้าใจผิดในการเลี้ยงปลากัด ที่ทำให้ปลาป่วยเงียบๆ",
                pillar="mythbuster",
                target_emotion="ตกใจ & อยากรีบแก้ไข",
                core_problem="คนส่วนใหญ่คิดว่าปลากัดเลี้ยงในโหลแคบๆ ได้โดยไม่ต้องดูแลน้ำ",
                estimated_duration_sec=35
            )
        elif "ขุ่น" in topic_lower or "กรอง" in topic_lower or "น้ำ" in topic_lower:
            return ContentConcept(
                title_th="ตู้ปลาน้ำขุ่นเร็วมาก ล้างเท่าไหร่ก็ไม่ใส แก้ง่ายๆ ด้วยจุดนี้จุดเดียว",
                pillar="mythbuster",
                target_emotion="โล่งใจ & ได้วิธีแก้ทันที",
                core_problem="ล้างระบบกรองผิดวิธีจนแบคทีเรียดีตายหมด ทำให้น้ำขุ่นตลอดเวลา",
                estimated_duration_sec=30
            )
        elif "จัดตู้" in topic_lower or "minimal" in topic_lower or "ไม้น้ำ" in topic_lower:
            return ContentConcept(
                title_th="วิธีจัดตู้ปลามินิมอลบนโต๊ะทำงาน งบประหยัด สวยคลีน สบายตา",
                pillar="aquascape_design",
                target_emotion="ผ่อนคลาย สบายตา และอยากทำตาม",
                core_problem="อยากมีตู้ปลาสวยๆ สไตล์มินิมอล แต่กลัวดูแลยากและงบบานปลาย",
                estimated_duration_sec=35
            )
        else:
            return ContentConcept(
                title_th=f"ความลับของ '{topic}' ที่คนเลี้ยงปลา 90% ยังไม่เคยรู้",
                pillar="mythbuster",
                target_emotion="อยากรู้อยากเห็น & ตื่นเต้น",
                core_problem=f"เทคนิคและการดูแล {topic} ให้สวย สมบูรณ์ แข็งแรง และอายุยืน",
                estimated_duration_sec=30
            )
