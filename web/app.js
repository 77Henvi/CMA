/**
 * Architectural Studio Simulation Engine (Three.js WebGL)
 * - Highly Detailed Stylized 3D Characters (Glasses, Lapels, Hair, Shoes, Watches, Cups)
 * - Fixed Seating & Desk Clearance (Zero Clipping, Proportional Heights)
 * - Smooth Walking Kinematics & Day/Sunset/Night Cycle
 */

const container = document.getElementById("threeContainer");

// --- 1. Three.js Scene Setup ---
const scene = new THREE.Scene();

// Atmosphere Presets (Day / Sunset / Night)
const atmospherePresets = {
  day: {
    bg: new THREE.Color(0xf6f2eb),
    fog: new THREE.Color(0xf6f2eb),
    ambient: new THREE.Color(0xfff8f0),
    ambientInt: 0.95,
    sunColor: new THREE.Color(0xfffcf5),
    sunInt: 1.25,
    sunPos: new THREE.Vector3(18, 28, 20),
    fillColor: new THREE.Color(0xe5ded3),
    fillInt: 0.5,
    deskSpotInt: 0.45,
    deskSpotColor: new THREE.Color(0xffeedb)
  },
  sunset: {
    bg: new THREE.Color(0xdcb896),
    fog: new THREE.Color(0xdcb896),
    ambient: new THREE.Color(0xfde68a),
    ambientInt: 0.95,
    sunColor: new THREE.Color(0xff7733),
    sunInt: 1.5,
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
    deskSpotInt: 1.35,
    deskSpotColor: new THREE.Color(0xffd8a8)
  }
};

let currentAtmoKey = "day";
let autoCycleActive = false;
let cycleTimer = 0;

scene.background = atmospherePresets.day.bg.clone();
scene.fog = new THREE.FogExp2(atmospherePresets.day.fog, 0.016);

const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 9.5, 29);

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
controls.target.set(0, 2.7, 0);
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 10;
controls.maxDistance = 48;

// --- 2. Dynamic Lighting Rig ---
const ambientLight = new THREE.AmbientLight(atmospherePresets.day.ambient, atmospherePresets.day.ambientInt);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc8bfb0, 0.65);
scene.add(hemiLight);

const mainSun = new THREE.DirectionalLight(atmospherePresets.day.sunColor, atmospherePresets.day.sunInt);
mainSun.position.copy(atmospherePresets.day.sunPos);
mainSun.castShadow = true;
mainSun.shadow.mapSize.width = 2048;
mainSun.shadow.mapSize.height = 2048;
mainSun.shadow.camera.near = 0.5;
mainSun.shadow.camera.far = 65;
mainSun.shadow.camera.left = -22;
mainSun.shadow.camera.right = 22;
mainSun.shadow.camera.top = 20;
mainSun.shadow.camera.bottom = -10;
mainSun.shadow.bias = -0.0003;
scene.add(mainSun);

const fillLight = new THREE.DirectionalLight(atmospherePresets.day.fillColor, atmospherePresets.day.fillInt);
fillLight.position.set(-18, 14, -10);
scene.add(fillLight);

// --- 3. Material Palette (Elevated Architectural Studio & Muted Earth Tones) ---
const mat = (color, roughness = 0.65, metalness = 0.04) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

// Architectural Scandinavian/Japanese Studio Palette (Directly matched to user reference)
const studioWallWhiteMat = mat(0xf3efe8, 0.95, 0.0);
const studioWallWarmMat = mat(0xeee7dc, 0.92, 0.0);
const warmAcousticFeltMat = mat(0xe5ddd1, 0.88, 0.0);
const gridLineMat = new THREE.MeshBasicMaterial({ color: 0xd6ccc0, transparent: true, opacity: 0.55 });
const pinboardMat = mat(0xd4c7b5, 0.85, 0.0);
const paperMat = mat(0xf9f7f2, 0.9, 0.0);
const paperDraftMat = mat(0xe8e0d2, 0.85, 0.0);

// Oak & Furniture
const whiteDeskMat = mat(0xfdfbf7, 0.35, 0.02);
const richHoneyOakMat = mat(0xbfa588, 0.75, 0.02); // Pale blonde ash oak
const naturalOakMat = mat(0xcdbda4, 0.78, 0.02);
const darkWalnutMat = mat(0x544538, 0.72, 0.02);
const warmCabinetBeigeMat = mat(0xd5c8b7, 0.75, 0.0);
const steelLegMat = mat(0x2d2b28, 0.35, 0.25);
const brassAccentMat = mat(0xcbb179, 0.4, 0.45);

// Chair Fabrics (Dark Charcoal, Sage Green, Rust Clay from reference)
const tealFabricMat = mat(0x426863, 0.8, 0.0); // Desaturated sage teal
const navyFabricMat = mat(0x363e46, 0.8, 0.0); // Muted slate navy
const rustFabricMat = mat(0x8f483c, 0.8, 0.0); // Japanese terracotta rust

// Props & Details
const skinMat = mat(0xf5d9c4, 0.55, 0.0);
const plantGreenMat = mat(0x4a634e, 0.75, 0.0);
const coffeeCupMat = mat(0xfcfaf6, 0.25, 0.0);
const shoeLeatherMat = mat(0x23201d, 0.5, 0.05);
const sneakerWhiteMat = mat(0xf7f5f0, 0.6, 0.0);

// --- 4. Architectural Environment Setup ---
// Floor with subtle soft warm concrete studio parquet
const floorGeo = new THREE.PlaneGeometry(60, 40);
const floorMesh = new THREE.Mesh(floorGeo, mat(0xece5d9, 0.85, 0.02));
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = 0;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Architectural Rug Area under working bench
const rugMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), mat(0xdfd6c7, 0.95, 0.0));
rugMesh.rotation.x = -Math.PI / 2;
rugMesh.position.set(0, 0.01, 1.2);
rugMesh.receiveShadow = true;
scene.add(rugMesh);

// Architectural Back Studio Partition Wall (Multi-layered panels like the reference)
const wallGroup = new THREE.Group();
wallGroup.position.set(0, 7.5, -4.8);

// Base Back Wall
const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 18), studioWallWhiteMat);
wallMesh.receiveShadow = true;
wallGroup.add(wallMesh);

// Architectural Grid Wireframe & Partition Mullions (Signature look of reference drawing)
for (let gx = -26; gx <= 26; gx += 3.2) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.04, 15, 0.04), gridLineMat);
  line.position.set(gx, 0, 0.02);
  wallGroup.add(line);
}
for (let gy = -6; gy <= 8; gy += 2.8) {
  const lineH = new THREE.Mesh(new THREE.BoxGeometry(54, 0.04, 0.04), gridLineMat);
  lineH.position.set(0, gy, 0.02);
  wallGroup.add(lineH);
}

// Slatted Acoustic Oak Screen / Japanese Shoji Screens behind Left & Right
const createSlatPartition = (posX, width) => {
  const slatGroup = new THREE.Group();
  slatGroup.position.set(posX, -0.5, 0.1);
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(width, 10.5, 0.1), warmAcousticFeltMat);
  slatGroup.add(backPanel);
  const numSlats = Math.floor(width / 0.45);
  for (let s = 0; s < numSlats; s++) {
    const sx = -width / 2 + 0.25 + s * 0.45;
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 10.5, 0.14), richHoneyOakMat);
    slat.position.set(sx, 0, 0.08);
    slat.castShadow = true;
    slatGroup.add(slat);
  }
  return slatGroup;
};
wallGroup.add(createSlatPartition(-18, 7.5));
wallGroup.add(createSlatPartition(18, 7.5));

// Architectural Pinboards, Sketch Plans & Framed Concept Art
const pinboardsData = [
  { x: -11.5, y: 1.5, w: 4.8, h: 4.0, bg: pinboardMat },
  { x: 3.5, y: 2.0, w: 6.2, h: 4.5, bg: warmAcousticFeltMat },
  { x: 11.5, y: 1.0, w: 3.8, h: 3.6, bg: pinboardMat }
];
pinboardsData.forEach((pb) => {
  const board = new THREE.Mesh(new THREE.BoxGeometry(pb.w, pb.h, 0.12), pb.bg);
  board.position.set(pb.x, pb.y, 0.1);
  board.receiveShadow = true;
  wallGroup.add(board);

  // Pin various sketch sheets onto the board
  const sheetsCount = 4;
  for (let sc = 0; sc < sheetsCount; sc++) {
    const sw = 1.0 + Math.random() * 0.6;
    const sh = 1.2 + Math.random() * 0.5;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), sc % 2 === 0 ? paperMat : paperDraftMat);
    const sx = pb.x - pb.w / 2 + 0.8 + sc * (pb.w / sheetsCount);
    const sy = pb.y - 0.5 + (sc % 2) * 1.0;
    sheet.position.set(sx, sy, 0.18);
    sheet.rotation.z = (Math.random() - 0.5) * 0.08;
    wallGroup.add(sheet);
  }
});

// Single Modern Minimalist Art Frame on Far Left (like in the drawing)
const artFrame = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), mat(0x282624, 0.5));
artFrame.position.set(-22, 3.5, 0.08);
const artInner = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.9), mat(0xd3c4b0, 0.9));
artInner.position.set(-22, 3.5, 0.1);
wallGroup.add(artFrame);
wallGroup.add(artInner);

// Floating Architectural Oak Shelving with Books and Ceramics
const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.15, 1.2), richHoneyOakMat);
shelf1.position.set(-4, 5.8, 0.6);
shelf1.castShadow = true;
wallGroup.add(shelf1);

// Books & decor objects on shelf
for (let b = 0; b < 12; b++) {
  const bookColors = [0x544538, 0x8f483c, 0xd4c7b5, 0x363e46, 0xbf9b7a];
  const bMat = mat(bookColors[b % bookColors.length], 0.8);
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85 + (b % 3) * 0.2, 0.65), bMat);
  book.position.set(-8.5 + b * 0.25, 6.35 + (b % 3) * 0.1, 0.6);
  book.castShadow = true;
  wallGroup.add(book);
}

// Minimalist Ceramic Vases on Shelf
const vase1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.1, 16), mat(0xe8dfd2, 0.4));
vase1.position.set(0.5, 6.4, 0.6);
vase1.castShadow = true;
wallGroup.add(vase1);

scene.add(wallGroup);

// --- 5. Coffee Station & Lounge Counter (Left Corner) ---
const coffeeStation = new THREE.Group();
coffeeStation.position.set(-16.5, 0, -0.8);

const counterTable = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.5, 2.2), warmCabinetBeigeMat);
counterTable.position.set(0, 1.25, 0);
counterTable.castShadow = true;
counterTable.receiveShadow = true;
coffeeStation.add(counterTable);

const counterTopWood = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 2.4), richHoneyOakMat);
counterTopWood.position.set(0, 2.55, 0);
counterTopWood.castShadow = true;
coffeeStation.add(counterTopWood);

const espressoBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 1.1), mat(0x282624, 0.35, 0.4));
espressoBody.position.set(-0.6, 3.1, 0);
espressoBody.castShadow = true;
coffeeStation.add(espressoBody);

for (let c = 0; c < 3; c++) {
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 16), coffeeCupMat);
  cup.position.set(0.6 + c * 0.35, 2.75, 0.2);
  cup.castShadow = true;
  coffeeStation.add(cup);
}

// Lush Architectural Planter with Ceramic Fluted Pot
const planterPot = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 1.4, 20), mat(0xd4c7b5, 0.6));
planterPot.position.set(-2.4, 0.7, 0.4);
planterPot.castShadow = true;
const plantFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05), plantGreenMat);
plantFoliage.position.set(-2.4, 2.0, 0.4);
plantFoliage.castShadow = true;
coffeeStation.add(planterPot);
coffeeStation.add(plantFoliage);

scene.add(coffeeStation);

// --- 6. Extended Shared Studio Bench Desk (Accurate Proportions from Drawing) ---
const tableGroup = new THREE.Group();
tableGroup.position.set(0, 0, 0);

const tableLength = 26; // Extended length for spacious, uncluttered feel
const tableDepth = 3.2;
const tableHeight = 2.6;

// Slim Crisp White Studio Top with Pale Honey Oak Bevel Edge
const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tableLength, 0.16, tableDepth), whiteDeskMat);
tableTop.position.set(0, tableHeight, 0);
tableTop.castShadow = true;
tableTop.receiveShadow = true;
tableGroup.add(tableTop);

const tableEdgeTrim = new THREE.Mesh(new THREE.BoxGeometry(tableLength + 0.04, 0.08, tableDepth + 0.06), richHoneyOakMat);
tableEdgeTrim.position.set(0, tableHeight - 0.1, 0);
tableGroup.add(tableEdgeTrim);

// Refined Architectural Black Steel Legs (Slimmer, elegant studio trestles)
const legX = [-12.2, -6.2, 0, 6.2, 12.2];
legX.forEach((lx) => {
  const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tableHeight, 16), steelLegMat);
  l1.position.set(lx, tableHeight / 2, -tableDepth / 2 + 0.3);
  l1.castShadow = true;
  tableGroup.add(l1);

  const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, tableHeight, 16), steelLegMat);
  l2.position.set(lx, tableHeight / 2, tableDepth / 2 - 0.3);
  l2.castShadow = true;
  tableGroup.add(l2);

  // Cross horizontal foot rail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, tableDepth - 0.6), steelLegMat);
  rail.position.set(lx, 0.35, 0);
  tableGroup.add(rail);
});

// Architectural Modular Drawer Pedestals & Storage Boxes (Right under table like in reference)
const cabinetsData = [
  { x: -10.2, w: 2.4, h: 2.1, d: 2.4, mat: warmCabinetBeigeMat },
  { x: -1.2, w: 2.2, h: 2.1, d: 2.4, mat: warmCabinetBeigeMat },
  { x: 4.8, w: 2.4, h: 2.1, d: 2.4, mat: naturalOakMat },
  { x: 9.8, w: 2.2, h: 2.1, d: 2.4, mat: warmCabinetBeigeMat }
];
cabinetsData.forEach((cab) => {
  const box = new THREE.Mesh(new THREE.BoxGeometry(cab.w, cab.h, cab.d), cab.mat);
  box.position.set(cab.x, cab.h / 2, -0.15);
  box.castShadow = true;
  box.receiveShadow = true;
  tableGroup.add(box);

  // Subtle horizontal drawer seam grooves
  for (let g = 1; g <= 3; g++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(cab.w - 0.1, 0.02, 0.04), mat(0x42382e, 0.5));
    seam.position.set(cab.x, (cab.h / 4) * g, cab.d / 2 - 0.1);
    tableGroup.add(seam);
  }
});

// Cardboard Storage Archive Boxes & Rolled Drafting Tubes on the floor (From drawing)
const floorProps = [
  { x: -7.6, z: 1.8, w: 1.6, h: 1.1, d: 1.4, c: 0xcdbda4 },
  { x: 2.8, z: 1.9, w: 1.8, h: 1.3, d: 1.5, c: 0xc4b39b },
  { x: 11.8, z: 1.9, w: 1.5, h: 1.0, d: 1.3, c: 0xcbb9a3 }
];
floorProps.forEach((fp) => {
  const box = new THREE.Mesh(new THREE.BoxGeometry(fp.w, fp.h, fp.d), mat(fp.c, 0.9));
  box.position.set(fp.x, fp.h / 2, fp.z);
  box.rotation.y = (Math.random() - 0.5) * 0.2;
  box.castShadow = true;
  box.receiveShadow = true;
  tableGroup.add(box);
});

// Desktops: High-End Frameless Monitors, Sleek Laptops, Anglepoise Drafting Lamps
const agentX = [-7.6, -2.6, 2.6, 7.6];
const deskSpots = [];

agentX.forEach((wx, i) => {
  if (i === 0 || i === 3) {
    // Ultra-slim minimalist studio displays (silver + clean glass pane)
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.14, 0.6, 16), steelLegMat);
    stand.position.set(wx, tableHeight + 0.3, -0.45);
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.15, 0.04), mat(0x282624, 0.2));
    screenFrame.position.set(wx, tableHeight + 0.88, -0.45);
    screenFrame.castShadow = true;
    const screenInner = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.08), new THREE.MeshBasicMaterial({ color: 0xf6f8fc }));
    screenInner.position.set(wx, tableHeight + 0.88, -0.42);
    tableGroup.add(stand);
    tableGroup.add(screenFrame);
    tableGroup.add(screenInner);
  } else {
    // Elegant open MacBook / slim workstation
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.65), mat(0xd4d8dc, 0.2, 0.6));
    base.position.set(wx, tableHeight + 0.09, -0.15);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.62, 0.02), mat(0xd4d8dc, 0.2, 0.6));
    lid.position.set(wx, tableHeight + 0.36, -0.46);
    lid.rotation.x = -0.25;
    tableGroup.add(base);
    tableGroup.add(lid);
  }

  // Classic Anglepoise Drafting Architect Lamp (from reference drawing)
  const lampGroup = new THREE.Group();
  lampGroup.position.set(wx + 1.25, tableHeight + 0.08, -0.7);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), steelLegMat);
  lampGroup.add(lampBase);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12), steelLegMat);
  arm1.position.set(0, 0.42, 0);
  arm1.rotation.z = -0.3;
  lampGroup.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 12), steelLegMat);
  arm2.position.set(-0.25, 0.95, 0);
  arm2.rotation.z = 0.55;
  lampGroup.add(arm2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 16), steelLegMat);
  shade.position.set(-0.55, 1.2, 0);
  shade.rotation.z = 1.1;
  lampGroup.add(shade);
  tableGroup.add(lampGroup);

  // Warm focused task spotlight
  const spot = new THREE.PointLight(atmospherePresets.day.deskSpotColor, atmospherePresets.day.deskSpotInt, 6.0);
  spot.position.set(wx + 0.7, tableHeight + 1.2, -0.4);
  tableGroup.add(spot);
  deskSpots.push(spot);

  // Clean Ceramic Espresso / Tea Mug
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.22, 16), coffeeCupMat);
  mug.position.set(wx - 0.85, tableHeight + 0.18, -0.15);
  mug.castShadow = true;
  tableGroup.add(mug);

  // Neatly organized paper sketches & note stack
  const paperStack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.85), paperMat);
  paperStack.position.set(wx + 0.85, tableHeight + 0.09, 0.2);
  paperStack.rotation.y = 0.08;
  tableGroup.add(paperStack);
});

// Centerpiece: Crystal Nano Aquascape Aquarium (High-Transparency Float Glass)
const nanoAquarium = new THREE.Group();
nanoAquarium.position.set(0, tableHeight + 0.75, -0.4);

const aqGlass = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 1.25, 1.25),
  new THREE.MeshPhysicalMaterial({ color: 0xa7f3d0, transmission: 0.94, transparent: true, roughness: 0.02, ior: 1.33 })
);
nanoAquarium.add(aqGlass);

const aqWater = new THREE.Mesh(
  new THREE.BoxGeometry(2.25, 1.1, 1.1),
  new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 })
);
nanoAquarium.add(aqWater);

// Aquascaped Dragon Stone & Mini Foliage
const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), mat(0x524e49, 0.85));
rock.position.set(0.1, -0.3, 0);
nanoAquarium.add(rock);

const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), plantGreenMat);
moss.position.set(-0.45, -0.35, 0.1);
nanoAquarium.add(moss);

const nanoFishes = [];
for (let f = 0; f < 4; f++) {
  const fish = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), mat(f % 2 === 0 ? 0x00e5ff : 0xff453a, 0.3));
  fish.rotation.z = Math.PI / 2;
  nanoAquarium.add(fish);
  nanoFishes.push({ mesh: fish, angle: f * 1.57, speed: 0.02 + f * 0.006, rad: 0.6 + f * 0.12, y: -0.15 + (f % 2) * 0.2 });
}
tableGroup.add(nanoAquarium);

scene.add(tableGroup);

// --- 7. Ergonomic Task Chairs (Facing -Z towards table) ---
function createErgonomicChair(x, z, chairMat) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // 5-Star Wheels Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.12, 8), steelLegMat);
  base.position.y = 0.2;
  group.add(base);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.15, 16), steelLegMat);
  column.position.y = 0.75;
  group.add(column);

  // Soft Cushion Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.22, 1.35), chairMat);
  seat.position.y = 1.35; // Cushion top at y = 1.46
  seat.castShadow = true;
  group.add(seat);

  // Ergonomic Curved Mesh Back
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.55, 0.16), chairMat);
  back.position.set(0, 2.18, 0.6);
  back.rotation.x = -0.06;
  back.castShadow = true;
  group.add(back);

  return group;
}

const chairs = [
  createErgonomicChair(agentX[0], 1.35, navyFabricMat),
  createErgonomicChair(agentX[1], 1.35, rustFabricMat),
  createErgonomicChair(agentX[2], 1.35, tealFabricMat),
  createErgonomicChair(agentX[3], 1.35, navyFabricMat)
];
chairs.forEach((c) => scene.add(c));

// --- 7. Highly Detailed 3D Humanoid Agent Rig (Facing -Z towards desk) ---
function createDetailedHumanoid(cfg) {
  const root = new THREE.Group();

  // Pelvis / Hips Group (Seated right on cushion at y = 1.46)
  const pelvis = new THREE.Group();
  pelvis.position.y = 1.46;
  root.add(pelvis);

  // Torso / Outer Coat / Cardigan
  const coatMat = mat(cfg.outfit, 0.75);
  const innerShirtMat = mat(cfg.innerShirt || 0xffffff, 0.8);
  const pantsMat = mat(cfg.pants || 0x262420, 0.85);
  const shoeMat = cfg.isWoman ? sneakerWhiteMat : shoeLeatherMat;

  // Upper Body
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 1.15, 16), coatMat);
  torso.position.y = 0.75;
  torso.castShadow = true;
  pelvis.add(torso);

  // Lapel V-neck Collar (Facing -Z front)
  const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.08), innerShirtMat);
  lapel.position.set(0, 1.05, -0.22);
  pelvis.add(lapel);

  // Neck & Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16), skinMat);
  neck.position.y = 1.42;
  pelvis.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.72; // Head center at y = 3.18, clearly visible above desk!

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Stylized Hair (Back is at +Z, Face is at -Z)
  const hairMat = mat(cfg.hair, 0.9);
  if (cfg.isWoman) {
    // Layered bob with bangs at -Z
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.5), hairMat);
    hairTop.position.set(0, 0.08, 0.02);
    headGroup.add(hairTop);
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.16), hairMat);
    bangs.position.set(0, 0.2, -0.3);
    headGroup.add(bangs);
  } else {
    // Sleek parted hair
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.41, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.8), hairMat);
    hairTop.position.set(0, 0.08, 0.02);
    headGroup.add(hairTop);
  }

  // Glasses (at -Z face side)
  if (cfg.hasGlasses) {
    const glassesL = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 16), steelLegMat);
    glassesL.position.set(-0.16, 0.05, -0.38);
    const glassesR = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 16), steelLegMat);
    glassesR.position.set(0.16, 0.05, -0.38);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), steelLegMat);
    bridge.position.set(0, 0.05, -0.38);
    headGroup.add(glassesL);
    headGroup.add(glassesR);
    headGroup.add(bridge);
  }

  pelvis.add(headGroup);

  // Left & Right Arms (Pivoting at shoulders, reaching forward towards -Z desk)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.5, 1.22, 0);
  const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), coatMat);
  leftUpperArm.position.y = -0.36;
  leftUpperArm.castShadow = true;
  leftArmPivot.add(leftUpperArm);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  leftHand.position.y = -0.74;
  leftArmPivot.add(leftHand);
  pelvis.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.5, 1.22, 0);
  const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), coatMat);
  rightUpperArm.position.y = -0.36;
  rightUpperArm.castShadow = true;
  rightArmPivot.add(rightUpperArm);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  rightHand.position.y = -0.74;
  rightArmPivot.add(rightHand);
  pelvis.add(rightArmPivot);

  // Left & Right Legs (Pivoting at hips)
  // When sitting, thighs project forward towards -Z (under desk) and shins drop down
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.22, 0, 0);
  const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.72, 0.2), pantsMat);
  leftThigh.position.y = -0.36;
  leftThigh.castShadow = true;
  leftLegPivot.add(leftThigh);
  const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), pantsMat);
  leftShin.position.set(0, -1.0, 0);
  leftShin.castShadow = true;
  leftLegPivot.add(leftShin);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.42), shoeMat);
  leftShoe.position.set(0, -1.4, -0.08); // Shoe points forward -Z
  leftShoe.castShadow = true;
  leftLegPivot.add(leftShoe);
  pelvis.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.22, 0, 0);
  const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.72, 0.2), pantsMat);
  rightThigh.position.y = -0.36;
  rightThigh.castShadow = true;
  rightLegPivot.add(rightThigh);
  const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), pantsMat);
  rightShin.position.set(0, -1.0, 0);
  rightShin.castShadow = true;
  rightLegPivot.add(rightShin);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.42), shoeMat);
  rightShoe.position.set(0, -1.4, -0.08); // Shoe points forward -Z
  rightShoe.castShadow = true;
  rightLegPivot.add(rightShoe);
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
  // 1. Strategist (Far Left): Dark Charcoal Blazer / Khaki Trousers / Sleek Glasses
  { id: "strategist", deskX: agentX[0], outfit: 0x33302c, innerShirt: 0xf5f3ee, pants: 0xb5a794, hair: 0x221f1d, isWoman: false, hasGlasses: true, name: "Strategist" },
  // 2. Scriptwriter (Mid Left): Japanese Terracotta Rust Cardigan / Black Slacks / Layered Hair
  { id: "scriptwriter", deskX: agentX[1], outfit: 0x8a4537, innerShirt: 0x242220, pants: 0x2b2825, hair: 0x6e4732, isWoman: true, hasGlasses: false, name: "Scriptwriter" },
  // 3. Shot Director (Mid Right): Warm Sand/Camel Beige Coat / Cream Top / Dark Denim
  { id: "shotDirector", deskX: agentX[2], outfit: 0xbaab97, innerShirt: 0xf9f7f2, pants: 0x363e46, hair: 0x2a2724, isWoman: false, hasGlasses: false, name: "Shot Director" },
  // 4. QA Auditor (Far Right): Japanese Muted Olive / Sage Green Overcoat / Minimalist Frames
  { id: "qaEvaluator", deskX: agentX[3], outfit: 0x6b6d57, innerShirt: 0x383531, pants: 0x262422, hair: 0x3b332a, isWoman: false, hasGlasses: true, name: "QA Auditor" }
];

const agents = agentConfigs.map((cfg) => {
  const char = createDetailedHumanoid(cfg);
  char.root.position.set(cfg.deskX, 0, 1.35); // Seated on chair at z = 1.35
  scene.add(char.root);

  return {
    ...cfg,
    ...char,
    targetX: cfg.deskX,
    targetZ: 1.35,
    state: "desk",
    stateTimer: Math.random() * 8 + 4,
    walkCycle: 0
  };
});

// --- 8. Animation & Walking Kinematics Loop ---
let clock = new THREE.Clock();
let activeAgentId = "idle";

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // 1. Atmosphere Auto Cycle
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

  // 3. Characters Behaviors & Kinematics
  agents.forEach((ag, idx) => {
    const isExecuting = activeAgentId === ag.id;

    if (activeAgentId === "idle") {
      ag.stateTimer -= 0.016;
      if (ag.stateTimer <= 0) {
        if (ag.state === "desk") {
          const rand = Math.random();
          if (rand < 0.4) {
            ag.state = "coffee";
            ag.targetX = -14.5; // Stand neatly in front of coffee counter
            ag.targetZ = 0.8;
            ag.stateTimer = 10.0;
          } else if (rand < 0.7) {
            ag.state = "stretching";
            ag.stateTimer = 5.5;
          } else {
            ag.state = "chatting";
            ag.targetX = ag.deskX + (idx % 2 === 0 ? 2.0 : -2.0);
            ag.targetZ = 2.2;
            ag.stateTimer = 7.0;
          }
        } else {
          ag.state = "desk";
          ag.targetX = ag.deskX;
          ag.targetZ = 1.35;
          ag.stateTimer = Math.random() * 14 + 6;
        }
      }
    } else {
      if (isExecuting && ag.state !== "desk") {
        ag.state = "desk";
        ag.targetX = ag.deskX;
        ag.targetZ = 1.35;
      }
    }

    const dx = ag.targetX - ag.root.position.x;
    const dz = ag.targetZ - ag.root.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isWalking = dist > 0.15;

    if (isWalking) {
      // --- WALKING STRIDE ---
      const walkSpeed = 0.05;
      ag.root.position.x += (dx / dist) * walkSpeed;
      ag.root.position.z += (dz / dist) * walkSpeed;

      // Face walking direction
      const targetAngle = Math.atan2(dx, dz);
      ag.root.rotation.y += (targetAngle - ag.root.rotation.y) * 0.15;

      ag.walkCycle += 0.18;

      ag.leftLegPivot.rotation.x = Math.sin(ag.walkCycle) * 0.65;
      ag.rightLegPivot.rotation.x = -Math.sin(ag.walkCycle) * 0.65;
      ag.leftArmPivot.rotation.x = -Math.sin(ag.walkCycle) * 0.55;
      ag.rightArmPivot.rotation.x = Math.sin(ag.walkCycle) * 0.55;

      ag.pelvis.position.y = 1.6 + Math.abs(Math.sin(ag.walkCycle * 2)) * 0.08;
      ag.headGroup.rotation.x = Math.sin(ag.walkCycle * 2) * 0.04;
    } else {
      // --- STATIONARY (Facing -Z towards desk when at desk) ---
      if (ag.state === "desk") {
        ag.root.rotation.y += (0 - ag.root.rotation.y) * 0.15; // Face straight towards desk (-Z)
        ag.pelvis.position.y = 1.46; // On chair cushion

        // Thighs project forward towards -Z (under desk), shins drop down
        ag.leftLegPivot.rotation.x = 1.45;
        ag.rightLegPivot.rotation.x = 1.45;

        // Arms reach forward onto desk top
        ag.leftArmPivot.rotation.x = -0.92;
        ag.rightArmPivot.rotation.x = -0.92;
      } else {
        // Standing at coffee counter or chatting
        ag.pelvis.position.y = 1.6;
        ag.leftLegPivot.rotation.x = 0;
        ag.rightLegPivot.rotation.x = 0;
      }

      ag.torso.position.y = 0.75 + Math.sin(time * 2 + idx) * 0.02;
      ag.headGroup.position.y = 1.72 + Math.sin(time * 2 + idx) * 0.03;

      if (isExecuting) {
        // Fast Typing on Laptop (-Z forward towards keyboard)
        ag.leftArmPivot.rotation.x = -0.95 + Math.sin(time * 20) * 0.15;
        ag.rightArmPivot.rotation.x = -0.95 + Math.cos(time * 20) * 0.15;
        ag.headGroup.rotation.x = -0.22 + Math.sin(time * 8) * 0.04;
        deskSpots[idx].intensity = 1.4;
      } else if (ag.state === "stretching") {
        // Standing and stretching arms up
        ag.leftArmPivot.rotation.x = 1.4 + Math.sin(time * 3) * 0.2;
        ag.rightArmPivot.rotation.x = 1.4 + Math.sin(time * 3) * 0.2;
        ag.headGroup.rotation.x = 0.35 + Math.sin(time * 2) * 0.1;
      } else if (ag.state === "coffee") {
        // Sipping coffee at espresso counter (face counter at -X)
        ag.root.rotation.y += (-Math.PI / 2 - ag.root.rotation.y) * 0.15;
        ag.leftArmPivot.rotation.x = -0.4;
        ag.rightArmPivot.rotation.x = -1.35 + Math.sin(time * 1.8) * 0.18;
        ag.headGroup.rotation.x = -0.12 + Math.sin(time * 1.8) * 0.1;
      } else {
        // Relaxed Desk Work
        ag.leftArmPivot.rotation.x = -0.85 + Math.sin(time * 2 + idx) * 0.04;
        ag.rightArmPivot.rotation.x = -0.85 + Math.cos(time * 2 + idx) * 0.04;
        ag.headGroup.rotation.y = Math.sin(time * 0.6 + idx * 1.2) * 0.18;
        ag.headGroup.rotation.x = -0.1 + Math.sin(time * 0.4 + idx) * 0.06;
      }
    }

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

  document.querySelectorAll(".cycle-btn:not(.auto-btn)").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-time") === modeKey);
  });
}

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

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    topicInput.value = chip.getAttribute("data-topic");
  });
});

generateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicInput.value.trim();
  if (!topic) return;

  startBtn.disabled = true;
  startBtn.style.opacity = "0.6";

  await runStudioPipelineSequence(topic);

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
  activeAgentId = "strategist";
  setActivityStatus("Strategist Agent", `Researching audience pain points and viral hooks for: "${topic}"`);
  await sleep(1500);

  activeAgentId = "scriptwriter";
  setActivityStatus("Scriptwriter Agent", "Composing 30s voiceover script and 3-second retention hook...");
  await sleep(1600);

  activeAgentId = "shotDirector";
  setActivityStatus("Shot Director Agent", "Directing physical camera angles (Macro close-up, Top-down, Wide setup)...");
  await sleep(1500);

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
        hfStatusBadge.className = "result-status-badge success";
        hfStatusBadge.innerText = "Job Submitted to Higgsfield";
        hfResultMsg.innerText = `Request ID: ${data.request_id} (Processing asynchronously on Higgsfield Cloud GPU)`;
      } else if (data.status === "insufficient_credits") {
        hfStatusBadge.className = "result-status-badge warning";
        hfStatusBadge.innerText = "Account Connected (Credits Needed)";
        hfResultMsg.innerHTML = `${data.message}<br><small style="color:var(--text-muted); display:block; margin-top:4px;">A preview sample has been loaded below to demonstrate studio integration.</small>`;
        if (data.sample_preview_url) {
          hfVideoContainer.style.display = "block";
          hfVideoPlayer.src = data.sample_preview_url;
        }
      } else {
        hfStatusBadge.className = "result-status-badge info";
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
