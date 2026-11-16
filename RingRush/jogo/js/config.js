// ============ Configurações e utilitários ============
const $ = id => document.getElementById(id);
const ROUND_TIME = 90, SPEED = 55, GAIN = 1.6, SPAWN_Y = 110, CEIL = 220;
const DEADZONE = 3;   // graus de folga ao redor do ponto neutro (evita o avião derivar sozinho)
const dz = v => Math.abs(v) < DEADZONE ? 0 : v - Math.sign(v) * DEADZONE;
const CELL = 100, N = 5, CH = CELL * N, R = 2;   // chunk, célula, células/lado, raio de chunks
const ADMIN_PIN = '1234';   // PIN da área de administração do ranking (TROQUE antes do evento)

// ---- Resposta do controle (aumente para ficar mais rápido/sensível) ----
const SMOOTH = 20;       // velocidade com que o avião acompanha a mão (antes era 6 = lento). 12 = suave, 30 = quase direto
const TURN_RATE = 1.7;   // quão rápido o avião curva ao inclinar (antes 1.3)
const CAM_FOLLOW = 12;   // quão colada a câmera segue o avião (antes 6)

// ---- Seleção de avião ----
const PLANE_SELECT = false;
const FIXED_PLANE = 'jato';
