import os
import sys
import yaml
import datetime
import uuid
from typing import Dict, Any, Optional

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .models import ProductionPack
from .llm import LLMClient
from .agents.strategist import StrategistAgent
from .agents.scriptwriter import ScriptwriterAgent
from .agents.shot_director import ShotDirectorAgent
from .agents.qa_evaluator import QAEvaluatorAgent
from .formatters import format_production_pack_markdown

class ContentCreationPipeline:
    """
    Main Orchestrator for the 4-Agent Content Creation Team.
    Flow:
    Strategist -> Scriptwriter -> Shot Director -> QA Evaluator -> Production Pack
    """
    def __init__(self, brand_config_path: str = "config/brand_dna.yaml"):
        self.brand_config = self._load_yaml(brand_config_path)
        self.llm_client = LLMClient()

        # Initialize Agents
        self.strategist = StrategistAgent(self.brand_config, self.llm_client)
        self.scriptwriter = ScriptwriterAgent(self.brand_config, self.llm_client)
        self.shot_director = ShotDirectorAgent(self.brand_config, self.llm_client)
        self.qa_evaluator = QAEvaluatorAgent(self.brand_config, self.llm_client)

    def _load_yaml(self, path: str) -> Dict[str, Any]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        return {}

    def run(self, topic_or_species: str, user_preference: str = "", max_revisions: int = 2) -> ProductionPack:
        print(f"\n🚀 [Agent 1: Strategist] วิเคราะห์หัวข้อ: '{topic_or_species}'...")
        concept = self.strategist.generate_concept(topic_or_species, user_preference)
        print(f"   💡 ได้คอนเซปต์: {concept.title_th} (Pillar: {concept.pillar})")

        revision_count = 0
        feedback_notes = ""
        script = None
        qa_report = None

        while revision_count <= max_revisions:
            print(f"\n✍️ [Agent 2: Scriptwriter] กำลังเขียนบทพากย์ & วางจังหวะ Hook (รอบที่ {revision_count + 1})...")
            script = self.scriptwriter.generate_script(concept, feedback_notes)

            print(f"\n🎬 [Agent 3: Shot Director] วางมุมกล้องและแนวทางการถ่ายทำจริงในร้าน...")
            script = self.shot_director.enrich_script_with_shot_guide(script)

            print(f"\n📊 [Agent 4: QA Evaluator] ตรวจสอบคะแนน Algorithm & Engagement...")
            qa_report = self.qa_evaluator.evaluate(script)
            print(f"   ⭐ คะแนนรวม: {qa_report.overall_score:.1f}/10 ({'ผ่านเกณฑ์ ✅' if qa_report.passed else 'ต้องปรับปรุง ⚠️'})")

            if qa_report.passed or revision_count >= max_revisions:
                break

            revision_count += 1
            feedback_notes = " ".join(qa_report.improvement_suggestions)
            print(f"   🔄 กำลังส่งกลับไปปรับแก้ตามข้อเสนอแนะ: {feedback_notes}")

        project_id = f"FISH-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        production_pack = ProductionPack(
            project_id=project_id,
            created_at=created_at,
            script=script,
            qa_report=qa_report
        )

        return production_pack

    def save_output(self, pack: ProductionPack, output_dir: str = "outputs") -> str:
        os.makedirs(output_dir, exist_ok=True)
        filename_base = f"{pack.project_id}_{pack.script.concept.pillar}"

        # Save Markdown Production Sheet
        md_content = format_production_pack_markdown(pack)
        md_path = os.path.join(output_dir, f"{filename_base}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        # Save JSON data
        json_path = os.path.join(output_dir, f"{filename_base}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(pack.model_dump_json(indent=2))

        return md_path
