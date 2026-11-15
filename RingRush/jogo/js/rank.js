// ============ Ranking: armazenamento, tabela e área de administração (protegida por PIN) ============
let rank = []; try { rank = JSON.parse(localStorage.getItem('rank') || '[]'); } catch (e) {}
let adminOn = false;

function saveRank() { try { localStorage.setItem('rank', JSON.stringify(rank)); } catch (e) {} }

function renderRank(hi) {
  const t = $('rank'); t.innerHTML = '';
  rank.slice(0, 10).forEach((e, i) => {
    const tr = t.insertRow(); if (e.id === hi) tr.className = 'me';
    tr.insertCell().textContent = (i + 1) + 'º'; tr.insertCell().textContent = e.name; tr.insertCell().textContent = e.score;
    if (adminOn) {   // no modo admin, ✕ remove só esta linha
      const c = tr.insertCell(); c.textContent = '✕'; c.className = 'del';
      c.onclick = () => { rank = rank.filter(x => x.id !== e.id); saveRank(); renderRank(hi); };
    }
  });
  if (!rank.length) t.insertRow().insertCell().textContent = 'Ninguém jogou ainda. Seja o primeiro!';
}

function exportCsv() {
  const csv = 'posicao,nome,pontos,data\n' + rank.map((e, i) => `${i + 1},"${e.name.replace(/"/g, '')}",${e.score},"${e.date}"`).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'ranking.csv'; a.click();
}

// ---------- Administração: Ctrl+Shift+A  ou  5 cliques rápidos no título ----------
const adminMsg = t => $('adminMsg').textContent = t;
function openAdmin() {
  $('admin').style.display = 'flex'; $('adminLocked').style.display = 'block'; $('adminTools').style.display = 'none';
  $('pin').value = ''; $('pinMsg').textContent = ''; $('pin').focus();
}
function closeAdmin() { $('admin').style.display = 'none'; adminOn = false; renderRank(); }

$('pinOk').onclick = () => {
  if ($('pin').value !== ADMIN_PIN) { $('pinMsg').textContent = 'PIN incorreto'; return; }
  adminOn = true; $('adminLocked').style.display = 'none'; $('adminTools').style.display = 'block';
  $('confirmTxt').value = ''; $('clr').disabled = true; adminMsg(''); renderRank();
};
$('pin').addEventListener('keydown', e => { if (e.key === 'Enter') $('pinOk').click(); });
$('adminClose').onclick = closeAdmin;
$('csv').onclick = exportCsv;
$('confirmTxt').oninput = () => $('clr').disabled = $('confirmTxt').value !== 'APAGAR';   // sem confirm() nativo
$('clr').onclick = () => {
  exportCsv();                                                                              // baixa um backup antes de apagar
  try { localStorage.setItem('rank_backup', JSON.stringify(rank)); } catch (e) {}
  rank = []; saveRank(); renderRank(); $('confirmTxt').value = ''; $('clr').disabled = true;
  adminMsg('Ranking apagado. Backup baixado (e guardado para restaurar).');
};
$('restore').onclick = () => {
  try { const b = JSON.parse(localStorage.getItem('rank_backup') || '[]');
    if (b.length) { rank = b; saveRank(); renderRank(); adminMsg('Backup restaurado.'); } else adminMsg('Nenhum backup guardado.'); } catch (e) {}
};
addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); openAdmin(); }
  if (e.key === 'Escape' && $('admin').style.display !== 'none') closeAdmin();
});
let titleClicks = 0, titleTimer;
$('title').onclick = () => { if (++titleClicks >= 5) { titleClicks = 0; openAdmin(); } clearTimeout(titleTimer); titleTimer = setTimeout(() => titleClicks = 0, 1500); };
