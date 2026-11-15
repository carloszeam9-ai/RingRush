// ============ Configurações e utilitários ============
const $ = id => document.getElementById(id);
const ROUND_TIME = 90, SPEED = 55, GAIN = 1.4, SPAWN_Y = 110, CEIL = 220;
const DEADZONE = 3;   // graus de folga ao redor do ponto neutro (evita o avião derivar sozinho)
const dz = v => Math.abs(v) < DEADZONE ? 0 : v - Math.sign(v) * DEADZONE;
const CELL = 100, N = 5, CH = CELL * N, R = 2;   // chunk, célula, células/lado, raio de chunks
const ADMIN_PIN = '1234';   // PIN da área de administração do ranking (TROQUE antes do evento)