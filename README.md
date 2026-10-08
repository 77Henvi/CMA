# 🐠 3D Minimal Fish Shop Content Creator AI Agent Team

ระบบ Multi-Agent AI อัตโนมัติสำหรับคิดไอเดีย, เขียนบทพากย์, และสร้าง 3D Prompts สำหรับช่อง TikTok ร้านปลาสวยงาม สไตล์ **3D Clean Minimalism** โดยเฉพาะ

---

## 🌟 จุดเด่นของระบบ

1. **ฉีกสไตล์จากตลาดเดิม:** เปลี่ยนจากคลิปถ่ายตู้ปลาธรรมดา มาเป็นงานภาพ **3D Minimalist Render** (Matte Clay, Translucent Water, Soft Pastel Studio Light) ที่ดูสบายตาและพรีเมียม
2. **Lean 4-Agent Pipeline:**
   - **Agent 1: Strategist** ค้นหาหัวข้อที่คนเลี้ยงปลาสงสัยและมีโอกาสไวรัล
   - **Agent 2: Scriptwriter** เขียนบทสั้น 15-35 วิ (Hook 3 วิแรก + คำพากย์ภาษาไทยเป็นธรรมชาติ + On-Screen Text) สำหรับนำไปอ่านพากย์เอง
   - **Agent 3: 3D Art Director** แปลงแต่ละฉากเป็น Prompt 3D ภาษาอังกฤษ พร้อม Copy วางใน Midjourney / Flux / Kling
   - **Agent 4: QA Evaluator** ตรวจสอบคะแนน Retention และการกระตุ้นคอมเมนต์ก่อนส่งมอบ
3. **ใช้งานได้ทันทีทั้งแบบ Offline และเชื่อมต่อ LLM API (Gemini / OpenAI / Groq)**

---

## 📁 โครงสร้างโปรเจกต์

```text
Content Creator Team Agents/
├── config/
│   ├── brand_dna.yaml          # ข้อมูล Niche, ปัญหาลูกค้า, และ Mood & Tone
│   └── 3d_style_guide.yaml     # Master Tokens คุมโทนภาพ 3D Minimal
├── src/
│   ├── models.py               # Data Schemas (Pydantic)
│   ├── llm.py                  # ระบบเชื่อมต่อ LLM หรือ Offline Engine
│   ├── pipeline.py             # ตัวคุมกระบวนการทำงานของ 4 Agents
│   ├── formatters.py           # ตัวแปลงผลลัพธ์เป็น Production Sheet
│   └── agents/
│       ├── strategist.py       # Agent 1
│       ├── scriptwriter.py     # Agent 2
│       ├── art_director.py     # Agent 3
│       └── qa_evaluator.py     # Agent 4
├── outputs/                    # เก็บ Production Sheet (Markdown & JSON)
├── main.py                     # เมนูรันโปรแกรม
└── requirements.txt            # Python Dependencies
```

---

## 🚀 วิธีการใช้งาน

### 1. ติดตั้ง Dependencies
```bash
py -m pip install -r requirements.txt
```

### 2. (ตัวเลือกเสริม) ตั้งค่า API Key
หากต้องการให้ AI ครีเอทบทใหม่ๆ อย่างไร้ขีดจำกัด ให้สร้างไฟล์ `.env` แล้วใส่คีย์:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(ถ้าไม่ใส่ ระบบจะใช้ Smart Niche Engine สำหรับปลาสวยงามทำงานแบบ Offline ได้ทันที)*

### 3. รันโปรแกรม
```bash
py main.py
```
เมื่อรันเสร็จ ระบบจะสร้าง **Production Pack** เก็บไว้ในโฟลเดอร์ `outputs/` ให้คุณนำบทไปอัดเสียงและ Copy 3D Prompts ไปกด Gen ภาพ/วิดีโอได้ทันที!
