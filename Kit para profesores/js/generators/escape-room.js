// ===========================================
// GENERADOR: ESCAPE ROOM (CANDADO DIGITAL)
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['escape-room'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || datos.mision || 'genética';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en gamificación educativa STEAM y diseño de Escape Rooms pedagógicos. Tu tarea es diseñar una misión de 4 salas consecutivas donde cada sala tiene un acertijo científico retador cuya respuesta lógica o deducción sea un código numérico secreto de 3 a 4 dígitos para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Crea un Escape Room educativo de 4 salas consecutivas sobre:
TEMA / MISIÓN: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Resuelve el acertijo científico de cada sala para descubrir el código secreto. Usa el teclado digital en pantalla para abrir el candado y avanzar.",
  "salas": [
    {
      "sala": 1,
      "nombre": "Sala 1: El Laboratorio de Muestras",
      "acertijo": "Texto detallado del acertijo con pistas lógicas o matemáticas claras que lleven a deducir el código numérico...",
      "pistaAyuda": "Una pequeña pista contextual...",
      "codigo": "1234"
    },
    {
      "sala": 2,
      "nombre": "Sala 2: La Cámara de Análisis",
      "acertijo": "Texto detallado del segundo acertijo científico...",
      "pistaAyuda": "Pista contextual...",
      "codigo": "567"
    },
    {
      "sala": 3,
      "nombre": "Sala 3: El Banco de Datos Genéticos",
      "acertijo": "Texto detallado del tercer acertijo científico...",
      "pistaAyuda": "Pista contextual...",
      "codigo": "8901"
    },
    {
      "sala": 4,
      "nombre": "Sala 4: La Bóveda Central",
      "acertijo": "Texto del acertijo final más retador...",
      "pistaAyuda": "Pista final...",
      "codigo": "2024"
    }
  ]
}

Reglas estrictas:
- Exactamente 4 salas.
- Cada sala debe tener un campo "codigo" que sea un string de 3 o 4 dígitos numéricos (ej. "482" o "1953").
- Los acertijos deben tener sentido científico y pedagógico para el nivel ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.salas || !Array.isArray(datos.salas) || datos.salas.length < 3) {
      throw new Error('La IA no devolvió las salas requeridas para el escape room.');
    }
    datos.salas = datos.salas.slice(0, 4).map((s, idx) => ({
      sala: s.sala || (idx + 1),
      nombre: s.nombre || `Sala ${idx + 1}`,
      acertijo: s.acertijo.trim(),
      pistaAyuda: s.pistaAyuda ? s.pistaAyuda.trim() : '',
      codigo: String(s.codigo).replace(/\D/g, '') || '123'
    }));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const salasJSON = JSON.stringify(contenido.salas);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Escape Room');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Resuelve el acertijo de cada sala y usa el teclado para abrir el candado.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Escape Room: ${tituloTema} | Peidagogos STEAM</title>
  <style>
    :root {
      --dark-bg: #0D1B2A;
      --dark-card: #1B263B;
      --neon-cyan: #00E5FF;
      --neon-green: #00E676;
      --neon-pink: #FF1744;
      --text-light: #E0E1DD;
      --text-muted: #778DA9;
      --primary: #1B2A4A;
      --border: #415A77;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--dark-bg);
      color: var(--text-light);
      line-height: 1.4;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      -webkit-user-select: none;
      user-select: none;
    }
    /* Header Institucional */
    .header-inst {
      width: 100%;
      max-width: 520px;
      background: #000814;
      color: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      box-shadow: 0 2px 12px rgba(0,229,255,0.1);
    }
    .header-inst img {
      height: 38px;
      width: auto;
      object-fit: contain;
      background: white;
      border-radius: 6px;
      padding: 2px;
    }
    .header-inst-info {
      flex: 1;
      font-size: 0.82rem;
      line-height: 1.3;
    }
    .header-inst-info strong {
      display: block;
      font-size: 0.95rem;
      color: var(--neon-cyan);
    }
    /* Contenedor Principal */
    .game-container {
      width: 100%;
      max-width: 520px;
      background: var(--dark-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .game-title {
      font-size: 1.2rem;
      color: var(--neon-cyan);
      font-weight: 700;
      text-align: center;
      text-shadow: 0 0 10px rgba(0,229,255,0.4);
    }
    /* Marcadores */
    .stats-bar {
      display: flex;
      justify-content: space-between;
      width: 100%;
      background: #0D1B2A;
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .timer { color: #FFB74D; }
    .room-badge { color: var(--neon-green); }
    /* Panel del Acertijo */
    .riddle-panel {
      width: 100%;
      background: #0D1B2A;
      border: 1px solid var(--border);
      border-left: 4px solid var(--neon-cyan);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .room-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--neon-cyan);
    }
    .riddle-text {
      font-size: 0.95rem;
      color: var(--text-light);
      line-height: 1.6;
    }
    .clue-hint {
      font-size: 0.82rem;
      color: #90CAF9;
      font-style: italic;
    }
    /* Display del Candado */
    .lock-display-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin: 4px 0;
    }
    .lock-icon-status {
      font-size: 1.6rem;
    }
    .lock-display {
      background: #000814;
      border: 2px solid var(--neon-cyan);
      border-radius: 12px;
      padding: 10px 20px;
      display: flex;
      gap: 12px;
      justify-content: center;
      min-width: 220px;
      box-shadow: inset 0 0 12px rgba(0,229,255,0.2), 0 0 16px rgba(0,229,255,0.15);
      transition: all 0.2s;
    }
    .display-digit {
      font-size: 1.8rem;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: var(--neon-cyan);
      min-width: 24px;
      text-align: center;
      border-bottom: 2px solid var(--border);
    }
    .display-digit.filled {
      border-color: var(--neon-cyan);
      color: #FFFFFF;
      text-shadow: 0 0 8px var(--neon-cyan);
    }
    .lock-display.correct {
      border-color: var(--neon-green) !important;
      box-shadow: 0 0 24px var(--neon-green) !important;
    }
    .lock-display.correct .display-digit {
      color: var(--neon-green) !important;
      border-color: var(--neon-green) !important;
    }
    .lock-display.wrong {
      border-color: var(--neon-pink) !important;
      box-shadow: 0 0 24px var(--neon-pink) !important;
      animation: displayShake 0.4s ease;
    }
    .lock-display.wrong .display-digit {
      color: var(--neon-pink) !important;
      border-color: var(--neon-pink) !important;
    }
    @keyframes displayShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    /* Teclado Táctil en Pantalla */
    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      width: 100%;
      max-width: 320px;
    }
    .key-btn {
      background: #0D1B2A;
      color: white;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 0;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.1s;
      touch-action: manipulation;
    }
    .key-btn:active {
      background: var(--neon-cyan);
      color: #000;
      transform: scale(0.94);
    }
    .key-btn.action-btn {
      font-size: 1.1rem;
    }
    .btn-delete {
      background: #370617;
      border-color: #6A040F;
      color: #FF8FA3;
    }
    .btn-delete:active {
      background: #D00000;
      color: white;
    }
    .btn-unlock {
      background: #004B23;
      border-color: #007200;
      color: #70E000;
      font-weight: 700;
    }
    .btn-unlock:active {
      background: var(--neon-green);
      color: #000;
    }
    /* Modal Victoria */
    .modal-win {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-content {
      background: var(--dark-card);
      border: 2px solid var(--neon-green);
      border-radius: 16px;
      padding: 26px 20px;
      text-align: center;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 0 40px rgba(0,230,118,0.3);
      animation: popIn 0.4s ease;
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .modal-content h2 {
      font-size: 1.4rem;
      color: var(--neon-green);
      margin-bottom: 8px;
    }
    .modal-content p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 14px;
    }
    .btn-restart {
      background: var(--neon-cyan);
      color: #000814;
      border: none;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    }
    .btn-restart:hover {
      background: #80D8FF;
      box-shadow: 0 0 16px var(--neon-cyan);
    }
    @keyframes confetiFall { to { top: 110%; transform: rotate(720deg); } }
    @media print {
      body { background: white; color: black; padding: 0; }
      .header-inst, .game-container { box-shadow: none; max-width: 100%; border: 1px solid #ccc; background: white; color: black; }
      .modal-win, .keypad-grid { display: none !important; }
      .riddle-panel { background: white; color: black; border-color: #ccc; }
      .room-name { color: #000; }
      .riddle-text { color: #333; }
    }
  </style>
</head>
<body>

  <header class="header-inst">
    ${logoBase64 ? `<img src="${logoBase64}" alt="Logo Peidagogos STEAM">` : ''}
    <div class="header-inst-info">
      <strong>Peidagogos STEAM</strong>
      <span>Docente: ${docente}</span> | <span>Tema: ${tituloTema}</span>
    </div>
  </header>

  <main class="game-container">
    <h1 class="game-title">🔐 Escape Room: ${tituloTema}</h1>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="room-badge" id="roomProgress">Sala 1 / 4</span>
    </div>

    <div class="riddle-panel">
      <div class="room-name" id="roomName">Cargando sala...</div>
      <div class="riddle-text" id="riddleText">...</div>
      <div class="clue-hint" id="clueHint"></div>
    </div>

    <div class="lock-display-wrapper">
      <div class="lock-icon-status" id="lockIcon">🔒</div>
      <div class="lock-display" id="lockDisplay"></div>
    </div>

    <!-- Teclado en pantalla (cero inputs nativos de celular) -->
    <div class="keypad-grid" id="keypadGrid">
      <button type="button" class="key-btn" data-key="1">1</button>
      <button type="button" class="key-btn" data-key="2">2</button>
      <button type="button" class="key-btn" data-key="3">3</button>
      <button type="button" class="key-btn" data-key="4">4</button>
      <button type="button" class="key-btn" data-key="5">5</button>
      <button type="button" class="key-btn" data-key="6">6</button>
      <button type="button" class="key-btn" data-key="7">7</button>
      <button type="button" class="key-btn" data-key="8">8</button>
      <button type="button" class="key-btn" data-key="9">9</button>
      <button type="button" class="key-btn action-btn btn-delete" id="btnDelete">⌫</button>
      <button type="button" class="key-btn" data-key="0">0</button>
      <button type="button" class="key-btn action-btn btn-unlock" id="btnUnlock">🔓</button>
    </div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Escape Exitoso!</h2>
      <p>Has descifrado todos los códigos y superado todas las salas de la misión.</p>
      <p><strong>Tiempo total de escape:</strong> <span id="finalTime">00:00</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const SALAS = ${salasJSON};

    let salaActualIndex = 0;
    let inputActual = '';
    let isLocked = false;
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarMision();
      vincularTeclado();
      document.getElementById('btnRestart').addEventListener('click', iniciarMision);
    });

    function iniciarMision() {
      salaActualIndex = 0;
      inputActual = '';
      isLocked = false;
      segundos = 0;
      document.getElementById('modalWin').style.display = 'none';
      iniciarCronometro();
      cargarSala(0);
    }

    function iniciarCronometro() {
      clearInterval(timerInterval);
      document.getElementById('timer').textContent = '⏱️ 00:00';
      timerInterval = setInterval(() => {
        segundos++;
        const mins = String(Math.floor(segundos / 60)).padStart(2, '0');
        const secs = String(segundos % 60).padStart(2, '0');
        document.getElementById('timer').textContent = '⏱️ ' + mins + ':' + secs;
      }, 1000);
    }

    function cargarSala(idx) {
      if (idx >= SALAS.length) {
        finalizarMision();
        return;
      }

      salaActualIndex = idx;
      inputActual = '';
      isLocked = false;

      const sala = SALAS[salaActualIndex];
      document.getElementById('roomProgress').textContent = 'Sala ' + (salaActualIndex + 1) + ' / ' + SALAS.length;
      document.getElementById('roomName').textContent = sala.nombre;
      document.getElementById('riddleText').textContent = sala.acertijo;
      document.getElementById('clueHint').textContent = sala.pistaAyuda ? ('💡 ' + sala.pistaAyuda) : '';
      document.getElementById('lockIcon').textContent = '🔒';

      renderizarDisplay();
    }

    function renderizarDisplay() {
      const display = document.getElementById('lockDisplay');
      display.className = 'lock-display';
      display.innerHTML = '';

      const sala = SALAS[salaActualIndex];
      const codeLen = sala.codigo.length;

      for (let i = 0; i < codeLen; i++) {
        const digitSpan = document.createElement('span');
        digitSpan.className = 'display-digit' + (i < inputActual.length ? ' filled' : '');
        digitSpan.textContent = i < inputActual.length ? inputActual[i] : '_';
        display.appendChild(digitSpan);
      }
    }

    function vincularTeclado() {
      // Botones numéricos 0-9
      document.querySelectorAll('.key-btn[data-key]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (isLocked) return;
          const sala = SALAS[salaActualIndex];
          if (inputActual.length < sala.codigo.length) {
            inputActual += btn.dataset.key;
            renderizarDisplay();
          }
        });
      });

      // Botón borrar
      document.getElementById('btnDelete').addEventListener('click', () => {
        if (isLocked) return;
        if (inputActual.length > 0) {
          inputActual = inputActual.slice(0, -1);
          renderizarDisplay();
        }
      });

      // Botón desbloquear
      document.getElementById('btnUnlock').addEventListener('click', validarCodigo);
    }

    function validarCodigo() {
      if (isLocked) return;
      const sala = SALAS[salaActualIndex];

      if (inputActual.length === 0) return;

      isLocked = true;
      const display = document.getElementById('lockDisplay');

      if (inputActual === sala.codigo) {
        // ¡Código Correcto!
        display.classList.add('correct');
        document.getElementById('lockIcon').textContent = '🔓';

        setTimeout(() => {
          cargarSala(salaActualIndex + 1);
        }, 1200);
      } else {
        // Código Incorrecto
        display.classList.add('wrong');

        setTimeout(() => {
          inputActual = '';
          display.classList.remove('wrong');
          renderizarDisplay();
          isLocked = false;
        }, 800);
      }
    }

    function finalizarMision() {
      clearInterval(timerInterval);
      const mins = String(Math.floor(segundos / 60)).padStart(2, '0');
      const secs = String(segundos % 60).padStart(2, '0');
      document.getElementById('finalTime').textContent = mins + ':' + secs;
      document.getElementById('modalWin').style.display = 'flex';
      lanzarConfeti();
    }

    function lanzarConfeti() {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      const colores = ['#00E5FF','#00E676','#FF1744','#FFD700','#E0E1DD'];
      for (let i = 0; i < 70; i++) {
        const c = document.createElement('div');
        c.style.cssText = 'position:absolute;width:' + (6 + Math.random()*8) + 'px;height:' + (6 + Math.random()*8) + 'px;background:' + colores[i % colores.length] + ';left:' + (Math.random()*100) + '%;top:-10px;border-radius:' + (Math.random()>0.5 ? '50%' : '2px') + ';animation:confetiFall ' + (2 + Math.random()*3) + 's ease-in forwards;animation-delay:' + (Math.random()*0.5) + 's;';
        container.appendChild(c);
      }
      setTimeout(() => container.remove(), 6000);
    }
  </script>
</body>
</html>`;
  }
};
