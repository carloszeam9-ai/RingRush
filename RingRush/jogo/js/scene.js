// ---------- Cena ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0a06a);
scene.fog = new THREE.Fog(0xf0a06a, 250, 950);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
scene.add(new THREE.HemisphereLight(0xffd2a8, 0x6b4a5a, 0.95));
const SUN_DIR = new THREE.Vector3(-0.55, 0.16, -0.82).normalize();
const sun = new THREE.DirectionalLight(0xffb070, 1.0); sun.position.copy(SUN_DIR).multiplyScalar(500); scene.add(sun);

// Chão: asfalto com faixas amarelas alinhadas às ruas (tile de 80 m, rua no centro do tile)
const gc = document.createElement('canvas'); gc.width = gc.height = 256;
{ const x = gc.getContext('2d'); x.fillStyle = '#2d2c36'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#e8c34a';
  for (let d = 0; d < 256; d += 48) { if (Math.abs(d + 12 - 128) > 40) { x.fillRect(125, d, 6, 24); x.fillRect(d, 125, 24, 6); } } }
const gt = new THREE.CanvasTexture(gc); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(50, 50); gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshLambertMaterial({ map: gt }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);

// Céu em degradê (roxo → rosa → laranja) com sol baixo
const sky = new THREE.Group();
const dome = new THREE.Mesh(new THREE.SphereGeometry(2500, 24, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 hor = vec3(1., .66, .38), mid = vec3(.78, .35, .5), top = vec3(.16, .12, .38);' +
    ' vec3 c = h < 0. ? hor : (h < .35 ? mix(hor, mid, h / .35) : mix(mid, top, clamp((h - .35) / .5, 0., 1.))); gl_FragColor = vec4(c, 1.); }'
}));
dome.frustumCulled = false; sky.add(dome);
const disc = new THREE.Mesh(new THREE.CircleGeometry(130, 32), new THREE.MeshBasicMaterial({ color: 0xfff2c8, fog: false, depthWrite: false }));
disc.position.copy(SUN_DIR).multiplyScalar(2400); disc.lookAt(0, 0, 0); sky.add(disc);
scene.add(sky);

// Pirâmides/montanhas no horizonte (acompanham o jogador, então parecem infinitas)
const pyr = new THREE.Group();
for (let i = 0; i < 16; i++) {
  const a = i / 16 * Math.PI * 2 + Math.sin(i * 12.9) * 0.2, d = 1300 + ((i * 37) % 5) * 60, h = 280 + ((i * 53) % 7) * 45, w = h * (1.1 + ((i * 29) % 3) * .25);
  const m = new THREE.Mesh(new THREE.ConeGeometry(w, h, 4), new THREE.MeshLambertMaterial({ color: 0xcf8f6a, fog: false }));
  m.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d); m.rotation.y = a + 0.4; pyr.add(m);
}
scene.add(pyr);
