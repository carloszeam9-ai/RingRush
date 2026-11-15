// ---------- Cidade infinita (chunks) ----------
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ringGeo = new THREE.TorusGeometry(10, 1, 8, 28), ringMat = new THREE.MeshBasicMaterial({ color: 0x35ffb0 });
const chunks = new Map(), collected = new Set();

// Fachadas geradas por código: tile de 16x16 m com 4x4 janelas, algumas acesas
function makeTex(wall, win, lit, litChance) {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = 256; return c; };
  const c = mk(), e = mk(), x = c.getContext('2d'), y = e.getContext('2d');
  x.fillStyle = wall; x.fillRect(0, 0, 256, 256); y.fillStyle = '#000'; y.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const on = Math.random() < litChance;
    x.fillStyle = on ? lit : win; x.fillRect(i * 64 + 14, j * 64 + 14, 36, 36);
    if (on) { y.fillStyle = lit; y.fillRect(i * 64 + 14, j * 64 + 14, 36, 36); }
  }
  const tex = cv => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
  return new THREE.MeshLambertMaterial({ map: tex(c), emissiveMap: tex(e), emissive: 0xffffff, vertexColors: true });
}
const styles = [
  makeTex('#e6c79e', '#3a2d36', '#ffd27a', .30),   // arenito
  makeTex('#c4623b', '#2a1d26', '#ffc15e', .30),   // terracota
  makeTex('#f0e2cb', '#403642', '#ffdc8a', .25),   // creme
  makeTex('#6d7fa0', '#243247', '#ffe3a0', .30),   // vidro azulado
];

// Junta todos os prédios de um estilo em uma única malha, com UVs proporcionais ao tamanho
function buildMesh(list, mat) {
  if (!list.length) return null;
  const pos = [], nor = [], uv = [], col = [], idx = []; let off = 0;
  for (const b of list) {
    const g = new THREE.BoxGeometry(b.w, b.h, b.d), P = g.attributes.position, U = g.attributes.uv, Nn = g.attributes.normal, I = g.index.array;
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i) + b.x, P.getY(i) + b.h / 2, P.getZ(i) + b.z);
      nor.push(Nn.getX(i), Nn.getY(i), Nn.getZ(i));
      const face = (i / 4) | 0;               // 0:+x 1:-x 2:+y(teto) 3:-y 4:+z 5:-z
      let u = U.getX(i), v = U.getY(i);
      if (face === 2 || face === 3) { u = 0.03; v = 0.03; }   // teto liso
      else { u *= (face < 2 ? b.d : b.w) / 16; v *= b.h / 16; }
      uv.push(u, v);
      const t = face === 2 ? b.tint * 0.6 : b.tint; col.push(t, t, t);
    }
    for (let i = 0; i < I.length; i++) idx.push(I[i] + off);
    off += P.count; g.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  return new THREE.Mesh(geo, mat);
}

function makeChunk(cx, cz) {
  const r = rng((cx * 73856093) ^ (cz * 19349663)), g = new THREE.Group(), boxes = [], empties = [], rings = [], meshes = [];
  const ox = cx * CH - CH / 2, oz = cz * CH - CH / 2;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = ox + (i + .5) * CELL, z = oz + (j + .5) * CELL;
    if (r() < 0.62) {
      const w = 36 + r() * 20, d = 36 + r() * 20, h = 70 + r() * 170;   // todos grandes: 70–240 m
      boxes.push({ x, z, hw: w / 2, hd: d / 2, w, d, h, tint: 0.85 + r() * 0.3, s: (r() * styles.length) | 0 });
    } else empties.push([x, z]);
  }
  for (let s = 0; s < styles.length; s++) {
    const m = buildMesh(boxes.filter(b => b.s === s), styles[s]); if (m) { g.add(m); meshes.push(m); }
  }
  for (let k = 0; k < 6 && empties.length; k++) {
    const id = cx + ',' + cz + ',' + k, [x, z] = empties.splice((r() * empties.length) | 0, 1)[0];
    const y = 25 + r() * 140, rot = r() < .5 ? 0 : Math.PI / 2;
    if (collected.has(id)) continue;
    const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.set(x, y, z); ring.rotation.y = rot; ring.updateMatrixWorld(); ring.userData.id = id;
    g.add(ring); rings.push(ring);
  }
  scene.add(g);
  return { g, boxes, rings, cx, cz, meshes };
}
let lastCx = 1e9, lastCz = 1e9;
function dropChunk(c) { scene.remove(c.g); c.meshes.forEach(m => m.geometry.dispose()); }
function updateChunks(force) {
  const cx = Math.round(plane.position.x / CH), cz = Math.round(plane.position.z / CH);
  if (!force && cx === lastCx && cz === lastCz) return;
  lastCx = cx; lastCz = cz;
  for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
    const k = (cx + dx) + ',' + (cz + dz);
    if (!chunks.has(k)) chunks.set(k, makeChunk(cx + dx, cz + dz));
  }
  for (const [k, c] of chunks) if (Math.abs(c.cx - cx) > R || Math.abs(c.cz - cz) > R) { dropChunk(c); chunks.delete(k); }
}
function clearChunks() { for (const c of chunks.values()) dropChunk(c); chunks.clear(); lastCx = 1e9; }
