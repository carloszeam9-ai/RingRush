// ---------- Controle ----------
let calP = 0, calR = 0, calN = 0;
let rawP = 0, rawR = 0, pOff = 0, rOff = 0, usingSensor = false, ws = null;
const keys = {}; let kp = 0, kr = 0;
addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (e.key === 'Enter' && $('panel').style.display !== 'none' && $('admin').style.display === 'none') startGame(); });
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
$('ip').value = localStorage.getItem('espip') || '';
$('btn').onclick = () => {
  const ip = $('ip').value.trim(); if (!ip) return;
  try { localStorage.setItem('espip', ip); } catch (e) {}
  if (ws) ws.close();
  $('status').textContent = 'Conectando...';
  ws = new WebSocket('ws://' + ip + ':81');
  ws.onopen = () => { usingSensor = true; $('status').textContent = 'Sensor conectado ✔'; };
  ws.onclose = () => { usingSensor = false; $('status').textContent = 'Sensor desconectado (teclado ativo)'; };
  ws.onerror = () => { $('status').textContent = 'Erro ao conectar'; };
  ws.onmessage = e => { const [p, r] = e.data.split(',').map(Number); if (!isNaN(p) && !isNaN(r)) { rawP = p; rawR = r; } };
};

// Lembra as opções do sensor (trocar/inverter eixos) entre sessões
for (const id of ['swapPR', 'invP', 'invR']) {
  const el = $(id);
  try { el.checked = localStorage.getItem(id) === '1'; } catch (e) {}
  el.onchange = () => { try { localStorage.setItem(id, el.checked ? '1' : '0'); } catch (e) {} };
}

// Tecla C: define a posição atual do controle como o ponto neutro
addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'c' && document.activeElement.tagName !== 'INPUT') { pOff = rawP; rOff = rawR; beep(660, .08); }
});