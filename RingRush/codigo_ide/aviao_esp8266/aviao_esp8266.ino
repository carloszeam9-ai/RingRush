/*
  Controle de avião 3D - ESP8266 (NodeMCU) + MPU6050
  Biblioteca necessária (Gerenciador de Bibliotecas): "WebSockets" by Markus Sattler (Links2004)

  Ligações:
    MPU6050 VCC -> 3V3
    MPU6050 GND -> GND
    MPU6050 SDA -> D2 (GPIO4)
    MPU6050 SCL -> D1 (GPIO5)
*/
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>

#include "secrets.h"   // WIFI_SSID e WIFI_PASS ficam nesse arquivo (que NÃO vai para o GitHub)

const uint8_t MPU_ADDR = 0x68;
const int SDA_PIN = 4;  // D2
const int SCL_PIN = 5;  // D1

WebSocketsServer ws(81);

float pitch = 0, roll = 0;
float gxOff = 0, gyOff = 0;
unsigned long lastUs = 0, lastSend = 0;

void mpuWrite(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

bool mpuRead(int16_t* v) {  // ax ay az temp gx gy gz
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)MPU_ADDR, 14) != 14) return false;
  for (int i = 0; i < 7; i++) {
    v[i] = (Wire.read() << 8) | Wire.read();
  }
  return true;
}

void calibrate() {
  // Deixe o sensor parado e nivelado durante ~2 segundos
  long sx = 0, sy = 0;
  int n = 0;
  int16_t v[7];
  for (int i = 0; i < 200; i++) {
    if (mpuRead(v)) { sx += v[4]; sy += v[5]; n++; }
    delay(10);
  }
  if (n) { gxOff = sx / (float)n; gyOff = sy / (float)n; }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);   // I2C rápido (400 kHz): leitura do sensor mais ágil
  mpuWrite(0x6B, 0x00);  // acorda o MPU6050
  mpuWrite(0x1B, 0x00);  // giroscópio ±250°/s (131 LSB/°/s)
  mpuWrite(0x1C, 0x00);  // acelerômetro ±2g (16384 LSB/g)
  mpuWrite(0x1A, 0x02);  // filtro digital ~94 Hz: tira o ruído do sensor, custa só ~3 ms

  Serial.println("\nCalibrando... mantenha parado.");
  calibrate();

  WiFi.mode(WIFI_STA);
  WiFi.setSleepMode(WIFI_NONE_SLEEP);   // desliga a economia de energia do WiFi: menos atraso e menos oscilação
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) { delay(400); Serial.print("."); }
  Serial.print("\nIP do ESP: ");
  Serial.println(WiFi.localIP());  // digite este IP na página do jogo

  ws.begin();
  lastUs = micros();
}

void loop() {
  ws.loop();

  int16_t v[7];
  if (!mpuRead(v)) return;

  unsigned long now = micros();
  float dt = (now - lastUs) / 1e6f;
  lastUs = now;
  if (dt > 0.05f) dt = 0.05f;

  float ax = v[0], ay = v[1], az = v[2];
  float gx = (v[4] - gxOff) / 131.0f;
  float gy = (v[5] - gyOff) / 131.0f;

  // ângulos pelo acelerômetro (graus)
  float accRoll  = atan2f(ay, az) * 57.2958f;
  float accPitch = atan2f(-ax, sqrtf(ay * ay + az * az)) * 57.2958f;

  // Filtro complementar com constante de tempo (não depende da velocidade do loop).
  // O giroscópio manda no curto prazo (rápido e suave); o acelerômetro só corrige a deriva, devagar.
  static bool started = false;
  if (!started) { roll = accRoll; pitch = accPitch; started = true; }
  const float TAU = 0.25f;                                      // segundos (menor = mais "nervoso", maior = mais suave)
  float a = TAU / (TAU + dt);
  float mag = sqrtf(ax * ax + ay * ay + az * az) / 16384.0f;    // ~1,0 g com o sensor parado
  roll  += gx * dt;
  pitch += gy * dt;
  if (fabsf(mag - 1.0f) < 0.25f) {                              // ignora o acelerômetro quando a mão balança forte
    roll  = a * roll  + (1 - a) * accRoll;
    pitch = a * pitch + (1 - a) * accPitch;
  }

  if (millis() - lastSend >= 10) {  // 100 Hz
    lastSend = millis();
    char buf[32];
    snprintf(buf, sizeof(buf), "%.1f,%.1f", pitch, roll);
    ws.broadcastTXT(buf);
  }
}
