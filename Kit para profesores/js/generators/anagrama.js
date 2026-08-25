// ===========================================
// GENERADOR: ANAGRAMA (ORDENAR LETRAS)
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['anagrama'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en diseño de juegos de lenguaje y ciencias STEAM. Tu tarea es generar exactamente 10 pares de PALABRA CLAVE y PISTA DESCRIPTIVA sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera 10 palabras y pistas para un juego de Anagrama (ordenar letras por niveles).
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Lee la pista y toca las letras en el orden correcto para descubrir la palabra oculta.",
  "niveles": [
    { "palabra": "PALABRA1", "pista": "Pista educativa clara y concisa para la palabra 1" },
    { "palabra": "PALABRA2", "pista": "Pista educativa clara y concisa para la palabra 2" },
    { "palabra": "PALABRA3", "pista": "Pista educativa clara y concisa para la palabra 3" },
    { "palabra": "PALABRA4", "pista": "Pista educativa clara y concisa para la palabra 4" },
    { "palabra": "PALABRA5", "pista": "Pista educativa clara y concisa para la palabra 5" },
    { "palabra": "PALABRA6", "pista": "Pista educativa clara y concisa para la palabra 6" },
    { "palabra": "PALABRA7", "pista": "Pista educativa clara y concisa para la palabra 7" },
    { "palabra": "PALABRA8", "pista": "Pista educativa clara y concisa para la palabra 8" },
    { "palabra": "PALABRA9", "pista": "Pista educativa clara y concisa para la palabra 9" },
    { "palabra": "PALABRA10", "pista": "Pista educativa clara y concisa para la palabra 10" }
  ]
}

Reglas estrictas:
- Exactamente 10 niveles.
- Cada palabra debe ser una sola palabra sin espacios ni guiones, de 4 a 10 letras.
- Mayúsculas y sin tildes.
- Las pistas deben ser directas y pedagógicamente enriquecedoras.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.niveles || !Array.isArray(datos.niveles) || datos.niveles.length < 5) {
      throw new Error('La IA no devolvió los 10 niveles requeridos para el anagrama.');
    }
    datos.niveles = datos.niveles.slice(0, 10).map(n => ({
      palabra: normalizarTexto(n.palabra),
      pista: n.pista.trim()
    }));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const nivelesJSON = JSON.stringify(contenido.niveles);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Anagrama');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Lee la pista y toca las letras en el orden correcto.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Anagrama: ${tituloTema} | Peidagogos STEAM</title>
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
      --border: #D0D7DE;
      --tile-size: min(10vw, 44px);
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
      max-width: 520px;
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
      max-width: 520px;
      background: var(--card-bg);
      border-radius: 14px;
      padding: 18px 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
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
    .level { color: var(--accent-cyan); }
    /* Tarjeta de la Pista */
    .clue-card {
      width: 100%;
      background: #E1F5FE;
      border-left: 4px solid var(--accent-cyan);
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 0.95rem;
      color: var(--primary);
      line-height: 1.4;
      text-align: center;
    }
    .clue-card strong { display: block; font-size: 0.8rem; color: #0288D1; margin-bottom: 2px; }
    /* Área de Respuesta (Casillas vacías) */
    .answer-area {
      display: flex;
      gap: 6px;
      justify-content: center;
      flex-wrap: wrap;
      min-height: calc(var(--tile-size) + 8px);
      padding: 6px;
      width: 100%;
    }
    .answer-slot {
      width: var(--tile-size);
      height: var(--tile-size);
      border: 2px dashed #90A4AE;
      border-radius: 8px;
      background: #F4F6F8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(16px, 4vw, 22px);
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .answer-slot.filled {
      border: 2px solid var(--primary);
      background: #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .answer-slot.correct {
      background: #C8E6C9 !important;
      border-color: #4CAF50 !important;
      color: #1B5E20 !important;
    }
    .answer-slot.wrong {
      background: #FFCDD2 !important;
      border-color: #F44336 !important;
      color: #B71C1C !important;
      animation: slotShake 0.4s ease;
    }
    @keyframes slotShake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    /* Área de Letras Disponibles */
    .pool-area-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pool-area {
      display: flex;
      gap: 6px;
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;
      min-height: calc(var(--tile-size) + 8px);
      padding: 6px;
    }
    .letter-tile {
      width: var(--tile-size);
      height: var(--tile-size);
      background: #FFFFFF;
      border: 2px solid var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(16px, 4vw, 22px);
      font-weight: 700;
      color: var(--primary);
      cursor: pointer;
      box-shadow: 0 3px 6px rgba(27,42,74,0.15);
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .letter-tile:hover, .letter-tile:active {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 12px rgba(27,42,74,0.25);
    }
    .letter-tile.used {
      visibility: hidden;
      pointer-events: none;
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
    <h1 class="game-title">🔠 Anagrama: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="level" id="levelProgress">Palabra: 1 / 10</span>
    </div>

    <div class="clue-card">
      <strong>💡 PISTA:</strong>
      <span id="clueText">Cargando...</span>
    </div>

    <div class="answer-area" id="answerArea"></div>

    <div class="pool-area-title">Letras disponibles (toca para ubicar):</div>
    <div class="pool-area" id="poolArea"></div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Todas las Palabras Resueltas!</h2>
      <p>Has ordenado correctamente las 10 palabras del anagrama.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const NIVELES = ${nivelesJSON};

    let nivelActual = 0;
    let poolLetters = [];
    let slots = [];
    let isEvaluating = false;
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      nivelActual = 0;
      segundos = 0;
      isEvaluating = false;
      document.getElementById('modalWin').style.display = 'none';
      iniciarCronometro();
      cargarNivel(0);
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

    function cargarNivel(idx) {
      if (idx >= NIVELES.length) {
        finalizarJuego();
        return;
      }

      nivelActual = idx;
      const data = NIVELES[nivelActual];
      document.getElementById('levelProgress').textContent = 'Palabra: ' + (nivelActual + 1) + ' / ' + NIVELES.length;
      document.getElementById('clueText').textContent = data.pista;

      const targetWord = data.palabra;
      const wordLen = targetWord.length;

      // Inicializar slots vacíos
      slots = Array(wordLen).fill(null);

      // Desordenar letras asegurando que no queden iguales a la palabra
      let letters = targetWord.split('');
      let shuffled = [...letters];
      let attempts = 0;
      do {
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        attempts++;
      } while (shuffled.join('') === targetWord && attempts < 10);

      poolLetters = shuffled.map((char, index) => ({
        id: index,
        char: char,
        used: false
      }));

      renderizarSlots();
      renderizarPool();
      isEvaluating = false;
    }

    function renderizarSlots() {
      const area = document.getElementById('answerArea');
      area.innerHTML = '';

      slots.forEach((item, slotIndex) => {
        const slot = document.createElement('div');
        slot.className = 'answer-slot' + (item ? ' filled' : '');
        slot.textContent = item ? item.char : '';
        slot.dataset.slotIndex = slotIndex;

        if (item) {
          slot.addEventListener('click', () => alClickSlot(slotIndex));
        }

        area.appendChild(slot);
      });
    }

    function renderizarPool() {
      const pool = document.getElementById('poolArea');
      pool.innerHTML = '';

      poolLetters.forEach(item => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile' + (item.used ? ' used' : '');
        tile.textContent = item.char;
        tile.dataset.id = item.id;

        tile.addEventListener('click', () => alClickTile(item));
        pool.appendChild(tile);
      });
    }

    function alClickTile(item) {
      if (isEvaluating || item.used) return;

      // Buscar primer slot libre
      const firstEmptySlot = slots.findIndex(s => s === null);
      if (firstEmptySlot === -1) return;

      item.used = true;
      slots[firstEmptySlot] = item;

      renderizarSlots();
      renderizarPool();

      // Si todos llenos, verificar
      if (slots.every(s => s !== null)) {
        verificarRespuesta();
      }
    }

    function alClickSlot(slotIndex) {
      if (isEvaluating || !slots[slotIndex]) return;

      const item = slots[slotIndex];
      item.used = false;
      slots[slotIndex] = null;

      renderizarSlots();
      renderizarPool();
    }

    function verificarRespuesta() {
      isEvaluating = true;
      const palabraUsuario = slots.map(s => s.char).join('');
      const targetWord = NIVELES[nivelActual].palabra;
      const slotEls = document.querySelectorAll('.answer-slot');

      if (palabraUsuario === targetWord) {
        // ¡Correcto!
        slotEls.forEach(el => el.classList.add('correct'));

        setTimeout(() => {
          cargarNivel(nivelActual + 1);
        }, 900);
      } else {
        // Incorrecto
        slotEls.forEach(el => el.classList.add('wrong'));

        setTimeout(() => {
          // Devolver todas las letras al pool
          poolLetters.forEach(l => l.used = false);
          slots = Array(targetWord.length).fill(null);
          renderizarSlots();
          renderizarPool();
          isEvaluating = false;
        }, 600);
      }
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
