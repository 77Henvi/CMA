/**
 * 3D Minimal Niche Virtual Office Platform (Three.js WebGL Engine)
 */

const container = document.getElementById("threeContainer");

// --- 1. Three.js Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e141d);
scene.fog = new THREE.FogExp2(0x0e141d, 0.02);

const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(18, 22, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.5, 0);
controls.maxPolarAngle = Math.PI / 2.1; // Don't flip below floor
controls.minDistance = 10;
controls.maxDistance = 45;

// --- 2. 3D Minimal Studio Lighting ---
const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.6);
scene.add(hemiLight);

const mainSun = new THREE.DirectionalLight(0xfff3e0, 1.2);
mainSun.position.set(15, 25, 15);
mainSun.castShadow = true;
mainSun.shadow.mapSize.width = 2048;
mainSun.shadow.mapSize.height = 2048;
mainSun.shadow.camera.near = 0.5;
mainSun.shadow.camera.far = 60;
mainSun.shadow.camera.left = -15;
mainSun.shadow.camera.right = 15;
mainSun.shadow.camera.top = 15;
mainSun.shadow.camera.bottom = -15;
mainSun.shadow.bias = -0.0005;
scene.add(mainSun);

const blueFill = new THREE.DirectionalLight(0x38bdf8, 0.5);
blueFill.position.set(-15, 10, -15);
scene.add(blueFill);

// --- 3. 3D Clay & Pastel Materials ---
const clayMat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x161f2e, roughness: 0.8, metalness: 0.1 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x99f6e4,
  transmission: 0.85,
  opacity: 1,
  transparent: true,
  roughness: 0.1,
  ior: 1.33
});

// --- 4. Build 3D Minimal Office Floor ---
const floorGeo = new THREE.BoxGeometry(20, 0.6, 16);
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.position.y = -0.3;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Base skirting glow line
const ringGeo = new THREE.RingGeometry(0.2, 10, 32);
const gridHelper = new THREE.GridHelper(19, 19, 0x38bdf8, 0x1e293b);
gridHelper.position.y = 0.02;
scene.add(gridHelper);

// --- 5. Centerpiece: 3D Minimal Nano Aquarium ---
const tankGroup = new THREE.Group();
tankGroup.position.set(0, 0.8, 0);

// Glass Tank Box
const tankGeo = new THREE.BoxGeometry(3.6, 2.4, 2.4);
const tankMesh = new THREE.Mesh(tankGeo, glassMat);
tankGroup.add(tankMesh);

// Substrate (Sand)
const sandGeo = new THREE.BoxGeometry(3.4, 0.3, 2.2);
const sandMesh = new THREE.Mesh(sandGeo, clayMat(0xe5e5da, 0.9));
sandMesh.position.y = -1.0;
sandGroup_add = tankGroup.add(sandMesh);

// Water glow interior
const waterGeo = new THREE.BoxGeometry(3.3, 1.8, 2.1);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x06b6d4,
  transparent: true,
  opacity: 0.25,
  roughness: 0.1
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.position.y = -0.1;
tankGroup.add(waterMesh);

// Desk for aquarium
const aqDeskGeo = new THREE.CylinderGeometry(2.4, 2.6, 1.6, 32);
const aqDesk = new THREE.Mesh(aqDeskGeo, clayMat(0x1e293b, 0.7));
aqDesk.position.set(0, 0, 0);
aqDesk.castShadow = true;
aqDesk.receiveShadow = true;
scene.add(aqDesk);
scene.add(tankGroup);

// Animated 3D Fishes
const fishMeshes = [];
const fishData = [
  { angle: 0, speed: 0.02, radius: 1.1, y: 0.8, color: 0x00e5ff },
  { angle: 1.5, speed: 0.016, radius: 0.9, y: 1.1, color: 0x00e5ff },
  { angle: 3.2, speed: -0.022, radius: 1.2, y: 0.6, color: 0xff6b6b },
  { angle: 4.8, speed: 0.018, radius: 0.8, y: 1.3, color: 0x00e5ff }
];

fishData.forEach((fd) => {
  const fGroup = new THREE.Group();
  const bodyGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
  bodyGeo.rotateZ(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, clayMat(fd.color, 0.4));
  fGroup.add(bodyMesh);

  // Red neon stripe
  const stripeGeo = new THREE.BoxGeometry(0.18, 0.04, 0.05);
  const stripeMesh = new THREE.Mesh(stripeGeo, clayMat(0xff3366, 0.3));
  fGroup.add(stripeMesh);

  tankGroup.add(fGroup);
  fishMeshes.push({ group: fGroup, ...fd });
});

// --- 6. Build 4 Minimal Workstations ---
const stations = {
  strategist: { x: -6.5, z: -4.5, color: 0x58a6ff, name: "Strategy Lounge" },
  scriptwriter: { x: 6.5, z: -4.5, color: 0xe3b341, name: "Scripting Studio" },
  shotDirector: { x: 6.5, z: 4.5, color: 0xff7b72, name: "Shot Director Bay" },
  qaEvaluator: { x: -6.5, z: 4.5, color: 0x38d9a9, name: "QA Audit Hub" }
};

function createDesk(x, z, accentColor) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Clay Desk Table
  const topGeo = new THREE.BoxGeometry(3.6, 0.25, 2.0);
  const topMesh = new THREE.Mesh(topGeo, clayMat(0x1f2937, 0.5));
  topMesh.position.y = 1.3;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3);
  const legPositions = [
    [-1.6, 0.65, -0.8],
    [1.6, 0.65, -0.8],
    [-1.6, 0.65, 0.8],
    [1.6, 0.65, 0.8]
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, clayMat(0x374151));
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  // Glowing station floor mat
  const padGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.05, 32);
  const padMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.15,
    roughness: 0.9
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.03;
  group.add(pad);

  return group;
}

// 1. Strategy Station Props (Whiteboard & Tablet)
const stratDesk = createDesk(stations.strategist.x, stations.strategist.z, stations.strategist.color);
const boardGeo = new THREE.BoxGeometry(2.4, 1.6, 0.1);
const boardMesh = new THREE.Mesh(boardGeo, clayMat(0xf8fafc, 0.3));
boardMesh.position.set(0, 2.4, -0.8);
stratDesk.add(boardMesh);
scene.add(stratDesk);

// 2. Scriptwriting Station Props (Dual Monitors)
const scriptDesk = createDesk(stations.scriptwriter.x, stations.scriptwriter.z, stations.scriptwriter.color);
const monGeo = new THREE.BoxGeometry(1.2, 0.8, 0.08);
const monMesh1 = new THREE.Mesh(monGeo, clayMat(0x0f172a, 0.2));
monMesh1.position.set(-0.65, 1.85, -0.2);
monMesh1.rotation.y = 0.2;
const monMesh2 = new THREE.Mesh(monGeo, clayMat(0x0f172a, 0.2));
monMesh2.position.set(0.65, 1.85, -0.2);
monMesh2.rotation.y = -0.2;
scriptDesk.add(monMesh1);
scriptDesk.add(monMesh2);
scene.add(scriptDesk);

// 3. Shot Director Station Props (Tripod Camera & Ring Light)
const shotDesk = createDesk(stations.shotDirector.x, stations.shotDirector.z, stations.shotDirector.color);
const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), clayMat(0x111827));
camBody.position.set(0, 1.8, 0);
const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16), clayMat(0x374151));
camLens.rotation.x = Math.PI / 2;
camLens.position.set(0, 1.8, -0.35);
const ringLight = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 16, 32), clayMat(0xffedd5, 0.1));
ringLight.position.set(0, 1.8, -0.5);
shotDesk.add(camBody);
shotDesk.add(camLens);
shotDesk.add(ringLight);
scene.add(shotDesk);

// 4. QA Audit Hub Props (Server Rack & Radar)
const qaDesk = createDesk(stations.qaEvaluator.x, stations.qaEvaluator.z, stations.qaEvaluator.color);
const serverRack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.9), clayMat(0x111827));
serverRack.position.set(0, 1.5, -0.4);
qaDesk.add(serverRack);
scene.add(qaDesk);

// --- 7. Build 4 Cute 3D Clay Chibi Avatar Agents ---
function createChibiAgent(color, label) {
  const group = new THREE.Group();

  // Head (Smooth Clay Sphere)
  const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, clayMat(0xffdec7, 0.6));
  headMesh.position.y = 1.35;
  headMesh.castShadow = true;
  group.add(headMesh);

  // Cute Eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const eyeMat = clayMat(0x111111, 0.2);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.16, 1.38, 0.43);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.16, 1.38, 0.43);
  group.add(leftEye);
  group.add(rightEye);

  // Blushing Cheeks
  const cheekGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const cheekMat = clayMat(0xff8a8a, 0.5);
  const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
  leftCheek.position.set(-0.28, 1.25, 0.38);
  const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
  rightCheek.position.set(0.28, 1.25, 0.38);
  group.add(leftCheek);
  group.add(rightCheek);

  // Clay Body (Capsule/Cylinder)
  const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.65, 24);
  const bodyMesh = new THREE.Mesh(bodyGeo, clayMat(color, 0.5));
  bodyMesh.position.y = 0.75;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Feet
  const footGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const footMat = clayMat(0x1e293b);
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-0.2, 0.2, 0.05);
  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightFoot.position.set(0.2, 0.2, 0.05);
  group.add(leftFoot);
  group.add(rightFoot);

  return group;
}

const agentCharacters = [
  {
    id: "strategist",
    mesh: createChibiAgent(0x58a6ff, "Strategist"),
    currentPos: new THREE.Vector3(stations.strategist.x, 0, stations.strategist.z + 1.6),
    targetPos: new THREE.Vector3(stations.strategist.x, 0, stations.strategist.z + 1.6)
  },
  {
    id: "scriptwriter",
    mesh: createChibiAgent(0xe3b341, "Scriptwriter"),
    currentPos: new THREE.Vector3(stations.scriptwriter.x, 0, stations.scriptwriter.z + 1.6),
    targetPos: new THREE.Vector3(stations.scriptwriter.x, 0, stations.scriptwriter.z + 1.6)
  },
  {
    id: "shotDirector",
    mesh: createChibiAgent(0xff7b72, "Shot Director"),
    currentPos: new THREE.Vector3(stations.shotDirector.x, 0, stations.shotDirector.z - 1.6),
    targetPos: new THREE.Vector3(stations.shotDirector.x, 0, stations.shotDirector.z - 1.6)
  },
  {
    id: "qaEvaluator",
    mesh: createChibiAgent(0x38d9a9, "QA Auditor"),
    currentPos: new THREE.Vector3(stations.qaEvaluator.x, 0, stations.qaEvaluator.z - 1.6),
    targetPos: new THREE.Vector3(stations.qaEvaluator.x, 0, stations.qaEvaluator.z - 1.6)
  }
];

agentCharacters.forEach((ac) => {
  ac.mesh.position.copy(ac.currentPos);
  scene.add(ac.mesh);
});

// --- 8. Animation Render Loop ---
let clock = new THREE.Clock();
let activeAgentId = "idle";

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // 1. Update Fishes Swimming
  fishMeshes.forEach((f) => {
    f.angle += f.speed;
    f.group.position.x = Math.cos(f.angle) * f.radius;
    f.group.position.z = Math.sin(f.angle) * (f.radius * 0.7);
    f.group.position.y = f.y + Math.sin(time * 3 + f.angle) * 0.1;
    f.group.rotation.y = -f.angle + (f.speed > 0 ? Math.PI / 2 : -Math.PI / 2);
  });

  // 2. Animate Chibi Agents (Walking & Bobbing)
  agentCharacters.forEach((ac) => {
    // Interpolate position
    ac.currentPos.lerp(ac.targetPos, 0.08);
    ac.mesh.position.copy(ac.currentPos);

    // Cute idle/working bobbing
    const isWorking = activeAgentId === ac.id;
    const bounceFreq = isWorking ? 10 : 3;
    const bounceAmp = isWorking ? 0.12 : 0.03;
    ac.mesh.position.y = Math.abs(Math.sin(time * bounceFreq)) * bounceAmp;

    // Look at center when walking
    if (ac.currentPos.distanceTo(ac.targetPos) > 0.1) {
      ac.mesh.lookAt(ac.targetPos.x, ac.mesh.position.y, ac.targetPos.z);
    }
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

  // Trigger 3D Agent Walk Animation
  await run3DAgentSequence(topic);

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
  setActivityStatus("🎉 ผลิตเสร็จสมบูรณ์!", "พร้อมนำบทไปอัดเสียง & ถ่ายคลิปจริงตามไกด์มุมกล้อง", "✅");
  startBtn.disabled = false;
  startBtn.style.opacity = "1";
});

async function run3DAgentSequence(topic) {
  // 1. Strategist
  activeAgentId = "strategist";
  setActivityStatus("Strategist Agent", `วิเคราะห์ Pain Point & หา Hook ปังๆ: "${topic}"`, "🧠");
  await sleep(1200);

  // Walk towards Scriptwriter
  agentCharacters[0].targetPos.set(0, 0, -3.5);
  await sleep(700);

  // 2. Scriptwriter
  activeAgentId = "scriptwriter";
  setActivityStatus("Scriptwriter Agent", "เขียนบทพากย์ 30 วิ + ล็อก Hook 3 วินาทีแรก...", "✍️");
  await sleep(1400);

  // Walk towards Shot Director
  agentCharacters[1].targetPos.set(5.5, 0, 0);
  await sleep(700);

  // 3. Shot Director
  activeAgentId = "shotDirector";
  setActivityStatus("Shot Director Agent", "วางมุมกล้องถ่ายทำจริงในร้าน (Macro, Wide, Close-up)...", "🎬");
  await sleep(1400);

  // Walk towards QA
  agentCharacters[2].targetPos.set(0, 0, 3.5);
  await sleep(700);

  // 4. QA Evaluator
  activeAgentId = "qaEvaluator";
  setActivityStatus("QA Evaluator Agent", "ตรวจสอบคะแนน TikTok Algorithm & ความง่ายในการถ่าย...", "📊");
  await sleep(1000);

  // Reset positions
  agentCharacters[0].targetPos.set(stations.strategist.x, 0, stations.strategist.z + 1.6);
  agentCharacters[1].targetPos.set(stations.scriptwriter.x, 0, stations.scriptwriter.z + 1.6);
  agentCharacters[2].targetPos.set(stations.shotDirector.x, 0, stations.shotDirector.z - 1.6);
  agentCharacters[3].targetPos.set(stations.qaEvaluator.x, 0, stations.qaEvaluator.z - 1.6);
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
        <strong>🎥 ไกด์มุมกล้องถ่ายจริง:</strong> ${scene.camera_shot_guide || "มุมถ่ายเจาะตู้ปลาแบบคลีนๆ"}
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
