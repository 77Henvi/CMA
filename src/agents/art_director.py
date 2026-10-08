import json
from typing import Dict, Any, List
from ..models import TikTokScript, ScriptScene
from ..llm import LLMClient

class ArtDirectorAgent:
    """
    Agent 3: 3D Minimal Visual Art Director
    Transforms each script scene into precise, high-aesthetic 3D Minimal generation prompts.
    """
    def __init__(self, style_guide: Dict[str, Any], llm_client: LLMClient):
        self.style_guide = style_guide
        self.llm_client = llm_client

    def enrich_script_with_3d_prompts(self, script: TikTokScript) -> TikTokScript:
        master_positive = self.style_guide.get("master_positive_tokens", "")
        master_negative = self.style_guide.get("master_negative_tokens", "")
        aspect_ratio = self.style_guide.get("platforms", {}).get("tiktok", {}).get("aspect_ratio", "--ar 9:16")

        system_prompt = f"""
        You are the 3D Minimal Visual Art Director for an aesthetic fish shop TikTok channel.
        Your style principles:
        - 3D stylized render, smooth matte clay & porcelain texture, translucent clean water.
        - Soft pastel studio lighting, diffused shadows, clean geometric forms, zero visual clutter.
        - Isometric aquarium cutaways, elegant minimalism, octane render aesthetic.
        - Every prompt must end with aspect ratio: {aspect_ratio}

        Master Positive Tokens: {master_positive}
        Master Negative Tokens: {master_negative}

        Generate English 3D image/video prompts for all scenes in the script.
        Return JSON matching this exact structure:
        {{
            "scenes": [
                {{
                    "scene_number": 1,
                    "prompt_3d_minimal": "Detailed 3D prompt in English..."
                }}
            ]
        }}
        """

        scenes_summary = [
            {"scene_number": s.scene_number, "action": s.visual_action_description, "voiceover": s.voiceover_th}
            for s in script.scenes
        ]
        user_prompt = f"Topic: {script.concept.title_th}\nScenes to generate 3D prompts for:\n{json.dumps(scenes_summary, ensure_ascii=False)}"

        if self.llm_client.is_configured():
            result = self.llm_client.generate_json(system_prompt, user_prompt)
            if result and "scenes" in result:
                prompt_map = {item["scene_number"]: item["prompt_3d_minimal"] for item in result["scenes"]}
                for scene in script.scenes:
                    if scene.scene_number in prompt_map:
                        scene.prompt_3d_minimal = prompt_map[scene.scene_number]
                return script

        # High-aesthetic fallback 3D prompt generator
        for scene in script.scenes:
            scene.prompt_3d_minimal = self._generate_fallback_prompt(scene, script.concept.title_th, aspect_ratio)
        return script

    def _generate_fallback_prompt(self, scene: ScriptScene, title: str, ar: str) -> str:
        prompt_templates = {
            1: "Minimalist 3D isometric cutaway of a modern transparent cube aquarium, smooth matte clay substrate, glowing pastel neon tetra fish swimming scattered in different directions, crystal-clear translucent water, gentle caustics, soft studio rim lighting, ultra-clean aesthetic",
            2: "3D stylized educational diagram cutaway of an aquarium, visual sensory sightlines in soft glowing pastel blue and coral red lines, tranquil ambiance, matte porcelain rocks, serene atmosphere, octane render, c4d",
            3: "3D minimalist isometric view of a clean aquascape with 15 synchronized neon tetra fish swimming together in a harmonious school, spacious open center, soft ambient lighting, pastel sage green aquatic plants, serene zen feeling",
            4: "Minimalist modern aesthetic room desk setup with a small glowing 3D nano cube aquarium, warm pastel sunset lighting, clean geometric decor, subtle floating 3D comment bubble icon, cozy atmosphere"
        }
        base_desc = prompt_templates.get(
            scene.scene_number,
            "Minimalist 3D stylized render of a serene clean aquarium, smooth matte clay textures, translucent crystal-clear water, pastel colors"
        )
        return f"{base_desc}, diffused shadows, no visual clutter, elegant simplicity, octane render {ar}"
