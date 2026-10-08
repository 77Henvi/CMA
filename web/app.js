/**
 * Virtual Office Simulation & Pipeline Controller
 */

// Canvas & Simulation Engine
const canvas = document.getElementById("officeCanvas");
const ctx = canvas.getContext("2d");

// Office Stations Coordinates
const stations = {
  strategist: { x: 180, y: 160, name: "Strategy Lounge", color: "#58a6ff", icon: "🧠" },
  scriptwriter: { x: 720, y: 160, name: "Scripting Studio", color: "#e3b341", icon: "✍️" },
  artDirector: { x: 720, y: 380, name: "3D Art Bay", color: "#bc8cff", icon: "🎨" },
  qaEvaluator: { x: 180, y: 380, name: "QA & Audit Lab", color: "#38d9a9", icon: "📊" },
  aquarium: { x: 450, y: 270, name: "Minimal Nano Cube", color: "#00E5FF", icon: "🐟" }
};

// Avatar Characters
const agents = [
  {
    id: "strategist",
    name: "Strategist",
    x: 180,
    y: 160,
    targetX: 180,
    targetY: 160,
    color: "#58a6ff",
    headColor: "#ffe0bd",
    bubble: "Finding Viral Angles...",
    isWorking: true,
    step: 0
  },
  {
    id: "scriptwriter",
    name: "Scriptwriter",
    x: 720,
    y: 160,
    targetX: 720,
    targetY: 160,
    color: "#e3b341",
    headColor: "#ffe0bd",
    bubble: "Writing 3s Hook...",
    isWorking: false,
    step: 0
  },
  {
    id: "artDirector",
    name: "Art Director",
    x: 720,
    y: 380,
    targetX: 720,
    targetY: 380,
    color: "#bc8cff",
    headColor: "#ffe0bd",
    bubble: "3D Octane Tokens Ready",
    isWorking: false,
    step: 0
  },
  {
    id: "qaEvaluator",
    name: "QA Auditor",
    x: 180,
    y: 380,
    targetX: 180,
    targetY: 380,
    color: "#38d9a9",
    headColor: "#ffe0bd",
    bubble: "Checking Retention Curve",
    isWorking: false,
    step: 0
  }
];

// Aquarium Fishes
const fishes = [
  { x: 430, y: 260, vx: 0.6, vy: 0.2, color: "#00E5FF", stripe: "#FF4500" },
  { x: 460, y: 275, vx: -0.5, vy: -0.3, color: "#00E5FF", stripe: "#FF4500" },
  { x: 440, y: 280, vx: 0.4, vy: 0.1, color: "#00E5FF", stripe: "#FF4500" },
  { x: 470, y: 265, vx: -0.7, vy: 0.2, color: "#00E5FF", stripe: "#FF4500" }
];

let globalTime = 0;
let activeStage = "idle"; // 'strategist', 'scriptwriter', 'art', 'qa', 'done'

// Main Render Loop
function renderOffice() {
  globalTime += 0.04;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Office Floor Grid & Rooms
  drawOfficeFloor();

  // 2. Draw Central 3D Minimal Nano Aquarium
  drawCenterAquarium();

  // 3. Draw Workstations
  drawWorkstations();

  // 4. Update & Draw Characters
  updateAndDrawAgents();

  requestAnimationFrame(renderOffice);
}

function drawOfficeFloor() {
  // Base floor
  ctx.fillStyle = "#111722";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Soft glow walkways connecting stations
  ctx.strokeStyle = "rgba(88, 166, 255, 0.08)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(180, 160);
  ctx.lineTo(720, 160);
  ctx.lineTo(720, 380);
  ctx.lineTo(180, 380);
  ctx.closePath();
  ctx.stroke();
}

function drawCenterAquarium() {
  const aq = stations.aquarium;
  const w = 150;
  const h = 100;
  const x = aq.x - w / 2;
  const y = aq.y - h / 2;

  // Aquarium Base
  ctx.fillStyle = "rgba(10, 25, 40, 0.8)";
  ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();

  // Water glow
  const grad = ctx.createRadialGradient(aq.x, aq.y, 10, aq.x, aq.y, 70);
  grad.addColorStop(0, "rgba(0, 229, 255, 0.25)");
  grad.addColorStop(1, "rgba(0, 229, 255, 0.02)");
  ctx.fillStyle = grad;
  ctx.fill();

  // Floating Caustics & Bubbles
  for (let i = 0; i < 5; i++) {
    const bx = x + 20 + ((i * 26 + globalTime * 15) % (w - 40));
    const by = y + h - 15 - ((i * 18 + globalTime * 20) % (h - 30));
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(bx, by, 2 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }

  // Fishes swimming
  fishes.forEach((f) => {
    f.x += f.vx;
    f.y += f.vy;

    // Bounce off aquarium bounds
    if (f.x < x + 15 || f.x > x + w - 15) f.vx *= -1;
    if (f.y < y + 15 || f.y > y + h - 15) f.vy *= -1;

    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.vx < 0) ctx.scale(-1, 1);

    // Neon body
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red glowing stripe
    ctx.fillStyle = f.stripe;
    ctx.fillRect(-4, -1, 5, 2);

    // Tail fin
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-11, -3);
    ctx.lineTo(-11, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // Label
  ctx.fillStyle = "#88ddff";
  ctx.font = "bold 11px Plus Jakarta Sans";
  ctx.textAlign = "center";
  ctx.fillText("✨ Minimal Nano Cube", aq.x, y + h + 18);
}

function drawWorkstations() {
  Object.keys(stations).forEach((key) => {
    if (key === "aquarium") return;
    const st = stations[key];
    const isCurrentActive = activeStage === key;

    // Station Desk Pad
    ctx.fillStyle = isCurrentActive ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = isCurrentActive ? st.color : "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = isCurrentActive ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(st.x - 70, st.y - 45, 140, 90, 12);
    ctx.fill();
    ctx.stroke();

    // Active Pulsing Ring
    if (isCurrentActive) {
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(st.x, st.y, 55 + Math.sin(globalTime * 4) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Station Name Label
    ctx.fillStyle = st.color;
    ctx.font = "bold 12px Plus Jakarta Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${st.icon} ${st.name}`, st.x, st.y - 54);
  });
}

function updateAndDrawAgents() {
  agents.forEach((agent) => {
    // Interpolate walking movement
    agent.x += (agent.targetX - agent.x) * 0.08;
    agent.y += (agent.targetY - agent.y) * 0.08;

    const isCurrent = activeStage === agent.id;
    const bounce = isCurrent ? Math.sin(globalTime * 8) * 3 : Math.sin(globalTime * 3) * 1.5;

    // Character Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(agent.x, agent.y + 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clay Chibi Body
    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.roundRect(agent.x - 11, agent.y - 2 + bounce, 22, 18, 6);
    ctx.fill();

    // Clay Head
    ctx.fillStyle = agent.headColor;
    ctx.beginPath();
    ctx.arc(agent.x, agent.y - 12 + bounce, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(agent.x - 4, agent.y - 13 + bounce, 1.8, 0, Math.PI * 2);
    ctx.arc(agent.x + 4, agent.y - 13 + bounce, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute Cheeks
    ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
    ctx.beginPath();
    ctx.arc(agent.x - 7, agent.y - 9 + bounce, 2, 0, Math.PI * 2);
    ctx.arc(agent.x + 7, agent.y - 9 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();

    // Speech / Status Bubble
    if (isCurrent || agent.isWorking) {
      const bubbleText = agent.bubble;
      ctx.font = "600 11px Plus Jakarta Sans, Noto Sans Thai";
      const textWidth = ctx.measureText(bubbleText).width;
      const bw = textWidth + 16;
      const bh = 22;
      const bx = agent.x - bw / 2;
      const by = agent.y - 42 + bounce;

      // Bubble Background
      ctx.fillStyle = "rgba(22, 27, 34, 0.95)";
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Bubble Text
      ctx.fillStyle = "#f0f6fc";
      ctx.textAlign = "center";
      ctx.fillText(bubbleText, agent.x, by + 15);
    }
  });
}

// UI Interaction Controller
const topicInput = document.getElementById("topicInput");
const generateForm = document.getElementById("generateForm");
const startBtn = document.getElementById("startBtn");
const chips = document.querySelectorAll(".preset-chips .chip");

const activityBar = document.getElementById("activityBar");
const activeAgentMini = document.getElementById("activeAgentMini");
const activeAgentName = document.getElementById("activeAgentName");
const activityStatus = document.getElementById("activityStatus");

const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");

let currentPackData = null;

// Chip Preset Click Handlers
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    topicInput.value = chip.getAttribute("data-topic");
  });
});

// Start Workflow Trigger
generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;

  startBtn.disabled = true;
  startBtn.style.opacity = "0.6";

  // Simulate animated stage transitions
  await runAgentStageAnimation(topic);

  // Fetch or run generation
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic, user_notes: "" })
    });

    if (res.ok) {
      const data = await res.json();
      currentPackData = data.pack;
      renderProductionPack(data.pack);
    } else {
      // Offline simulation fallback for standalone HTML view
      renderFallbackPack(topic);
    }
  } catch (err) {
    console.log("Using standalone fallback engine...", err);
    renderFallbackPack(topic);
  }

  activeStage = "idle";
  setActivityStatus("🎉 สำเร็จ!", "พร้อมสำหรับการพากย์เสียงและ Copy 3D Prompts", "✅");
  startBtn.disabled = false;
  startBtn.style.opacity = "1";
});

async function runAgentStageAnimation(topic) {
  // Stage 1: Strategist
  activeStage = "strategist";
  setActivityStatus("Strategist Agent", `วิเคราะห์ Pain Point & หา Hook สำหรับ: "${topic}"`, "🧠");
  agents[0].bubble = "Analyzing Fish Mystery...";
  await sleep(1200);

  // Walk to Scriptwriter
  agents[0].targetX = 450;
  agents[0].targetY = 160;
  await sleep(600);

  // Stage 2: Scriptwriter
  activeStage = "scriptwriter";
  setActivityStatus("Scriptwriter Agent", "เขียนบทพากย์ 30 วินาที + ล็อก Hook 3 วินาทีแรก...", "✍️");
  agents[1].bubble = "Writing Natural Thai Script...";
  await sleep(1400);

  // Walk to Art Director
  agents[1].targetX = 720;
  agents[1].targetY = 270;
  await sleep(600);

  // Stage 3: 3D Art Director
  activeStage = "artDirector";
  setActivityStatus("3D Art Director Agent", "แปลงซีนเป็น 3D Minimal Master Prompts (Octane/Clay)...", "🎨");
  agents[2].bubble = "Injecting Translucent Water Caustics...";
  await sleep(1400);

  // Walk to QA Lab
  agents[2].targetX = 450;
  agents[2].targetY = 380;
  await sleep(600);

  // Stage 4: QA Evaluator
  activeStage = "qaEvaluator";
  setActivityStatus("QA Evaluator Agent", "ตรวจสอบ TikTok Algorithm Checkpoints (Hook & Retention)...", "📊");
  agents[3].bubble = "Audit Score: 9.2/10 Approved!";
  await sleep(1000);

  // Reset character positions
  agents[0].targetX = stations.strategist.x;
  agents[0].targetY = stations.strategist.y;
  agents[1].targetX = stations.scriptwriter.x;
  agents[1].targetY = stations.scriptwriter.y;
  agents[2].targetX = stations.artDirector.x;
  agents[2].targetY = stations.artDirector.y;
}

function setActivityStatus(name, text, icon) {
  activeAgentName.innerText = name;
  activityStatus.innerText = text;
  activeAgentMini.innerText = icon;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Render Production Pack to UI
function renderProductionPack(pack) {
  emptyState.classList.add("hidden");
  resultContent.classList.remove("hidden");

  const script = pack.script;
  const qa = pack.qa_report;

  // QA Scores
  document.getElementById("qaOverallScore").innerText = qa.overall_score.toFixed(1);
  document.getElementById("qaHookScore").innerText = `${qa.hook_score}/10`;
  document.getElementById("qaRetentionScore").innerText = `${qa.retention_score}/10`;
  document.getElementById("qaCommentScore").innerText = `${qa.comment_trigger_score}/10`;
  document.getElementById("qaVisualScore").innerText = `${qa.visual_3d_feasibility}/10`;

  // Hook Text
  document.getElementById("scriptHookText").innerText = `"${script.hook_3sec}"`;

  // Scenes
  const scenesList = document.getElementById("scenesList");
  scenesList.innerHTML = "";

  script.scenes.forEach((scene) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.innerHTML = `
      <div class="scene-header">
        <span class="scene-tag">📍 Scene ${scene.scene_number}</span>
        <span class="scene-time">⏱️ ${scene.time_range}</span>
      </div>
      <div class="vo-text">
        <strong>🗣️ บทพูดพากย์:</strong> "${scene.voiceover_th}"
      </div>
      <div class="on-screen-pill">
        📱 ข้อความบนจอ: <code>${scene.on_screen_text}</code>
      </div>
      <div class="prompt-3d-box">
        <button class="copy-mini-btn" onclick="copySnippet('${escapeHtml(scene.prompt_3d_minimal)}')">Copy Prompt</button>
        <code>${scene.prompt_3d_minimal}</code>
      </div>
    `;
    scenesList.appendChild(card);
  });

  // Publishing
  document.getElementById("captionText").innerText = `${script.caption_th}\n\n${script.hashtags.join(" ")}`;
  document.getElementById("pinnedCommentText").innerText = `"${script.pinned_comment}"`;
}

function renderFallbackPack(topic) {
  const fallbackPack = {
    script: {
      hook_3sec: `ทำไม ${topic} ถึงสำคัญที่คนเลี้ยงปลาต้องรู้?`,
      scenes: [
        {
          scene_number: 1,
          time_range: "00:00 - 00:03",
          voiceover_th: `เคยสงสัยมั้ยครับ? เรื่องเกี่ยวกับ ${topic} ที่หลายคนเข้าใจผิดมาตลอด...`,
          on_screen_text: `ความลับของ ${topic.slice(0, 18)}!`,
          prompt_3d_minimal: `Minimalist 3D isometric cutaway of an aquarium explaining ${topic}, smooth matte clay texture, translucent crystal-clear water, pastel studio lighting, octane render --ar 9:16`
        },
        {
          scene_number: 2,
          time_range: "00:04 - 00:14",
          voiceover_th: `ความจริงคือระบบในตู้ต้องการความสมดุลครับ ถ้าเราปรับจังหวะน้ำและระบบกรองให้ถูก ปัญหานี้จะหายไปทันที`,
          on_screen_text: `ระบบนิเวศน์ต้องสมดุล!`,
          prompt_3d_minimal: `3D stylized minimalist diagram of water filtration and bacterial cycle, glowing pastel dots, clean geometry, serene ambient light --ar 9:16`
        },
        {
          scene_number: 3,
          time_range: "00:15 - 00:24",
          voiceover_th: `วิธีแก้ง่ายๆ คือจัดพื้นที่ให้โปร่ง และเปลี่ยนน้ำครั้งละ 20% เพื่อไม่ให้ค่าพารามิเตอร์แกว่งครับ`,
          on_screen_text: `ทริค: เปลี่ยนน้ำ 20% & จัดตู้โปร่ง`,
          prompt_3d_minimal: `3D minimalist aesthetic aquarium with glowing crystal-clear water and happy stylized swimming fish, soft sage green plants, elegant simplicity --ar 9:16`
        },
        {
          scene_number: 4,
          time_range: "00:25 - 00:30",
          voiceover_th: `ที่บ้านเพื่อนๆ เจอแบบนี้กันมั้ยครับ? ลองคอมเมนต์บอกหน่อย เดี๋ยวช่วยตอบให้ครับ`,
          on_screen_text: `เจอปัญหานี้มั้ย? คอมเมนต์เลย 👇`,
          prompt_3d_minimal: `Minimalist modern desk setup with a glowing nano aquarium cube, warm pastel light, floating 3D comment bubble, cozy room --ar 9:16`
        }
      ],
      caption_th: `${topic} 🐟✨ เคล็ดลับคนรักปลาสวยงามที่ห้ามพลาด เซฟไว้ดูย้อนหลังได้เลยครับ #ปลาสวยงาม #ตู้ปลามินิมอล #ความรู้ดีๆ`,
      hashtags: ["#ปลาสวยงาม", "#ตู้ปลามินิมอล", "#Aquascaping", "#สัตว์เลี้ยง"],
      pinned_comment: "ใครเลี้ยงปลาชนิดนี้อยู่บ้าง? เจอปัญหาอะไรกันบ้าง พิมพ์บอกในคอมเมนต์ได้เลยนะครับ!"
    },
    qa_report: {
      overall_score: 9.3,
      hook_score: 9,
      retention_score: 9,
      comment_trigger_score: 9,
      visual_3d_feasibility: 10
    }
  };
  currentPackData = fallbackPack;
  renderProductionPack(fallbackPack);
}

function copySnippet(text) {
  navigator.clipboard.writeText(text);
  alert("📋 Copy 3D Prompt สำเร็จแล้ว!");
}

function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text);
  alert("📋 Copy ข้อความเรียบร้อย!");
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'");
}

// Copy All & Export Markdown
document.getElementById("copyAllBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const script = currentPackData.script;
  let fullText = `🎬 TikTok Script: ${script.hook_3sec}\n\n`;
  script.scenes.forEach((s) => {
    fullText += `[${s.time_range}] ${s.voiceover_th}\n(Text: ${s.on_screen_text})\n3D Prompt: ${s.prompt_3d_minimal}\n\n`;
  });
  fullText += `Caption:\n${script.caption_th}\n\nPinned Comment:\n${script.pinned_comment}`;
  navigator.clipboard.writeText(fullText);
  alert("📋 Copy Production Pack ทั้งหมดสำเร็จ!");
});

document.getElementById("downloadMdBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const blob = new Blob([JSON.stringify(currentPackData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Production_Pack_${Date.now()}.json`;
  a.click();
});

// Start loop
renderOffice();
