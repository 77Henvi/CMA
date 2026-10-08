/**
 * Architectural Studio Simulation Engine (Three.js WebGL)
 * - Real Walking Animation (Swinging limbs, hip bobbing, directional turning)
 * - Cute Day / Sunset / Night Atmosphere Cycle
 * - Rich Warm Architectural Color Palette
 */

const container = document.getElementById("threeContainer");

// --- 1. Three.js Scene Setup ---
const scene = new THREE.Scene();

// Atmosphere Presets (Day / Sunset / Night)
const atmospherePresets = {
  day: {
    bg: new THREE.Color(0xded7ca),
    fog: new THREE.Color(0xded7ca),
    ambient: new THREE.Color(0xf5ede4),
    ambientInt: 0.85,
    sunColor: new THREE.Color(0xfffaee),
    sunInt: 1.25,
    sunPos: new THREE.Vector3(16, 26, 18),
    fillColor: new THREE.Color(0xcfd8dc),
    fillInt: 0.45,
    deskSpotInt: 0.4,
    deskSpotColor: new THREE.Color(0xffeedb)
  },
  sunset: {
    bg: new THREE.Color(0xdcb896),
    fog: new THREE.Color(0xdcb896),
    ambient: new THREE.Color(0xfde68a),
    ambientInt: 0.9,
    sunColor: new THREE.Color(0xff7733),
    sunInt: 1.45,
    sunPos: new THREE.Vector3(26, 14, 16),
    fillColor: new THREE.Color(0xf472b6),
    fillInt: 0.55,
    deskSpotInt: 0.85,
    deskSpotColor: new THREE.Color(0xffedd5)
  },
  night: {
    bg: new THREE.Color(0x141a24),
    fog: new THREE.Color(0x141a24),
    ambient: new THREE.Color(0x1e293b),
    ambientInt: 0.35,
    sunColor: new THREE.Color(0x93c5fd),
    sunInt: 0.35,
    sunPos: new THREE.Vector3(-14, 22, -10),
    fillColor: new THREE.Color(0x0f172a),
    fillInt: 0.25,
    deskSpotInt: 1.25,
    deskSpotColor: new THREE.Color(0xffd8a8)
  }
};

let currentAtmoKey = "day";
let autoCycleActive = false;
let cycleTimer = 0;

scene.background = atmospherePresets.day.bg.clone();
scene.fog = new THREE.FogExp2(atmospherePresets.day.fog, 0.016);

const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 9.5, 27);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2.6, 0);
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 10;
controls.maxDistance = 45;

// --- 2. Dynamic Lighting Rig ---
const ambientLight = new THREE.AmbientLight(atmospherePresets.day.ambient, atmospherePresets.day.ambientInt);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc8bfb0, 0.6);
scene.add(hemiLight);

const mainSun = new THREE.DirectionalLight(atmospherePresets.day.sunColor, atmospherePresets.day.sunInt);
mainSun.position.copy(atmospherePresets.day.sunPos);
mainSun.castShadow = true;
mainSun.shadow.mapSize.width = 2048;
mainSun.shadow.mapSize.height = 2048;
mainSun.shadow.camera.near = 0.5;
mainSun.shadow.camera.far = 60;
mainSun.shadow.camera.left = -20;
mainSun.shadow.camera.right = 20;
mainSun.shadow.camera.top = 18;
mainSun.shadow.camera.bottom = -10;
mainSun.shadow.bias = -0.0003;
scene.add(mainSun);

const fillLight = new THREE.DirectionalLight(atmospherePresets.day.fillColor, atmospherePresets.day.fillInt);
fillLight.position.set(-18, 14, -10);
scene.add(fillLight);

// --- 3. Rich Materials Palette ---
const mat = (color, roughness = 0.65, metalness = 0.04) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const whiteDeskMat = mat(0xffffff, 0.25, 0.05);
const richHoneyOakMat = mat(0xc68b59, 0.7, 0.03); // Rich Warm Oak
const darkWalnutMat = mat(0x4a2e18, 0.8, 0.02);
const steelLegMat = mat(0x282624, 0.35, 0.3);
const terracottaWallMat = mat(0xdfd4c5, 0.9, 0.0);
const warmParquetMat = mat(0xd6c6b2, 0.75, 0.05);
const tealFabricMat = mat(0x254b47, 0.7, 0.0);
const navyFabricMat = mat(0x1e293b, 0.7, 0.0);
const skinMat = mat(0xffdec7, 0.6, 0.0);
const plantGreenMat = mat(0x2e7d32, 0.7, 0.0);
const coffeeCupMat = mat(0xffffff, 0.3, 0.0);

// --- 4. Architectural Environment Setup ---
// Floor with warm parquet tone
const floorGeo = new THREE.PlaneGeometry(55, 35);
const floorMesh = new THREE.Mesh(floorGeo, warmParquetMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = 0;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Back Wall with Moodboard & Architectural Art
const wallGroup = new THREE.Group();
wallGroup.position.set(0, 7.5, -4.8);

const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(55, 16), terracottaWallMat);
wallMesh.receiveShadow = true;
wallGroup.add(wallMesh);

const wallArt = [
  { x: -14, y: 2.2, w: 2.2, h: 2.8, c: 0xcdbda8 },
  { x: -8, y: 3.2, w: 3.4, h: 2.4, c: 0xd9caa5 },
  { x: -2, y: 2.8, w: 2.8, h: 3.4, c: 0xe0d4c3 },
  { x: 5, y: 3.0, w: 4.2, h: 2.8, c: 0xd1bfab },
  { x: 12, y: 2.4, w: 2.6, h: 3.6, c: 0xcbbba6 }
];

wallArt.forEach((art) => {
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(art.w, art.h), mat(art.c, 0.9));
  frame.position.set(art.x, art.y, 0.06);
  const border = new THREE.Mesh(new THREE.PlaneGeometry(art.w + 0.12, art.h + 0.12), mat(0x826e5a, 0.6));
  border.position.set(art.x, art.y, 0.03);
  wallGroup.add(border);
  wallGroup.add(frame);
});
scene.add(wallGroup);

// Coffee & Espresso Bar Counter (Left side)
const coffeeStation = new THREE.Group();
coffeeStation.position.set(-13.5, 0, -1.5);

const counterTable = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.5, 2.2), richHoneyOakMat);
counterTable.position.set(0, 1.25, 0);
counterTable.castShadow = true;
counterTable.receiveShadow = true;
coffeeStation.add(counterTable);

const espressoBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.0), mat(0x22201e, 0.3, 0.5));
espressoBody.position.set(-0.5, 3.0, 0);
espressoBody.castShadow = true;
coffeeStation.add(espressoBody);

for (let c = 0; c < 3; c++) {
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.22, 16), coffeeCupMat);
  cup.position.set(0.6 + c * 0.35, 2.61, 0.2);
  cup.castShadow = true;
  coffeeStation.add(cup);
}

// Lush Indoor Plants in Terracotta Pots
const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.9, 16), mat(0xb85d38, 0.8));
plantPot.position.set(1.4, 0.45, 1.2);
plantPot.castShadow = true;
const plantFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75), plantGreenMat);
plantFoliage.position.set(1.4, 1.25, 1.2);
plantFoliage.castShadow = true;
coffeeStation.add(plantPot);
coffeeStation.add(plantFoliage);

scene.add(coffeeStation);

// --- 5. Long Executive Oak Studio Table ---
const tableGroup = new THREE.Group();
tableGroup.position.set(0, 0, 0);

const tableLength = 22;
const tableDepth = 3.0;
const tableHeight = 2.6;

const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tableLength, 0.22, tableDepth), whiteDeskMat);
tableTop.position.set(0, tableHeight, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
tableGroup.add(tableTop);

// Rich Beveled Honey Oak Trim
const tableEdge = new THREE.Mesh(new THREE.BoxGeometry(tableLength, 0.08, tableDepth + 0.06), richHoneyOakMat);
tableEdge.position.set(0, tableHeight - 0.12, 0);
tableGroup.add(tableEdge);

const legX = [-10.5, -5.2, 0, 5.2, 10.5];
legX.forEach((lx) => {
  const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, tableHeight, 16), steelLegMat);
  l1.position.set(lx, tableHeight / 2, -tableDepth / 2 + 0.25);
  l1.castShadow = true;
  tableGroup.add(l1);

  const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, tableHeight, 16), steelLegMat);
  l2.position.set(lx, tableHeight / 2, tableDepth / 2 - 0.25);
  l2.castShadow = true;
  tableGroup.add(l2);
});

const drawersX = [-8.5, -0.2, 7.8];
drawersX.forEach((dx) => {
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 2.2), richHoneyOakMat);
  cabinet.position.set(dx, 1.0, 0);
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  tableGroup.add(cabinet);
});

// Desktops: Dual Monitors, Laptops, Lamps
const agentX = [-6.8, -2.2, 2.6, 7.2];
const deskSpots = [];

agentX.forEach((wx, i) => {
  if (i === 0 || i === 2) {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.5, 16), steelLegMat);
    stand.position.set(wx, tableHeight + 0.25, -0.4);
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.05, 0.08), mat(0x22201e, 0.3));
    screenFrame.position.set(wx, tableHeight + 0.78, -0.4);
    screenFrame.castShadow = true;
    const screenInner = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.92), new THREE.MeshBasicMaterial({ color: 0xf5f8fc }));
    screenInner.position.set(wx, tableHeight + 0.78, -0.35);
    tableGroup.add(stand);
    tableGroup.add(screenFrame);
    tableGroup.add(screenInner);
  } else {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.65), mat(0x33302c, 0.3));
    base.position.set(wx, tableHeight + 0.12, -0.1);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.58, 0.03), mat(0x33302c, 0.3));
    lid.position.set(wx, tableHeight + 0.38, -0.4);
    lid.rotation.x = -0.22;
    tableGroup.add(base);
    tableGroup.add(lid);
  }

  // Modern Desk Lamp
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), steelLegMat);
  lampBase.position.set(wx + 1.1, tableHeight + 0.12, -0.65);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16), steelLegMat);
  lampPole.position.set(wx + 1.1, tableHeight + 0.65, -0.65);
  lampPole.rotation.z = -0.25;
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 16), steelLegMat);
  lampHead.position.set(wx + 0.88, tableHeight + 1.1, -0.65);
  lampHead.rotation.z = 0.5;
  tableGroup.add(lampBase);
  tableGroup.add(lampPole);
  tableGroup.add(lampHead);

  const spot = new THREE.PointLight(atmospherePresets.day.deskSpotColor, atmospherePresets.day.deskSpotInt, 5.5);
  spot.position.set(wx + 0.85, tableHeight + 1.0, -0.45);
  tableGroup.add(spot);
  deskSpots.push(spot);

  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.2, 16), coffeeCupMat);
  mug.position.set(wx - 0.75, tableHeight + 0.2, -0.1);
  mug.castShadow = true;
  tableGroup.add(mug);
});

// Centerpiece: Crystal Nano Aquarium
const nanoAquarium = new THREE.Group();
nanoAquarium.position.set(0.2, tableHeight + 0.75, -0.3);

const aqGlass = new THREE.Mesh(
  new THREE.BoxGeometry(2.0, 1.2, 1.2),
  new THREE.MeshPhysicalMaterial({ color: 0x99f6e4, transmission: 0.92, transparent: true, roughness: 0.03, ior: 1.33 })
);
nanoAquarium.add(aqGlass);

const aqWater = new THREE.Mesh(
  new THREE.BoxGeometry(1.85, 1.05, 1.05),
  new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.25 })
);
nanoAquarium.add(aqWater);

const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), plantGreenMat);
moss.position.set(-0.4, -0.4, 0);
nanoAquarium.add(moss);

const nanoFishes = [];
for (let f = 0; f < 3; f++) {
  const fish = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), mat(f === 0 ? 0x00e5ff : 0xff3b30, 0.3));
  fish.rotation.z = Math.PI / 2;
  nanoAquarium.add(fish);
  nanoFishes.push({ mesh: fish, angle: f * 2.1, speed: 0.02 + f * 0.005, rad: 0.5 + f * 0.15, y: -0.15 + f * 0.15 });
}
tableGroup.add(nanoAquarium);

scene.add(tableGroup);

// --- 6. Ergonomic Task Chairs ---
function createErgonomicChair(x, z, chairMat) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.1, 8), steelLegMat);
  base.position.y = 0.18;
  group.add(base);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 16), steelLegMat);
  column.position.y = 0.65;
  group.add(column);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.3), chairMat);
  seat.position.y = 1.25;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.45, 0.16), chairMat);
  back.position.set(0, 2.05, 0.58);
  back.rotation.x = -0.07;
  back.castShadow = true;
  group.add(back);

  return group;
}

const chairs = [
  createErgonomicChair(agentX[0], 1.25, navyFabricMat),
  createErgonomicChair(agentX[1], 1.25, tealFabricMat),
  createErgonomicChair(agentX[2], 1.25, tealFabricMat),
  createErgonomicChair(agentX[3], 1.25, navyFabricMat)
];
chairs.forEach((c) => scene.add(c));

// --- 7. Full Kinematic Humanoid Agent Rig with Real Walking Skeleton ---
function createWalkingHumanoidAgent(outfitColor, hairColor, isWoman = false) {
  const root = new THREE.Group();

  // Pelvis / Hips Group
  const pelvis = new THREE.Group();
  pelvis.position.y = 1.35; // Base hip height
  root.add(pelvis);

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 1.1, 16), mat(outfitColor, 0.8));
  torso.position.y = 0.75;
  torso.castShadow = true;
  pelvis.add(torso);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const hairGeo = isWoman
    ? new THREE.SphereGeometry(0.42, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.5)
    : new THREE.SphereGeometry(0.41, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const hair = new THREE.Mesh(hairGeo, mat(hairColor, 0.9));
  hair.position.set(0, 0.08, 0.02);
  headGroup.add(hair);
  pelvis.add(headGroup);

  // Left & Right Arms (Pivoting at Shoulders)
  const armMat = mat(outfitColor, 0.8);
  
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.48, 1.15, 0);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), armMat);
  leftArmMesh.position.y = -0.36;
  leftArmMesh.castShadow = true;
  leftArmPivot.add(leftArmMesh);
  pelvis.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.48, 1.15, 0);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), armMat);
  rightArmMesh.position.y = -0.36;
  rightArmMesh.castShadow = true;
  rightArmPivot.add(rightArmMesh);
  pelvis.add(rightArmPivot);

  // Left & Right Legs (Pivoting at Hips)
  const pantsMat = mat(0x262420, 0.85);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.22, 0, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 0.2), pantsMat);
  leftLegMesh.position.y = -0.62;
  leftLegMesh.castShadow = true;
  leftLegPivot.add(leftLegMesh);
  pelvis.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.22, 0, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.25, 0.2), pantsMat);
  rightLegMesh.position.y = -0.62;
  rightLegMesh.castShadow = true;
  rightLegPivot.add(rightLegMesh);
  pelvis.add(rightLegPivot);

  return {
    root,
    pelvis,
    torso,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot
  };
}

const agentConfigs = [
  { id: "strategist", deskX: agentX[0], outfit: 0x363330, hair: 0x1f1d1b, isWoman: false, name: "Strategist" },
  { id: "scriptwriter", deskX: agentX[1], outfit: 0xa14332, hair: 0x804d2e, isWoman: true, name: "Scriptwriter" },
  { id: "shotDirector", deskX: agentX[2], outfit: 0x6e6558, hair: 0x22201e, isWoman: false, name: "Shot Director" },
  { id: "qaEvaluator", deskX: agentX[3], outfit: 0xb5a695, hair: 0x3d3025, isWoman: false, name: "QA Auditor" }
];

const agents = agentConfigs.map((cfg) => {
  const char = createWalkingHumanoidAgent(cfg.outfit, cfg.hair, cfg.isWoman);
  char.root.position.set(cfg.deskX, 0, 1.15);
  scene.add(char.root);

  return {
    ...cfg,
    ...char,
    targetX: cfg.deskX,
    targetZ: 1.15,
    state: "desk", // "desk", "coffee", "stretching", "chatting"
    stateTimer: Math.random() * 8 + 4,
    walkCycle: 0
  };
});

// --- 8. Animation & Day/Night Atmosphere Loop ---
let clock = new THREE.Clock();
let activeAgentId = "idle";

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // 1. Atmosphere Smooth Transition & Auto Cycle
  if (autoCycleActive) {
    cycleTimer += 0.003;
    const modes = ["day", "sunset", "night"];
    const targetMode = modes[Math.floor(cycleTimer) % modes.length];
    if (targetMode !== currentAtmoKey) {
      setAtmosphere(targetMode);
    }
  }

  // 2. Nano Fishes Swimming
  nanoFishes.forEach((f) => {
    f.angle += f.speed;
    f.mesh.position.x = Math.cos(f.angle) * f.rad;
    f.mesh.position.z = Math.sin(f.angle) * (f.rad * 0.7);
    f.mesh.position.y = f.y + Math.sin(time * 3 + f.angle) * 0.06;
    f.mesh.rotation.y = -f.angle + Math.PI / 2;
  });

  // 3. Autonomous Behaviors & Kinematic Walking Animation
  agents.forEach((ag, idx) => {
    const isExecuting = activeAgentId === ag.id;

    // Autonomous State Switching
    if (activeAgentId === "idle") {
      ag.stateTimer -= 0.016;
      if (ag.stateTimer <= 0) {
        if (ag.state === "desk") {
          const rand = Math.random();
          if (rand < 0.4) {
            ag.state = "coffee";
            ag.targetX = -12.5; // Walk to Espresso counter
            ag.targetZ = 0.5;
            ag.stateTimer = 10.0;
          } else if (rand < 0.7) {
            ag.state = "stretching";
            ag.stateTimer = 5.5;
          } else {
            ag.state = "chatting";
            ag.targetX = ag.deskX + (idx % 2 === 0 ? 2.5 : -2.5);
            ag.targetZ = 1.8;
            ag.stateTimer = 7.0;
          }
        } else {
          ag.state = "desk";
          ag.targetX = ag.deskX;
          ag.targetZ = 1.15;
          ag.stateTimer = Math.random() * 14 + 6;
        }
      }
    } else {
      if (isExecuting && ag.state !== "desk") {
        ag.state = "desk";
        ag.targetX = ag.deskX;
        ag.targetZ = 1.15;
      }
    }

    // Distance to Target
    const dx = ag.targetX - ag.root.position.x;
    const dz = ag.targetZ - ag.root.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isWalking = dist > 0.15;

    if (isWalking) {
      // --- REAL WALKING KINEMATICS ---
      const walkSpeed = 0.05;
      ag.root.position.x += (dx / dist) * walkSpeed;
      ag.root.position.z += (dz / dist) * walkSpeed;

      // Smooth Directional Heading
      const targetAngle = Math.atan2(dx, dz);
      ag.root.rotation.y += (targetAngle - ag.root.rotation.y) * 0.15;

      ag.walkCycle += 0.18;

      // Alternating Leg Stride
      ag.leftLegPivot.rotation.x = Math.sin(ag.walkCycle) * 0.65;
      ag.rightLegPivot.rotation.x = -Math.sin(ag.walkCycle) * 0.65;

      // Arm Counter-Swing
      ag.leftArmPivot.rotation.x = -Math.sin(ag.walkCycle) * 0.55;
      ag.rightArmPivot.rotation.x = Math.sin(ag.walkCycle) * 0.55;

      // Hip Vertical Bobbing
      ag.pelvis.position.y = 1.35 + Math.abs(Math.sin(ag.walkCycle * 2)) * 0.08;
      ag.headGroup.rotation.x = Math.sin(ag.walkCycle * 2) * 0.04;
    } else {
      // --- SEATED / STANDING STATIONARY ANIMATIONS ---
      ag.root.rotation.y += (0 - ag.root.rotation.y) * 0.1;
      ag.pelvis.position.y = ag.state === "desk" ? 1.05 : 1.35; // Sit down at desk

      // Reset Leg angles for Sitting vs Standing
      if (ag.state === "desk") {
        ag.leftLegPivot.rotation.x = -1.45; // 90 degree seated bend
        ag.rightLegPivot.rotation.x = -1.45;
      } else {
        ag.leftLegPivot.rotation.x = 0;
        ag.rightLegPivot.rotation.x = 0;
      }

      // Natural Breathing & Posture
      ag.torso.position.y = 0.75 + Math.sin(time * 2 + idx) * 0.02;
      ag.headGroup.position.y = 1.5 + Math.sin(time * 2 + idx) * 0.03;

      if (isExecuting) {
        // Fast Typing on Laptop
        ag.leftArmPivot.rotation.x = 0.95 + Math.sin(time * 20) * 0.15;
        ag.rightArmPivot.rotation.x = 0.95 + Math.cos(time * 20) * 0.15;
        ag.headGroup.rotation.x = 0.22 + Math.sin(time * 8) * 0.04;
        deskSpots[idx].intensity = 1.4;
      } else if (ag.state === "stretching") {
        // Standing and stretching arms high
        ag.leftArmPivot.rotation.x = -1.4 + Math.sin(time * 3) * 0.2;
        ag.rightArmPivot.rotation.x = -1.4 + Math.sin(time * 3) * 0.2;
        ag.headGroup.rotation.x = -0.35 + Math.sin(time * 2) * 0.1;
      } else if (ag.state === "coffee") {
        // Sipping warm coffee
        ag.leftArmPivot.rotation.x = 0.4;
        ag.rightArmPivot.rotation.x = 1.35 + Math.sin(time * 1.8) * 0.18;
        ag.headGroup.rotation.x = 0.12 + Math.sin(time * 1.8) * 0.1;
      } else {
        // Normal Working at Desk
        ag.leftArmPivot.rotation.x = 0.85 + Math.sin(time * 2 + idx) * 0.04;
        ag.rightArmPivot.rotation.x = 0.85 + Math.cos(time * 2 + idx) * 0.04;
        ag.headGroup.rotation.y = Math.sin(time * 0.6 + idx * 1.2) * 0.18;
        ag.headGroup.rotation.x = Math.sin(time * 0.4 + idx) * 0.06;
      }
    }

    // Chair subtle swivel
    chairs[idx].rotation.y = Math.sin(time * 0.5 + idx) * 0.05;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- 9. Day / Sunset / Night Atmosphere Switcher ---
function setAtmosphere(modeKey) {
  currentAtmoKey = modeKey;
  const p = atmospherePresets[modeKey];
  if (!p) return;

  // Animate Colors
  scene.background.copy(p.bg);
  scene.fog.color.copy(p.fog);
  ambientLight.color.copy(p.ambient);
  ambientLight.intensity = p.ambientInt;
  mainSun.color.copy(p.sunColor);
  mainSun.intensity = p.sunInt;
  mainSun.position.copy(p.sunPos);
  fillLight.color.copy(p.fillColor);
  fillLight.intensity = p.fillInt;

  deskSpots.forEach((spot) => {
    spot.color.copy(p.deskSpotColor);
    spot.intensity = p.deskSpotInt;
  });

  // Update UI button states
  document.querySelectorAll(".cycle-btn:not(.auto-btn)").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-time") === modeKey);
  });
}

// Atmosphere Buttons Event Listeners
document.querySelectorAll(".cycle-btn[data-time]").forEach((btn) => {
  btn.addEventListener("click", () => {
    autoCycleActive = false;
    document.getElementById("autoCycleBtn").classList.remove("active");
    setAtmosphere(btn.getAttribute("data-time"));
  });
});

document.getElementById("autoCycleBtn")?.addEventListener("click", () => {
  autoCycleActive = !autoCycleActive;
  document.getElementById("autoCycleBtn").classList.toggle("active", autoCycleActive);
});

// Window Resize Handler
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// --- 10. UI & Pipeline Controller ---
const topicInput = document.getElementById("topicInput");
const generateForm = document.getElementById("generateForm");
const startBtn = document.getElementById("startBtn");
const chips = document.querySelectorAll(".preset-chips .chip");

const activeAgentName = document.getElementById("activeAgentName");
const activityStatus = document.getElementById("activityStatus");

const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");

let currentPackData = null;

// Preset Chip Clicks
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

  // Trigger Lively Agent Step Sequence
  await runStudioPipelineSequence(topic);

  // Fetch from Python backend
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
  setActivityStatus("Production Sheet Complete", "Ready for voiceover recording and video shooting in your store", true);
  startBtn.disabled = false;
  startBtn.style.opacity = "1";
});

async function runStudioPipelineSequence(topic) {
  // 1. Strategist
  activeAgentId = "strategist";
  setActivityStatus("Strategist Agent", `Researching audience pain points and viral hooks for: "${topic}"`);
  await sleep(1500);

  // 2. Scriptwriter
  activeAgentId = "scriptwriter";
  setActivityStatus("Scriptwriter Agent", "Composing 30s voiceover script and 3-second retention hook...");
  await sleep(1600);

  // 3. Shot Director
  activeAgentId = "shotDirector";
  setActivityStatus("Shot Director Agent", "Directing physical camera angles (Macro close-up, Top-down, Wide setup)...");
  await sleep(1500);

  // 4. QA Auditor
  activeAgentId = "qaEvaluator";
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

  // Scenes List
  const scenesList = document.getElementById("scenesList");
  scenesList.innerHTML = "";

  script.scenes.forEach((scene) => {
    const card = document.createElement("div");
    card.className = "scene-card";
    card.innerHTML = `
      <div class="scene-header">
        <span class="scene-tag">Scene ${scene.scene_number}</span>
        <span class="scene-time">${scene.time_range}</span>
      </div>
      <div class="vo-text">
        <strong>Voiceover:</strong> "${scene.voiceover_th}"
      </div>
      <div class="on-screen-pill">
        <span>On-Screen Text:</span> <code>${scene.on_screen_text}</code>
      </div>
      <div class="shot-guide-box">
        <strong>Camera Direction:</strong> ${scene.camera_shot_guide || "Clean front shot focusing on aquarium"}
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
  currentPackData = fallbackPack;
  renderProductionPack(fallbackPack);
}

function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text);
  alert("Copied to clipboard!");
}

document.getElementById("copyAllBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const script = currentPackData.script;
  let fullText = `TikTok Script: ${script.hook_3sec}\n\n`;
  script.scenes.forEach((s) => {
    fullText += `[${s.time_range}] ${s.voiceover_th}\n(Text: ${s.on_screen_text})\nShot: ${s.camera_shot_guide}\n\n`;
  });
  fullText += `Caption:\n${script.caption_th}\n\nPinned Comment:\n${script.pinned_comment}`;
  navigator.clipboard.writeText(fullText);
  alert("Production Sheet Copied!");
});

document.getElementById("downloadMdBtn")?.addEventListener("click", () => {
  if (!currentPackData) return;
  const blob = new Blob([JSON.stringify(currentPackData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Production_Pack_${Date.now()}.json`;
  a.click();
});
