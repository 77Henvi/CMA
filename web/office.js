/**
 * Virtual Studio – 3D office scene (Three.js r130, global build)
 *
 * Clay-style "chibi" agents in a soft pastel diorama.
 *  - correct sitting pose (separate hip + knee joints)
 *  - 2-bone IK so hands always land on the keyboard
 *  - frame-rate independent movement (delta time)
 *  - gentle lighting, no fog wash-out
 *
 * Public API:  window.Office.setActive(id|null) / setAtmosphere(key) / setAuto(bool)
 * Agent ids:   strategist | scriptwriter | shotDirector | qaEvaluator
 */
(() => {
  "use strict";

  const container = document.getElementById("threeContainer");
  if (!container || !window.THREE) {
    console.error("[Office] container or THREE missing");
    return;
  }

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (dt, k) => 1 - Math.exp(-k * dt);
  const angDiff = (a, b) => {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  };
  let _seed = 11;
  const srand = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647; // deterministic decor

  // ---------- renderer / scene / camera ----------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  camera.position.set(15, 12.5, 25);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.target.set(0, 2.2, 0.5);
  controls.minDistance = 12;
  controls.maxDistance = 42;
  controls.maxPolarAngle = 1.42;
  controls.minPolarAngle = 0.55;
  controls.minAzimuthAngle = -0.35;
  controls.maxAzimuthAngle = 1.25;

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(container);
  window.addEventListener("resize", resize);
  resize();

  // ---------- atmosphere (soft, balanced studio lighting - not overexposed) ----------
  const PRESETS = {
    day:    { bg: 0xe6e0d5, amb: 0xf5ede1, ambI: 0.42, hemiI: 0.35, sun: 0xfff0dc, sunI: 0.65, sunPos: [14, 22, 14],  fill: 0xc8d7eb, fillI: 0.20, lamp: 0.0 },
    sunset: { bg: 0xdcb896, amb: 0xf8cb9c, ambI: 0.40, hemiI: 0.28, sun: 0xf48842, sunI: 0.70, sunPos: [24, 9, 10],   fill: 0xe897b6, fillI: 0.24, lamp: 0.30 },
    night:  { bg: 0x161d28, amb: 0x303e58, ambI: 0.38, hemiI: 0.20, sun: 0x8ba6e8, sunI: 0.25, sunPos: [-12, 20, 8],  fill: 0x1b273d, fillI: 0.16, lamp: 0.85 }
  };
  const cur = {
    bg: new THREE.Color(PRESETS.day.bg), amb: new THREE.Color(PRESETS.day.amb), sun: new THREE.Color(PRESETS.day.sun),
    fill: new THREE.Color(PRESETS.day.fill), ambI: PRESETS.day.ambI, hemiI: PRESETS.day.hemiI, sunI: PRESETS.day.sunI,
    fillI: PRESETS.day.fillI, lamp: PRESETS.day.lamp, sunPos: new THREE.Vector3(...PRESETS.day.sunPos)
  };
  let atmoKey = "day";
  let autoCycle = false;
  let autoTimer = 0;

  scene.background = cur.bg;
  scene.fog = new THREE.Fog(cur.bg.clone(), 65, 175);

  const ambient = new THREE.AmbientLight(cur.amb, cur.ambI);
  const hemi = new THREE.HemisphereLight(0xfff7ed, 0xbab0a0, cur.hemiI);
  const sun = new THREE.DirectionalLight(cur.sun, cur.sunI);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { near: 1, far: 80, left: -28, right: 28, top: 22, bottom: -12 });
  sun.shadow.bias = -0.0004;
  const fill = new THREE.DirectionalLight(cur.fill, cur.fillI);
  fill.position.set(-16, 10, 12);
  scene.add(ambient, hemi, sun, fill);

  function stepAtmosphere(dt) {
    const t = PRESETS[atmoKey];
    const k = damp(dt, 2.5);
    cur.bg.lerp(new THREE.Color(t.bg), k);
    cur.amb.lerp(new THREE.Color(t.amb), k);
    cur.sun.lerp(new THREE.Color(t.sun), k);
    cur.fill.lerp(new THREE.Color(t.fill), k);
    cur.ambI = lerp(cur.ambI, t.ambI, k);
    cur.hemiI = lerp(cur.hemiI, t.hemiI, k);
    cur.sunI = lerp(cur.sunI, t.sunI, k);
    cur.fillI = lerp(cur.fillI, t.fillI, k);
    cur.lamp = lerp(cur.lamp, t.lamp, k);
    cur.sunPos.lerp(new THREE.Vector3(...t.sunPos), k);
    ambient.color.copy(cur.amb); ambient.intensity = cur.ambI;
    hemi.intensity = cur.hemiI;
    sun.color.copy(cur.sun); sun.intensity = cur.sunI; sun.position.copy(cur.sunPos);
    fill.color.copy(cur.fill); fill.intensity = cur.fillI;
    scene.fog.color.copy(cur.bg);
  }

  // ---------- materials ----------
  const M = (color, rough = 0.85, metal = 0.0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const mWall = M(0xe8e2d7, 0.95), mFloor = M(0xded5c6, 0.9), mRug = M(0xd5cab8, 1.0);
  const mOak = M(0xc4a682, 0.8), mOakDark = M(0x9a7d5c, 0.8), mDesk = M(0xf3eee6, 0.6);
  const mSteel = M(0x32302d, 0.4, 0.3), mCream = M(0xeee7db, 0.7), mBeige = M(0xd9ccba, 0.85);
  const mPlant = M(0x5e8b63, 0.8), mPot = M(0xdfd1be, 0.7), mDark = M(0x302e33, 0.5);
  const mGlass = new THREE.MeshStandardMaterial({ color: 0xbde6dc, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.0, depthWrite: false });
  const mWater = new THREE.MeshStandardMaterial({ color: 0x6bc4d8, transparent: true, opacity: 0.28, roughness: 0.2, depthWrite: false });

  function box(w, h, d, mat, x = 0, y = 0, z = 0, shadow = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 20) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function ball(r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true;
    return m;
  }

  // ---------- canvas textures ----------
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }
  const tileTex = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#e8e2d7"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(175,160,140,0.55)"; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  const mTile = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.95 });

  const noteTex = canvasTex(256, 192, (g, w, h) => {
    g.fillStyle = "#e9dfd0"; g.fillRect(0, 0, w, h);
    const cols = ["#ffd9c7", "#cfe3f5", "#e1f0d2", "#fff1b8", "#f6cfe0"];
    for (let i = 0; i < 9; i++) {
      g.fillStyle = cols[i % cols.length];
      const x = 14 + (i % 3) * 80 + srand() * 8, y = 12 + Math.floor(i / 3) * 58 + srand() * 6;
      g.save(); g.translate(x + 30, y + 22); g.rotate((srand() - 0.5) * 0.15);
      g.fillRect(-30, -22, 60, 44);
      g.fillStyle = "rgba(60,50,40,0.35)";
      g.fillRect(-22, -10, 44, 4); g.fillRect(-22, 0, 30, 4);
      g.restore();
    }
  });
  const mNotes = new THREE.MeshStandardMaterial({ map: noteTex, roughness: 0.95 });

  // ---------- environment ----------
  const world = new THREE.Group();
  scene.add(world);
  // Everything the agents interact with lives in `rig`, turned 180° so faces point at the camera.
  // Inside rig: agents face -Z and chairs sit at +Z, so the movement logic stays simple.
  const rig = new THREE.Group();
  rig.rotation.y = Math.PI;
  world.add(rig);

  // floor plinth (diorama look)
  const plinth = box(46, 0.8, 26, mFloor, 0, -0.4, 3.5);
  world.add(plinth);
  const rug = box(30, 0.04, 9, mRug, 0, 0.02, 2.2, false);
  world.add(rug);

  // back wall + left wall (tiled)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(46, 14), mTile.clone());
  backWall.material.map = tileTex.clone(); backWall.material.map.needsUpdate = true;
  backWall.material.map.wrapS = backWall.material.map.wrapT = THREE.RepeatWrapping;
  backWall.material.map.repeat.set(46 / 8, 14 / 4);
  backWall.position.set(0, 7, -4.6); backWall.receiveShadow = true;
  world.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), mTile.clone());
  leftWall.material.map = tileTex.clone(); leftWall.material.map.needsUpdate = true;
  leftWall.material.map.wrapS = leftWall.material.map.wrapT = THREE.RepeatWrapping;
  leftWall.material.map.repeat.set(26 / 8, 14 / 4);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-23, 7, 3.5); leftWall.receiveShadow = true;
  world.add(leftWall);

  function slatPanel(x, z, w, h, rotY = 0) {
    const g = new THREE.Group();
    g.add(box(w, h, 0.12, mBeige, 0, 0, 0));
    const n = Math.floor(w / 0.42);
    for (let i = 0; i < n; i++) g.add(box(0.14, h, 0.16, mOak, -w / 2 + 0.3 + i * 0.42, 0, 0.1));
    g.position.set(x, h / 2 + 0.4, z); g.rotation.y = rotY;
    return g;
  }
  world.add(slatPanel(-17, -4.5, 5.4, 9));
  world.add(slatPanel(17, -4.5, 5.4, 9));
  world.add(slatPanel(-22.9, 1.5, 6, 9, Math.PI / 2));

  // pinboards + framed art on the back wall
  [[-8.2, 6.4, 4.4, 3.2], [6.8, 6.2, 5.2, 3.6]].forEach(([x, y, w, h]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), [mOakDark, mOakDark, mOakDark, mOakDark, mNotes, mOakDark]);
    b.position.set(x, y, -4.5); b.castShadow = true;
    world.add(b);
  });
  const artFrame = box(2.4, 3.2, 0.12, mDark, 12.8, 6.4, -4.5);
  world.add(artFrame, box(2.0, 2.8, 0.14, mBeige, 12.8, 6.4, -4.48, false));

  // shelf with books
  world.add(box(7, 0.14, 0.9, mOak, -1.2, 8.2, -4.15));
  const bookCols = [0xe79a86, 0x9db8d6, 0xf0c98f, 0xb7a58e, 0xd96f64, 0x8aa8a0];
  for (let i = 0; i < 9; i++) {
    const h = 0.9 + (i % 3) * 0.18;
    world.add(box(0.2, h, 0.62, M(bookCols[i % bookCols.length], 0.8), -3.8 + i * 0.26, 8.27 + h / 2, -4.15));
  }
  world.add(cyl(0.28, 0.36, 0.9, M(0xf1e6d6, 0.5), 0.8, 8.7, -4.15));

  // coffee counter
  const coffee = new THREE.Group();
  coffee.position.set(15, 0, -1.6);
  coffee.add(box(3.4, 1.7, 1.6, mBeige, 0, 0.85, 0), box(3.6, 0.12, 1.8, mOak, 0, 1.75, 0));
  coffee.add(box(1.1, 0.9, 0.9, mDark, -0.7, 2.27, 0));
  for (let i = 0; i < 3; i++) coffee.add(cyl(0.12, 0.09, 0.22, mCream, 0.5 + i * 0.35, 1.92, 0.35, 16));
  rig.add(coffee);

  function plant(x, z, s = 1) {
    const g = new THREE.Group();
    g.add(cyl(0.5 * s, 0.38 * s, 0.9 * s, mPot, 0, 0.45 * s, 0));
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 * s, 1), mPlant);
    f.position.y = 1.45 * s; f.castShadow = true; g.add(f);
    g.position.set(x, 0, z);
    return g;
  }
  world.add(plant(-19.5, -2.6, 1.2), plant(20, -2.8, 1.1), plant(-18.5, 6.5, 0.9));
  world.add(box(2.4, 1.6, 2.0, mDark, -19.5, 0.8, 3.2)); // printer / speaker cube

  // ---------- long desk ----------
  const DESK_TOP = 1.15, DESK_D = 1.6, DESK_L = 25;
  const desk = new THREE.Group();
  desk.add(box(DESK_L, 0.1, DESK_D, mDesk, 0, DESK_TOP, 0));
  desk.add(box(DESK_L + 0.04, 0.05, DESK_D + 0.04, mOak, 0, DESK_TOP - 0.08, 0));
  [-12, -6, 0, 6, 12].forEach((x) => {
    [-0.65, 0.65].forEach((z) => desk.add(box(0.07, DESK_TOP, 0.07, mSteel, x, DESK_TOP / 2, z)));
    desk.add(box(0.06, 0.06, 1.3, mSteel, x, 0.25, 0));
  });
  [-10.5, 5.5].forEach((x) => {
    desk.add(box(1.8, 1.0, 1.3, mBeige, x, 0.5, -0.1));
    for (let g = 1; g <= 2; g++) desk.add(box(1.5, 0.03, 0.04, M(0x8a7a66, 0.6), x, g * 0.33, 0.56));
  });
  rig.add(desk);

  // aquarium centrepiece
  const aquarium = new THREE.Group();
  aquarium.position.set(0, DESK_TOP + 0.05 + 0.55, -0.1);
  aquarium.add(box(2.2, 0.08, 1.1, mOak, 0, -0.55, 0, false));
  aquarium.add(new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.05, 1.0), mGlass));
  const water = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 0.9), mWater);
  water.position.y = -0.05; aquarium.add(water);
  aquarium.add(ball(0.28, M(0x6a655f, 0.9), 0.3, -0.38, 0, 1.3, 0.9, 1));
  aquarium.add(ball(0.2, mPlant, -0.5, -0.4, 0.1));
  const fishes = [];
  const fishCols = [0x39d0ff, 0xff6b5e, 0xffc24a, 0x39d0ff, 0xff6b5e];
  for (let i = 0; i < 5; i++) {
    const f = new THREE.Group();
    f.add(ball(0.07, M(fishCols[i], 0.4), 0, 0, 0, 1.6, 1, 0.7));
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4), M(fishCols[i], 0.4));
    tail.rotation.z = Math.PI / 2; tail.position.x = -0.15; f.add(tail);
    aquarium.add(f);
    fishes.push({ g: f, a: i * 1.3, sp: 0.5 + i * 0.12, rx: 0.55 + (i % 3) * 0.12, rz: 0.22, y: -0.2 + (i % 3) * 0.17 });
  }
  rig.add(aquarium);

  // ---------- agents config ----------
  const AGENTS = [
    { id: "strategist",   label: "Strategist",    deskX: 8.4, accent: 0x8fa9c9, outfit: 0xd9dfe9, pants: 0x7a8696, hair: 0x4a382c, style: "short", glasses: true,  ui: "bars"  },
    { id: "scriptwriter", label: "Scriptwriter",  deskX: 2.8, accent: 0xe9877a, outfit: 0xf3b6a8, pants: 0x5a4a48, hair: 0x7a4c33, style: "bun",   glasses: false, ui: "lines" },
    { id: "shotDirector", label: "Shot Director", deskX: -2.8, accent: 0x8cc9b6, outfit: 0xdcebe4, pants: 0x5b6670, hair: 0x2d2824, style: "short", glasses: false, ui: "grid"  },
    { id: "qaEvaluator",  label: "QA Auditor",    deskX: -8.4, accent: 0xa7b88a, outfit: 0xdde3cb, pants: 0x4a4a42, hair: 0x5b4636, style: "bob",   glasses: true,  ui: "check" }
  ];
  const SKIN = 0xf6d9c4, SHOE = 0x3b3835;
  const CHAIR_Z = 1.45, AISLE = 3.2;

  // ---------- workstations ----------
  function screenTexture(kind, accent) {
    const col = "#" + new THREE.Color(accent).getHexString();
    return canvasTex(256, 160, (g, w, h) => {
      g.fillStyle = "#fbfaf7"; g.fillRect(0, 0, w, h);
      g.fillStyle = col; g.fillRect(0, 0, w, 18);
      g.fillStyle = "rgba(60,55,50,0.25)";
      if (kind === "bars") { [60, 95, 40, 110, 75].forEach((v, i) => { g.fillStyle = i % 2 ? col : "rgba(60,55,50,0.35)"; g.fillRect(24 + i * 44, h - 14 - v, 28, v); }); }
      else if (kind === "lines") { for (let i = 0; i < 8; i++) g.fillRect(20, 34 + i * 15, 150 + ((i * 37) % 70), 6); }
      else if (kind === "grid") { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? col : "rgba(60,55,50,0.3)"; g.fillRect(20 + (i % 3) * 76, 32 + Math.floor(i / 3) * 62, 66, 52); } }
      else { for (let i = 0; i < 5; i++) { g.fillStyle = col; g.fillRect(22, 36 + i * 24, 14, 14); g.fillStyle = "rgba(60,55,50,0.3)"; g.fillRect(46, 40 + i * 24, 120 + ((i * 29) % 60), 6); } }
    });
  }

  function chair(x, accent) {
    const g = new THREE.Group();
    const fabric = M(accent, 0.85);
    g.add(cyl(0.5, 0.5, 0.08, mSteel, 0, 0.1, 0, 10));
    g.add(cyl(0.07, 0.07, 0.42, mSteel, 0, 0.32, 0, 10));
    g.add(box(1.05, 0.2, 1.05, fabric, 0, 0.55, 0));
    const back = box(1.0, 1.0, 0.16, fabric, 0, 1.2, 0.5);
    back.rotation.x = 0.08; g.add(back);
    g.position.set(x, 0, CHAIR_Z);
    return g;
  }

  const stations = AGENTS.map((cfg) => {
    const x = cfg.deskX;
    const g = new THREE.Group();
    // monitor
    const tex = screenTexture(cfg.ui, cfg.accent);
    const screenMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xdddddd });
    const frameM = box(1.7, 1.05, 0.06, mDark, x, DESK_TOP + 1.15, -0.35);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.95), screenMat);
    screen.position.set(x, DESK_TOP + 1.15, -0.315);
    g.add(frameM, screen, cyl(0.04, 0.12, 0.5, mSteel, x, DESK_TOP + 0.3, -0.35, 12));
    // keyboard / mouse / mug / small plant
    g.add(box(0.95, 0.04, 0.32, mCream, x, DESK_TOP + 0.07, 0.42));
    g.add(box(0.14, 0.04, 0.2, mCream, x + 0.85, DESK_TOP + 0.07, 0.42));
    g.add(cyl(0.1, 0.08, 0.2, M(cfg.accent, 0.5), x - 1.2, DESK_TOP + 0.15, 0.1, 16));
    const sp = plant(x + 1.5, -0.2, 0.28); sp.position.y = DESK_TOP + 0.05; g.add(sp);
    // task light
    const lamp = new THREE.PointLight(0xffd9a8, 0, 9);
    lamp.position.set(x, DESK_TOP + 2.0, 0.2);
    g.add(lamp);
    rig.add(g);
    const ch = chair(x, cfg.accent);
    rig.add(ch);
    return { screenMat, lamp, chair: ch };
  });

  // ---------- character rig ----------
  const ARM1 = 0.55, ARM2 = 0.6; // upper arm, forearm+hand
  function limb(len, r, mat, endMat) {
    const g = new THREE.Group();
    const m = cyl(r, r * 0.92, len, mat, 0, -len / 2, 0, 14);
    g.add(m);
    if (endMat) g.add(ball(r * 1.15, endMat, 0, -len, 0));
    return g;
  }

  function buildCharacter(cfg) {
    const root = new THREE.Group();
    const skin = M(SKIN, 0.6), outfit = M(cfg.outfit, 0.85), pants = M(cfg.pants, 0.85);
    const hairM = M(cfg.hair, 0.8), shoe = M(SHOE, 0.6), dark = M(0x2b2522, 0.4);

    const hip = new THREE.Group(); root.add(hip);
    hip.add(ball(0.34, pants, 0, 0, 0, 1.15, 0.7, 0.95));

    // torso
    const torso = new THREE.Group(); hip.add(torso);
    torso.add(cyl(0.32, 0.4, 0.78, outfit, 0, 0.42, 0, 20));
    torso.add(ball(0.33, outfit, 0, 0.8, 0, 1.0, 0.55, 0.9));
    const collar = box(0.26, 0.14, 0.06, M(0xffffff, 0.6), 0, 0.82, -0.3, false);
    torso.add(collar);

    // head
    const head = new THREE.Group(); head.position.set(0, 1.45, 0); hip.add(head);
    head.add(ball(0.46, skin, 0, 0, 0, 1.0, 0.95, 1.0));
    // hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, cfg.style === "bob" ? 2.3 : 1.85), hairM);
    hair.position.set(0, 0.06, 0.05); hair.castShadow = true; head.add(hair);
    head.add(ball(0.5, hairM, 0, 0.22, -0.17, 0.95, 0.3, 0.55)); // fringe
    if (cfg.style === "bun") head.add(ball(0.2, hairM, 0, 0.58, 0.12));
    // face
    const eyeM = dark;
    const eyeL = ball(0.045, eyeM, -0.15, 0.0, -0.435, 1, 1.25, 0.6);
    const eyeR = ball(0.045, eyeM, 0.15, 0.0, -0.435, 1, 1.25, 0.6);
    head.add(eyeL, eyeR);
    const blushM = new THREE.MeshBasicMaterial({ color: 0xf2a39a, transparent: true, opacity: 0.55 });
    [-0.27, 0.27].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.06, 14), blushM); b.position.set(x, -0.1, -0.41); b.rotation.y = x < 0 ? 0.5 : -0.5; head.add(b); });
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 6, 14, Math.PI), new THREE.MeshBasicMaterial({ color: 0x6b3b36 }));
    mouth.rotation.z = Math.PI; mouth.position.set(0, -0.1, -0.445); head.add(mouth);
    if (cfg.glasses) {
      const gm = new THREE.MeshStandardMaterial({ color: 0x2f2b28, roughness: 0.4 });
      [-0.15, 0.15].forEach((x) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 20), gm); r.position.set(x, 0.0, -0.455); head.add(r); });
      head.add(box(0.1, 0.014, 0.014, mDark, 0, 0.02, -0.455, false));
    }

    // arms
    const mkArm = (side) => {
      const sh = new THREE.Group(); sh.position.set(side * 0.43, 0.7, 0);
      sh.add(cyl(0.09, 0.085, ARM1, outfit, 0, -ARM1 / 2, 0, 12));
      const el = new THREE.Group(); el.position.y = -ARM1; sh.add(el);
      el.add(ball(0.085, outfit, 0, 0, 0));
      el.add(cyl(0.08, 0.075, ARM2 - 0.1, outfit, 0, -(ARM2 - 0.1) / 2, 0, 12));
      el.add(ball(0.1, skin, 0, -(ARM2 - 0.02), 0));
      hip.add(sh);
      return { sh, el, side };
    };
    const armL = mkArm(-1), armR = mkArm(1);

    // legs
    const mkLeg = (side) => {
      const hp = new THREE.Group(); hp.position.set(side * 0.2, 0, 0);
      hp.add(cyl(0.13, 0.12, 0.5, pants, 0, -0.25, 0, 12));
      const kn = new THREE.Group(); kn.position.y = -0.5; hp.add(kn);
      kn.add(ball(0.12, pants, 0, 0, 0));
      kn.add(cyl(0.12, 0.1, 0.5, pants, 0, -0.25, 0, 12));
      kn.add(box(0.26, 0.13, 0.44, shoe, 0, -0.56, -0.07));
      hip.add(hp);
      return { hp, kn, side };
    };
    const legL = mkLeg(-1), legR = mkLeg(1);

    // labels
    const label = makeLabel(cfg.label, cfg.accent);
    label.position.set(0, 2.9, 0); hip.add(label);
    const bubble = makeBubble();
    bubble.position.set(0.9, 3.2, 0); bubble.visible = false; hip.add(bubble);

    return { root, hip, torso, head, eyeL, eyeR, armL, armR, legL, legR, label, bubble };
  }

  function makeLabel(text, accent) {
    const col = "#" + new THREE.Color(accent).getHexString();
    const tex = canvasTex(320, 80, (g, w, h) => {
      g.fillStyle = "rgba(255,255,255,0.92)";
      g.beginPath(); g.roundRect ? g.roundRect(4, 8, w - 8, h - 16, 28) : g.rect(4, 8, w - 8, h - 16); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(36, h / 2, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#4a423a"; g.font = "600 30px 'Segoe UI', system-ui, sans-serif"; g.textBaseline = "middle";
      g.fillText(text, 60, h / 2 + 1);
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set(2.6, 0.65, 1);
    return s;
  }

  const bubbleCache = {};
  function bubbleTexture(txt) {
    if (bubbleCache[txt]) return bubbleCache[txt];
    return (bubbleCache[txt] = canvasTex(128, 96, (g, w, h) => {
      g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.arc(w / 2, 40, 36, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(w / 2 - 12, 70); g.lineTo(w / 2 - 22, 92); g.lineTo(w / 2 + 6, 74); g.fill();
      g.font = "40px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(txt, w / 2, 42);
    }));
  }
  function makeBubble() {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTexture("⌨️"), transparent: true, depthWrite: false }));
    s.scale.set(1.0, 0.75, 1);
    return s;
  }

  // ---------- agent instances ----------
  const agents = AGENTS.map((cfg, i) => {
    const built = buildCharacter(cfg);
    built.root.position.set(cfg.deskX, 0, CHAIR_Z - 0.05);
    rig.add(built.root);
    return {
      ...built, cfg, idx: i, deskX: cfg.deskX,
      sit: 1, psi: 0, phase: Math.random() * 6, path: [], face: null,
      activity: "desk", timer: 3 + Math.random() * 6, blinkT: 2 + Math.random() * 3, bubbleKey: ""
    };
  });
  const seatPos = (a) => ({ x: a.deskX, z: CHAIR_Z - 0.05 });

  let activeId = null;

  // ---------- routing ----------
  function routeTo(a, dest) {
    const cur = a.root.position, p = [];
    const sp = seatPos(a);
    const nearDesk = Math.abs(cur.x - a.deskX) < 0.3 && Math.abs(cur.z - sp.z) < 0.3;
    let side = cur.x;
    if (nearDesk) { side = a.deskX + 1.0; p.push({ x: side, z: sp.z }); }
    if (cur.z < AISLE - 0.3) p.push({ x: side, z: AISLE });
    if (dest.desk) {
      p.push({ x: a.deskX + 1.0, z: AISLE }, { x: a.deskX + 1.0, z: sp.z }, { x: sp.x, z: sp.z });
    } else {
      if (dest.z < AISLE - 0.3) p.push({ x: dest.x, z: AISLE });
      p.push({ x: dest.x, z: dest.z, face: dest.face });
    }
    // drop zero-length hops
    a.path = p.filter((w, k) => k === 0 || Math.hypot(w.x - p[k - 1].x, w.z - p[k - 1].z) > 0.05);
    a.face = null;
  }
  const goDesk = (a) => { a.activity = "desk"; routeTo(a, { desk: true }); };

  function startIdleActivity(a) {
    const r = Math.random();
    const ready = (o) => o !== a && o.activity === "desk" && o.path.length === 0 && o.sit > 0.99;
    const partners = agents.filter(ready);
    if (r < 0.4) {
      a.activity = "coffee"; a.timer = 8 + Math.random() * 3;
      routeTo(a, { x: 15, z: 0.35, face: 0 });
    } else if (r < 0.7 || partners.length === 0) {
      a.activity = "stretch"; a.timer = 5;
      routeTo(a, { x: a.deskX + 1.0, z: AISLE, face: Math.PI });
    } else {
      const b = partners[Math.floor(Math.random() * partners.length)];
      const mx = (a.deskX + b.deskX) / 2, aLeft = a.deskX < b.deskX;
      const dur = 7 + Math.random() * 3;
      a.activity = b.activity = "chat"; a.timer = b.timer = dur;
      routeTo(a, { x: mx + (aLeft ? -0.8 : 0.8), z: AISLE + 0.3, face: aLeft ? -Math.PI / 2 : Math.PI / 2 });
      routeTo(b, { x: mx + (aLeft ? 0.8 : -0.8), z: AISLE + 0.3, face: aLeft ? Math.PI / 2 : -Math.PI / 2 });
    }
  }

  // ---------- IK (2-bone, YZ plane) ----------
  // direction of a limb at angle t (0 = straight down, +PI/2 = forward = -Z): (y,z) = (-cos t, -sin t)
  function ikArm(sy, ty, tz) {
    const dy = ty - sy, dz = tz;
    let d = Math.hypot(dy, dz);
    const max = ARM1 + ARM2 - 0.02;
    if (d > max) d = max;
    const phi = Math.atan2(-dz, -dy);
    const cosA = clamp((ARM1 * ARM1 + d * d - ARM2 * ARM2) / (2 * ARM1 * d), -1, 1);
    const alpha = Math.acos(cosA);
    const sh = phi - alpha;
    const cosB = clamp((ARM1 * ARM1 + ARM2 * ARM2 - d * d) / (2 * ARM1 * ARM2), -1, 1);
    const elbow = Math.PI - Math.acos(cosB);
    return { sh, el: elbow };
  }

  // ---------- per-frame agent update ----------
  const WALK_SPEED = 3.2;
  function updateAgent(a, dt, t) {
    const isActive = activeId === a.cfg.id;
    const pipelineBusy = activeId !== null;

    // behaviour planning
    if (pipelineBusy) {
      if (a.activity !== "desk") goDesk(a);
    } else if (a.path.length === 0) {
      if (a.activity === "desk") {
        if (a.sit > 0.99) { a.timer -= dt; if (a.timer <= 0) startIdleActivity(a); }
      } else {
        a.timer -= dt;
        if (a.timer <= 0) { goDesk(a); a.timer = 6 + Math.random() * 10; }
      }
    }

    // movement
    const pos = a.root.position;
    let walking = false;
    if (a.path.length > 0) {
      if (a.sit > 0.01) {
        a.sit = Math.max(0, a.sit - dt * 2.6);           // stand up first
      } else {
        const w = a.path[0];
        const dx = w.x - pos.x, dz = w.z - pos.z, d = Math.hypot(dx, dz), step = WALK_SPEED * dt;
        walking = true;
        if (d <= step) {
          pos.x = w.x; pos.z = w.z;
          if (w.face !== undefined) a.face = w.face;
          a.path.shift();
        } else {
          pos.x += (dx / d) * step; pos.z += (dz / d) * step;
          const target = Math.atan2(-dx, -dz);            // model front is -Z
          a.psi += angDiff(a.psi, target) * damp(dt, 12);
        }
        a.phase += dt * 9;
      }
    } else if (a.activity === "desk") {
      a.psi += angDiff(a.psi, 0) * damp(dt, 10);
      if (Math.abs(angDiff(a.psi, 0)) < 0.25) a.sit = Math.min(1, a.sit + dt * 2.2);
    } else {
      const target = a.face !== null ? a.face : a.psi;
      a.psi += angDiff(a.psi, target) * damp(dt, 8);
      a.sit = 0;
    }
    a.root.rotation.y = a.psi;

    // pose
    const s = a.sit;
    const standY = 1.12, seatY = 0.7;
    const bob = walking ? Math.abs(Math.sin(a.phase)) * 0.07 : Math.sin(t * 1.8 + a.idx) * 0.012;
    a.hip.position.y = lerp(standY, seatY, s) + bob * (1 - s);

    // legs: sitting = thigh forward, shin down
    const swing = walking ? Math.sin(a.phase) * 0.65 : 0;
    const kneeL = walking ? -Math.max(0, Math.cos(a.phase)) * 0.8 : 0;
    const kneeR = walking ? -Math.max(0, -Math.cos(a.phase)) * 0.8 : 0;
    a.legL.hp.rotation.x = lerp(swing, Math.PI / 2, s);
    a.legR.hp.rotation.x = lerp(-swing, Math.PI / 2, s);
    a.legL.kn.rotation.x = lerp(kneeL, -Math.PI / 2, s);
    a.legR.kn.rotation.x = lerp(kneeR, -Math.PI / 2, s);

    // arms: FK pose (standing) + IK pose (typing), blended by sit
    let fkLS = 0.06, fkLE = 0.18, fkRS = 0.06, fkRE = 0.18;
    if (walking) {
      fkLS = -Math.sin(a.phase) * 0.55; fkRS = Math.sin(a.phase) * 0.55; fkLE = fkRE = 0.35;
    } else if (a.activity === "stretch") {
      const u = 2.85 + Math.sin(t * 2.4) * 0.12; fkLS = fkRS = u; fkLE = fkRE = 0.05;
    } else if (a.activity === "coffee") {
      fkRS = 0.95; fkRE = 1.75 + Math.sin(t * 1.6) * 0.1; fkLS = 0.15; fkLE = 0.5;
    } else if (a.activity === "chat") {
      fkRS = 0.9 + Math.sin(t * 3 + a.idx) * 0.25; fkRE = 1.2 + Math.sin(t * 3.4) * 0.3; fkLS = 0.1; fkLE = 0.3;
    }

    const typing = isActive;
    const jit = (k) => (typing ? Math.sin(t * 22 + k) * 0.035 : Math.sin(t * 1.3 + k) * 0.006);
    const shoulderY = 0.7;
    const ikL = ikArm(shoulderY, 0.62 + jit(0), -1.05 + (typing ? Math.sin(t * 17) * 0.03 : 0));
    const ikR = ikArm(shoulderY, 0.62 + jit(2), -1.05 + (typing ? Math.cos(t * 19) * 0.03 : 0));
    // hand target is expressed in hip-local coords: keyboard sits ~1.0 in front, slightly above the hip
    a.armL.sh.rotation.x = lerp(fkLS, ikL.sh, s); a.armL.el.rotation.x = lerp(fkLE, ikL.el, s);
    a.armR.sh.rotation.x = lerp(fkRS, ikR.sh, s); a.armR.el.rotation.x = lerp(fkRE, ikR.el, s);
    a.armL.sh.rotation.z = 0.07; a.armR.sh.rotation.z = -0.07;

    // head / torso life
    const look = a.activity === "chat" ? Math.sin(t * 1.4 + a.idx) * 0.18 : Math.sin(t * 0.6 + a.idx * 1.3) * 0.15 * s;
    a.head.rotation.y += (look - a.head.rotation.y) * damp(dt, 6);
    const nod = typing ? -0.2 + Math.sin(t * 7) * 0.03 : a.activity === "stretch" ? 0.3 : -0.04 + Math.sin(t * 0.5 + a.idx) * 0.04;
    a.head.rotation.x += (nod - a.head.rotation.x) * damp(dt, 6);
    a.torso.rotation.x = typing || a.sit > 0.9 ? -0.1 * s : 0;
    a.torso.scale.y = 1 + Math.sin(t * 2 + a.idx) * 0.012;

    // blink
    a.blinkT -= dt;
    let blink = 1;
    if (a.blinkT < 0.12 && a.blinkT > 0) blink = 0.1;
    if (a.blinkT <= 0) a.blinkT = 2.5 + Math.random() * 3;
    a.eyeL.scale.y = a.eyeR.scale.y = 1.25 * blink;

    // status bubble
    let key = "";
    if (isActive) key = "⌨️"; else if (a.activity === "coffee" && !walking) key = "☕"; else if (a.activity === "chat" && !walking) key = "💬"; else if (a.activity === "stretch" && !walking) key = "😌";
    if (key !== a.bubbleKey) {
      a.bubbleKey = key;
      a.bubble.visible = !!key;
      if (key) { a.bubble.material.map = bubbleTexture(key); a.bubble.material.needsUpdate = true; }
    }
    if (a.bubble.visible) a.bubble.position.y = 3.2 + Math.sin(t * 3 + a.idx) * 0.06;

    // chair follows agent a little
    stations[a.idx].chair.rotation.y = Math.sin(t * 0.5 + a.idx) * 0.04 * a.sit;
  }

  // ---------- main loop ----------
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (autoCycle) {
      autoTimer += dt;
      if (autoTimer > 9) { autoTimer = 0; const k = Object.keys(PRESETS); setAtmosphere(k[(k.indexOf(atmoKey) + 1) % k.length], true); }
    }
    stepAtmosphere(dt);

    fishes.forEach((f) => {
      f.a += f.sp * dt;
      const x = Math.cos(f.a) * f.rx, z = Math.sin(f.a) * f.rz;
      f.g.position.set(x, f.y + Math.sin(t * 2 + f.a * 3) * 0.04, z);
      f.g.rotation.y = -Math.atan2(Math.cos(f.a) * f.rz, -Math.sin(f.a) * f.rx);
    });

    agents.forEach((a) => updateAgent(a, dt, t));
    stations.forEach((st, i) => {
      const on = activeId === AGENTS[i].id;
      const target = on ? 1.0 : 0.82;
      const c = st.screenMat.color; c.r = c.g = c.b = lerp(c.r, target, damp(dt, 5));
      st.lamp.intensity = lerp(st.lamp.intensity, cur.lamp * 0.9 + (on ? 0.7 : 0), damp(dt, 4));
    });

    controls.update();
    renderer.render(scene, camera);
  }

  // ---------- public API ----------
  function setAtmosphere(key, fromAuto) {
    if (!PRESETS[key]) return;
    atmoKey = key;
    document.querySelectorAll(".cycle-btn[data-time]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-time") === key));
    if (!fromAuto) autoTimer = 0;
  }
  function setAuto(on) {
    autoCycle = !!on; autoTimer = 0;
    const b = document.getElementById("autoCycleBtn");
    if (b) b.classList.toggle("active", autoCycle);
  }
  function setActive(id) { activeId = id || null; }

  window.Office = { setActive, setAtmosphere, setAuto, _debug: { agents, scene } };
  frame();
})();
