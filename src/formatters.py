import json
from .models import ProductionPack

def format_production_pack_markdown(pack: ProductionPack) -> str:
    script = pack.script
    concept = script.concept
    qa = pack.qa_report

    lines = []
    lines.append(f"# TikTok Production Pack: {concept.title_th}")
    lines.append(f"**Project ID:** `{pack.project_id}` | **Date:** {pack.created_at} | **Pillar:** `{concept.pillar}`")
    lines.append("")
    lines.append("---")
    lines.append("## TikTok Strategy & Overview")
    lines.append(f"- **Core Problem / Mystery:** {concept.core_problem}")
    lines.append(f"- **Target Emotion:** {concept.target_emotion}")
    lines.append(f"- **Estimated Duration:** ~{concept.estimated_duration_sec} Seconds")
    lines.append(f"- **3-Second Hook:** > **\"{script.hook_3sec}\"**")
    lines.append("")
    lines.append("---")
    lines.append("## Scene Breakdown & Camera Shot Direction")
    lines.append("")

    for s in script.scenes:
        lines.append(f"### Scene {s.scene_number} ({s.time_range})")
        lines.append(f"- **Voiceover (บทพูดพากย์):**")
        lines.append(f"  > \"{s.voiceover_th}\"")
        lines.append(f"- **On-Screen Text:** `{s.on_screen_text}`")
        lines.append(f"- **Visual Action:** {s.visual_action_description}")
        lines.append(f"- **Camera Shot Guide (ไกด์มุมกล้องถ่ายจริง):**")
        lines.append(f"  `{s.camera_shot_guide}`")
        lines.append("")

    lines.append("---")
    lines.append("## TikTok Publishing Assets")
    lines.append(f"### Caption:")
    lines.append(f"```text\n{script.caption_th}\n```")
    lines.append("")
    lines.append(f"### Pinned Comment (Engagement Catalyst):")
    lines.append(f"> **\"{script.pinned_comment}\"**")
    lines.append("")
    lines.append(f"### Hashtags:")
    lines.append(f"`{' '.join(script.hashtags)}`")
    lines.append("")
    lines.append("---")
    lines.append("## TikTok Algorithm QA Audit")
    lines.append(f"- **Overall Score:** **{qa.overall_score:.1f} / 10** ({'PASS' if qa.passed else 'NEED REVISION'})")
    lines.append(f"  - 3-Second Hook Impact: `{qa.hook_score}/10`")
    lines.append(f"  - Retention Potential: `{qa.retention_score}/10`")
    lines.append(f"  - Comment Trigger: `{qa.comment_trigger_score}/10`")
    lines.append(f"  - Filming Feasibility: `{qa.filming_feasibility}/10`")
    lines.append("")
    lines.append("**Key Strengths:**")
    for st in qa.strengths:
        lines.append(f"- {st}")
    lines.append("")
    lines.append("**Production Tips:**")
    for imp in qa.improvement_suggestions:
        lines.append(f"- {imp}")
    lines.append("")

    return "\n".join(lines)
