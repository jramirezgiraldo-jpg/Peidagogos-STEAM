// ===========================================
// GENERADOR: CONCÉNTRESE (MEMORIA)
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['concentrese'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en pedagogía STEAM y diseño de juegos de memoria interactivos. Tu tarea es generar exactamente 10 pares de CONCEPTO y DEFINICIÓN CORTA sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera 10 pares (concepto y definición corta) para un juego de Concéntrese / Memoria (20 cartas en total).
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Toca las cartas para voltearlas y encuentra los 10 pares. Debes emparejar cada concepto con su definición exacta.",
  "pares": [
    { "id": 1, "concepto": "Concepto 1", "definicion": "Definición corta y muy concisa (máx. 10 palabras)" },
    { "id": 2, "concepto": "Concepto 2", "definicion": "Definición corta y muy concisa" },
    { "id": 3, "concepto": "Concepto 3", "definicion": "Definición corta y muy concisa" },
    { "id": 4, "concepto": "Concepto 4", "definicion": "Definición corta y muy concisa" },
    { "id": 5, "concepto": "Concepto 5", "definicion": "Definición corta y muy concisa" },
    { "id": 6, "concepto": "Concepto 6", "definicion": "Definición corta y muy concisa" },
    { "id": 7, "concepto": "Concepto 7", "definicion": "Definición corta y muy concisa" },
    { "id": 8, "concepto": "Concepto 8", "definicion": "Definición corta y muy concisa" },
    { "id": 9, "concepto": "Concepto 9", "definicion": "Definición corta y muy concisa" },
    { "id": 10, "concepto": "Concepto 10", "definicion": "Definición corta y muy concisa" }
  ]
}

Reglas estrictas:
- Exactamente 10 pares.
- Los conceptos deben ser de 1 a 2 palabras.
- Las definiciones deben ser MUY CORTAS (máximo 8 a 12 palabras) para caber perfectamente dentro de las cartas en móviles.
- Nivel educativo: ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.pares || !Array.isArray(datos.pares) || datos.pares.length < 5) {
      throw new Error('La IA no devolvió los 10 pares requeridos para el juego de memoria.');
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
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Concéntrese');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Toca las cartas para voltearlas y encuentra los 10 pares.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Concéntrese: ${tituloTema} | Peidagogos STEAM</title>
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
      padding: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
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
    .progress { color: var(--accent-green); }
    /* Grid de Memoria (4 columnas x 5 filas) */
    .memory-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 8px;
      width: 100%;
      perspective: 1000px;
      margin: 4px 0;
    }
    /* Carta 3D */
    .card-item {
      aspect-ratio: 1 / 1.15;
      position: relative;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-item.flipped {
      transform: rotateY(180deg);
    }
    .card-item.matched {
      transform: rotateY(180deg);
      cursor: default;
    }
    .card-face {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      font-size: clamp(10px, 2.5vw, 13px);
      line-height: 1.2;
    }
    /* Frente (Oculto) */
    .card-front {
      background: linear-gradient(135deg, var(--primary), #2C3E6B);
      color: white;
      border: 2px solid var(--primary);
    }
    .card-front::after {
      content: '🧠';
      font-size: 1.5rem;
    }
    /* Dorso (Revelado) */
    .card-back {
      background: #FFFFFF;
      color: var(--primary);
      border: 2px solid var(--border);
      transform: rotateY(180deg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-weight: 600;
    }
    .card-back.concept-card {
      background: #E3F2FD;
      border-color: #90CAF9;
      color: #0D47A1;
      font-weight: 700;
    }
    .card-back.definition-card {
      background: #FFF8E1;
      border-color: #FFE082;
      color: #37474F;
      font-size: clamp(9px, 2.2vw, 11.5px);
      font-weight: 500;
    }
    .card-item.matched .card-back {
      background: #E8F5E9 !important;
      border-color: #81C784 !important;
      color: #1B5E20 !important;
      box-shadow: 0 0 0 2px #4CAF50;
    }
    .card-item.wrong .card-back {
      background: #FFEBEE !important;
      border-color: #EF5350 !important;
      animation: cardShake 0.4s ease;
    }
    @keyframes cardShake {
      0%, 100% { transform: rotateY(180deg) translateX(0); }
      20%, 60% { transform: rotateY(180deg) translateX(-4px); }
      40%, 80% { transform: rotateY(180deg) translateX(4px); }
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
    <h1 class="game-title">🧠 Concéntrese: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="moves" id="moves">Movimientos: 0</span>
      <span class="progress" id="progress">Parejas: 0 / 10</span>
    </div>

    <div class="memory-grid" id="memoryGrid"></div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Excelente Memoria!</h2>
      <p>Has encontrado todos los 10 pares concepto-definición.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <p><strong>Total de movimientos:</strong> <span id="finalMoves">0</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const PARES_BASE = ${paresJSON};

    let deck = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalMoves = 0;
    let isLocked = false;
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      matchedPairs = 0;
      totalMoves = 0;
      flippedCards = [];
      isLocked = false;
      document.getElementById('modalWin').style.display = 'none';
      document.getElementById('moves').textContent = 'Movimientos: 0';
      actualizarProgreso();
      iniciarCronometro();
      prepararMazo();
      renderizarTablero();
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

    function prepararMazo() {
      deck = [];
      PARES_BASE.forEach(par => {
        // Carta de Concepto
        deck.push({
          pairId: par.id,
          type: 'concept',
          text: par.concepto
        });
        // Carta de Definición
        deck.push({
          pairId: par.id,
          type: 'definition',
          text: par.definicion
        });
      });

      // Barajar cartas (Fisher-Yates)
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }

    function renderizarTablero() {
      const grid = document.getElementById('memoryGrid');
      grid.innerHTML = '';

      deck.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.dataset.index = index;
        cardEl.dataset.pairId = card.pairId;

        const front = document.createElement('div');
        front.className = 'card-face card-front';

        const back = document.createElement('div');
        back.className = 'card-face card-back ' + (card.type === 'concept' ? 'concept-card' : 'definition-card');
        back.textContent = card.text;

        cardEl.appendChild(front);
        cardEl.appendChild(back);

        cardEl.addEventListener('click', () => alClickCarta(cardEl));
        grid.appendChild(cardEl);
      });
    }

    function alClickCarta(cardEl) {
      if (isLocked || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
        return;
      }

      cardEl.classList.add('flipped');
      flippedCards.push(cardEl);

      if (flippedCards.length === 2) {
        totalMoves++;
        document.getElementById('moves').textContent = 'Movimientos: ' + totalMoves;
        evaluarPar();
      }
    }

    function evaluarPar() {
      isLocked = true;
      const [card1, card2] = flippedCards;
      const id1 = card1.dataset.pairId;
      const id2 = card2.dataset.pairId;

      if (id1 === id2) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          card1.classList.add('matched');
          card2.classList.add('matched');
          matchedPairs++;
          actualizarProgreso();
          flippedCards = [];
          isLocked = false;

          if (matchedPairs === PARES_BASE.length) {
            finalizarJuego();
          }
        }, 300);
      } else {
        // No coinciden: mostrar un momento y voltear
        setTimeout(() => {
          card1.classList.add('wrong');
          card2.classList.add('wrong');
        }, 400);

        setTimeout(() => {
          card1.classList.remove('flipped', 'wrong');
          card2.classList.remove('flipped', 'wrong');
          flippedCards = [];
          isLocked = false;
        }, 1300);
      }
    }

    function actualizarProgreso() {
      document.getElementById('progress').textContent = 'Parejas: ' + matchedPairs + ' / ' + PARES_BASE.length;
    }

    function finalizarJuego() {
      clearInterval(timerInterval);
      const mins = String(Math.floor(segundos / 60)).padStart(2, '0');
      const secs = String(segundos % 60).padStart(2, '0');
      document.getElementById('finalTime').textContent = mins + ':' + secs;
      document.getElementById('finalMoves').textContent = totalMoves;
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
