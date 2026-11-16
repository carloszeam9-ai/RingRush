# ✈ Ring Rush

Jogo de voo 3D controlado **inclinando um sensor de giroscópio** (MPU6050 + ESP8266 NodeMCU).
Você voa entre prédios de uma cidade infinita ao pôr do sol, atravessa anéis, faz combos e entra no ranking.
Feito para ser jogado por muita gente em eventos.

## Como funciona
```
MPU6050 → ESP8266 (WiFi, WebSocket) → página do jogo no navegador (three.js)
```
O ESP lê a inclinação 100x por segundo e envia ao navegador. O jogo roda inteiro no navegador.

## O que você precisa
- NodeMCU (ESP8266) e sensor MPU6050 (GY-521)
- Arduino IDE com a placa **esp8266** e a biblioteca **WebSockets** (Markus Sattler)
- Um navegador moderno (o PC precisa de internet, para carregar o three.js)

## Ligações
| MPU6050 | NodeMCU |
|---------|---------|
| VCC     | 3V3     |
| GND     | GND     |
| SDA     | D2      |
| SCL     | D1      |

## Instalação
1. Em `codigo_ide/aviao_esp8266/`, copie `secrets.example.h` para `secrets.h` e preencha o nome e a senha do seu WiFi (**2,4 GHz**).
2. Abra `codigo_ide/aviao_esp8266/aviao_esp8266.ino` na Arduino IDE, escolha a placa *NodeMCU 1.0 (ESP-12E)* e grave.
3. Abra o Monitor Serial (115200) e anote o **IP** do ESP.
4. Abra `jogo/jogo.html` no navegador (duplo clique), digite o IP e clique em **Conectar**.

Sem o sensor, dá para jogar com as setas ou WASD.

## Controles
- Inclinar para os lados: rola e curva. Inclinar para frente ou para trás: desce ou sobe.
- **C**: zera o ponto neutro do sensor.
- **F3**: painel de diagnóstico (FPS, leituras por segundo e gráfico do sensor).
- Setas ◀ ▶ na tela inicial: escolhe entre 12 aviões.
- Se os eixos estiverem errados, use **trocar eixos**, **inverter pitch** e **inverter roll** no canto da tela.

## Ranking e administração
O ranking fica salvo no navegador. Para exportar, limpar ou remover um nome, abra a administração
com **Ctrl+Shift+A** (ou 5 cliques no título). O PIN padrão é `1234`: troque em `js/config.js` (`ADMIN_PIN`).

## Estrutura
```
RingRush/
├── codigo_ide/aviao_esp8266/   firmware do ESP8266 (abra o .ino na Arduino IDE)
│   ├── aviao_esp8266.ino
│   ├── secrets.example.h       modelo; copie para secrets.h (não vai ao GitHub)
│   └── secrets.h
└── jogo/                       o jogo (abra o jogo.html no navegador)
    ├── jogo.html
    ├── css/style.css
    └── js/                     config, scene, planes, city, rank, audio, input, game
```

## Versão do evento (sem seleção de avião)
Em `jogo/js/config.js`, troque `PLANE_SELECT` para `false` e escolha o avião em `FIXED_PLANE`.
A sensibilidade do controle também fica ali (`GAIN`, `SMOOTH`, `TURN_RATE`, `DEADZONE`).

## Observação sobre GitHub Pages
O navegador bloqueia a conexão do sensor (`ws://`) em páginas `https://`. Para jogar com o sensor,
abra o `jogo.html` do disco; em um site publicado só funciona o modo teclado.
