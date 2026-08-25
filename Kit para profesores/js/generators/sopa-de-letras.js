// ===========================================
// GENERADOR: SOPA DE LETRAS
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['sopa-de-letras'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';
    const instruccion = datos.instruccion || 'Encuentra las 10 palabras clave ocultas en la sopa de letras.';

    const system = `Eres un docente experto en diseño curricular y pedagogía STEAM. Tu tarea es generar exactamente 10 palabras clave educativas sobre el tema solicitado, apropiadas para el nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera 10 palabras clave para una Sopa de Letras educativa.
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"
INSTRUCCIÓN: "${instruccion}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "${instruccion}",
  "palabras": [
    "PALABRA1",
    "PALABRA2",
    "PALABRA3",
    "PALABRA4",
    "PALABRA5",
    "PALABRA6",
    "PALABRA7",
    "PALABRA8",
    "PALABRA9",
    "PALABRA10"
  ]
}

Reglas estrictas:
- Exactamente 10 palabras.
- Solo una palabra por elemento (sin espacios, sin guiones, sin caracteres especiales).
- Longitud entre 4 y 10 letras cada una.
- Mayúsculas y sin tildes.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.palabras || !Array.isArray(datos.palabras) || datos.palabras.length < 5) {
      throw new Error('La IA no devolvió las 10 palabras requeridas.');
    }
    // Asegurar normalización
    datos.palabras = datos.palabras.slice(0, 10).map(p => normalizarTexto(p));
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const palabrasJSON = JSON.stringify(contenido.palabras);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Sopa de Letras');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Encuentra las 10 palabras en la sopa de letras.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sopa de Letras: ${tituloTema} | Peidagogos STEAM</title>
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
      --cell-size: min(8vw, 36px);
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
    .progress { color: var(--accent-green); }
    /* Cuadrícula */
    .grid-wrapper {
      position: relative;
      touch-action: none;
      padding: 4px;
      background: #ECEFF1;
      border-radius: 10px;
      margin: 4px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, var(--cell-size));
      grid-template-rows: repeat(12, var(--cell-size));
      gap: 2px;
      background: #CFD8DC;
      padding: 2px;
      border-radius: 8px;
    }
    .cell {
      width: var(--cell-size);
      height: var(--cell-size);
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(12px, 3.5vw, 16px);
      font-weight: 700;
      color: var(--primary);
      border-radius: 4px;
      transition: background 0.15s;
      cursor: pointer;
    }
    .cell.selected {
      background: #FFE082 !important;
      color: #000;
      transform: scale(0.95);
    }
    .cell.found {
      color: #FFFFFF !important;
    }
    /* Lista de Palabras */
    .words-section {
      width: 100%;
      margin-top: 4px;
    }
    .words-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
      text-align: center;
    }
    .words-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }
    .word-badge {
      padding: 5px 10px;
      background: #ECEFF1;
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.3s;
    }
    .word-badge.found {
      background: var(--accent-green) !important;
      color: white !important;
      border-color: var(--accent-green);
      text-decoration: line-through;
      transform: scale(0.95);
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
      .stats-bar { border: 1px solid #ccc; }
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
    <h1 class="game-title">🔤 Sopa de Letras: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="progress" id="progress">Encontradas: 0 / 10</span>
    </div>

    <div class="grid-wrapper" id="gridWrapper">
      <div class="grid" id="grid"></div>
    </div>

    <div class="words-section">
      <div class="words-title">Palabras a encontrar:</div>
      <div class="words-list" id="wordsList"></div>
    </div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Excelente Trabajo!</h2>
      <p>Has encontrado todas las 10 palabras ocultas.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    // Palabras del juego
    const PALABRAS_BASE = ${palabrasJSON};
    const GRID_SIZE = 12;
    const COLORES_PALABRAS = [
      '#4CAF50', '#2196F3', '#E91E63', '#FF9800', '#9C27B0',
      '#00BCD4', '#FF5722', '#3F51B5', '#009688', '#E65100'
    ];

    let grid = [];
    let palabrasColocadas = [];
    let palabrasEncontradas = new Set();
    let isSelecting = false;
    let startCell = null;
    let selectedCells = [];
    let timerInterval = null;
    let segundos = 0;

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      palabrasEncontradas.clear();
      document.getElementById('modalWin').style.display = 'none';
      actualizarProgreso();
      iniciarCronometro();
      construirSopa();
      renderizarGrid();
      renderizarBadges();
      vincularEventosTactiles();
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

    function construirSopa() {
      // 1. Crear matriz vacía
      grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
      palabrasColocadas = [];

      // Direcciones: [dFila, dCol]
      const direcciones = [
        [0, 1],   // Horizontal derecha
        [0, -1],  // Horizontal izquierda
        [1, 0],   // Vertical abajo
        [-1, 0],  // Vertical arriba
        [1, 1],   // Diagonal abajo-der
        [1, -1],  // Diagonal abajo-izq
        [-1, 1],  // Diagonal arriba-der
        [-1, -1]  // Diagonal arriba-izq
      ];

      // 2. Colocar cada palabra
      PALABRAS_BASE.forEach((palabra, idx) => {
        let colocada = false;
        let intentos = 0;
        const dirsMezcladas = [...direcciones].sort(() => Math.random() - 0.5);

        while (!colocada && intentos < 150) {
          intentos++;
          const dir = dirsMezcladas[intentos % dirsMezcladas.length];
          const filaIni = Math.floor(Math.random() * GRID_SIZE);
          const colIni = Math.floor(Math.random() * GRID_SIZE);

          const filaFin = filaIni + dir[0] * (palabra.length - 1);
          const colFin = colIni + dir[1] * (palabra.length - 1);

          if (filaFin >= 0 && filaFin < GRID_SIZE && colFin >= 0 && colFin < GRID_SIZE) {
            let cabe = true;
            for (let i = 0; i < palabra.length; i++) {
              const r = filaIni + dir[0] * i;
              const c = colIni + dir[1] * i;
              if (grid[r][c] !== '' && grid[r][c] !== palabra[i]) {
                cabe = false;
                break;
              }
            }

            if (cabe) {
              const celdas = [];
              for (let i = 0; i < palabra.length; i++) {
                const r = filaIni + dir[0] * i;
                const c = colIni + dir[1] * i;
                grid[r][c] = palabra[i];
                celdas.push({ r, c });
              }
              palabrasColocadas.push({
                palabra: palabra,
                celdas: celdas,
                color: COLORES_PALABRAS[idx % COLORES_PALABRAS.length]
              });
              colocada = true;
            }
          }
        }
      });

      // 3. Rellenar vacíos con letras aleatorias
      const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (grid[r][c] === '') {
            grid[r][c] = letras[Math.floor(Math.random() * letras.length)];
          }
        }
      }
    }

    function renderizarGrid() {
      const gridEl = document.getElementById('grid');
      gridEl.innerHTML = '';
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.textContent = grid[r][c];
          gridEl.appendChild(cell);
        }
      }
    }

    function renderizarBadges() {
      const wordsList = document.getElementById('wordsList');
      wordsList.innerHTML = PALABRAS_BASE.map(p => 
        '<span class="word-badge" id="badge_' + p + '">' + p + '</span>'
      ).join('');
    }

    function actualizarProgreso() {
      document.getElementById('progress').textContent = 'Encontradas: ' + palabrasEncontradas.size + ' / ' + PALABRAS_BASE.length;
    }

    // Eventos Pointer para soporte móvil y mouse fluido
    function vincularEventosTactiles() {
      const wrapper = document.getElementById('gridWrapper');

      wrapper.onpointerdown = (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains('cell')) {
          isSelecting = true;
          startCell = { r: parseInt(target.dataset.r), c: parseInt(target.dataset.c) };
          actualizarSeleccion(startCell, startCell);
          wrapper.setPointerCapture(e.pointerId);
        }
      };

      wrapper.onpointermove = (e) => {
        if (!isSelecting || !startCell) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains('cell')) {
          const currentCell = { r: parseInt(target.dataset.r), c: parseInt(target.dataset.c) };
          actualizarSeleccion(startCell, currentCell);
        }
      };

      wrapper.onpointerup = (e) => {
        if (!isSelecting) return;
        isSelecting = false;
        try { wrapper.releasePointerCapture(e.pointerId); } catch(err) {}
        verificarSeleccion();
      };

      wrapper.onpointercancel = () => {
        isSelecting = false;
        limpiarSeleccionVisual();
      };
    }

    function actualizarSeleccion(start, end) {
      limpiarSeleccionVisual();
      selectedCells = [];

      const dR = end.r - start.r;
      const dC = end.c - start.c;
      const stepR = dR === 0 ? 0 : dR / Math.abs(dR);
      const stepC = dC === 0 ? 0 : dC / Math.abs(dC);

      const isHorizontal = dR === 0 && dC !== 0;
      const isVertical = dC === 0 && dR !== 0;
      const isDiagonal = Math.abs(dR) === Math.abs(dC) && dR !== 0;

      if (start.r === end.r && start.c === end.c) {
        selectedCells = [start];
      } else if (isHorizontal || isVertical || isDiagonal) {
        const steps = Math.max(Math.abs(dR), Math.abs(dC));
        for (let i = 0; i <= steps; i++) {
          selectedCells.push({
            r: start.r + stepR * i,
            c: start.c + stepC * i
          });
        }
      }

      selectedCells.forEach(pos => {
        const el = document.querySelector('.cell[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
        if (el) el.classList.add('selected');
      });
    }

    function limpiarSeleccionVisual() {
      document.querySelectorAll('.cell.selected').forEach(el => el.classList.remove('selected'));
    }

    function verificarSeleccion() {
      if (selectedCells.length < 2) {
        limpiarSeleccionVisual();
        return;
      }

      const palabraSeleccionada = selectedCells.map(pos => grid[pos.r][pos.c]).join('');
      const palabraInvertida = palabraSeleccionada.split('').reverse().join('');

      let encontrada = null;
      for (const p of palabrasColocadas) {
        if (!palabrasEncontradas.has(p.palabra)) {
          if (p.palabra === palabraSeleccionada || p.palabra === palabraInvertida) {
            // Verificar celdas exactas
            const coincideInicio = (p.celdas[0].r === selectedCells[0].r && p.celdas[0].c === selectedCells[0].c);
            const coincideFin = (p.celdas[0].r === selectedCells[selectedCells.length-1].r && p.celdas[0].c === selectedCells[selectedCells.length-1].c);
            if (coincideInicio || coincideFin) {
              encontrada = p;
              break;
            }
          }
        }
      }

      if (encontrada) {
        // Marcar como encontrada
        palabrasEncontradas.add(encontrada.palabra);
        encontrada.celdas.forEach(pos => {
          const el = document.querySelector('.cell[data-r="' + pos.r + '"][data-c="' + pos.c + '"]');
          if (el) {
            el.classList.add('found');
            el.style.backgroundColor = encontrada.color;
          }
        });

        // Actualizar badge
        const badge = document.getElementById('badge_' + encontrada.palabra);
        if (badge) {
          badge.classList.add('found');
          badge.style.backgroundColor = encontrada.color;
        }

        actualizarProgreso();

        // Verificar victoria
        if (palabrasEncontradas.size === PALABRAS_BASE.length) {
          finalizarJuego();
        }
      }

      limpiarSeleccionVisual();
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
