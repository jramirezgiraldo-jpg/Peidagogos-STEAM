// ===========================================
// GENERADOR: EMPAREJAR
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['emparejar'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en pedagogía STEAM y diseño de actividades de emparejamiento. Tu tarea es generar exactamente 10 pares de CONCEPTO y DEFINICIÓN sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera 10 pares de concepto y definición para una actividad de emparejar columnas.
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Toca un concepto en la columna izquierda y luego su definición correspondiente en la derecha para emparejarlos.",
  "pares": [
    { "id": 1, "concepto": "Concepto 1", "definicion": "Definición clara, concisa y pedagógica del concepto 1." },
    { "id": 2, "concepto": "Concepto 2", "definicion": "Definición clara, concisa y pedagógica del concepto 2." },
    { "id": 3, "concepto": "Concepto 3", "definicion": "Definición clara, concisa y pedagógica del concepto 3." },
    { "id": 4, "concepto": "Concepto 4", "definicion": "Definición clara, concisa y pedagógica del concepto 4." },
    { "id": 5, "concepto": "Concepto 5", "definicion": "Definición clara, concisa y pedagógica del concepto 5." },
    { "id": 6, "concepto": "Concepto 6", "definicion": "Definición clara, concisa y pedagógica del concepto 6." },
    { "id": 7, "concepto": "Concepto 7", "definicion": "Definición clara, concisa y pedagógica del concepto 7." },
    { "id": 8, "concepto": "Concepto 8", "definicion": "Definición clara, concisa y pedagógica del concepto 8." },
    { "id": 9, "concepto": "Concepto 9", "definicion": "Definición clara, concisa y pedagógica del concepto 9." },
    { "id": 10, "concepto": "Concepto 10", "definicion": "Definición clara, concisa y pedagógica del concepto 10." }
  ]
}

Reglas estrictas:
- Exactamente 10 pares.
- Los conceptos deben ser breves (1 a 3 palabras).
- Las definiciones deben ser claras, directas (1 a 2 frases breves).
- Todo adaptado al nivel educativo ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.pares || !Array.isArray(datos.pares) || datos.pares.length < 5) {
      throw new Error('La IA no devolvió los 10 pares de concepto y definición requeridos.');
    }
    datos.pares = datos.pares.slice(0, 10).map((p, idx) => ({
      id: p.id || (idx + 1),
      concepto: p.concepto.trim(),
      definicion: p.definicion.trim()
    }));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const paresJSON = JSON.stringify(contenido.pares);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Emparejar');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Toca un concepto y luego su definición para emparejarlos.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Emparejar: ${tituloTema} | Peidagogos STEAM</title>
  <style>
    :root {
      --primary: #1B2A4A;
      --accent-green: #4CAF50;
      --accent-pink: #E91E63;
      --accent-orange: #FF9800;
      --accent-cyan: #00BCD4;
      --accent-purple: #7B1FA2;
      --bg: #F9F9F9;
      --card-bg: #FFFFFF;
      --text: #212121;
      --text-muted: #616161;
      --border: #E0E0E0;
      --selected-border: #2196F3;
      --selected-bg: #E3F2FD;
      --correct-bg: #E8F5E9;
      --correct-border: #4CAF50;
      --error-bg: #FFEBEE;
      --error-border: #F44336;
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
      max-width: 600px;
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
      max-width: 600px;
      background: var(--card-bg);
      border-radius: 14px;
      padding: 14px;
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
    .progress { color: var(--accent-green); }
    /* Columnas de Emparejar */
    .columns-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      width: 100%;
      margin: 4px 0;
    }
    .match-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .col-header {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      text-align: center;
      padding-bottom: 4px;
      border-bottom: 2px solid var(--border);
    }
    /* Tarjetas */
    .match-card {
      background: #FFFFFF;
      border: 2px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 0.85rem;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 52px;
      line-height: 1.3;
    }
    .match-card:hover {
      border-color: var(--accent-cyan);
      transform: translateY(-1px);
    }
    .match-card.selected {
      background: var(--selected-bg) !important;
      border-color: var(--selected-border) !important;
      border-width: 2.5px;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
      transform: scale(1.02);
    }
    .match-card.correct {
      background: var(--correct-bg) !important;
      border-color: var(--correct-border) !important;
      color: #2E7D32 !important;
      font-weight: 600;
      cursor: default;
      opacity: 0.85;
      transform: scale(0.98);
      pointer-events: none;
    }
    .match-card.wrong {
      background: var(--error-bg) !important;
      border-color: var(--error-border) !important;
      color: #C62828 !important;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
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
      margin-bottom: 16px;
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
      .modal-win { display: none !important; }
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
    <h1 class="game-title">🔗 Emparejar: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="progress" id="progress">Parejas encontradas: 0 / 10</span>
    </div>

    <div class="columns-wrapper">
      <div class="match-column" id="colA">
        <div class="col-header">📌 Conceptos</div>
      </div>
      <div class="match-column" id="colB">
        <div class="col-header">📖 Definiciones</div>
      </div>
    </div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Todas las Parejas Encontradas!</h2>
      <p>Has emparejado con éxito todos los conceptos con sus definiciones.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const PARES_BASE = ${paresJSON};

    let selectedConcept = null;
    let selectedDefinition = null;
    let parejasResueltas = 0;
    let isEvaluating = false;
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      parejasResueltas = 0;
      selectedConcept = null;
      selectedDefinition = null;
      isEvaluating = false;
      document.getElementById('modalWin').style.display = 'none';
      actualizarProgreso();
      iniciarCronometro();
      renderizarColumnas();
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

    function shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function renderizarColumnas() {
      const colA = document.getElementById('colA');
      const colB = document.getElementById('colB');

      // Limpiar tarjetas anteriores manteniendo el header
      colA.innerHTML = '<div class="col-header">📌 Conceptos</div>';
      colB.innerHTML = '<div class="col-header">📖 Definiciones</div>';

      const conceptosMezclados = shuffleArray(PARES_BASE);
      const definicionesMezcladas = shuffleArray(PARES_BASE);

      conceptosMezclados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.id = item.id;
        card.dataset.type = 'concept';
        card.textContent = item.concepto;
        card.addEventListener('click', () => alClickTarjeta(card));
        colA.appendChild(card);
      });

      definicionesMezcladas.forEach(item => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.dataset.id = item.id;
        card.dataset.type = 'definition';
        card.textContent = item.definicion;
        card.addEventListener('click', () => alClickTarjeta(card));
        colB.appendChild(card);
      });
    }

    function alClickTarjeta(card) {
      if (isEvaluating || card.classList.contains('correct')) return;

      const type = card.dataset.type;

      if (type === 'concept') {
        if (selectedConcept === card) {
          // Deseleccionar si toca la misma
          selectedConcept.classList.remove('selected');
          selectedConcept = null;
          return;
        }
        if (selectedConcept) selectedConcept.classList.remove('selected');
        selectedConcept = card;
        selectedConcept.classList.add('selected');
      } else {
        if (selectedDefinition === card) {
          selectedDefinition.classList.remove('selected');
          selectedDefinition = null;
          return;
        }
        if (selectedDefinition) selectedDefinition.classList.remove('selected');
        selectedDefinition = card;
        selectedDefinition.classList.add('selected');
      }

      // Si ambas están seleccionadas, evaluar
      if (selectedConcept && selectedDefinition) {
        evaluarPareja();
      }
    }

    function evaluarPareja() {
      isEvaluating = true;
      const cId = selectedConcept.dataset.id;
      const dId = selectedDefinition.dataset.id;

      if (cId === dId) {
        // Correcto!
        selectedConcept.classList.remove('selected');
        selectedDefinition.classList.remove('selected');
        selectedConcept.classList.add('correct');
        selectedDefinition.classList.add('correct');

        parejasResueltas++;
        actualizarProgreso();

        selectedConcept = null;
        selectedDefinition = null;
        isEvaluating = false;

        if (parejasResueltas === PARES_BASE.length) {
          finalizarJuego();
        }
      } else {
        // Incorrecto
        selectedConcept.classList.add('wrong');
        selectedDefinition.classList.add('wrong');

        setTimeout(() => {
          if (selectedConcept) {
            selectedConcept.classList.remove('selected', 'wrong');
            selectedConcept = null;
          }
          if (selectedDefinition) {
            selectedDefinition.classList.remove('selected', 'wrong');
            selectedDefinition = null;
          }
          isEvaluating = false;
        }, 800);
      }
    }

    function actualizarProgreso() {
      document.getElementById('progress').textContent = 'Parejas encontradas: ' + parejasResueltas + ' / ' + PARES_BASE.length;
    }

    function finalizarJuego() {
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
