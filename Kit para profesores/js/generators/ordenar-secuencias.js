// ===========================================
// GENERADOR: ORDENAR SECUENCIAS
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['ordenar-secuencias'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || datos.proceso || 'Mitosis';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en secuenciación didáctica y procesos científicos STEAM. Tu tarea es dividir el proceso indicado en exactamente 6 a 8 pasos cronológicos o lógicos claros y rigurosos para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera una secuencia de pasos ordenados para la actividad "Ordenar Secuencias".
PROCESO O TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Lee los pasos desordenados y usa las flechas (⬆️ ⬇️) para organizarlos en el orden cronológico correcto.",
  "pasos": [
    { "id": 1, "texto": "Primer paso exacto del proceso cronológico..." },
    { "id": 2, "texto": "Segundo paso exacto del proceso..." },
    { "id": 3, "texto": "Tercer paso del proceso..." },
    { "id": 4, "texto": "Cuarto paso del proceso..." },
    { "id": 5, "texto": "Quinto paso del proceso..." },
    { "id": 6, "texto": "Sexto paso del proceso..." },
    { "id": 7, "texto": "Séptimo paso del proceso (opcional)..." }
  ]
}

Reglas estrictas:
- Entre 6 y 8 pasos en total.
- El campo "id" debe representar el orden cronológico real correcto (1, 2, 3, 4, 5, 6...).
- Los textos deben ser claros, bien explicados y comprensibles para el nivel ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.pasos || !Array.isArray(datos.pasos) || datos.pasos.length < 4) {
      throw new Error('La IA no devolvió la lista de pasos para ordenar.');
    }
    datos.pasos = datos.pasos.slice(0, 8).map((p, idx) => ({
      id: p.id || (idx + 1),
      texto: p.texto.trim()
    }));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const pasosJSON = JSON.stringify(contenido.pasos);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Ordenar Secuencia');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Usa las flechas para ordenar los pasos en la secuencia correcta.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Secuencia: ${tituloTema} | Peidagogos STEAM</title>
  <style>
    :root {
      --primary: #1B2A4A;
      --accent-green: #4CAF50;
      --accent-pink: #E91E63;
      --accent-orange: #FF9800;
      --accent-cyan: #00BCD4;
      --accent-purple: #7B1FA2;
      --bg: #F4F6F8;
      --card-bg: #FFFFFF;
      --text: #212121;
      --text-muted: #616161;
      --border: #E0E0E0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
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
      max-width: 540px;
      background: var(--primary);
      color: white;
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(27,42,74,0.15);
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
      color: #FFF;
    }
    /* Contenedor del Juego */
    .game-container {
      width: 100%;
      max-width: 540px;
      background: var(--card-bg);
      border-radius: 14px;
      padding: 16px 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .game-title {
      font-size: 1.15rem;
      color: var(--primary);
      font-weight: 700;
      text-align: center;
    }
    .game-instruction {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
    }
    /* Marcadores */
    .stats-bar {
      display: flex;
      justify-content: space-between;
      width: 100%;
      background: #ECEFF1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary);
    }
    .timer { color: var(--accent-orange); }
    .moves { color: var(--accent-purple); }
    /* Lista de Pasos */
    .sequence-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .step-card {
      background: #FFFFFF;
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s, border-color 0.2s;
    }
    .step-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #E3F2FD;
      color: #1565C0;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-text {
      flex: 1;
      font-size: 0.9rem;
      color: var(--text);
      line-height: 1.4;
    }
    .step-actions {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
    }
    .arrow-btn {
      background: #ECEFF1;
      border: 1px solid var(--border);
      border-radius: 6px;
      width: 34px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      cursor: pointer;
      color: var(--primary);
      transition: all 0.15s;
    }
    .arrow-btn:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .arrow-btn:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
    .step-card.correct-all {
      background: #E8F5E9 !important;
      border-color: #4CAF50 !important;
    }
    .step-card.correct-all .step-number {
      background: #4CAF50 !important;
      color: white !important;
    }
    /* Modal Victoria */
    .modal-win {
      position: fixed;
      inset: 0;
      background: rgba(27,42,74,0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: popIn 0.4s ease;
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .modal-content h2 {
      font-size: 1.4rem;
      color: var(--accent-green);
      margin-bottom: 8px;
    }
    .modal-content p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
    .btn-restart {
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    .btn-restart:hover { background: #2C3E6B; }
    @keyframes confetiFall { to { top: 110%; transform: rotate(720deg); } }
    @media print {
      body { background: white; padding: 0; }
      .header-inst, .game-container { box-shadow: none; max-width: 100%; }
      .modal-win, .step-actions { display: none !important; }
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
    <h1 class="game-title">📋 Secuencia: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="moves" id="moves">Movimientos: 0</span>
    </div>

    <div class="sequence-list" id="sequenceList"></div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Secuencia Correcta!</h2>
      <p>Has ordenado todos los pasos cronológicos a la perfección.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <p><strong>Movimientos realizados:</strong> <span id="finalMoves">0</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const PASOS_ORIGINALES = ${pasosJSON};

    let pasosActuales = [];
    let movimientos = 0;
    let timerInterval = null;
    let segundos = 0;
    let isWon = false;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      movimientos = 0;
      isWon = false;
      document.getElementById('modalWin').style.display = 'none';
      document.getElementById('moves').textContent = 'Movimientos: 0';
      iniciarCronometro();
      desordenarPasos();
      renderizarLista();
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

    function desordenarPasos() {
      let shuffled = [...PASOS_ORIGINALES];
      let attempts = 0;

      // Asegurar que no empiece ordenado
      do {
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        attempts++;
      } while (estaOrdenado(shuffled) && attempts < 10);

      pasosActuales = shuffled;
    }

    function estaOrdenado(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id !== (i + 1)) return false;
      }
      return true;
    }

    function renderizarLista() {
      const list = document.getElementById('sequenceList');
      list.innerHTML = '';

      pasosActuales.forEach((paso, index) => {
        const card = document.createElement('div');
        card.className = 'step-card' + (isWon ? ' correct-all' : '');
        card.dataset.index = index;

        const num = document.createElement('div');
        num.className = 'step-number';
        num.textContent = (index + 1);

        const text = document.createElement('div');
        text.className = 'step-text';
        text.textContent = paso.texto;

        card.appendChild(num);
        card.appendChild(text);

        if (!isWon) {
          const actions = document.createElement('div');
          actions.className = 'step-actions';

          const btnUp = document.createElement('button');
          btnUp.type = 'button';
          btnUp.className = 'arrow-btn';
          btnUp.innerHTML = '⬆️';
          btnUp.disabled = (index === 0);
          btnUp.addEventListener('click', () => moverPaso(index, -1));

          const btnDown = document.createElement('button');
          btnDown.type = 'button';
          btnDown.className = 'arrow-btn';
          btnDown.innerHTML = '⬇️';
          btnDown.disabled = (index === pasosActuales.length - 1);
          btnDown.addEventListener('click', () => moverPaso(index, 1));

          actions.appendChild(btnUp);
          actions.appendChild(btnDown);
          card.appendChild(actions);
        }

        list.appendChild(card);
      });
    }

    function moverPaso(index, delta) {
      if (isWon) return;
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= pasosActuales.length) return;

      // Intercambiar
      const temp = pasosActuales[index];
      pasosActuales[index] = pasosActuales[targetIndex];
      pasosActuales[targetIndex] = temp;

      movimientos++;
      document.getElementById('moves').textContent = 'Movimientos: ' + movimientos;

      // Verificar si ya está en orden correcto
      if (estaOrdenado(pasosActuales)) {
        isWon = true;
        renderizarLista();
        setTimeout(finalizarJuego, 300);
      } else {
        renderizarLista();
      }
    }

    function finalizarJuego() {
      clearInterval(timerInterval);
      const mins = String(Math.floor(segundos / 60)).padStart(2, '0');
      const secs = String(segundos % 60).padStart(2, '0');
      document.getElementById('finalTime').textContent = mins + ':' + secs;
      document.getElementById('finalMoves').textContent = movimientos;
      document.getElementById('modalWin').style.display = 'flex';
      lanzarConfeti();
    }

    function lanzarConfeti() {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      const colores = ['#4CAF50','#E91E63','#FF9800','#00BCD4','#7B1FA2','#FFD700'];
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
