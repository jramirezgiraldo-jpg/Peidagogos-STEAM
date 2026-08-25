// ===========================================
// GENERADOR: CLASIFICADOR TAP & SORT
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['clasificador'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';
    const categorias = datos.categorias || 'Organelos membranosos, Organelos no membranosos';

    const system = `Eres un docente experto en taxonomía y diseño de juegos de clasificación educativa. Tu tarea es generar entre 12 y 14 elementos para clasificar en las categorías dadas sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Genera los datos para un juego de clasificación "Tap & Sort".
TEMA: "${tema}"
CATEGORÍAS SUGERIDAS: "${categorias}"
NIVEL EDUCATIVO: "${nivel}"

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Toca un elemento de la lista y luego toca el contenedor correcto al que pertenece para clasificarlo.",
  "categorias": [
    { "id": "cat1", "nombre": "Nombre Categoría 1", "color": "#1B2A4A", "icono": "📁" },
    { "id": "cat2", "nombre": "Nombre Categoría 2", "color": "#00BCD4", "icono": "📂" }
  ],
  "elementos": [
    { "id": 1, "texto": "Mitocondria", "emoji": "⚡", "categoriaId": "cat1" },
    { "id": 2, "texto": "Ribosoma", "emoji": "🧬", "categoriaId": "cat2" },
    { "id": 3, "texto": "Elemento 3", "emoji": "🔬", "categoriaId": "cat1" },
    { "id": 4, "texto": "Elemento 4", "emoji": "🧪", "categoriaId": "cat2" },
    { "id": 5, "texto": "Elemento 5", "emoji": "🌱", "categoriaId": "cat1" },
    { "id": 6, "texto": "Elemento 6", "emoji": "🧫", "categoriaId": "cat2" },
    { "id": 7, "texto": "Elemento 7", "emoji": "🦠", "categoriaId": "cat1" },
    { "id": 8, "texto": "Elemento 8", "emoji": "💡", "categoriaId": "cat2" },
    { "id": 9, "texto": "Elemento 9", "emoji": "🌿", "categoriaId": "cat1" },
    { "id": 10, "texto": "Elemento 10", "emoji": "🔍", "categoriaId": "cat2" },
    { "id": 11, "texto": "Elemento 11", "emoji": "⚙️", "categoriaId": "cat1" },
    { "id": 12, "texto": "Elemento 12", "emoji": "📌", "categoriaId": "cat2" }
  ]
}

Reglas estrictas:
- Entre 2 y 3 categorías bien diferenciadas.
- Entre 12 y 14 elementos en total, distribuidos de forma equitativa entre las categorías.
- Cada elemento debe tener su texto breve (1 a 3 palabras), un emoji representativo y su categoriaId correspondiente.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.categorias || !datos.elementos || !Array.isArray(datos.elementos) || datos.elementos.length < 6) {
      throw new Error('La IA no devolvió las categorías y elementos requeridos.');
    }
    // Asignar colores vibrantes a categorías si no tienen
    const paleta = ['#1B2A4A', '#00BCD4', '#E91E63', '#4CAF50', '#FF9800'];
    datos.categorias.forEach((cat, idx) => {
      cat.color = cat.color || paleta[idx % paleta.length];
      cat.icono = cat.icono || '📁';
    });
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const dataJSON = JSON.stringify(contenido);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Clasificador');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Toca un elemento y luego su categoría correspondiente.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Clasificador: ${tituloTema} | Peidagogos STEAM</title>
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
    .hits { color: var(--accent-green); }
    .errors { color: var(--accent-pink); }
    /* Zona de Categorías (Contenedores) */
    .categories-zone {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      width: 100%;
      margin-top: 4px;
    }
    .category-btn {
      background: var(--cat-color, var(--primary));
      color: white;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 12px 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.12);
      transition: transform 0.2s, box-shadow 0.2s;
      min-height: 72px;
      justify-content: center;
      text-align: center;
    }
    .category-btn:hover, .category-btn:active {
      transform: scale(1.03);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .cat-icon { font-size: 1.4rem; }
    .cat-name { font-size: 0.85rem; font-weight: 700; line-height: 1.2; }
    .cat-count { font-size: 0.72rem; opacity: 0.85; }
    /* Zona de Elementos (Pool) */
    .items-pool-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary);
      align-self: flex-start;
      margin-top: 4px;
    }
    .items-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
      justify-content: center;
      min-height: 120px;
      padding: 10px;
      background: #F4F6F8;
      border-radius: 10px;
      border: 1px dashed var(--border);
    }
    .item-chip {
      background: #FFFFFF;
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .item-chip:hover {
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
    }
    .item-chip.selected {
      background: #E3F2FD !important;
      border-color: #2196F3 !important;
      border-width: 2.5px;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.25);
      transform: scale(1.06);
    }
    .item-chip.wrong {
      background: #FFEBEE !important;
      border-color: #F44336 !important;
      color: #C62828 !important;
      animation: chipShake 0.4s ease;
    }
    .item-chip.correct-fly {
      transform: scale(0.1);
      opacity: 0;
      transition: all 0.35s ease;
    }
    @keyframes chipShake {
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
      margin-bottom: 10px;
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
    <h1 class="game-title">📦 Clasificador: ${tituloTema}</h1>
    <p class="game-instruction">${instruccion}</p>

    <div class="stats-bar">
      <span class="timer" id="timer">⏱️ 00:00</span>
      <span class="hits" id="hits">Aciertos: 0 / 12</span>
      <span class="errors" id="errors">Errores: 0</span>
    </div>

    <div class="categories-zone" id="categoriesZone"></div>

    <div class="items-pool-title">👇 Toca un elemento para seleccionarlo:</div>
    <div class="items-pool" id="itemsPool"></div>
  </main>

  <div class="modal-win" id="modalWin">
    <div class="modal-content">
      <h2>🎉 ¡Clasificación Exitosa!</h2>
      <p>Has ubicado todos los elementos en sus categorías correspondientes.</p>
      <p><strong>Tiempo final:</strong> <span id="finalTime">00:00</span></p>
      <p><strong>Errores cometidos:</strong> <span id="finalErrors">0</span></p>
      <button class="btn-restart" id="btnRestart">🔄 Jugar de nuevo</button>
    </div>
  </div>

  <script>
    const DATA_JUEGO = ${dataJSON};

    let itemsRestantes = [];
    let selectedItemChip = null;
    let aciertos = 0;
    let errores = 0;
    let countsPorCategoria = {};
    let isEvaluating = false;
    let timerInterval = null;
    let segundos = 0;

    document.addEventListener('DOMContentLoaded', () => {
      iniciarJuego();
      document.getElementById('btnRestart').addEventListener('click', iniciarJuego);
    });

    function iniciarJuego() {
      segundos = 0;
      aciertos = 0;
      errores = 0;
      selectedItemChip = null;
      isEvaluating = false;
      document.getElementById('modalWin').style.display = 'none';
      document.getElementById('errors').textContent = 'Errores: 0';
      actualizarAciertos();
      iniciarCronometro();

      // Reset contadores de categorías
      countsPorCategoria = {};
      DATA_JUEGO.categorias.forEach(cat => countsPorCategoria[cat.id] = 0);

      renderizarCategorias();
      prepararElementos();
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

    function renderizarCategorias() {
      const zone = document.getElementById('categoriesZone');
      zone.innerHTML = '';

      DATA_JUEGO.categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-btn';
        btn.style.setProperty('--cat-color', cat.color);
        btn.dataset.id = cat.id;

        btn.innerHTML = '<span class="cat-icon">' + cat.icono + '</span>' +
                        '<span class="cat-name">' + cat.nombre + '</span>' +
                        '<span class="cat-count" id="count_' + cat.id + '">(' + countsPorCategoria[cat.id] + ')</span>';

        btn.addEventListener('click', () => alClickCategoria(cat.id));
        zone.appendChild(btn);
      });
    }

    function prepararElementos() {
      const pool = document.getElementById('itemsPool');
      pool.innerHTML = '';

      // Barajar elementos
      itemsRestantes = [...DATA_JUEGO.elementos];
      for (let i = itemsRestantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsRestantes[i], itemsRestantes[j]] = [itemsRestantes[j], itemsRestantes[i]];
      }

      itemsRestantes.forEach(item => {
        const chip = document.createElement('div');
        chip.className = 'item-chip';
        chip.dataset.id = item.id;
        chip.dataset.catId = item.categoriaId;
        chip.innerHTML = '<span>' + (item.emoji || '📌') + '</span> <span>' + item.texto + '</span>';

        chip.addEventListener('click', () => alClickElemento(chip));
        pool.appendChild(chip);
      });
    }

    function alClickElemento(chip) {
      if (isEvaluating) return;

      if (selectedItemChip === chip) {
        // Deseleccionar al tocar de nuevo
        chip.classList.remove('selected');
        selectedItemChip = null;
        return;
      }

      if (selectedItemChip) {
        selectedItemChip.classList.remove('selected');
      }

      selectedItemChip = chip;
      chip.classList.add('selected');
    }

    function alClickCategoria(catId) {
      if (isEvaluating || !selectedItemChip) return;

      isEvaluating = true;
      const expectedCatId = selectedItemChip.dataset.catId;

      if (expectedCatId === catId) {
        // ¡Correcto!
        selectedItemChip.classList.remove('selected');
        selectedItemChip.classList.add('correct-fly');

        aciertos++;
        countsPorCategoria[catId]++;
        const countEl = document.getElementById('count_' + catId);
        if (countEl) countEl.textContent = '(' + countsPorCategoria[catId] + ')';

        actualizarAciertos();

        const chipToRemove = selectedItemChip;
        selectedItemChip = null;

        setTimeout(() => {
          chipToRemove.remove();
          isEvaluating = false;

          if (aciertos === DATA_JUEGO.elementos.length) {
            finalizarJuego();
          }
        }, 350);

      } else {
        // Incorrecto
        errores++;
        document.getElementById('errors').textContent = 'Errores: ' + errores;
        selectedItemChip.classList.add('wrong');

        setTimeout(() => {
          if (selectedItemChip) {
            selectedItemChip.classList.remove('selected', 'wrong');
            selectedItemChip = null;
          }
          isEvaluating = false;
        }, 600);
      }
    }

    function actualizarAciertos() {
      document.getElementById('hits').textContent = 'Aciertos: ' + aciertos + ' / ' + DATA_JUEGO.elementos.length;
    }

    function finalizarJuego() {
      clearInterval(timerInterval);
      const mins = String(Math.floor(segundos / 60)).padStart(2, '0');
      const secs = String(segundos % 60).padStart(2, '0');
      document.getElementById('finalTime').textContent = mins + ':' + secs;
      document.getElementById('finalErrors').textContent = errores;
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
