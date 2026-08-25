// ===========================================
// GENERADOR: LABERINTO DE DECISIONES
// Peidagogos STEAM - Kit de Actividades
// ===========================================

window.PEIDAGOGOS = window.PEIDAGOGOS || {};

window.PEIDAGOGOS['laberinto'] = {
  /**
   * Genera el prompt para la IA
   */
  generarPrompt(datos) {
    const tema = datos.tema || 'la célula';
    const nivel = datos.nivel || 'secundaria';
    const contexto = datos.contexto || '';

    const system = `Eres un diseñador instruccional senior y experto en narrativa ramificada para educación STEAM. Tu tarea es generar un árbol de decisiones pedagógico completo con al menos 8 escenas interactivas sobre el tema solicitado para estudiantes de nivel ${nivel}.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin bloques de código markdown, solo el JSON puro.`;

    const user = `Crea una historia interactiva ramificada (Laberinto de Decisiones) sobre:
TEMA: "${tema}"
NIVEL EDUCATIVO: "${nivel}"
${contexto ? `CONTEXTO ADICIONAL: "${contexto}"` : ''}

Estructura JSON requerida:
{
  "tema": "${tema}",
  "instruccion": "Lee atentamente cada situación y elige la mejor decisión para resolver el reto científico. ¡Tus elecciones tienen consecuencias!",
  "nodos": [
    {
      "id": "inicio",
      "tipo": "inicio",
      "titulo": "El Reto Inicial",
      "texto": "Texto inmersivo que plantea el problema científico...",
      "opciones": [
        { "texto": "Opción A...", "siguienteId": "nodo_2a" },
        { "texto": "Opción B...", "siguienteId": "nodo_2b" }
      ]
    },
    {
      "id": "nodo_2a",
      "tipo": "decision",
      "titulo": "Situación 2A",
      "texto": "Explicación de lo que ocurre y nuevo dilema...",
      "opciones": [
        { "texto": "Opción...", "siguienteId": "nodo_3a" },
        { "texto": "Opción...", "siguienteId": "final_falla1" }
      ]
    },
    {
      "id": "nodo_2b",
      "tipo": "decision",
      "titulo": "Situación 2B",
      "texto": "Explicación de lo que ocurre y nuevo dilema...",
      "opciones": [
        { "texto": "Opción...", "siguienteId": "nodo_3b" },
        { "texto": "Opción...", "siguienteId": "final_falla2" }
      ]
    },
    {
      "id": "nodo_3a",
      "tipo": "decision",
      "titulo": "Decisión Crítica",
      "texto": "Situación avanzada...",
      "opciones": [
        { "texto": "Opción correcta...", "siguienteId": "final_exito" },
        { "texto": "Opción incorrecta...", "siguienteId": "final_falla1" }
      ]
    },
    {
      "id": "nodo_3b",
      "tipo": "decision",
      "titulo": "Ruta Alternativa",
      "texto": "Situación avanzada...",
      "opciones": [
        { "texto": "Opción correcta...", "siguienteId": "final_exito" },
        { "texto": "Opción incorrecta...", "siguienteId": "final_falla2" }
      ]
    },
    {
      "id": "final_exito",
      "tipo": "finalExito",
      "titulo": "🏆 ¡Misión Científica Cumplida!",
      "texto": "Explicación detallada de por qué las decisiones tomadas fueron las correctas y qué principios científicos se aplicaron exitosamente.",
      "opciones": []
    },
    {
      "id": "final_falla1",
      "tipo": "finalFalla",
      "titulo": "⚠️ Resultado Desfavorable - Oportunidad de Aprendizaje",
      "texto": "Explicación pedagógica de por qué esta decisión causó problemas y qué conceptos científicos se deben repasar.",
      "opciones": []
    },
    {
      "id": "final_falla2",
      "tipo": "finalFalla",
      "titulo": "⚠️ Consecuencia Inesperada",
      "texto": "Explicación pedagógica del error conceptual cometido y cómo evitarlo en el futuro.",
      "opciones": []
    }
  ]
}

Reglas estrictas:
- Mínimo 8 nodos en total.
- Al menos 1 nodo de inicio, varios de decisión, 1 finalExito y al menos 2 finalFalla.
- Cada opción debe tener texto claro y un siguienteId que apunte a un nodo existente.
- Lenguaje inmersivo, riguroso pero accesible para nivel ${nivel}.`;

    return { system, user };
  },

  /**
   * Parsea la respuesta de la IA
   */
  parsearRespuesta(textoIA) {
    const datos = AIService.extraerJSON(textoIA);
    if (!datos.nodos || !Array.isArray(datos.nodos) || datos.nodos.length < 5) {
      throw new Error('La IA no devolvió la estructura de árbol de decisiones requerida.');
    }
    return datos;
  },

  /**
   * Genera el archivo HTML autónomo completo
   */
  generarHTML(contenido, meta) {
    const nodosJSON = JSON.stringify(contenido.nodos);
    const tituloTema = escaparHTML(meta.tema || contenido.tema || 'Laberinto de Decisiones');
    const instruccion = escaparHTML(meta.instruccion || contenido.instruccion || 'Lee cada situación y toma la mejor decisión.');
    const docente = escaparHTML(meta.docente || 'Docente');
    const logoBase64 = meta.logoBase64 || '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Laberinto de Decisiones: ${tituloTema} | Peidagogos STEAM</title>
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
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
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
    /* Contenedor Principal */
    .game-container {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    /* Barra de Progreso */
    .stats-bar {
      display: flex;
      justify-content: space-between;
      width: 100%;
      background: #FFFFFF;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary);
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .step-badge {
      background: #E3F2FD;
      color: #1565C0;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.78rem;
    }
    /* Tarjeta de Escena */
    .scene-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 24px 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      transition: opacity 0.3s ease, transform 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .scene-card.fade-out {
      opacity: 0;
      transform: translateY(-8px);
    }
    .scene-card.fade-in {
      opacity: 1;
      transform: translateY(0);
    }
    .scene-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      border-radius: 20px;
      align-self: flex-start;
    }
    .type-inicio { background: #E1F5FE; color: #0288D1; }
    .type-decision { background: #FFF3E0; color: #F57C00; }
    .type-finalExito { background: #E8F5E9; color: #2E7D32; }
    .type-finalFalla { background: #FFEBEE; color: #C62828; }
    .scene-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      line-height: 1.3;
    }
    .scene-text {
      font-size: 1rem;
      color: #37474F;
      line-height: 1.7;
    }
    /* Botones de Decisión */
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .option-btn {
      background: #FFFFFF;
      border: 2px solid var(--primary);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .option-btn:hover, .option-btn:active {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(27,42,74,0.2);
    }
    .option-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    /* Estilos de Finales */
    .final-success-box {
      background: #E8F5E9;
      border: 2px solid #81C784;
      border-radius: 12px;
      padding: 16px;
      color: #1B5E20;
    }
    .final-failure-box {
      background: #FFF3E0;
      border: 2px solid #FFB74D;
      border-radius: 12px;
      padding: 16px;
      color: #E65100;
    }
    .btn-restart {
      background: var(--primary);
      color: white;
      border: none;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
      margin-top: 8px;
      text-align: center;
    }
    .btn-restart:hover { background: #2C3E6B; }
    @keyframes confetiFall { to { top: 110%; transform: rotate(720deg); } }
    @media print {
      body { background: white; padding: 0; }
      .header-inst, .game-container { box-shadow: none; max-width: 100%; }
      .option-btn { border: 1px solid #ccc; }
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
    <div class="stats-bar">
      <span>🌳 Laberinto: ${tituloTema}</span>
      <span class="step-badge" id="stepBadge">Paso 1</span>
    </div>

    <div class="scene-card fade-in" id="sceneCard">
      <!-- Contenido dinámico del nodo -->
    </div>
  </main>

  <script>
    const NODOS_HISTORIA = ${nodosJSON};

    let nodoActualId = 'inicio';
    let pasoContador = 1;
    let historial = [];

    document.addEventListener('DOMContentLoaded', () => {
      iniciarHistoria();
    });

    function iniciarHistoria() {
      nodoActualId = NODOS_HISTORIA[0].id;
      pasoContador = 1;
      historial = [];
      cargarNodo(nodoActualId);
    }

    function cargarNodo(id) {
      const nodo = NODOS_HISTORIA.find(n => n.id === id);
      if (!nodo) {
        console.error('Nodo no encontrado:', id);
        return;
      }

      nodoActualId = id;
      document.getElementById('stepBadge').textContent = 'Paso ' + pasoContador;

      const card = document.getElementById('sceneCard');
      card.classList.add('fade-out');

      setTimeout(() => {
        renderizarContenidoNodo(nodo);
        card.classList.remove('fade-out');
        card.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (nodo.tipo === 'finalExito') {
          lanzarConfeti();
        }
      }, 250);
    }

    function renderizarContenidoNodo(nodo) {
      const card = document.getElementById('sceneCard');
      let typeBadge = '';
      let typeClass = 'type-' + nodo.tipo;

      if (nodo.tipo === 'inicio') typeBadge = '🚀 Planteamiento Inicial';
      else if (nodo.tipo === 'decision') typeBadge = '🤔 Toma una Decisión';
      else if (nodo.tipo === 'finalExito') typeBadge = '🏆 Final Exitoso';
      else if (nodo.tipo === 'finalFalla') typeBadge = '💡 Aprendizaje';

      let html = '<div class="scene-type-badge ' + typeClass + '">' + typeBadge + '</div>';
      html += '<h2 class="scene-title">' + (nodo.titulo || '') + '</h2>';
      html += '<div class="scene-text">' + nodo.texto + '</div>';

      if (nodo.tipo === 'finalExito' || nodo.tipo === 'finalFalla') {
        html += '<button class="btn-restart" id="btnRestartStory">🔄 Comenzar la Historia de Nuevo</button>';
      } else if (nodo.opciones && nodo.opciones.length > 0) {
        html += '<div class="options-container">';
        nodo.opciones.forEach((opc, idx) => {
          const letras = ['A', 'B', 'C', 'D'];
          html += '<button class="option-btn" data-next="' + opc.siguienteId + '">';
          html += '<span class="option-icon">' + letras[idx % 4] + '</span>';
          html += '<span>' + opc.texto + '</span>';
          html += '</button>';
        });
        html += '</div>';
      }

      card.innerHTML = html;

      // Vincular eventos de botones
      const btnRestart = document.getElementById('btnRestartStory');
      if (btnRestart) {
        btnRestart.addEventListener('click', iniciarHistoria);
      }

      const optionBtns = card.querySelectorAll('.option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const nextId = btn.dataset.next;
          pasoContador++;
          cargarNodo(nextId);
        });
      });
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
