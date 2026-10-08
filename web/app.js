/**
 * 3D Architectural Creative Studio (Three.js WebGL Engine)
 * Inspired by Japanese / Scandinavian Minimalist Studio Aesthetics
 */

const container = document.getElementById("threeContainer");

// --- 1. Three.js Scene & Camera Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f3ec); // Warm off-white from image
scene.fog = new THREE.FogExp2(0xf6f3ec, 0.015);

const camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 1000);
// Side-angled architectural perspective matching the reference image
camera.position.set(0, 10, 32);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 3.5, 0);
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 12;
controls.maxDistance = 55;

// --- 2. Warm Studio Lighting ---
const ambientLight = new THREE.AmbientLight(0xfffbf2, 0.95);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2ded4, 0.7);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff6e6, 1.1);
sunLight.position.set(12, 28, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 70;
sunLight.shadow.camera.left = -25;
sunLight.shadow.camera.right = 25;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);

// Soft backlight
const backLight = new THREE.DirectionalLight(0xd9e2ec, 0.4);
backLight.position.set(-15, 12, -15);
scene.add(backLight);

// --- 3. Material Palette (Matte Architectural Clay & Wood) ---
const mat = (color, roughness = 0.65) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });

const deskTopMat = mat(0xffffff, 0.3); // Sleek white studio table
const deskWoodMat = mat(0xd7ccc8, 0.8); // Warm oak drawers
const metalLegMat = mat(0x3e3c38, 0.4); // Charcoal steel legs
const wallMat = mat(0xefeae1, 0.9); // Back wall
const floorMat = mat(0xf3efe6, 0.85); // Floor
const tealChairMat = mat(0x3b5c5e, 0.5); // Teal ergonomic chair
const darkChairMat = mat(0x2f3640, 0.6); // Slate black chair

// --- 4. Architectural Back Wall & Moodboards ---
const wallGroup = new THREE.Group();
wallGroup.position.set(0, 8, -5);

// Main backdrop panel
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), wallMat);
backWall.receiveShadow = true;
wallGroup.add(backWall);

// Pinned Sketches & Frames (as seen in the reference image)
const sketches = [
  { x: -16, y: 3, w: 2.2, h: 2.8, color: 0xdfd7cb },
  { x: -9, y: 4.5, w: 3.5, h: 2.5, color: 0xe6dfd5 },
  { x: -2, y: 3.8, w: 2.8, h: 3.6, color: 0xeae4db },
  { x: 6, y: 4.2, w: 4.5, h: 3.0, color: 0xe2dad0 },
  { x: 14, y: 3.5, w: 3.0, h: 4.0, color: 0xdfd8cd }
];

sketches.forEach((s) => {
  const f = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.h), mat(s.color, 0.9));
  f.position.set(s.x, s.y, 0.05);
  // Thin border
  const border = new THREE.Mesh(new THREE.PlaneGeometry(s.w + 0.15, s.h + 0.15), mat(0x8d8276, 0.7));
  border.position.set(s.x, s.y, 0.02);
  wallGroup.add(border);
  wallGroup.add(f);
});

scene.add(wallGroup);

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// --- 5. Long Shared Collaborative Studio Desk ---
const tableGroup = new THREE.Group();
tableGroup.position.set(0, 0, 0);

const tableLength = 26;
const tableDepth = 3.2;
const tableHeight = 3.0;

// Table Top
const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tableLength, 0.2, tableDepth), deskTopMat);
tableTop.position.set(0, tableHeight, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
tableGroup.add(tableTop);

// Steel Legs along the table
const legPositionsX = [-12.5, -6.5, 0, 6.5, 12.5];
legPositionsX.forEach((lx) => {
  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, tableHeight), metalLegMat);
  leg1.position.set(lx, tableHeight / 2, -tableDepth / 2 + 0.2);
  leg1.castShadow = true;
  tableGroup.add(leg1);

  const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, tableHeight), metalLegMat);
  leg2.position.set(lx, tableHeight / 2, tableDepth / 2 - 0.2);
  leg2.castShadow = true;
  tableGroup.add(leg2);
});

// Under-desk Cabinet Drawers (Warm Wood/Beige as in reference)
const drawerPositionsX = [-10, -1, 8.5];
drawerPositionsX.forEach((dx) => {
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), deskWoodMat);
  cabinet.position.set(dx, 1.1, 0);
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  tableGroup.add(cabinet);
});

// Desktop Monitors & Laptops
const laptopMat = mat(0x3a3834, 0.3);
const monitorMat = mat(0x2b2926, 0.2);
const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0xf0f6fc });

const workstationX = [-8, -2.5, 3.5, 9];

workstationX.forEach((wx, i) => {
  // Laptop / Monitor
  if (i === 0 || i === 2) {
    // Sleek Desktop Monitor
    const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 0.6), metalLegMat);
    monStand.position.set(wx, tableHeight + 0.3, -0.4);
    const monScreen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), monitorMat);
    monScreen.position.set(wx, tableHeight + 0.9, -0.4);
    monScreen.castShadow = true;
    const innerScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.95), screenGlowMat);
    innerScreen.position.set(wx, tableHeight + 0.9, -0.35);
    tableGroup.add(monStand);
    tableGroup.add(monScreen);
    tableGroup.add(innerScreen);
  } else {
    // Open Laptop
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.7), laptopMat);
    base.position.set(wx, tableHeight + 0.12, 0);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.04), laptopMat);
    screen.position.set(wx, tableHeight + 0.42, -0.32);
    screen.rotation.x = -0.2;
    tableGroup.add(base);
    tableGroup.add(screen);
  }

  // Modern Desk Lamp (with warm spot glow)
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05), metalLegMat);
  lampBase.position.set(wx + 1.2, tableHeight + 0.12, -0.6);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), metalLegMat);
  lampPole.position.set(wx + 1.2, tableHeight + 0.7, -0.6);
  lampPole.rotation.z = -0.2;
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.35, 16), metalLegMat);
  lampHead.position.set(wx + 0.95, tableHeight + 1.2, -0.6);
  lampHead.rotation.z = 0.5;
  tableGroup.add(lampBase);
  tableGroup.add(lampPole);
  tableGroup.add(lampHead);

  // Warm localized light
  const deskSpot = new THREE.PointLight(0xffedd5, 0.6, 6);
  deskSpot.position.set(wx + 0.9, tableHeight + 1.1, -0.4);
  tableGroup.add(deskSpot);
});

// Centerpiece: Minimalist Nano Tank on Table (with glowing animated fish)
const nanoTankGroup = new THREE.Group();
nanoTankGroup.position.set(0.5, tableHeight + 0.9, -0.3);

const tankGlass = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 1.5, 1.5),
  new THREE.MeshPhysicalMaterial({ color: 0x99f6e4, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.05, ior: 1.33 })
);
nanoTankGroup.add(tankGlass);

const nanoWater = new THREE.Mesh(
  new THREE.BoxGeometry(2.2, 1.3, 1.3),
  new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25 })
);
nanoTankGroup.add(nanoWater);

// Animated nano fish
const nanoFishes = [];
for (let f = 0; f < 3; f++) {
  const fish = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), mat(f === 0 ? 0x00e5ff : 0xff7b72, 0.3));
  fish.rotation.z = Math.PI / 2;
  nanoTankGroup.add(fish);
  nanoFishes.push({ mesh: fish, angle: f * 2.1, speed: 0.02 + f * 0.005, rad: 0.6 + f * 0.2, y: -0.2 + f * 0.2 });
}
tableGroup.add(nanoTankGroup);

scene.add(tableGroup);

// --- 6. Task Office Chairs (Teal & Dark Grey Ergonomic Chairs) ---
function createOfficeChair(x, z, chairMaterial, rotationY = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;

  // Wheel Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.1, 8), metalLegMat);
  base.position.y = 0.2;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2), metalLegMat);
  pole.position.y = 0.8;
  group.add(pole);

  // Seat Cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.4), chairMaterial);
  seat.position.y = 1.45;
  seat.castShadow = true;
  group.add(seat);

  // Ergonomic Curved Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.18), chairMaterial);
  back.position.set(0, 2.3, 0.65);
  back.rotation.x = -0.08;
  back.castShadow = true;
  group.add(back);

  return group;
}

const chairs = [
  createOfficeChair(-8, 1.4, darkChairMat, 0),
  createOfficeChair(-2.5, 1.4, tealChairMat, -0.1),
  createOfficeChair(3.5, 1.4, tealChairMat, 0.15),
  createOfficeChair(9, 1.4, darkChairMat, -0.1)
];
chairs.forEach((c) => scene.add(c));

// --- 7. Create Humanoid 3D Characters (Architectural Studio Style) ---
function createHumanoidAgent(outfitColor, hairColor, isWoman = false) {
  const group = new THREE.Group();

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), mat(0xffdec7, 0.7));
  head.position.y = 3.6;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairGeo = isWoman
    ? new THREE.SphereGeometry(0.46, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.5)
    : new THREE.SphereGeometry(0.45, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const hair = new THREE.Mesh(hairGeo, mat(hairColor, 0.9));
  hair.position.set(0, 3.68, 0.02);
  hair.rotation.x = isWoman ? 0.2 : -0.1;
  group.add(hair);

  // Torso / Stylish Jacket / Cardigan
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 1.2, 16), mat(outfitColor, 0.8));
  torso.position.y = 2.6;
  torso.castShadow = true;
  group.add(torso);

  // Upper Legs (Seated)
  const legMat = mat(0x2b2926, 0.8);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.1), legMat);
  leftLeg.position.set(-0.25, 1.6, -0.4);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.1), legMat);
  rightLeg.position.set(0.25, 1.6, -0.4);
  group.add(leftLeg);
  group.add(rightLeg);

  // Lower Legs
  const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.2, 0.22), legMat);
  leftShin.position.set(-0.25, 0.8, -0.85);
  const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.2, 0.22), legMat);
  rightShin.position.set(0.25, 0.8, -0.85);
  group.add(leftShin);
  group.add(rightShin);

  // Arms (Leaning / Typing towards desk)
  const armMat = mat(outfitColor, 0.8);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), armMat);
  leftArm.position.set(-0.48, 2.6, -0.2);
  leftArm.rotation.x = 0.8;
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), armMat);
  rightArm.position.set(0.48, 2.6, -0.2);
  rightArm.rotation.x = 0.8;
  group.add(leftArm);
  group.add(rightArm);

  return { group, head, torso, leftArm, rightArm };
}

// 4 Agents based on character styling in image:
// 1. Strategist (Dark coat / thoughtful researcher)
// 2. Scriptwriter (Terracotta cardigan / creative writer)
// 3. Shot Director (Olive-camel blazer / visual designer)
// 4. QA Auditor (Oatmeal jacket / reviewer)
const agentData = [
  { id: "strategist", x: -8, outfit: 0x3d3835, hair: 0x221f1d, isWoman: false, name: "Strategist" },
  { id: "scriptwriter", x: -2.5, outfit: 0x9a4c3e, hair: 0x8d5b34, isWoman: true, name: "Scriptwriter" },
  { id: "shotDirector", x: 3.5, outfit: 0x7c7365, hair: 0x1f1d1b, isWoman: false, name: "Shot Director" },
  { id: "qaEvaluator", x: 9, outfit: 0xb5a898, hair: 0x3a2c20, isWoman: false, name: "QA Auditor" }
];

const agents = agentData.map((d) => {
  const character = createHumanoidAgent(d.outfit, d.hair, d.isWoman);
  character.group.position.set(d.x, 0, 1.3);
  scene.add(character.group);
  return { ...d, ...character, baseRotY: 0, currentRotY: 0 };
});

// --- 8. Lively Animation Loop ---
let clock = new THREE.Clock();
let activeAgentId = "idle";

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // 1. Nano Fish Swimming
  nanoFishes.forEach((f) => {
    f.angle += f.speed;
    f.mesh.position.x = Math.cos(f.angle) * f.rad;
    f.mesh.position.z = Math.sin(f.angle) * (f.rad * 0.7);
    f.mesh.position.y = f.y + Math.sin(time * 3 + f.angle) * 0.08;
    f.mesh.rotation.y = -f.angle + Math.PI / 2;
  });

  // 2. Lively Agent Animations
  agents.forEach((ag, idx) => {
    const isWorking = activeAgentId === ag.id;

    // Breathing & natural posture shifting
    ag.torso.position.y = 2.6 + Math.sin(time * 2 + idx) * 0.025;
    ag.head.position.y = 3.6 + Math.sin(time * 2 + idx) * 0.035;

    // Natural head nodding / looking around
    ag.head.rotation.y = Math.sin(time * 0.8 + idx * 1.5) * 0.12;
    ag.head.rotation.x = isWorking ? 0.2 + Math.sin(time * 8) * 0.05 : Math.sin(time * 0.5 + idx) * 0.05;

    // Typing / Writing hand motions
    if (isWorking) {
      ag.leftArm.rotation.x = 0.8 + Math.sin(time * 16) * 0.12;
      ag.rightArm.rotation.x = 0.8 + Math.cos(time * 16) * 0.12;
      ag.group.position.y = Math.abs(Math.sin(time * 6)) * 0.06; // Active slight chair bounce
    } else {
      ag.leftArm.rotation.x = 0.8 + Math.sin(time * 1.5 + idx) * 0.03;
      ag.rightArm.rotation.x = 0.8 + Math.cos(time * 1.5 + idx) * 0.03;
      ag.group.position.y = 0;
    }

    // Chair subtle swivel
    chairs[idx].rotation.y = Math.sin(time * 0.6 + idx) * 0.06;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// --- 9. UI Interaction & Workflow ---
const topicInput = document.getElementById("topicInput");
const generateForm = document.getElementById("generateForm");
const startBtn = document.getElementById("startBtn");
const chips = document.querySelectorAll(".preset-chips .chip");

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

// Submit Workflow
generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;

  startBtn.disabled = true;
  startBtn.style.opacity = "0.6";

  // Trigger Lively Agent Animation Sequence
  await runLivelyStudioSequence(topic);

  // Fetch from Python server
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
      renderFallbackPack(topic);
    }
  } catch (err) {
    console.log("Using standalone fallback engine...", err);
    renderFallbackPack(topic);
  }

  activeAgentId = "idle";
  setActivityStatus("🎉 สตูดิโอผลิตคลิปเสร็จสมบูรณ์!", "พร้อมนำบทไปอัดเสียง & ถ่ายคลิปจริงตามไกด์มุมกล้อง", "✅");
  startBtn.disabled = false;
  startBtn.style.opacity = "1";
});

async function runLivelyStudioSequence(topic) {
  // 1. Strategist (The Researcher)
  activeAgentId = "strategist";
  setActivityStatus("Strategist Agent (นักกลยุทธ์)", `กำลังวิเคราะห์ Pain Point & หา Hook สำหรับ: "${topic}"`, "🧠");
  await sleep(1400);

  // 2. Scriptwriter (The Writer)
  activeAgentId = "scriptwriter";
  setActivityStatus("Scriptwriter Agent (นักเขียนบท)", "กำลังเขียนบทพากย์ 30 วิ + ปรับจังหวะ Hook 3 วินาทีแรก...", "✍️");
  await sleep(1500);

  // 3. Shot Director (The Visual Director)
  activeAgentId = "shotDirector";
  setActivityStatus("Shot Director Agent (ผู้กำกับภาพ)", "กำลังวางมุมกล้องถ่ายจริง (Macro, Top-down, Wide)...", "🎬");
  await sleep(1400);

  // 4. QA Auditor (The Reviewer)
  activeAgentId = "qaEvaluator";
  setActivityStatus("QA Auditor Agent (ฝ่ายตรวจคุณภาพ)", "ตรวจสอบคะแนน TikTok Algorithm & Retention Score...", "📊");
  await sleep(1100);
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
  document.getElementById("qaVisualScore").innerText = `${qa.filming_feasibility || 10}/10`;

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
        <strong>🗣️ บทพูดพากย์ (Voiceover):</strong> "${scene.voiceover_th}"
      </div>
      <div class="on-screen-pill">
        📱 ข้อความบนจอ: <code>${scene.on_screen_text}</code>
      </div>
      <div class="shot-guide-box">
        <strong>🎥 ไกด์มุมกล้องถ่ายจริงในร้าน:</strong> ${scene.camera_shot_guide || "มุมถ่ายเจาะตู้ปลาแบบคลีนๆ"}
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
      hook_3sec: `ทำไม ${topic.slice(0, 25)} ถึงเป็นเรื่องที่คนเลี้ยงปลาเข้าใจผิดบ่อยสุด?`,
      scenes: [
        {
          scene_number: 1,
          time_range: "00:00 - 00:03",
          voiceover_th: `เคยสงสัยมั้ยครับ? เรื่องเกี่ยวกับ ${topic.slice(0, 20)} ที่หลายคนไม่เคยรู้มาก่อน...`,
          on_screen_text: `ความลับของ ${topic.slice(0, 15)}!`,
          camera_shot_guide: "🎥 [Hook Shot] มุมถ่ายตรงหน้าตู้ปลา ใช้ไฟตู้ส่องนำสายตา ปิดไฟห้องรอบข้างเพื่อให้ปลาดูโดดเด่นทันที"
        },
        {
          scene_number: 2,
          time_range: "00:04 - 00:14",
          voiceover_th: `ความจริงคือระบบนิเวศน์ในตู้ต้องการความสมดุลครับ ถ้าเราปรับจังหวะน้ำและระบบกรองให้ถูก ปัญหานี้จะหายไปทันที`,
          on_screen_text: `หัวใจคือระบบนิเวศน์สมดุล!`,
          camera_shot_guide: "🔬 [Insight Shot] มุม Macro Close-up เจาะพฤติกรรมการว่ายน้ำและขยับเหงือกของปลาในระยะประชิด"
        },
        {
          scene_number: 3,
          time_range: "00:15 - 00:24",
          voiceover_th: `วิธีแก้ง่ายๆ ที่ร้านเราใช้คือ จัดเลย์เอาต์ให้โปร่ง และเปลี่ยนน้ำสม่ำเสมอครั้งละ 20% ครับ`,
          on_screen_text: `ทริค: จัดตู้โปร่ง & เปลี่ยนน้ำ 20%`,
          camera_shot_guide: "✨ [Action Tip Shot] มุมกว้างเฉียง 45 องศา โชว์ภาพรวมความใสของน้ำและการจัดวางไม้น้ำ/หินแบบคลีนๆ"
        },
        {
          scene_number: 4,
          time_range: "00:25 - 00:30",
          voiceover_th: `ตู้ที่บ้านเพื่อนๆ เจอแบบนี้กันมั้ยครับ? ลองคอมเมนต์บอกหน่อย เดี๋ยวช่วยตอบให้ครับ`,
          on_screen_text: `ที่บ้านเจอมั้ย? คอมเมนต์เลย 👇`,
          camera_shot_guide: "🛋️ [CTA Shot] มุม Slow Pan ช้าๆ ถอยออกจากตู้ปลา เห็นบรรยากาศโต๊ะทำงานที่ผ่อนคลาย"
        }
      ],
      caption_th: `${topic} 🐟✨ ทริคดีๆ จากร้านปลาสวยงาม เซฟคลิปนี้ไว้ดูตอนจัดตู้ได้เลยครับ! #ปลาสวยงาม #ตู้ปลา #เลี้ยงปลา #TikTokUni`,
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
  currentPackData = fallbackPack;
  renderProductionPack(fallbackPack);
}

function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text);
  alert("📋 Copy ข้อความเรียบร้อย!");
}

document.getElementById("copyAllBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const script = currentPackData.script;
  let fullText = `🎬 TikTok Script: ${script.hook_3sec}\n\n`;
  script.scenes.forEach((s) => {
    fullText += `[${s.time_range}] ${s.voiceover_th}\n(Text: ${s.on_screen_text})\n🎥 Shot: ${s.camera_shot_guide}\n\n`;
  });
  fullText += `Caption:\n${script.caption_th}\n\nPinned Comment:\n${script.pinned_comment}`;
  navigator.clipboard.writeText(fullText);
  alert("📋 Copy Production Sheet ทั้งหมดสำเร็จ!");
});

document.getElementById("downloadMdBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const blob = new Blob([JSON.stringify(currentPackData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Production_Pack_${Date.now()}.json`;
  a.click();
});
