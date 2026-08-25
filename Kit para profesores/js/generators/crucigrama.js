// ===========================================
// GENERADOR: CRUCIGRAMA
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['crucigrama'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';

    const system = `Eres un docente experto en pedagogía STEAM y diseño de crucigramas educativos. Tu tarea es generar exactamente 10 pares de PALABRA y PISTA educativa sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera exactamente 10 palabras y sus correspondientes 10 pistas educativas para un crucigrama.
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Lee las pistas y completa el crucigrama tocando las casillas para escribir.",
  "items": [
    { "palabra": "PALABRA1", "pista": "Descripción o pista clara y pedagógica para la palabra 1" },
    { "palabra": "PALABRA2", "pista": "Descripción o pista clara y pedagógica para la palabra 2" },
    { "palabra": "PALABRA3", "pista": "Descripción o pista clara y pedagógica para la palabra 3" },
    { "palabra": "PALABRA4", "pista": "Descripción o pista clara y pedagógica para la palabra 4" },
    { "palabra": "PALABRA5", "pista": "Descripción o pista clara y pedagógica para la palabra 5" },
    { "palabra": "PALABRA6", "pista": "Descripción o pista clara y pedagógica para la palabra 6" },
    { "palabra": "PALABRA7", "pista": "Descripción o pista clara y pedagógica para la palabra 7" },
    { "palabra": "PALABRA8", "pista": "Descripción o pista clara y pedagógica para la palabra 8" },
    { "palabra": "PALABRA9", "pista": "Descripción o pista clara y pedagógica para la palabra 9" },
    { "palabra": "PALABRA10", "pista": "Descripción o pista clara y pedagógica para la palabra 10" }
  ]
}

Reglas estrictas:
- Exactamente 10 elementos.
- Cada palabra debe ser de una sola palabra (sin espacios, sin guiones, entre 4 y 10 letras).
- Mayúsculas y sin tildes en el campo "palabra".
- Las pistas deben ser educativas, concisas y orientadas al nivel ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.items || !Array.isArray(datos.items) || datos.items.length < 5) {
      throw new Error('La IA no devolvió las 10 palabras y pistas para el crucigrama.');
    }
    datos.items = datos.items.slice(0, 10).map(item => ({
      palabra: normalizarTexto(item.palabra),
      pista: item.pista.trim()
    }));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const itemsJSON = JSON.stringify(contenido.items);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Crucigrama');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Lee las pistas y completa el crucigrama tocando las casillas.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Crucigrama: ${tituloTema} | Peidagogos STEAM</title>
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
      --border: #D0D7DE;
      --cell-active-bg: #FFF9C4;
      --word-active-bg: #E3F2FD;
      --cell-correct-bg: #C8E6C9;
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
      max-width: 580px;
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
      max-width: 580px;
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
    /* Pista Activa Banner */
    .active-clue-banner {
      width: 100%;
      background: #E1F5FE;
      border-left: 4px solid var(--accent-cyan);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 0.88rem;
      color: var(--primary);
      min-height: 38px;
      display: flex;
      align-items: center;
    }
    .active-clue-banner strong { margin-right: 6px; }
    /* Cuadrícula de Crucigrama */
    .crossword-board-wrapper {
      width: 100%;
      overflow-x: auto;
      display: flex;
      justify-content: center;
      padding: 6px;
    }
    .crossword-grid {
      display: grid;
      gap: 2px;
      background: #CFD8DC;
      padding: 3px;
      border-radius: 8px;
    }
    .cw-cell {
      position: relative;
      background: #FFFFFF;
      border: 1.5px solid #90A4AE;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .cw-cell.blocked {
      background: #ECEFF1;
      border-color: #ECEFF1;
      pointer-events: none;
    }
    .cw-cell.in-active-word {
      background: var(--word-active-bg);
      border-color: #64B5F6;
    }
    .cw-cell.focused {
      background: var(--cell-active-bg) !important;
      border: 2px solid var(--accent-orange) !important;
      transform: scale(1.05);
      z-index: 5;
    }
    .cw-cell.correct {
      background: var(--cell-correct-bg) !important;
      border-color: var(--accent-green) !important;
      color: #1B5E20;
    }
    .cw-cell-number {
      position: absolute;
      top: 1px;
      left: 2px;
      font-size: 8px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1;
      pointer-events: none;
    }
    .cw-cell input {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      text-align: center;
      font-family: inherit;
      font-size: 16px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      outline: none;
      padding: 0;
      cursor: pointer;
    }
    /* Sección de Pistas */
    .clues-container {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 6px;
    }
    @media (min-width: 460px) {
      .clues-container { grid-template-columns: 1fr 1fr; }
    }
    .clues-column {
      background: #F4F6F8;
      border-radius: 8px;
      padding: 10px;
      border: 1px solid var(--border);
    }
    .clues-col-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .clues-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .clue-item {
      font-size: 0.8rem;
      color: var(--text);
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
      line-height: 1.3;
    }
    .clue-item:hover { background: #E0E0E0; }
    .clue-item.active { background: #E3F2FD; font-weight: 600; }
    .clue-item.solved {
      text-decoration: line-through;
      color: #9E9E9E;
      background: #E8F5E9;
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
      .cw-cell input { border: none; }
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
    <h1 class="game-title">✏️ Crucigrama: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="progress" id="progress">Palabras: 0 / 10</span>
    </div>

    <div class="active-clue-banner" id="activeClueBanner">
      <span>Toca una casilla para comenzar</span>
    </div>

    <div class="crossword-board-wrapper">
      <div class="crossword-grid" id="crosswordGrid"></div>
    </div>

    <div class="clues-container">
      <div class="clues-column">
        <div class="clues-col-title">➡️ Horizontales</div>
        <ul class="clues-list" id="cluesAcross"></ul>
      </div>
      <div class="clues-column">
        <div class="clues-col-title">⬇️ Verticales</div>
        <ul class="clues-list" id="cluesDown"></ul>
      </div>
    </div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Crucigrama Completado!</h2>
      <p>Has resuelto correctamente todas las palabras del crucigrama.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const ITEMS_BASE = ${itemsJSON};

    let wordsPlaced = [];
    let gridRows = 0;
    let gridCols = 0;
    let gridData = [];
    let currentWordIndex = null;
    let currentDir = 'across'; // 'across' o 'down'
    let currentCell = null;
    let solvedWords = new Set();
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      solvedWords.clear();
      document.getElementById('modalWin').style.display = 'none';
      iniciarCronometro();
      generarEstructuraCrucigrama();
      renderizarTablero();
      renderizarPistas();
      actualizarProgreso();
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

    // Algoritmo de colocación cruzada de palabras
    function generarEstructuraCrucigrama() {
      const items = [...ITEMS_BASE].sort((a, b) => b.palabra.length - a.palabra.length);
      wordsPlaced = [];
      const MAX_SIZE = 14;
      let grid = Array(MAX_SIZE).fill(null).map(() => Array(MAX_SIZE).fill(null));

      // 1. Colocar la palabra más larga en el centro horizontalmente
      const first = items[0];
      const startR = Math.floor(MAX_SIZE / 2);
      const startC = Math.floor((MAX_SIZE - first.palabra.length) / 2);
      
      for (let i = 0; i < first.palabra.length; i++) {
        grid[startR][startC + i] = { char: first.palabra[i], wordIds: [0] };
      }
      wordsPlaced.push({
        id: 0,
        palabra: first.palabra,
        pista: first.pista,
        dir: 'across',
        row: startR,
        col: startC,
        num: 1
      });

      // 2. Colocar el resto buscando intersecciones
      let numCounter = 2;
      for (let itemIdx = 1; itemIdx < items.length; itemIdx++) {
        const item = items[itemIdx];
        const palabra = item.palabra;
        let bestPlacement = null;
        let maxScore = -1;

        // Probar todas las posibles intersecciones
        for (const placed of wordsPlaced) {
          const tryDir = placed.dir === 'across' ? 'down' : 'across';

          for (let pi = 0; pi < placed.palabra.length; pi++) {
            for (let wi = 0; wi < palabra.length; wi++) {
              if (placed.palabra[pi] === palabra[wi]) {
                let r, c;
                if (tryDir === 'down') {
                  r = placed.row - wi;
                  c = placed.col + pi;
                } else {
                  r = placed.row + pi;
                  c = placed.col - wi;
                }

                if (puedeColocar(palabra, tryDir, r, c, grid, MAX_SIZE)) {
                  const score = calcularScore(palabra, tryDir, r, c, grid, MAX_SIZE);
                  if (score > maxScore) {
                    maxScore = score;
                    bestPlacement = { dir: tryDir, row: r, col: c };
                  }
                }
              }
            }
          }
        }

        if (bestPlacement) {
          const wid = wordsPlaced.length;
          for (let i = 0; i < palabra.length; i++) {
            const r = bestPlacement.dir === 'across' ? bestPlacement.row : bestPlacement.row + i;
            const c = bestPlacement.dir === 'across' ? bestPlacement.col + i : bestPlacement.col;
            if (!grid[r][c]) {
              grid[r][c] = { char: palabra[i], wordIds: [wid] };
            } else {
              grid[r][c].wordIds.push(wid);
            }
          }
          wordsPlaced.push({
            id: wid,
            palabra: palabra,
            pista: item.pista,
            dir: bestPlacement.dir,
            row: bestPlacement.row,
            col: bestPlacement.col,
            num: numCounter++
          });
        } else {
          // Si no intersecta, colocar en una posición paralela libre
          const fallback = buscarEspacioLibre(palabra, grid, MAX_SIZE);
          if (fallback) {
            const wid = wordsPlaced.length;
            for (let i = 0; i < palabra.length; i++) {
              const r = fallback.dir === 'across' ? fallback.row : fallback.row + i;
              const c = fallback.dir === 'across' ? fallback.col + i : fallback.col;
              grid[r][c] = { char: palabra[i], wordIds: [wid] };
            }
            wordsPlaced.push({
              id: wid,
              palabra: palabra,
              pista: item.pista,
              dir: fallback.dir,
              row: fallback.row,
              col: fallback.col,
              num: numCounter++
            });
          }
        }
      }

      // 3. Recortar cuadrícula a los límites reales
      let minR = MAX_SIZE, maxR = 0, minC = MAX_SIZE, maxC = 0;
      for (let r = 0; r < MAX_SIZE; r++) {
        for (let c = 0; c < MAX_SIZE; c++) {
          if (grid[r][c]) {
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
            if (c < minC) minC = c;
            if (c > maxC) maxC = c;
          }
        }
      }

      gridRows = (maxR - minR + 1);
      gridCols = (maxC - minC + 1);
      gridData = Array(gridRows).fill(null).map(() => Array(gridCols).fill(null));

      // Reajustar coordenadas de palabras
      wordsPlaced.forEach(w => {
        w.row -= minR;
        w.col -= minC;
      });

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (grid[r][c]) {
            gridData[r - minR][c - minC] = grid[r][c];
          }
        }
      }

      // Re-numerar de forma estándar (arriba a abajo, izq a der)
      let currentNumber = 1;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const startingWords = wordsPlaced.filter(w => w.row === r && w.col === c);
          if (startingWords.length > 0) {
            startingWords.forEach(w => w.num = currentNumber);
            currentNumber++;
          }
        }
      }
    }

    function puedeColocar(palabra, dir, row, col, grid, size) {
      const len = palabra.length;
      if (row < 0 || col < 0) return false;
      if (dir === 'across' && (col + len > size || row >= size)) return false;
      if (dir === 'down' && (row + len > size || col >= size)) return false;

      // Verificar bordes antes y después
      if (dir === 'across') {
        if (col > 0 && grid[row][col - 1]) return false;
        if (col + len < size && grid[row][col + len]) return false;
      } else {
        if (row > 0 && grid[row - 1][col]) return false;
        if (row + len < size && grid[row + len][col]) return false;
      }

      for (let i = 0; i < len; i++) {
        const r = dir === 'across' ? row : row + i;
        const c = dir === 'across' ? col + i : col;
        const cell = grid[r][c];

        if (cell !== null) {
          if (cell.char !== palabra[i]) return false;
        } else {
          // Verificar celdas adyacentes paralelas para que no se toquen indebidamente
          if (dir === 'across') {
            if (r > 0 && grid[r - 1][c]) return false;
            if (r + 1 < size && grid[r + 1][c]) return false;
          } else {
            if (c > 0 && grid[r][c - 1]) return false;
            if (c + 1 < size && grid[r][c + 1]) return false;
          }
        }
      }
      return true;
    }

    function calcularScore(palabra, dir, row, col, grid, size) {
      let intersections = 0;
      for (let i = 0; i < palabra.length; i++) {
        const r = dir === 'across' ? row : row + i;
        const c = dir === 'across' ? col + i : col;
        if (grid[r][c] && grid[r][c].char === palabra[i]) intersections++;
      }
      return intersections;
    }

    function buscarEspacioLibre(palabra, grid, size) {
      for (let r = 0; r < size - 2; r += 2) {
        for (let c = 0; c <= size - palabra.length; c++) {
          if (puedeColocar(palabra, 'across', r, c, grid, size)) {
            return { dir: 'across', row: r, col: c };
          }
        }
      }
      return null;
    }

    function renderizarTablero() {
      const gridEl = document.getElementById('crosswordGrid');
      gridEl.innerHTML = '';
      
      const cellSize = Math.min(Math.floor(340 / Math.max(gridCols, 8)), 32);
      gridEl.style.gridTemplateColumns = 'repeat(' + gridCols + ', ' + cellSize + 'px)';
      gridEl.style.gridTemplateRows = 'repeat(' + gridRows + ', ' + cellSize + 'px)';

      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const cellData = gridData[r][c];
          const cell = document.createElement('div');
          cell.className = 'cw-cell';
          cell.style.width = cellSize + 'px';
          cell.style.height = cellSize + 'px';
          cell.dataset.r = r;
          cell.dataset.c = c;

          if (!cellData) {
            cell.classList.add('blocked');
          } else {
            // Número si es inicio de alguna palabra
            const starting = wordsPlaced.filter(w => w.row === r && w.col === c);
            if (starting.length > 0) {
              const numEl = document.createElement('span');
              numEl.className = 'cw-cell-number';
              numEl.textContent = starting[0].num;
              cell.appendChild(numEl);
            }

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.r = r;
            input.dataset.c = c;
            input.dataset.char = cellData.char;

            // Eventos de celda
            input.addEventListener('focus', () => alEnfocarCelda(r, c));
            input.addEventListener('input', (e) => alEscribir(e, r, c));
            input.addEventListener('keydown', (e) => alTecla(e, r, c));
            input.addEventListener('click', () => alClickCelda(r, c));

            cell.appendChild(input);
          }
          gridEl.appendChild(cell);
        }
      }
    }

    function renderizarPistas() {
      const acrossList = document.getElementById('cluesAcross');
      const downList = document.getElementById('cluesDown');
      acrossList.innerHTML = '';
      downList.innerHTML = '';

      const acrossWords = wordsPlaced.filter(w => w.dir === 'across').sort((a, b) => a.num - b.num);
      const downWords = wordsPlaced.filter(w => w.dir === 'down').sort((a, b) => a.num - b.num);

      acrossWords.forEach(w => {
        const li = document.createElement('li');
        li.className = 'clue-item';
        li.id = 'clue_' + w.id;
        li.innerHTML = '<strong>' + w.num + '.</strong> ' + w.pista;
        li.addEventListener('click', () => seleccionarPalabra(w.id, w.row, w.col));
        acrossList.appendChild(li);
      });

      downWords.forEach(w => {
        const li = document.createElement('li');
        li.className = 'clue-item';
        li.id = 'clue_' + w.id;
        li.innerHTML = '<strong>' + w.num + '.</strong> ' + w.pista;
        li.addEventListener('click', () => seleccionarPalabra(w.id, w.row, w.col));
        downList.appendChild(li);
      });
    }

    function alClickCelda(r, c) {
      const cellData = gridData[r][c];
      if (!cellData) return;

      // Si es intersección y se hace click en la misma celda, alternar dirección
      if (cellData.wordIds.length > 1 && currentCell && currentCell.r === r && currentCell.c === c) {
        const otherWordId = cellData.wordIds.find(id => id !== currentWordIndex);
        if (otherWordId !== undefined) {
          const otherWord = wordsPlaced.find(w => w.id === otherWordId);
          currentWordIndex = otherWord.id;
          currentDir = otherWord.dir;
          resaltarPalabraActiva();
          return;
        }
      }
      alEnfocarCelda(r, c);
    }

    function alEnfocarCelda(r, c) {
      currentCell = { r, c };
      const cellData = gridData[r][c];
      if (!cellData) return;

      // Si la palabra activa actual contiene esta celda, mantenerla
      let activeWord = wordsPlaced.find(w => w.id === currentWordIndex);
      let wordContainsCell = false;

      if (activeWord) {
        for (let i = 0; i < activeWord.palabra.length; i++) {
          const wr = activeWord.dir === 'across' ? activeWord.row : activeWord.row + i;
          const wc = activeWord.dir === 'across' ? activeWord.col + i : activeWord.col;
          if (wr === r && wc === c) {
            wordContainsCell = true;
            break;
          }
        }
      }

      if (!wordContainsCell) {
        // Elegir la primera palabra que pase por aquí
        const firstWordId = cellData.wordIds[0];
        const w = wordsPlaced.find(item => item.id === firstWordId);
        currentWordIndex = w.id;
        currentDir = w.dir;
      }

      resaltarPalabraActiva();
    }

    function seleccionarPalabra(wordId, r, c) {
      const w = wordsPlaced.find(item => item.id === wordId);
      if (!w) return;
      currentWordIndex = w.id;
      currentDir = w.dir;
      currentCell = { r, c };

      const input = document.querySelector('input[data-r="' + r + '"][data-c="' + c + '"]');
      if (input) input.focus();
      resaltarPalabraActiva();
    }

    function resaltarPalabraActiva() {
      // Limpiar resaltados previos
      document.querySelectorAll('.cw-cell').forEach(el => {
        el.classList.remove('in-active-word', 'focused');
      });
      document.querySelectorAll('.clue-item').forEach(el => el.classList.remove('active'));

      const activeWord = wordsPlaced.find(w => w.id === currentWordIndex);
      if (!activeWord) return;

      // Resaltar celdas de la palabra
      for (let i = 0; i < activeWord.palabra.length; i++) {
        const wr = activeWord.dir === 'across' ? activeWord.row : activeWord.row + i;
        const wc = activeWord.dir === 'across' ? activeWord.col + i : activeWord.col;
        const cell = document.querySelector('.cw-cell[data-r="' + wr + '"][data-c="' + wc + '"]');
        if (cell) cell.classList.add('in-active-word');
      }

      // Resaltar celda enfocada
      if (currentCell) {
        const focusedCell = document.querySelector('.cw-cell[data-r="' + currentCell.r + '"][data-c="' + currentCell.c + '"]');
        if (focusedCell) focusedCell.classList.add('focused');
      }

      // Resaltar pista activa en lista
      const clueLi = document.getElementById('clue_' + activeWord.id);
      if (clueLi) clueLi.classList.add('active');

      // Actualizar banner superior
      const dirIcon = activeWord.dir === 'across' ? '➡️ Hor' : '⬇️ Ver';
      document.getElementById('activeClueBanner').innerHTML = '<strong>' + activeWord.num + ' ' + dirIcon + ':</strong> ' + activeWord.pista;
    }

    function alEscribir(e, r, c) {
      const val = e.target.value.toUpperCase().replace(/[^A-ZÑ]/g, '');
      e.target.value = val;

      if (val.length > 0) {
        // Auto-avanzar a la siguiente celda de la palabra
        avanzarCelda(r, c, 1);
      }

      verificarCrucigrama();
    }

    function alTecla(e, r, c) {
      if (e.key === 'Backspace') {
        const input = e.target;
        if (input.value === '') {
          avanzarCelda(r, c, -1);
        } else {
          input.value = '';
        }
        verificarCrucigrama();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        moverFoco(r, c + 1);
      } else if (e.key === 'ArrowLeft') {
        moverFoco(r, c - 1);
      } else if (e.key === 'ArrowDown') {
        moverFoco(r + 1, c);
      } else if (e.key === 'ArrowUp') {
        moverFoco(r - 1, c);
      }
    }

    function avanzarCelda(r, c, delta) {
      const activeWord = wordsPlaced.find(w => w.id === currentWordIndex);
      if (!activeWord) return;

      const nextR = activeWord.dir === 'across' ? r : r + delta;
      const nextC = activeWord.dir === 'across' ? c + delta : c;

      const nextInput = document.querySelector('input[data-r="' + nextR + '"][data-c="' + nextC + '"]');
      if (nextInput) {
        nextInput.focus();
      }
    }

    function moverFoco(r, c) {
      const input = document.querySelector('input[data-r="' + r + '"][data-c="' + c + '"]');
      if (input) input.focus();
    }

    function verificarCrucigrama() {
      wordsPlaced.forEach(w => {
        let palabraIngresada = '';
        let celdasWord = [];

        for (let i = 0; i < w.palabra.length; i++) {
          const r = w.dir === 'across' ? w.row : w.row + i;
          const c = w.dir === 'across' ? w.col + i : w.col;
          const input = document.querySelector('input[data-r="' + r + '"][data-c="' + c + '"]');
          if (input) {
            palabraIngresada += (input.value || ' ');
            celdasWord.push(input.parentElement);
          }
        }

        if (palabraIngresada === w.palabra) {
          if (!solvedWords.has(w.id)) {
            solvedWords.add(w.id);
            celdasWord.forEach(c => c.classList.add('correct'));
            const clueLi = document.getElementById('clue_' + w.id);
            if (clueLi) clueLi.classList.add('solved');
            actualizarProgreso();
          }
        } else {
          if (solvedWords.has(w.id)) {
            solvedWords.delete(w.id);
            const clueLi = document.getElementById('clue_' + w.id);
            if (clueLi) clueLi.classList.remove('solved');
            actualizarProgreso();
          }
        }
      });

      // Victoria si todas las palabras resueltas
      if (solvedWords.size === wordsPlaced.length && wordsPlaced.length > 0) {
        finalizarJuego();
      }
    }

    function actualizarProgreso() {
      document.getElementById('progress').textContent = 'Palabras: ' + solvedWords.size + ' / ' + wordsPlaced.length;
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
