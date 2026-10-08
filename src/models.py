from typing import List, Optional
from pydantic import BaseModel, Field

class ContentConcept(BaseModel):
    title_th: str = Field(description="ชื่อหัวข้อคลิปภาษาไทยที่ดึงดูดสายตา")
    pillar: str = Field(description="Content Pillar (mythbuster, aquascape_design, species_anatomy, interactive_quiz)")
    target_emotion: str = Field(description="อารมณ์เป้าหมายของผู้ชม เช่น สงสัย, สบายตา, ประหลาดใจ")
    core_problem: str = Field(description="ปัญหาหรือคำถามที่คลิปนี้จะตอบ")
    estimated_duration_sec: int = Field(default=30, description="ความยาวคลิปโดยประมาณ (วินาที)")

class ScriptScene(BaseModel):
    scene_number: int = Field(description="ลำดับฉาก (เริ่มจาก 1)")
    time_range: str = Field(description="ช่วงเวลา เช่น 00:00 - 00:03")
    voiceover_th: str = Field(description="บทพูดพากย์ภาษาไทย เป็นธรรมชาติ มีคำเน้นเสียง")
    on_screen_text: str = Field(description="ข้อความสั้นๆ บนหน้าจอ (เน้นตัวโต อ่านง่าย)")
    visual_action_description: str = Field(description="คำอธิบายภาพในฉากว่าเกิดอะไรขึ้น")
    prompt_3d_minimal: Optional[str] = Field(default="", description="Prompt 3D Minimal ภาษาอังกฤษสำหรับนำไปใส่ Midjourney/Flux")

class TikTokScript(BaseModel):
    concept: ContentConcept
    hook_3sec: str = Field(description="ประโยค Hook 3 วินาทีแรกที่หยุดนิ้วคนดู")
    scenes: List[ScriptScene] = Field(default_factory=list, description="ฉากทั้งหมดในคลิป")
    caption_th: str = Field(description="แคปชันสำหรับโพสต์ลง TikTok")
    hashtags: List[str] = Field(default_factory=list, description="แฮชแท็กที่เหมาะสม")
    pinned_comment: str = Field(description="คำถามสำหรับปักหมุดในคอมเมนต์เพื่อกระตุ้น Engagement")

class QAFeedback(BaseModel):
    hook_score: int = Field(description="คะแนน Hook 3 วิแรก (1-10)", ge=1, le=10)
    retention_score: int = Field(description="คะแนนความน่าติดตามต่อเนื่อง (1-10)", ge=1, le=10)
    comment_trigger_score: int = Field(description="คะแนนการกระตุ้นให้คอมเมนต์ (1-10)", ge=1, le=10)
    visual_3d_feasibility: int = Field(description="คะแนนความเหมาะสมกับสไตล์ 3D Minimal (1-10)", ge=1, le=10)
    overall_score: float = Field(description="คะแนนเฉลี่ยรวม")
    passed: bool = Field(description="ผ่านเกณฑ์คุณภาพหรือไม่ (>= 8.0)")
    strengths: List[str] = Field(default_factory=list, description="จุดเด่นของคลิปนี้")
    improvement_suggestions: List[str] = Field(default_factory=list, description="ข้อเสนอแนะในการปรับปรุง")

class ProductionPack(BaseModel):
    project_id: str
    created_at: str
    script: TikTokScript
    qa_report: QAFeedback
