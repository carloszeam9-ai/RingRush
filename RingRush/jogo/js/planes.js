// ---------- Avião (jato esportivo) ----------
const plane = new THREE.Group(), model = new THREE.Group();
plane.add(model); let cur = model;
const phong = (c, o = {}) => new THREE.MeshPhongMaterial(Object.assign({ color: c, shininess: 70 }, o));
const WHITE = phong(0xf4f4f4), RED = phong(0xd7263d), DARK = phong(0x3d4450), GLASS = phong(0x5ec8ff, { shininess: 150, specular: 0xffffff });
const wingMat = phong(0xf4f4f4, { side: THREE.DoubleSide }), wingRed = phong(0xd7263d, { side: THREE.DoubleSide });
const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); cur.add(m); return m; };
const flat = (pts, depth) => {   // forma no plano XZ (x, z) com espessura em Y
  const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); g.rotateX(Math.PI / 2); g.translate(0, depth / 2, 0); return g;
};
const pair = (geo, mat, x, y, z) => { add(geo, mat, x, y, z); const l = add(geo, mat, -x, y, z); l.scale.x = -1; };

// ---------- Catálogo de aviões (só visual) ----------
const builders = {};
const gl = (x, y, z, r = .2, c = 0xffa23a) => add(new THREE.CylinderGeometry(r, r, .12, 14).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: c }), x, y, z);
const cylZ = (rf, rb, len, mat, x = 0, y = 0, z = 0) => add(new THREE.CylinderGeometry(rb, rf, len, 18).rotateX(Math.PI / 2), mat, x, y, z);   // rf = raio da frente, rb = raio de trás
const noseZ = (r, len, mat, z) => add(new THREE.ConeGeometry(r, len, 18).rotateX(-Math.PI / 2), mat, 0, 0, z);
const ell = (rx, ry, rz, mat, x = 0, y = 0, z = 0) => add(new THREE.SphereGeometry(1, 18, 12).scale(rx, ry, rz), mat, x, y, z);
const bx = (w, h, d, mat, x = 0, y = 0, z = 0, rz = 0) => { const m = add(new THREE.BoxGeometry(w, h, d), mat, x, y, z); m.rotation.z = rz; return m; };
const wm = c => phong(c, { side: THREE.DoubleSide });
const onAnim = fn => cur.userData.anims.push(fn);
const flapWing = (pts, mat, px, py, pz, s) => { const grp = new THREE.Group(); grp.position.set(px * s, py, pz); const m = new THREE.Mesh(flat(pts, .06), mat); m.scale.x = s; grp.add(m); cur.add(grp); return grp; };

builders.b2 = () => { const k = wm(0x1c1e24);
  pair(flat([[0, -2.4], [5.2, 1.6], [3.8, 1.7], [2.7, 2.3], [1.5, 1.7], [0, 2.6]], .25), k, 0, 0, 0);
  ell(.8, .3, 1.8, k, 0, .1, .2); ell(.3, .15, .5, GLASS, 0, .32, -1.2); };
builders.gripen = () => { const g = phong(0x9aa3ad), k = wm(0x9aa3ad);
  cylZ(.4, .5, 3.4, g, 0, 0, .3); noseZ(.4, 1.8, g, -2.3); ell(.3, .28, .9, GLASS, 0, .45, -.9);
  pair(flat([[.3, -.3], [3, 1.9], [3, 2.3], [.3, 2.2]], .1), k, 0, -.05, .4);
  pair(flat([[.3, -.2], [1.5, .6], [1.5, .9], [.3, .9]], .07), k, 0, .1, -1.7);   // canards
  bx(.09, 1.3, 1.1, g, 0, .9, 2.1); gl(0, 0, 2.05, .35); };
builders.mig25 = () => { const g = phong(0x9fa6ad), k = wm(0x9fa6ad);
  bx(.9, .5, 3.4, g, 0, .05, .3); noseZ(.42, 2.2, g, -2.5); ell(.3, .28, .8, GLASS, 0, .4, -1);
  pair(flat([[1, -.4], [4.3, 1], [4.3, 1.7], [1, 1.5]], .1), k, 0, .05, .4);
  for (const s of [-1, 1]) { cylZ(.5, .55, 4.2, g, s * .62, 0, .6); gl(s * .62, 0, 2.75, .42); bx(.08, 1.5, 1.2, g, s * .9, .85, 2.2, -s * .3); } };
builders.f22 = () => { const g = phong(0x6e7782), k = wm(0x6e7782);
  ell(.65, .38, 2.8, g); ell(.3, .28, .9, GLASS, 0, .32, -1.3);
  pair(flat([[.3, -.9], [3.3, 1.5], [3.3, 2], [.3, 2.1]], .1), k, 0, -.05, .2);
  pair(flat([[.5, 1.5], [1.9, 2.7], [1.9, 3.1], [.5, 3]], .08), k, 0, 0, .3);
  for (const s of [-1, 1]) { bx(.08, 1.2, 1.3, g, s * .7, .7, 2.2, -s * .4); gl(s * .3, 0, 2.85, .28); } };
builders.sr71 = () => { const g = phong(0x181a1f), k = wm(0x181a1f);
  cylZ(.32, .4, 4.6, g, 0, 0, .3); noseZ(.32, 3.4, g, -3.7); ell(.25, .22, .7, GLASS, 0, .38, -2.2);
  pair(flat([[.3, -1], [3.6, 2.5], [3.6, 3], [.3, 3]], .1), k, 0, -.05, .2);
  pair(flat([[.3, -3], [1, -.8], [.3, -.8]], .05), k, 0, 0, 0);
  for (const s of [-1, 1]) { cylZ(.34, .4, 2.8, g, s * 1.35, -.02, 1.9); add(new THREE.ConeGeometry(.34, .7, 16).rotateX(-Math.PI / 2), g, s * 1.35, -.02, .15);
    gl(s * 1.35, -.02, 3.32, .3, 0x7fb8ff); bx(.07, 1.1, 1, g, s * 1.35, .65, 3, -s * .15); } };
builders.f14 = () => { const g = phong(0x7d8793), k = wm(0x7d8793);
  bx(1.6, .6, 3.4, g, 0, 0, .2); noseZ(.5, 1.8, g, -2.3); ell(.35, .3, .9, GLASS, 0, .42, -1.2);
  pair(flat([[.5, 2], [1.7, 2.9], [1.7, 3.3], [.5, 3.1]], .08), k, 0, -.05, 0);
  for (const s of [-1, 1]) { cylZ(.4, .4, 3.2, g, s * .65, -.15, 1); gl(s * .65, -.15, 2.66, .32); bx(.08, 1.3, 1.2, g, s * .7, .8, 2.5, -s * .12); }
  const wR = flapWing([[0, 0], [3.3, 0], [3.3, 1.1], [0, 1.7]], k, .9, .05, -.1, 1), wL = flapWing([[0, 0], [3.3, 0], [3.3, 1.1], [0, 1.7]], k, .9, .05, -.1, -1);
  onAnim((t, roll) => { const sw = .15 + Math.min(1, Math.abs(roll) * 1.4) * .8; wR.rotation.y = -sw; wL.rotation.y = sw; }); };   // asas fecham ao inclinar
builders.a10 = () => { const g = phong(0x6b7a4a), k = wm(0x6b7a4a);
  cylZ(.45, .38, 3.6, g, 0, 0, .2); noseZ(.45, 1, g, -2.1); ell(.34, .3, .8, GLASS, 0, .45, -1.3);
  pair(flat([[.4, -.5], [3.9, .2], [3.9, 1.2], [.4, 1.3]], .14), k, 0, -.1, .3);
  pair(flat([[.3, 2.2], [2.2, 2.4], [2.2, 3.1], [.3, 3.1]], .08), k, 0, .25, 0);
  for (const s of [-1, 1]) { cylZ(.4, .4, 1.8, phong(0x4e5a38), s * .9, .55, 1.7); gl(s * .9, .55, 2.66, .32); bx(.07, 1.2, 1, g, s * 2.2, .75, 2.7); } };
builders.ufo = () => { ell(2.6, .45, 2.6, phong(0xc9ced6, { shininess: 120 })); ell(1, .75, 1, GLASS, 0, .3, 0);
  const lit = new THREE.MeshBasicMaterial({ color: 0x7dffb0 }), ring = new THREE.Group();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, m = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 8), lit); m.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); ring.add(m); }
  cur.add(ring); onAnim(t => ring.rotation.y = t * 2);
  add(new THREE.CylinderGeometry(.9, .9, .1, 24), lit, 0, -.42, 0); };
builders.dragao = () => { const gr = phong(0x3fa34d), mem = wm(0xe06c2c), ye = new THREE.MeshBasicMaterial({ color: 0xffe14a });
  ell(.6, .55, 1.5, gr, 0, 0, .2); cylZ(.28, .4, 1.4, gr, 0, .2, -1.6); ell(.38, .32, .6, gr, 0, .35, -2.5);
  add(new THREE.ConeGeometry(.42, 3.2, 14).rotateX(Math.PI / 2), gr, 0, 0, 3.3);
  for (const s of [-1, 1]) { add(new THREE.ConeGeometry(.08, .5, 8).rotateX(.7), mem, s * .15, .65, -2.5); add(new THREE.SphereGeometry(.07, 8, 8), ye, s * .22, .5, -2.8); }
  const pts = [[0, -.4], [3.8, -1.1], [3.1, .1], [2.7, 0], [2, 1.2], [1.4, .4], [0, 1]];
  const wR = flapWing(pts, mem, .5, .35, -.2, 1), wL = flapWing(pts, mem, .5, .35, -.2, -1);
  onAnim(t => { const f = Math.sin(t * 7) * .55; wR.rotation.z = f; wL.rotation.z = -f; }); };   // asas batendo
builders.nave = () => { const g = phong(0x34425f, { shininess: 120 }), k = wm(0x34425f), c = new THREE.MeshBasicMaterial({ color: 0x3de0ff });
  ell(.7, .35, 2.4, g); ell(.35, .25, .8, GLASS, 0, .28, -.9); bx(.1, .04, 2.4, c, 0, .36, .6);
  pair(flat([[.4, -.9], [2.8, 1.1], [2.8, 1.7], [.4, 1.5]], .08), k, 0, .45, .3);
  pair(flat([[.4, -.9], [2.8, 1.1], [2.8, 1.7], [.4, 1.5]], .08), k, 0, -.45, .3);
  for (const s of [-1, 1]) { cylZ(.25, .3, 1.8, g, s * 2.8, 0, 1.7); gl(s * 2.8, 0, 2.66, .26, 0x3de0ff); } };
builders.papel = () => { const p = wm(0xfafafa), q = wm(0xdfe6ee);
  for (const s of [-1, 1]) { const m = new THREE.Mesh(flat([[0, -3], [2.6, 2], [0, 2]], .02), s > 0 ? p : q); m.scale.x = s; m.rotation.z = s * .3; cur.add(m); }
  bx(.03, .6, 4.2, q, 0, -.25, -.2); };

builders.jato = () => {
// fuselagem: corpo + nariz + cauda afinando
add(new THREE.CylinderGeometry(0.45, 0.45, 2.8, 20).rotateX(Math.PI / 2), WHITE);
add(new THREE.ConeGeometry(0.45, 1.6, 20).rotateX(-Math.PI / 2), WHITE, 0, 0, -2.2);
add(new THREE.CylinderGeometry(0.15, 0.45, 1.8, 20).rotateX(Math.PI / 2), WHITE, 0, 0, 2.3);
add(new THREE.CylinderGeometry(0.46, 0.46, 0.45, 20).rotateX(Math.PI / 2), RED, 0, 0, 0.5);       // faixa vermelha
add(new THREE.SphereGeometry(0.42, 18, 12).scale(0.85, 0.75, 2.0), GLASS, 0, 0.3, -0.85);          // cabine
// asas em flecha + pontas vermelhas
pair(flat([[0, -0.9], [3.9, 0.8], [3.9, 1.3], [0, 0.8]], 0.1), wingMat, 0.3, -0.12, 0.1);
pair(flat([[0, 0], [0.35, -0.05], [0.35, 0.55], [0, 0.6]], 0.12), wingRed, 4.2, -0.12, 0.8);
// estabilizadores
pair(flat([[0, -0.3], [1.6, 0.5], [1.6, 0.85], [0, 0.55]], 0.08), wingMat, 0.2, 0, 2.6);
// deriva vertical (leme)
{ const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.8, 1.2); sh.lineTo(1.3, 1.2); sh.lineTo(1.3, 0); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(0.05, 0, 0);
  add(g, RED, 0, 0.3, 1.9); }
// turbinas sob as asas, com brilho no escape
for (const sx of [-1, 1]) {
  add(new THREE.CylinderGeometry(0.26, 0.22, 1.5, 16).rotateX(Math.PI / 2), DARK, sx * 1.4, -0.38, 0.4);
  add(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 16).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffa23a }), sx * 1.4, -0.38, 1.18);
  add(new THREE.TorusGeometry(0.25, 0.04, 8, 16), RED, sx * 1.4, -0.38, -0.34);
}
};

plane.rotation.order = 'YXZ'; scene.add(plane);

// ---------- Seleção de avião (preview 3D no painel) ----------
const PLANES = [
  { id: 'jato', n: 'Jato Clássico', s: .85 }, { id: 'b2', n: 'B-2 Spirit', s: .8 }, { id: 'gripen', n: 'Gripen', s: .9 },
  { id: 'mig25', n: 'MiG-25', s: .85 }, { id: 'f22', n: 'F-22 Raptor', s: .9 }, { id: 'sr71', n: 'SR-71 Blackbird', s: .7 },
  { id: 'f14', n: 'F-14 Tomcat', s: .85 }, { id: 'a10', n: 'A-10 Warthog', s: .85 }, { id: 'ufo', n: 'Disco Voador', s: .75 },
  { id: 'dragao', n: 'Dragão', s: .85 }, { id: 'nave', n: 'Nave Estelar', s: .9 }, { id: 'papel', n: 'Avião de Papel', s: 1 }
];
const pr = new THREE.WebGLRenderer({ antialias: true, alpha: true }); pr.setSize(480, 200); $('prev3d').appendChild(pr.domElement);
const pScene = new THREE.Scene(), pCam = new THREE.PerspectiveCamera(40, 480 / 200, .1, 100), pModel = new THREE.Group();
pModel.rotation.x = .15; pScene.add(pModel, new THREE.HemisphereLight(0xffd2a8, 0x6b4a5a, 1.1));
const pLight = new THREE.DirectionalLight(0xffb070, 1); pLight.position.set(-5, 4, 3); pScene.add(pLight);
pCam.position.set(0, 2.2, 11); pCam.lookAt(0, 0, 0);
function buildPlane(tgt, i) {
  while (tgt.children.length) tgt.remove(tgt.children[0]);
  tgt.userData.anims = []; tgt.scale.setScalar(PLANES[i].s); cur = tgt; builders[PLANES[i].id](); cur = model;
}
let selPlane = 0; try { selPlane = +localStorage.getItem('plane') || 0; } catch (e) {}
function setPlane(i) {
  selPlane = (i + PLANES.length) % PLANES.length; buildPlane(model, selPlane); buildPlane(pModel, selPlane);
  $('pname').textContent = PLANES[selPlane].n + '  (' + (selPlane + 1) + '/' + PLANES.length + ')';
  try { localStorage.setItem('plane', selPlane); } catch (e) {}
}
$('pp').onclick = () => setPlane(selPlane - 1); $('pn').onclick = () => setPlane(selPlane + 1);
addEventListener('keydown', e => {
  if ($('panel').style.display === 'none' || $('admin').style.display !== 'none' || document.activeElement === $('name')) return;
  if (e.key === 'ArrowRight') setPlane(selPlane + 1); if (e.key === 'ArrowLeft') setPlane(selPlane - 1);
});
setPlane(selPlane);
