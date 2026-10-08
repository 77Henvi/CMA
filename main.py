import sys
import os

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure local imports work smoothly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.pipeline import ContentCreationPipeline
from src.formatters import format_production_pack_markdown

def main():
    print("=" * 65)
    print("🐠  3D Minimal Fish Shop Content Creator Agent Team  🐠")
    print("    AI Multi-Agent System for High-Retention TikTok Videos")
    print("=" * 65)

    pipeline = ContentCreationPipeline()

    presets = [
        "1. ปลานีออน (ทำไมไม่ยอมว่ายเป็นฝูง & ทริคจัดตู้)",
        "2. ปลากัด (3 ความเข้าใจผิดที่คนเลี้ยงชอบทำ)",
        "3. ปัญหาน้ำขุ่น (วิธีแก้น้ำขุ่นแบบวิถีมินิมอล ไม่ต้องล้างบ่อย)",
        "4. จัดตู้ปลามินิมอลบนโต๊ะทำงาน (งบประหยัด สวยคลีน)",
        "5. กำหนดหัวข้อ/สายพันธุ์ปลาเอง (Custom Topic)"
    ]

    print("\nเลือกโจทย์คอนเทนต์ที่ต้องการสร้าง:")
    for p in presets:
        print(f"  {p}")

    choice = input("\n👉 กรุณาเลือกหมายเลข (1-5) [กด Enter เพื่อเลือก 1]: ").strip()

    topic = "ปลานีออน"
    user_notes = ""

    if choice == "2":
        topic = "ปลากัด"
    elif choice == "3":
        topic = "ปัญหาน้ำขุ่นในตู้ปลาและระบบกรอง"
    elif choice == "4":
        topic = "จัดตู้ปลามินิมอลบนโต๊ะทำงาน"
    elif choice == "5":
        topic = input("พิมพ์ชื่อปลา หรือ ปัญหาที่ต้องการทำคอนเทนต์: ").strip()
        user_notes = input("รายละเอียดเพิ่มเติมที่ต้องการเน้น (ถ้ามี): ").strip()
    else:
        topic = "ปลานีออนไม่ยอมว่ายรวมฝูง"

    print("\n" + "-" * 65)
    print(f"🎬 กำลังเริ่มกระบวนการสร้างคอนเทนต์สำหรับ: '{topic}'")
    print("-" * 65)

    production_pack = pipeline.run(topic, user_notes)
    saved_path = pipeline.save_output(production_pack)

    print("\n" + "=" * 65)
    print("🎉 ผลิตคอนเทนต์สำเร็จเรียบร้อย! (Production Pack Ready)")
    print(f"📂 บันทึกไฟล์ Production Sheet ที่: {saved_path}")
    print("=" * 65)

    # Print summary preview to terminal
    print("\n" + format_production_pack_markdown(production_pack))

if __name__ == "__main__":
    main()
