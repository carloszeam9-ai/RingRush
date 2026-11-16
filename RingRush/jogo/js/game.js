// ---------- Estado do jogo ----------
let ringCount = 0, state = 'menu', score = 0, combo = 1, lastRingT = -99, timeLeft = ROUND_TIME, countdown = 0, deadT = 0, clockT = 0;
let heading = 0, pitch = 0, roll = 0, playerName = '';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function resetPlane() { const p = plane.position; p.set(Math.round((p.x - CELL / 2) / CELL) * CELL + CELL / 2, SPAWN_Y, Math.round((p.z - CELL / 2) / CELL) * CELL + CELL / 2); heading = Math.round(heading / (Math.PI / 2)) * Math.PI / 2; pitch = roll = 0; plane.rotation.set(0, heading, 0); }
function startGame() {
  playerName = $('name').value.trim() || 'Piloto';
  state = 'count'; countdown = 3.99; score = 0; ringCount = 0; combo = 1; timeLeft = ROUND_TIME; collected.clear();
  plane.position.set(CELL / 2, SPAWN_Y, CELL / 2); heading = 0; pitch = roll = 0; clearChunks(); updateChunks(true);
  $('panel').style.display = 'none'; beep(440, .1);
}
function endGame() {
  state = 'over'; $('msg').textContent = '';
  const e = { id: Date.now(), name: playerName, score, date: new Date().toLocaleString('pt-BR') };
  rank.push(e); rank.sort((a, b) => b.score - a.score); rank = rank.slice(0, 300); saveRank();
  $('result').textContent = `${playerName}: ${score} pts, ${rank.findIndex(x => x.id === e.id) + 1}º lugar!`;
  $('name').value = ''; renderRank(e.id); $('panel').style.display = 'block'; beep(330, .4);
}
$('go').onclick = startGame;

// ---------- Loop ----------
const clock = new THREE.Clock(), camPos = new THREE.Vector3(), local = new THREE.Vector3();
plane.position.set(0, 300, 0); updateChunks(true); renderRank();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05); clockT += dt;
  const p = plane.position;
  let tp = 0, tr = 0;
  if (state === 'menu' || state === 'over') { tr = 18; }      // modo demonstração: voa em círculos
  else if (usingSensor) { let dp = rawP - pOff, dr = rawR - rOff; if ($('swapPR').checked) [dp, dr] = [dr, dp];
    dp = dz(dp); dr = dz(dr);
    tp = dp * GAIN * ($('invP').checked ? -1 : 1); tr = dr * GAIN * ($('invR').checked ? -1 : 1); }
  else {
    const kpT = (keys['arrowup'] || keys['w'] ? -25 : 0) + (keys['arrowdown'] || keys['s'] ? 25 : 0);
    const krT = (keys['arrowright'] || keys['d'] ? 45 : 0) + (keys['arrowleft'] || keys['a'] ? -45 : 0);
    kp += (kpT - kp) * 4 * dt; kr += (krT - kr) * 4 * dt; tp = kp; tr = kr;
  }

  if (state === 'count') {
    countdown -= dt; $('msg').textContent = countdown > 1 ? 'Segure parado... ' + Math.floor(countdown) : 'VAI!';
    if (countdown < 1.5) { calP += rawP; calR += rawR; calN++; }   // média das leituras = ponto neutro estável
    if (countdown <= 0) { if (calN) { pOff = calP / calN; rOff = calR / calN; } calP = calR = calN = 0; state = 'play'; $('msg').textContent = ''; beep(880, .25); }
  }
  const moving = state === 'play' || state === 'menu' || state === 'over';
  if (moving) {
    const k = 1 - Math.exp(-SMOOTH * dt);
    pitch += (clamp(tp, -55, 55) * Math.PI / 180 - pitch) * k;
    roll += (clamp(tr, -75, 75) * Math.PI / 180 - roll) * k;
    heading -= Math.sin(roll) * TURN_RATE * dt;
    plane.rotation.set(pitch, heading, -roll);
    plane.translateZ(-SPEED * dt);
    const ceil = state === 'play' ? CEIL : 450; if (p.y > ceil) p.y = ceil;
    if (state !== 'play' && p.y < 300) p.y = 300;
  }
  updateChunks();

  if (state === 'play') {
    timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; endGame(); }
    let crash = p.y < 1.5;
    const cx = Math.round(p.x / CH), cz = Math.round(p.z / CH);
    for (let dx = -1; dx <= 1 && !crash; dx++) for (let dz = -1; dz <= 1 && !crash; dz++) {
      const c = chunks.get((cx + dx) + ',' + (cz + dz)); if (!c) continue;
      for (const b of c.boxes) if (Math.abs(p.x - b.x) < b.hw + 1 && Math.abs(p.z - b.z) < b.hd + 1 && p.y < b.h + 1) { crash = true; break; }
      for (let k = c.rings.length - 1; k >= 0; k--) {
        const rg = c.rings[k]; local.copy(p); rg.worldToLocal(local);
        if (Math.abs(local.z) < 4 && Math.hypot(local.x, local.y) < 10) {
          combo = clockT - lastRingT < 6 ? Math.min(5, combo + 1) : 1; lastRingT = clockT;
          ringCount++; score += 10 * combo; timeLeft += 2; collected.add(rg.userData.id);
          c.g.remove(rg); c.rings.splice(k, 1); beep(520 + combo * 120, .12);
        }
      }
    }
    if (crash && state === 'play') { state = 'dead'; deadT = 2; combo = 1; $('msg').textContent = '💥 BATEU!'; beep(110, .5); }
  } else if (state === 'dead') {
    deadT -= dt; if (deadT <= 0) { resetPlane(); state = 'play'; $('msg').textContent = ''; }
  }

  $('score').textContent = score;
  const cb = clockT - lastRingT < 6 ? combo : 1; $('combo').textContent = 'x' + cb; $('combo').className = cb > 1 ? 'on' : ''; $('rings').textContent = ringCount;
  $('time').textContent = Math.ceil(timeLeft); $('alt').textContent = Math.round(p.y);
  ground.position.set(Math.round(p.x / CELL) * CELL, 0, Math.round(p.z / CELL) * CELL);

  camPos.set(0, 2.8, 9.5).applyQuaternion(plane.quaternion).add(p);
  camera.position.lerp(camPos, 1 - Math.exp(-CAM_FOLLOW * dt)); camera.up.set(0, 1, 0); camera.lookAt(p.x, p.y + 1, p.z);
  sky.position.copy(camera.position); pyr.position.set(p.x, 0, p.z);
  for (const fn of model.userData.anims) fn(clockT, roll);
  renderer.render(scene, camera);
  if ($('panel').style.display !== 'none') { pModel.rotation.y += dt * .9; for (const fn of pModel.userData.anims) fn(clockT, Math.sin(clockT * 1.3) * .9); pr.render(pScene, pCam); }
}
loop();