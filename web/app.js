/**
 * UI controller – talks to the 3D scene (office.js) and the Python backend.
 */
const container = document.getElementById("threeContainer");

// --- Day / Sunset / Night controls ---
document.querySelectorAll(".cycle-btn[data-time]").forEach((btn) => {
  btn.addEventListener("click", () => {
    Office.setAuto(false);
    Office.setAtmosphere(btn.getAttribute("data-time"));
  });
});
document.getElementById("autoCycleBtn")?.addEventListener("click", (e) => {
  Office.setAuto(!e.currentTarget.classList.contains("active"));
});

// --- helpers ---
const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText =
      "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#3b342d;color:#fff;padding:10px 18px;border-radius:999px;font:500 14px system-ui,sans-serif;z-index:9999;opacity:0;transition:opacity .2s;pointer-events:none";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(toast._h);
  toast._h = setTimeout(() => (t.style.opacity = "0"), 1800);
}

// --- Pipeline controller ---
const topicInput = document.getElementById("topicInput");
const generateForm = document.getElementById("generateForm");
const startBtn = document.getElementById("startBtn");
const activeAgentName = document.getElementById("activeAgentName");
const activityStatus = document.getElementById("activityStatus");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
let currentPackData = null;

// --- Dynamic 4-Topic Manager with 5-Minute Auto-Refresh ---
const TOPIC_COUNTDOWN_SEC = 300; // 5 minutes per topic
const MAX_TOPICS = 4;

const FALLBACK_TOPIC_BANK = [
  { id: "neon-flock", label: "ปลานีออนไม่รวมฝูง", query: "ทำไมปลานีออนไม่ยอมว่ายรวมฝูง และวิธีฝึกให้เกาะกลุ่ม" },
  { id: "betta-myth", label: "ความลับเลี้ยงปลากัด", query: "3 ความเข้าใจผิดในการเลี้ยงปลากัด ที่ทำให้ปลาป่วยเงียบๆ" },
  { id: "cloudy-water", label: "แก้น้ำขุ่นถาวร", query: "วิธีแก้น้ำขุ่นในตู้ปลาให้ใสวิ้ง ไม่ต้องล้างตู้บ่อย" },
  { id: "minimal-tank", label: "จัดตู้มินิมอลบนโต๊ะ", query: "วิธีจัดตู้ปลามินิมอลบนโต๊ะทำงาน สวยคลีน สบายตา" },
  { id: "shrimp-molt", label: "กุ้งแคระลอกคราบ", query: "วิธีกู้ชีพกุ้งแคระลอกคราบไม่ออก และปรับค่าน้ำป้องกัน" },
  { id: "hair-algae", label: "กำจัดตะไคร่เส้นผม", query: "เทคนิคกำจัดตะไคร่เส้นผมในตู้ไม้น้ำ แบบถอนรากถอนโคน" },
  { id: "cardinal-vs-neon", label: "คาร์ดินัล vs นีออน", query: "ปลาคาร์ดินัลกับปลานีออน ต่างกันยังไง เลือกตัวไหนเลี้ยงง่ายกว่า" },
  { id: "ich-white-spot", label: "รักษาโรคจุดขาว", query: "วิธีรักษาโรคจุดขาวในตู้ปลาช่วงหน้าหนาว ไม่ให้ลามทั้งตู้" },
  { id: "goldfish-swim", label: "ปลาทองหงายท้อง", query: "สาเหตุปลาทองว่ายหงายท้อง เสียศูนย์ และวิธีปฐมพยาบาลด่วน" },
  { id: "plant-melting", label: "ต้นไม้น้ำใบละลาย", query: "ต้นไม้น้ำใบละลายหลังปักตู้ใหม่ แก้ปัญหาอย่างไรให้แตกยอดใหม่" },
  { id: "corydoras-sand", label: "ปลาแพะคุ้ยทราย", query: "เลือกทรายรองพื้นให้ปลาแพะยังไง ไม่ให้หนวดกุดและติดเชื้อ" },
  { id: "water-change", label: "เทคนิคเปลี่ยนน้ำ 20%", query: "วิธีเปลี่ยนน้ำตู้ปลา 20% โดยที่ปลาไม่ช็อกและแบคทีเรียไม่พัง" },
  { id: "filter-media", label: "จัดเรียงมีเดียกรอง", query: "วิธีจัดเรียงมีเดียกรองนอกตู้ปลาให้น้ำใสและดักฝุ่นดีที่สุด" },
  { id: "nerite-snail", label: "หอยเขาคุมตะไคร่", query: "ข้อดีข้อเสียของหอยเขา เลี้ยงยังไงไม่ให้ไข่ติดเต็มขอนไม้" }
];

let activeTopicSlots = [];
let topicTimerInterval = null;
const presetChipsContainer = document.getElementById("presetChips");
const refreshTopicsBtn = document.getElementById("refreshTopicsBtn");

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function selectTopicSlot(index) {
  activeTopicSlots.forEach((slot, i) => {
    slot.isSelected = (i === index);
  });
  const selected = activeTopicSlots[index];
  if (selected && topicInput) {
    topicInput.value = selected.query;
  }
  updateTimerDisplays();
}

function renderTopicChips() {
  if (!presetChipsContainer) return;
  presetChipsContainer.innerHTML = "";
  activeTopicSlots.forEach((slot, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip ${slot.isSelected ? "active" : ""} ${slot.isNew ? "entering" : ""}`;
    btn.dataset.index = index;
    btn.dataset.id = slot.id;

    const labelSpan = document.createElement("span");
    labelSpan.className = "chip-label";
    labelSpan.textContent = slot.label;

    const timerSpan = document.createElement("span");
    timerSpan.className = `chip-timer ${slot.remainingSec <= 60 && !slot.isSelected ? "urgent" : ""}`;

    if (slot.isSelected) {
      timerSpan.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>Active`;
    } else {
      timerSpan.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 14"/></svg>${formatTime(slot.remainingSec)}`;
    }

    btn.appendChild(labelSpan);
    btn.appendChild(timerSpan);

    btn.addEventListener("click", () => {
      selectTopicSlot(index);
    });

    presetChipsContainer.appendChild(btn);
  });
}

function updateTimerDisplays() {
  if (!presetChipsContainer) return;
  const chipButtons = presetChipsContainer.querySelectorAll(".chip");
  chipButtons.forEach((btn, index) => {
    const slot = activeTopicSlots[index];
    if (!slot) return;
    const timerSpan = btn.querySelector(".chip-timer");
    if (!timerSpan) return;

    if (slot.isSelected) {
      if (!btn.classList.contains("active")) {
        btn.classList.add("active");
      }
      timerSpan.className = "chip-timer";
      timerSpan.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>Active`;
    } else {
      btn.classList.remove("active");
      timerSpan.className = `chip-timer ${slot.remainingSec <= 60 ? "urgent" : ""}`;
      timerSpan.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 14"/></svg>${formatTime(slot.remainingSec)}`;
    }
  });
}

async function replaceExpiredTopic(index) {
  const slot = activeTopicSlots[index];
  if (!slot || slot.isReplacing) return;
  slot.isReplacing = true;

  // Animate out
  const chipButtons = presetChipsContainer ? presetChipsContainer.querySelectorAll(".chip") : [];
  const targetBtn = chipButtons[index];
  if (targetBtn) {
    targetBtn.classList.add("expiring");
  }

  // Collect current active topic IDs & labels to exclude
  const exclude = activeTopicSlots.map(s => s.id || s.label);
  let newTopic = null;

  try {
    const res = await fetch(`/api/topics?count=1&exclude=${encodeURIComponent(exclude.join(","))}`);
    if (res.ok) {
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        newTopic = data.topics[0];
      }
    }
  } catch (err) {
    console.warn("Topic fetch error:", err);
  }

  if (!newTopic) {
    const available = FALLBACK_TOPIC_BANK.filter(f => !exclude.includes(f.id) && !exclude.includes(f.label));
    newTopic = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : FALLBACK_TOPIC_BANK[index % FALLBACK_TOPIC_BANK.length];
  }

  await new Promise(r => setTimeout(r, 260));

  activeTopicSlots[index] = {
    id: newTopic.id || "topic-" + Date.now(),
    label: newTopic.label,
    query: newTopic.query,
    remainingSec: TOPIC_COUNTDOWN_SEC,
    isSelected: false,
    isReplacing: false,
    isNew: true
  };

  renderTopicChips();

  setTimeout(() => {
    if (activeTopicSlots[index]) {
      activeTopicSlots[index].isNew = false;
      const b = presetChipsContainer ? presetChipsContainer.querySelectorAll(".chip")[index] : null;
      if (b) b.classList.remove("entering");
    }
  }, 400);
}

function tickTopicTimers() {
  let needUpdate = false;
  activeTopicSlots.forEach((slot, index) => {
    if (!slot.isSelected && !slot.isReplacing) {
      slot.remainingSec -= 1;
      needUpdate = true;

      if (slot.remainingSec <= 0) {
        slot.remainingSec = 0;
        replaceExpiredTopic(index);
      }
    }
  });

  if (needUpdate) {
    updateTimerDisplays();
  }
}

async function refreshAllTopics(initial = false) {
  if (refreshTopicsBtn) refreshTopicsBtn.classList.add("spinning");

  const exclude = initial ? [] : activeTopicSlots.map(s => s.id || s.label);
  let freshTopics = [];
  try {
    const res = await fetch(`/api/topics?count=${MAX_TOPICS}&exclude=${encodeURIComponent(exclude.join(","))}`);
    if (res.ok) {
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        freshTopics = data.topics;
      }
    }
  } catch (e) {
    console.warn("Could not fetch fresh topics:", e);
  }

  if (freshTopics.length < MAX_TOPICS) {
    const pool = [...FALLBACK_TOPIC_BANK].sort(() => 0.5 - Math.random());
    freshTopics = pool.slice(0, MAX_TOPICS);
  }

  // Preserve user's input if they had already selected something
  const currentVal = topicInput ? topicInput.value.trim() : "";
  let matchedIdx = -1;

  activeTopicSlots = freshTopics.slice(0, MAX_TOPICS).map((t, idx) => {
    const isSel = (currentVal && t.query === currentVal) || (!currentVal && idx === 0);
    if (isSel) matchedIdx = idx;
    return {
      id: t.id,
      label: t.label,
      query: t.query,
      remainingSec: TOPIC_COUNTDOWN_SEC,
      isSelected: isSel,
      isReplacing: false,
      isNew: true
    };
  });

  if (matchedIdx === -1 && activeTopicSlots.length > 0) {
    activeTopicSlots[0].isSelected = true;
    if (topicInput) topicInput.value = activeTopicSlots[0].query;
  } else if (matchedIdx !== -1 && topicInput) {
    topicInput.value = activeTopicSlots[matchedIdx].query;
  }

  renderTopicChips();

  if (!topicTimerInterval) {
    topicTimerInterval = setInterval(tickTopicTimers, 1000);
  }

  setTimeout(() => {
    if (refreshTopicsBtn) refreshTopicsBtn.classList.remove("spinning");
    activeTopicSlots.forEach(s => (s.isNew = false));
    if (presetChipsContainer) {
      presetChipsContainer.querySelectorAll(".chip").forEach(b => b.classList.remove("entering"));
    }
  }, 400);
}

refreshTopicsBtn?.addEventListener("click", () => {
  refreshAllTopics(false);
});

topicInput?.addEventListener("input", () => {
  const currentVal = topicInput.value.trim();
  const matchedIndex = activeTopicSlots.findIndex(s => s.query === currentVal);
  if (matchedIndex === -1) {
    activeTopicSlots.forEach(s => (s.isSelected = false));
  } else {
    activeTopicSlots.forEach((s, idx) => (s.isSelected = idx === matchedIndex));
  }
  updateTimerDisplays();
});

// Kick off initial topics load
refreshAllTopics(true);

async function fetchPack(topic) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, user_notes: "" })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.status !== "success") throw new Error(data.message || "unknown error");
    return data.pack;
  } catch (err) {
    console.warn("Backend unavailable, using offline sample:", err);
    toast("ใช้ข้อมูลตัวอย่าง (เชื่อมต่อเซิร์ฟเวอร์ไม่ได้)");
    return buildFallbackPack(topic);
  }
}

generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;

  startBtn.disabled = true;
  startBtn.style.opacity = "0.6";

  // Run the agent animation and the real request at the same time (no more dead waiting).
  const animation = runStudioPipelineSequence(topic);
  const pack = await fetchPack(topic);
  await animation;
  currentPackData = pack;
  renderProductionPack(pack);

  Office.setActive(null);
  setActivityStatus("Production Sheet Complete", "Ready for voiceover recording and video shooting in your store", true);
  startBtn.disabled = false;
  startBtn.style.opacity = "1";
});

async function runStudioPipelineSequence(topic) {
  Office.setActive("strategist");
  setActivityStatus("Strategist Agent", `Researching audience pain points and viral hooks for: "${topic}"`);
  await sleep(1500);

  Office.setActive("scriptwriter");
  setActivityStatus("Scriptwriter Agent", "Composing 30s voiceover script and 3-second retention hook...");
  await sleep(1600);

  Office.setActive("shotDirector");
  setActivityStatus("Shot Director Agent", "Directing physical camera angles (Macro close-up, Top-down, Wide setup)...");
  await sleep(1500);

  Office.setActive("qaEvaluator");
  setActivityStatus("QA Auditor Agent", "Auditing algorithm retention score and filming feasibility...");
  await sleep(1200);
}

function setActivityStatus(name, text, isDone = false) {
  activeAgentName.innerText = name;
  activityStatus.innerText = text;
  document.getElementById("activeSpinner").style.display = isDone ? "none" : "block";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Production Sheet Drawer Logic ---
const outputDrawer = document.getElementById("outputDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const openSheetBtn = document.getElementById("openSheetBtn");
const openDrawerQuickBtn = document.getElementById("openDrawerQuickBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const sheetUpdateDot = document.getElementById("sheetUpdateDot");

function openDrawer() {
  if (!outputDrawer) return;
  outputDrawer.classList.add("open");
  if (drawerOverlay) drawerOverlay.style.display = "block";
  if (sheetUpdateDot) sheetUpdateDot.style.display = "none";
}

function closeDrawer() {
  if (!outputDrawer) return;
  outputDrawer.classList.remove("open");
  if (drawerOverlay) drawerOverlay.style.display = "none";
}

openSheetBtn?.addEventListener("click", openDrawer);
openDrawerQuickBtn?.addEventListener("click", openDrawer);
closeDrawerBtn?.addEventListener("click", closeDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);

function renderProductionPack(pack) {
  emptyState.classList.add("hidden");
  resultContent.classList.remove("hidden");

  const script = pack.script;
  const qa = pack.qa_report;

  document.getElementById("qaOverallScore").innerText = qa.overall_score.toFixed(1);
  document.getElementById("qaHookScore").innerText = `${qa.hook_score}/10`;
  document.getElementById("qaRetentionScore").innerText = `${qa.retention_score}/10`;
  document.getElementById("qaCommentScore").innerText = `${qa.comment_trigger_score}/10`;
  document.getElementById("qaVisualScore").innerText = `${qa.filming_feasibility || 10}/10`;

  document.getElementById("scriptHookText").innerText = `"${script.hook_3sec}"`;

  // Show notification dot and open drawer smoothly
  if (sheetUpdateDot) sheetUpdateDot.style.display = "block";
  openDrawer();

  const scenesList = document.getElementById("scenesList");
  scenesList.innerHTML = "";

  script.scenes.forEach((scene) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.innerHTML = `
      <div class="scene-header">
        <span class="scene-tag">Scene ${esc(scene.scene_number)}</span>
        <span class="scene-time">${esc(scene.time_range)}</span>
      </div>
      <div class="vo-text">
        <strong>Voiceover:</strong> "${esc(scene.voiceover_th)}"
      </div>
      <div class="on-screen-pill">
        <span>On-Screen Text:</span> <code>${esc(scene.on_screen_text)}</code>
      </div>
      <div class="shot-guide-box">
        <strong>Camera Direction:</strong> ${esc(scene.camera_shot_guide || "Clean front shot focusing on aquarium")}
      </div>
    `;
    scenesList.appendChild(card);
  });

  document.getElementById("captionText").innerText = `${script.caption_th}\n\n${script.hashtags.join(" ")}`;
  document.getElementById("pinnedCommentText").innerText = `"${script.pinned_comment}"`;
}

function buildFallbackPack(topic) {
  const fallbackPack = {
    script: {
      hook_3sec: `ทำไมเรื่องเกี่ยวกับ "${topic.slice(0, 25)}" ถึงสำคัญที่คนเลี้ยงปลาต้องรู้?`,
      scenes: [
        {
          scene_number: 1,
          time_range: "00:00 - 00:03",
          voiceover_th: `เคยสงสัยมั้ยครับ? เรื่องเกี่ยวกับ ${topic.slice(0, 20)} ที่หลายคนไม่เคยรู้มาก่อน...`,
          on_screen_text: `ความลับของ ${topic.slice(0, 15)}!`,
          camera_shot_guide: "[Hook Shot] มุมถ่ายตรงหน้าตู้ปลา ใช้ไฟตู้ส่องนำสายตา ปิดไฟห้องรอบข้างเพื่อให้ปลาดูโดดเด่นทันที"
        },
        {
          scene_number: 2,
          time_range: "00:04 - 00:14",
          voiceover_th: `ความจริงคือระบบนิเวศน์ในตู้ต้องการความสมดุลครับ ถ้าเราปรับจังหวะน้ำและระบบกรองให้ถูก ปัญหานี้จะหายไปทันที`,
          on_screen_text: `หัวใจคือระบบนิเวศน์สมดุล!`,
          camera_shot_guide: "[Insight Shot] มุม Macro Close-up เจาะพฤติกรรมการว่ายน้ำและขยับเหงือกของปลาในระยะประชิด"
        },
        {
          scene_number: 3,
          time_range: "00:15 - 00:24",
          voiceover_th: `วิธีแก้ง่ายๆ ที่ร้านเราใช้คือ จัดเลย์เอาต์ให้โปร่ง และเปลี่ยนน้ำสม่ำเสมอครั้งละ 20% ครับ`,
          on_screen_text: `ทริค: จัดตู้โปร่ง & เปลี่ยนน้ำ 20%`,
          camera_shot_guide: "[Action Tip Shot] มุมกว้างเฉียง 45 องศา โชว์ภาพรวมความใสของน้ำและการจัดวางไม้น้ำ/หินแบบคลีนๆ"
        },
        {
          scene_number: 4,
          time_range: "00:25 - 00:30",
          voiceover_th: `ตู้ที่บ้านเพื่อนๆ เจอแบบนี้กันมั้ยครับ? ลองคอมเมนต์บอกหน่อย เดี๋ยวช่วยตอบให้ครับ`,
          on_screen_text: `ที่บ้านเจอมั้ย? คอมเมนต์เลย`,
          camera_shot_guide: "[CTA Shot] มุม Slow Pan ช้าๆ ถอยออกจากตู้ปลา เห็นบรรยากาศโต๊ะทำงานที่ผ่อนคลาย"
        }
      ],
      caption_th: `${topic} ทริคดีๆ จากร้านปลาสวยงาม เซฟคลิปนี้ไว้ดูตอนจัดตู้ได้เลยครับ! #ปลาสวยงาม #ตู้ปลา #เลี้ยงปลา #TikTokUni`,
      hashtags: ["#ปลาสวยงาม", "#ตู้ปลามินิมอล", "#Aquascaping", "#สัตว์เลี้ยง"],
      pinned_comment: "ใครเลี้ยงปลาชนิดนี้อยู่บ้าง? เจอปัญหานี้กันมั้ย พิมพ์ขนาดตู้กับอาการมาในคอมเมนต์ได้เลยครับ!"
    },
    qa_report: {
      overall_score: 9.3,
      hook_score: 9,
      retention_score: 9,
      comment_trigger_score: 9,
      filming_feasibility: 10
    }
  };
  return fallbackPack;
}

function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => toast("คัดลอกแล้ว ✓"), () => toast("คัดลอกไม่สำเร็จ"));
}

document.getElementById("copyAllBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const script = currentPackData.script;
  let fullText = `TikTok Script: ${script.hook_3sec}\n\n`;
  script.scenes.forEach((s) => {
    fullText += `[${s.time_range}] ${s.voiceover_th}\n(Text: ${s.on_screen_text})\nShot: ${s.camera_shot_guide}\n\n`;
  });
  fullText += `Caption:\n${script.caption_th}\n\nPinned Comment:\n${script.pinned_comment}`;
  navigator.clipboard.writeText(fullText).then(() => toast("คัดลอก Production Sheet แล้ว ✓"), () => toast("คัดลอกไม่สำเร็จ"));
});

document.getElementById("downloadMdBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const blob = new Blob([JSON.stringify(currentPackData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Production_Pack_${Date.now()}.json`;
  a.click();
});

// --- HIGGSFIELD AI MODAL LOGIC ---
const higgsfieldModal = document.getElementById("higgsfieldModal");
const higgsfieldBtn = document.getElementById("higgsfieldBtn");
const closeHiggsfieldModal = document.getElementById("closeHiggsfieldModal");
const tabOfficeVisual = document.getElementById("tabOfficeVisual");
const tabBrollVisual = document.getElementById("tabBrollVisual");
const higgsfieldPrompt = document.getElementById("higgsfieldPrompt");
const submitHiggsfieldBtn = document.getElementById("submitHiggsfieldBtn");
const higgsfieldResultArea = document.getElementById("higgsfieldResultArea");
const hfStatusBadge = document.getElementById("hfStatusBadge");
const hfResultMsg = document.getElementById("hfResultMsg");
const hfVideoContainer = document.getElementById("hfVideoContainer");
const hfVideoPlayer = document.getElementById("hfVideoPlayer");

let currentHfMode = "office";

if (higgsfieldBtn && higgsfieldModal) {
  higgsfieldBtn.addEventListener("click", () => {
    higgsfieldModal.style.display = "flex";
  });

  closeHiggsfieldModal?.addEventListener("click", () => {
    higgsfieldModal.style.display = "none";
  });

  // Close on backdrop click
  higgsfieldModal.addEventListener("click", (e) => {
    if (e.target === higgsfieldModal) {
      higgsfieldModal.style.display = "none";
    }
  });

  tabOfficeVisual?.addEventListener("click", () => {
    currentHfMode = "office";
    tabOfficeVisual.classList.add("active");
    tabBrollVisual?.classList.remove("active");
    higgsfieldPrompt.value = "Cinematic high-angle camera pan of an architectural Japanese minimalist creative studio. Warm honey oak long wooden table with miniature aquascaped nano planted aquarium, soft diffused daylight, lush ficus plants, cozy espresso bar.";
  });

  tabBrollVisual?.addEventListener("click", () => {
    currentHfMode = "broll";
    tabBrollVisual.classList.add("active");
    tabOfficeVisual?.classList.remove("active");
    const topic = topicInput?.value || "ปลานีออนว่ายในตู้ไม้น้ำ";
    higgsfieldPrompt.value = `Macro cinematic close-up shot: ${topic}. Crystal clear water, lush aquatic plants, vibrant ornamental fish, natural studio lighting, 4k 60fps cinematic shallow depth of field.`;
  });

  submitHiggsfieldBtn?.addEventListener("click", async () => {
    submitHiggsfieldBtn.disabled = true;
    submitHiggsfieldBtn.innerText = "Synthesizing...";
    higgsfieldResultArea.style.display = "flex";
    hfStatusBadge.className = "result-status-badge info";
    hfStatusBadge.innerText = "Sending to Higgsfield AI...";
    hfResultMsg.innerText = "Connecting to Kling 3.0 Pro / Soul v2 engine...";
    hfVideoContainer.style.display = "none";

    const endpoint = currentHfMode === "office" ? "/api/higgsfield/generate-office" : "/api/higgsfield/generate-broll";
    const payload = currentHfMode === "office" 
      ? { prompt: higgsfieldPrompt.value, mode: "video" }
      : { scene_description: higgsfieldPrompt.value, camera_movement: "slow pan" };

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (data.status === "submitted") {
        hfStatusBadge.className = "result-status-badge info";
        hfStatusBadge.innerText = "Rendering on Higgsfield…";
        hfResultMsg.innerText = `Request ID: ${data.request_id}`;
        await pollHiggsfield(data.request_id);
      } else if (data.status === "insufficient_credits") {
        hfStatusBadge.className = "result-status-badge warning";
        hfStatusBadge.innerText = "Account Connected (Credits Needed)";
        hfResultMsg.innerText = data.message;
      } else {
        hfStatusBadge.className = "result-status-badge warning";
        hfStatusBadge.innerText = "Notice";
        hfResultMsg.innerText = data.message || "Operation complete.";
      }
    } catch (err) {
      hfStatusBadge.className = "result-status-badge warning";
      hfStatusBadge.innerText = "Error";
      hfResultMsg.innerText = "Unable to reach server endpoint: " + err.message;
    } finally {
      submitHiggsfieldBtn.disabled = false;
      submitHiggsfieldBtn.innerText = "Generate Video";
    }
  });
}


async function pollHiggsfield(requestId, tries = 90, delayMs = 4000) {
  for (let i = 0; i < tries; i++) {
    await sleep(delayMs);
    let st;
    try {
      st = await (await fetch("/api/higgsfield/status?request_id=" + encodeURIComponent(requestId))).json();
    } catch (err) {
      continue; // transient network error – keep polling
    }
    if (st.status === "completed") {
      hfStatusBadge.className = "result-status-badge success";
      hfStatusBadge.innerText = "Done";
      hfResultMsg.innerText = "Render finished";
      const url = (st.urls || [])[0];
      if (url && /\.(mp4|webm|mov)(\?|$)/i.test(url)) {
        hfVideoContainer.style.display = "block";
        hfVideoPlayer.src = url;
      } else if (url) {
        hfResultMsg.innerHTML = `Render finished — <a href="${esc(url)}" target="_blank" rel="noopener">open result</a>`;
      }
      return;
    }
    if (st.status === "failed" || st.status === "error") {
      hfStatusBadge.className = "result-status-badge warning";
      hfStatusBadge.innerText = "Failed";
      hfResultMsg.innerText = st.message || "Higgsfield could not finish this job.";
      return;
    }
    hfResultMsg.innerText = `Request ${requestId} — ${st.status || "in progress"} (${(i + 1) * delayMs / 1000}s)`;
  }
  hfStatusBadge.className = "result-status-badge warning";
  hfStatusBadge.innerText = "Still processing";
  hfResultMsg.innerText = "Taking longer than expected. Check console.higgsfield.ai for request " + requestId;
}
