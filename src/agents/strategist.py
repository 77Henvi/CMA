import json
from typing import Dict, Any, List, Optional
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

    def brainstorm_topics(self, count: int = 4, exclude: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Brainstorms up to `count` fresh, viral topic ideas for TikTok clips.
        Ensures topics are not in `exclude` list (labels or IDs).
        """
        import random
        exclude_set = set(exclude or [])

        # Curated bank of viral aquarium / ornamental fish topics
        topic_bank = [
            {
                "id": "neon-flock",
                "label": "ปลานีออนไม่รวมฝูง",
                "query": "ทำไมปลานีออนไม่ยอมว่ายรวมฝูง และวิธีฝึกให้เกาะกลุ่ม",
                "pillar": "species_anatomy"
            },
            {
                "id": "betta-myth",
                "label": "ความลับเลี้ยงปลากัด",
                "query": "3 ความเข้าใจผิดในการเลี้ยงปลากัด ที่ทำให้ปลาป่วยเงียบๆ",
                "pillar": "mythbuster"
            },
            {
                "id": "cloudy-water",
                "label": "แก้น้ำขุ่นถาวร",
                "query": "วิธีแก้น้ำขุ่นในตู้ปลาให้ใสวิ้ง ไม่ต้องล้างตู้บ่อย",
                "pillar": "mythbuster"
            },
            {
                "id": "minimal-tank",
                "label": "จัดตู้มินิมอลบนโต๊ะ",
                "query": "วิธีจัดตู้ปลามินิมอลบนโต๊ะทำงาน สวยคลีน สบายตา",
                "pillar": "aquascape_design"
            },
            {
                "id": "shrimp-molt",
                "label": "กุ้งแคระลอกคราบ",
                "query": "วิธีกู้ชีพกุ้งแคระลอกคราบไม่ออก และปรับค่าน้ำป้องกัน",
                "pillar": "species_anatomy"
            },
            {
                "id": "hair-algae",
                "label": "กำจัดตะไคร่เส้นผม",
                "query": "เทคนิคกำจัดตะไคร่เส้นผมในตู้ไม้น้ำ แบบถอนรากถอนโคน",
                "pillar": "aquascape_design"
            },
            {
                "id": "cardinal-vs-neon",
                "label": "คาร์ดินัล vs นีออน",
                "query": "ปลาคาร์ดินัลกับปลานีออน ต่างกันยังไง เลือกตัวไหนเลี้ยงง่ายกว่า",
                "pillar": "species_anatomy"
            },
            {
                "id": "ich-white-spot",
                "label": "รักษาโรคจุดขาว",
                "query": "วิธีรักษาโรคจุดขาวในตู้ปลาช่วงหน้าหนาว ไม่ให้ลามทั้งตู้",
                "pillar": "mythbuster"
            },
            {
                "id": "discus-diet",
                "label": "ปลาดิสคัสกินยาก",
                "query": "สูตรขุนปลาดิสคัสกินยาก ให้กลับมาอ้วนสมบูรณ์ สีสดจัดจ้าน",
                "pillar": "species_anatomy"
            },
            {
                "id": "goldfish-swim",
                "label": "ปลาทองหงายท้อง",
                "query": "สาเหตุปลาทองว่ายหงายท้อง เสียศูนย์ และวิธีปฐมพยาบาลด่วน",
                "pillar": "mythbuster"
            },
            {
                "id": "plant-melting",
                "label": "ต้นไม้น้ำใบละลาย",
                "query": "ต้นไม้น้ำใบละลายหลังปักตู้ใหม่ แก้ปัญหาอย่างไรให้แตกยอดใหม่",
                "pillar": "aquascape_design"
            },
            {
                "id": "corydoras-sand",
                "label": "ปลาแพะคุ้ยทราย",
                "query": "เลือกทรายรองพื้นให้ปลาแพะยังไง ไม่ให้หนวดกุดและติดเชื้อ",
                "pillar": "species_anatomy"
            },
            {
                "id": "water-change",
                "label": "เทคนิคเปลี่ยนน้ำ 20%",
                "query": "วิธีเปลี่ยนน้ำตู้ปลา 20% โดยที่ปลาไม่ช็อกและแบคทีเรียไม่พัง",
                "pillar": "mythbuster"
            },
            {
                "id": "filter-media",
                "label": "จัดเรียงมีเดียกรอง",
                "query": "วิธีจัดเรียงมีเดียกรองนอกตู้ปลาให้น้ำใสและดักฝุ่นดีที่สุด",
                "pillar": "aquascape_design"
            },
            {
                "id": "nerite-snail",
                "label": "หอยเขาคุมตะไคร่",
                "query": "ข้อดีข้อเสียของหอยเขา เลี้ยงยังไงไม่ให้ไข่ติดเต็มขอนไม้",
                "pillar": "species_anatomy"
            },
            {
                "id": "guppy-breeding",
                "label": "เพาะปลาหางนกยูง",
                "query": "เคล็ดลับเพาะลูกปลาหางนกยูงให้รอด 99% ตัวโตไว หางใหญ่ฟอร์มสวย",
                "pillar": "species_anatomy"
            },
            {
                "id": "wrgb-light",
                "label": "ตั้งไฟตู้ไม้น้ำ",
                "query": "วิธีปรับแสงไฟ WRGB ตู้ไม้น้ำให้ไม้แดงเข้ม ตะไคร่ไม่บุก",
                "pillar": "aquascape_design"
            },
            {
                "id": "co2-check",
                "label": "คุมคาร์บอน CO2",
                "query": "วิธีดูดรอปเช็คเกอร์ CO2 ตู้ไม้น้ำ ไม่ให้ปลาลอยหัวขาดอากาศ",
                "pillar": "mythbuster"
            },
            {
                "id": "dwarf-gourami",
                "label": "ปลากระดี่แคระ",
                "query": "การเลี้ยงปลากระดี่แคระนีออน เมทตู้แบบไหนไม่โดนไล่ตอด",
                "pillar": "species_anatomy"
            },
            {
                "id": "bacterial-bloom",
                "label": "น้ำขาวหลังตั้งตู้",
                "query": "ตั้งตู้ใหม่แล้วน้ำขาวเหมือนน้ำนม แบคทีเรียบูมแก้อย่างไรให้ใสกริบ",
                "pillar": "mythbuster"
            },
            {
                "id": "arowana-diet",
                "label": "อาหารปลามังกร",
                "query": "อาหารสด vs อาหารเม็ด เลี้ยงปลามังกรอโรวาน่าแบบไหนเกล็ดเงางามกว่า",
                "pillar": "species_anatomy"
            },
            {
                "id": "moss-care",
                "label": "มอสชวาไม่เหลือง",
                "query": "วิธีดูแลมอสชวาและสไปกี้มอสให้เขียวฟู ไม่ดำไม่เหลืองกรอบ",
                "pillar": "aquascape_design"
            }
        ]

        # Attempt LLM brainstorm if configured and count == 1 (for real-time freshness)
        if self.llm_client.is_configured() and count <= 2:
            try:
                system_prompt = """You are the Lead Creative Strategist for an Ornamental Fish & Aquascaping shop TikTok channel.
Generate 1 or 2 high-impact viral content topics in Thai for TikTok short videos (20-40s).
Format as JSON list with fields:
- id: short english slug
- label: short punchy Thai button text (max 18 chars)
- query: full engaging video hook/question in Thai
- pillar: one of 'species_anatomy', 'mythbuster', 'aquascape_design'
Do not repeat these existing topics: """ + ", ".join(list(exclude_set)[:10])

                user_prompt = f"Brainstorm {count} unique fresh viral topic(s) that fishkeepers love."
                llm_res = self.llm_client.generate_json(system_prompt, user_prompt)
                if isinstance(llm_res, list) and len(llm_res) > 0:
                    valid_items = []
                    for item in llm_res:
                        if isinstance(item, dict) and "label" in item and "query" in item:
                            item_id = item.get("id") or str(random.randint(1000, 9999))
                            if item_id not in exclude_set and item.get("label") not in exclude_set:
                                valid_items.append({
                                    "id": str(item_id),
                                    "label": str(item["label"]),
                                    "query": str(item["query"]),
                                    "pillar": str(item.get("pillar", "species_anatomy"))
                                })
                    if len(valid_items) >= count:
                        return valid_items[:count]
            except Exception:
                pass  # smoothly fall through to topic bank

        # Filter available topics not in exclude
        available = [
            t for t in topic_bank
            if t["id"] not in exclude_set and t["label"] not in exclude_set and t["query"] not in exclude_set
        ]

        if len(available) < count:
            # If exhausted, pick from whole pool excluding only immediate matches
            random.shuffle(topic_bank)
            return topic_bank[:count]

        random.shuffle(available)
        return available[:count]

