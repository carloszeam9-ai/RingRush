// ============ Diagnóstico do sensor (tecla F3) ============
// Mostra FPS do jogo, leituras por segundo, maior intervalo entre leituras e um gráfico do pitch/roll.
const diag = { on: false, times: [], p: [], r: [], frames: [] };

function diagSample(p, r) {   // chamada a cada leitura recebida do ESP (ver input.js)
  diag.times.push(performance.now()); diag.p.push(p); diag.r.push(r);
  if (diag.times.length > 400) { diag.times.shift(); diag.p.shift(); diag.r.shift(); }
}

addEventListener('keydown', e => {
  if (e.key === 'F3') { e.preventDefault(); diag.on = !diag.on; $('diag').style.display = diag.on ? 'block' : 'none'; }
});

(function loop(t) {
  requestAnimationFrame(loop);
  diag.frames.push(t); while (diag.frames.length && t - diag.frames[0] > 1000) diag.frames.shift();
  if (!diag.on) return;
  const now = performance.now(), T = diag.times, recent = T.filter(x => now - x < 1000);
  let maxGap = 0; for (let i = 1; i < recent.length; i++) maxGap = Math.max(maxGap, recent[i] - recent[i - 1]);
  const age = T.length ? Math.round(now - T[T.length - 1]) : -1;
  $('diagTxt').textContent = `FPS do jogo: ${diag.frames.length}\nLeituras/s: ${recent.length} (esperado ~100)\nMaior intervalo: ${Math.round(maxGap)} ms\nÚltima leitura há: ${age} ms\nBruto P/R: ${rawP.toFixed(1)} / ${rawR.toFixed(1)}\nNeutro P/R: ${pOff.toFixed(1)} / ${rOff.toFixed(1)}`;
  const c = $('diagG'), g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
  g.strokeStyle = '#666'; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
  const draw = (arr, col) => {
    g.strokeStyle = col; g.beginPath(); const n = Math.min(200, arr.length), s = arr.length - n;
    for (let i = 0; i < n; i++) { const x = i / 200 * W, y = H / 2 - Math.max(-90, Math.min(90, arr[s + i])) / 90 * (H / 2); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  };
  draw(diag.p, '#ffd400'); draw(diag.r, '#3de0ff');
})(0);
