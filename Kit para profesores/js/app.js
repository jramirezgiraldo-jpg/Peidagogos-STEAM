// ===========================================
// APP.JS - Lógica principal de la plataforma
// Peidagogos STEAM - Kit de Actividades Interactivas
// Orquesta: navegación, formularios, IA y descarga
// ===========================================

// Registro global de generadores (cada generador se auto-registra aquí)
window.PEIDAGOGOS = window.PEIDAGOGOS || {};

/**
 * Definiciones de las 10 actividades con sus metadatos y campos de formulario
 */
const ACTIVIDADES = [
  {
    id: 'sopa-de-letras',
    nombre: 'Sopa de Letras',
    icono: '🔤',
    color: '#4CAF50',
    descripcion: 'Encuentra las palabras ocultas en la cuadrícula. Selecciona arrastrando horizontal, vertical o diagonalmente.'
  },
  {
    id: 'crucigrama',
    nombre: 'Crucigrama',
    icono: '✏️',
    color: '#2196F3',
    descripcion: 'Lee las pistas y completa el crucigrama interactivo tocando las casillas para escribir las respuestas.'
  },
  {
    id: 'emparejar',
    nombre: 'Emparejar',
    icono: '🔗',
    color: '#E91E63',
    descripcion: 'Conecta cada concepto con su definición correcta. Toca un elemento y luego su pareja.'
  },
  {
    id: 'concentrese',
    nombre: 'Concéntrese',
    icono: '🧠',
    color: '#9C27B0',
    descripcion: 'Voltea las cartas y encuentra los pares concepto-definición. ¡Usa tu memoria!'
  },
  {
    id: 'laberinto',
    nombre: 'Laberinto de Decisiones',
    icono: '🌳',
    color: '#FF9800',
    descripcion: 'Historia interactiva donde cada decisión lleva a un camino diferente. ¡Elige sabiamente!'
  },
  {
    id: 'clasificador',
    nombre: 'Clasificador Tap & Sort',
    icono: '📦',
    color: '#00BCD4',
    descripcion: 'Clasifica elementos en sus categorías correctas. Toca un elemento y luego el contenedor adecuado.'
  },
  {
    id: 'anagrama',
    nombre: 'Anagrama',
    icono: '🔠',
    color: '#FF5722',
    descripcion: 'Ordena las letras desordenadas para descubrir la palabra oculta. Lee la pista para obtener ayuda.'
  },
  {
    id: 'ordenar-secuencias',
    nombre: 'Ordenar Secuencias',
    icono: '📋',
    color: '#607D8B',
    descripcion: 'Usa las flechas para organizar los pasos en el orden cronológico o lógico correcto.'
  },
  {
    id: 'escape-room',
    nombre: 'Escape Room',
    icono: '🔐',
    color: '#263238',
    descripcion: 'Resuelve acertijos científicos para descubrir códigos secretos y escapar de cada sala.'
  },
  {
    id: 'completar-parrafo',
    nombre: 'Completar el Párrafo',
    icono: '📝',
    color: '#7B1FA2',
    descripcion: 'Arrastra las palabras del banco para completar los espacios vacíos del texto educativo.'
  }
];

/**
 * Campos de formulario compartidos por todas las actividades
 */
const CAMPOS_COMUNES = [
  {
    id: 'tema',
    label: '📚 Tema de la actividad',
    type: 'text',
    placeholder: 'Ej. La célula, Fotosíntesis, Sistema solar...',
    required: true
  },
  {
    id: 'nivel',
    label: '🎓 Nivel educativo',
    type: 'select',
    options: [
      { value: 'primaria', text: 'Primaria (grados 3-5)' },
      { value: 'secundaria', text: 'Secundaria (grados 6-8)' },
      { value: 'media', text: 'Media (grados 9-11)' },
      { value: 'universidad', text: 'Universidad / Superior' }
    ],
    required: true
  }
];

/**
 * Campos adicionales específicos por tipo de actividad
 */
const CAMPOS_ESPECIFICOS = {
  'sopa-de-letras': [
    {
      id: 'instruccion',
      label: '📌 Instrucción personalizada (opcional)',
      type: 'text',
      placeholder: 'Ej. Encuentra las 10 palabras sobre los organelos celulares',
      required: false
    }
  ],
  'crucigrama': [],
  'emparejar': [],
  'concentrese': [],
  'laberinto': [
    {
      id: 'contexto',
      label: '🌍 Contexto o escenario narrativo (opcional)',
      type: 'textarea',
      placeholder: 'Ej. Eres un científico que debe salvar un ecosistema...',
      required: false
    }
  ],
  'clasificador': [
    {
      id: 'categorias',
      label: '📂 Categorías de clasificación',
      type: 'text',
      placeholder: 'Ej. Organelos membranosos, Organelos no membranosos',
      required: false
    }
  ],
  'anagrama': [],
  'ordenar-secuencias': [
    {
      id: 'proceso',
      label: '🔄 Proceso o secuencia a ordenar',
      type: 'text',
      placeholder: 'Ej. Mitosis, Ciclo del agua, Método científico',
      required: false
    }
  ],
  'escape-room': [
    {
      id: 'mision',
      label: '🎯 Nombre de la misión (opcional)',
      type: 'text',
      placeholder: 'Ej. Misión: Descifrar el ADN',
      required: false
    }
  ],
  'completar-parrafo': []
};

// ===================== ESTADO DE LA APP =====================
let estadoApp = {
  actividadActual: null,    // ID de la actividad seleccionada
  htmlGenerado: null,       // HTML generado para descargar
  nombreArchivo: null       // Nombre del archivo para descarga
};

// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', () => {
  renderizarGrid();
  cargarConfigUI();
  actualizarEstadoConfig();
  vincularEventos();
  cargarNombreDocente();
});

/**
 * Renderiza las 10 tarjetas de actividad en el grid
 */
function renderizarGrid() {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = ACTIVIDADES.map(act => `
    <div class="activity-card" data-id="${act.id}" style="--card-accent: ${act.color};">
      <div class="activity-card__icon">${act.icono}</div>
      <div class="activity-card__name">${act.nombre}</div>
      <div class="activity-card__desc">${act.descripcion}</div>
      <button type="button" class="activity-card__btn" style="background:${act.color}">
        ✨ Crear actividad
      </button>
    </div>
  `).join('');

  // Vincular clics en tarjetas
  grid.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      abrirCreacion(id);
    });
  });
}

/**
 * Abre el panel de creación para una actividad específica
 * @param {string} actividadId - ID de la actividad
 */
function abrirCreacion(actividadId) {
  const actividad = ACTIVIDADES.find(a => a.id === actividadId);
  if (!actividad) return;

  estadoApp.actividadActual = actividadId;

  // Ocultar grid y hero, mostrar panel de creación
  document.getElementById('activitiesGrid').style.display = 'none';
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('previewPanel').style.display = 'none';
  document.getElementById('creationPanel').style.display = 'block';

  // Actualizar título e ícono
  document.getElementById('creationTitle').textContent = actividad.nombre;
  document.getElementById('creationIcon').textContent = actividad.icono;

  // Construir formulario dinámico
  const form = document.getElementById('activityForm');
  const campos = [...CAMPOS_COMUNES, ...(CAMPOS_ESPECIFICOS[actividadId] || [])];

  form.innerHTML = campos.map(campo => {
    if (campo.type === 'select') {
      return `
        <div class="form-group">
          <label for="${campo.id}">${campo.label}</label>
          <select id="${campo.id}" ${campo.required ? 'required' : ''}>
            ${campo.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
          </select>
        </div>`;
    } else if (campo.type === 'textarea') {
      return `
        <div class="form-group">
          <label for="${campo.id}">${campo.label}</label>
          <textarea id="${campo.id}" placeholder="${campo.placeholder || ''}" ${campo.required ? 'required' : ''}></textarea>
        </div>`;
    } else {
      return `
        <div class="form-group">
          <label for="${campo.id}">${campo.label}</label>
          <input type="${campo.type}" id="${campo.id}" placeholder="${campo.placeholder || ''}" ${campo.required ? 'required' : ''}>
        </div>`;
    }
  }).join('');

  // Limpiar errores previos
  ocultarError();
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('btnGenerate').disabled = false;

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Vuelve a la vista principal del grid
 */
function volverAlGrid() {
  document.getElementById('creationPanel').style.display = 'none';
  document.getElementById('previewPanel').style.display = 'none';
  document.getElementById('activitiesGrid').style.display = '';
  document.getElementById('heroSection').style.display = '';
  estadoApp.actividadActual = null;
  estadoApp.htmlGenerado = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Vuelve del preview al formulario de creación
 */
function volverAlFormulario() {
  document.getElementById('previewPanel').style.display = 'none';
  document.getElementById('creationPanel').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================== GENERACIÓN CON IA =====================

/**
 * Proceso principal: recopilar datos → llamar IA → generar HTML → previsualizar
 */
async function generarActividad() {
  const actividadId = estadoApp.actividadActual;
  const generador = window.PEIDAGOGOS[actividadId];

  if (!generador) {
    mostrarError(`El generador para "${actividadId}" no está disponible todavía.`);
    return;
  }

  if (!AIService.estaConfigurado()) {
    mostrarError('⚠️ Configura tu API Key primero. Haz clic en ⚙️ en la esquina superior derecha.');
    return;
  }

  // Recopilar datos del formulario
  const datos = recopilarFormulario();
  if (!datos) return;

  const docente = document.getElementById('teacherName').value.trim() || 'Docente';

  // Mostrar loading
  const btnGenerate = document.getElementById('btnGenerate');
  btnGenerate.disabled = true;
  document.getElementById('loadingState').style.display = 'block';
  ocultarError();

  try {
    // Paso 1: Obtener el prompt del generador
    const { system, user } = generador.generarPrompt(datos);

    // Paso 2: Enviar a la IA
    document.getElementById('loadingText').textContent = '🤖 Consultando a la IA... Esto puede tardar 10-30 segundos.';
    const respuestaIA = await AIService.enviarPrompt(system, user);

    // Paso 3: Parsear la respuesta
    document.getElementById('loadingText').textContent = '⚙️ Construyendo la actividad interactiva...';
    const contenido = generador.parsearRespuesta(respuestaIA);

    // Paso 4: Generar HTML autónomo
    const metadata = {
      tema: datos.tema || datos.proceso || datos.mision || 'Actividad',
      docente: docente,
      logoBase64: window.LOGO_BASE64 || '',
      nivel: datos.nivel || '',
      instruccion: datos.instruccion || ''
    };

    const htmlCompleto = generador.generarHTML(contenido, metadata);

    // Guardar en estado
    const actividad = ACTIVIDADES.find(a => a.id === actividadId);
    estadoApp.htmlGenerado = htmlCompleto;
    estadoApp.nombreArchivo = formatearNombreArchivo(
      actividad.nombre,
      metadata.tema,
      docente
    );

    // Paso 5: Mostrar previsualización
    mostrarPreview(htmlCompleto);
    mostrarToast('✅ ¡Actividad generada exitosamente!', 'success');

  } catch (error) {
    console.error('[App] Error al generar:', error);
    mostrarError(`❌ Error: ${error.message}`);
  } finally {
    btnGenerate.disabled = false;
    document.getElementById('loadingState').style.display = 'none';
  }
}

/**
 * Recopila los datos del formulario actual
 * @returns {Object|null} Datos del formulario o null si falta alguno requerido
 */
function recopilarFormulario() {
  const form = document.getElementById('activityForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  const datos = {};

  for (const input of inputs) {
    const valor = input.value.trim();
    if (input.required && !valor) {
      mostrarError(`Por favor completa el campo "${input.previousElementSibling?.textContent || input.id}".`);
      input.focus();
      return null;
    }
    datos[input.id] = valor;
  }

  return datos;
}

/**
 * Muestra la previsualización del HTML generado en un iframe
 * @param {string} html - Contenido HTML completo
 */
function mostrarPreview(html) {
  document.getElementById('creationPanel').style.display = 'none';
  document.getElementById('previewPanel').style.display = 'block';

  const iframe = document.getElementById('previewFrame');
  iframe.srcdoc = html;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================== DESCARGA E IMPRESIÓN =====================

/**
 * Descarga el HTML generado como archivo
 */
function descargarActividadHTML() {
  if (!estadoApp.htmlGenerado) {
    mostrarToast('No hay actividad para descargar', 'warning');
    return;
  }
  descargarHTML(estadoApp.htmlGenerado, estadoApp.nombreArchivo);
  mostrarToast('📥 Archivo descargado', 'success');
}

/**
 * Abre ventana de impresión para el HTML generado
 */
function imprimirActividad() {
  if (!estadoApp.htmlGenerado) {
    mostrarToast('No hay actividad para imprimir', 'warning');
    return;
  }
  imprimirHTML(estadoApp.htmlGenerado);
}

// ===================== CONFIGURACIÓN DE IA =====================

/**
 * Abre el modal de configuración
 */
function abrirSettings() {
  const config = AIService.obtenerConfig();
  document.getElementById('aiProvider').value = config.proveedor || 'openrouter';
  document.getElementById('apiKey').value = config.apiKey || '';
  document.getElementById('aiModel').value = config.modelo || '';
  actualizarHintModelo();
  document.getElementById('settingsModal').style.display = 'flex';
}

/**
 * Cierra el modal de configuración
 */
function cerrarSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

/**
 * Guarda la configuración de IA
 */
function guardarSettings() {
  const config = {
    proveedor: document.getElementById('aiProvider').value,
    apiKey: document.getElementById('apiKey').value.trim(),
    modelo: document.getElementById('aiModel').value.trim()
  };

  AIService.guardarConfig(config);
  actualizarEstadoConfig();
  cerrarSettings();
  mostrarToast('✅ Configuración guardada', 'success');
}

/**
 * Actualiza el indicador visual de configuración
 */
function actualizarEstadoConfig() {
  const statusEl = document.getElementById('configStatus');
  if (AIService.estaConfigurado()) {
    const config = AIService.obtenerConfig();
    const proveedorNombre = {
      openrouter: 'OpenRouter',
      gemini: 'Gemini',
      deepseek: 'DeepSeek',
      openai: 'OpenAI'
    }[config.proveedor] || config.proveedor;

    statusEl.innerHTML = `
      <span class="config-status config-status--ok">
        ✅ IA conectada: ${proveedorNombre}
      </span>`;
  } else {
    statusEl.innerHTML = `
      <span class="config-status config-status--warn" onclick="abrirSettings()">
        ⚠️ Configura tu API Key para empezar
      </span>`;
  }
}

/**
 * Actualiza el hint del modelo y clave sugerida según el proveedor seleccionado
 */
function actualizarHintModelo() {
  const proveedor = document.getElementById('aiProvider').value;
  const hints = {
    openrouter: 'Por defecto: deepseek/deepseek-chat',
    gemini: 'Por defecto: gemini-2.0-flash',
    deepseek: 'Por defecto: deepseek-chat',
    openai: 'Por defecto: gpt-4o-mini'
  };
  document.getElementById('modelHint').textContent = hints[proveedor] || '';
  
  // Si no hay key ingresada o es un preset anterior, sugerir preset del proveedor
  const apiKeyInput = document.getElementById('apiKey');
  const currentKey = apiKeyInput.value.trim();
  const isPreset = Object.values(AIService.presetKeys || {}).includes(currentKey);
  if (!currentKey || isPreset) {
    apiKeyInput.value = AIService.presetKeys?.[proveedor] || '';
  }
}

/**
 * Carga la configuración guardada en el UI
 */
function cargarConfigUI() {
  const config = AIService.obtenerConfig();
  document.getElementById('aiProvider').value = config.proveedor || 'openrouter';
  actualizarHintModelo();
}

/**
 * Guarda y carga el nombre del docente en localStorage
 */
function cargarNombreDocente() {
  const saved = localStorage.getItem('peidagogos_docente');
  if (saved) {
    document.getElementById('teacherName').value = saved;
  }
  // Auto-guardar al cambiar
  document.getElementById('teacherName').addEventListener('change', (e) => {
    localStorage.setItem('peidagogos_docente', e.target.value.trim());
  });
}

// ===================== UTILIDADES UI =====================

/**
 * Muestra un mensaje de error en el panel de creación
 * @param {string} msg - Mensaje de error
 */
function mostrarError(msg) {
  const el = document.getElementById('errorDisplay');
  el.textContent = msg;
  el.style.display = 'block';
}

/**
 * Oculta el mensaje de error
 */
function ocultarError() {
  document.getElementById('errorDisplay').style.display = 'none';
}

/**
 * Muestra una notificación toast temporal
 * @param {string} msg - Mensaje
 * @param {string} tipo - 'success', 'error' o 'warning'
 */
function mostrarToast(msg, tipo = 'success') {
  // Eliminar toasts anteriores
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===================== EVENTOS =====================

/**
 * Vincula todos los event listeners
 */
function vincularEventos() {
  // Navegación
  document.getElementById('btnBack').addEventListener('click', volverAlGrid);
  document.getElementById('btnBackFromPreview').addEventListener('click', volverAlFormulario);

  // Generación
  document.getElementById('btnGenerate').addEventListener('click', generarActividad);

  // Descarga e impresión
  document.getElementById('btnDownloadHTML').addEventListener('click', descargarActividadHTML);
  document.getElementById('btnPrint').addEventListener('click', imprimirActividad);

  // Settings
  document.getElementById('btnSettings').addEventListener('click', abrirSettings);
  document.getElementById('closeSettings').addEventListener('click', cerrarSettings);
  document.getElementById('btnSaveSettings').addEventListener('click', guardarSettings);
  document.getElementById('aiProvider').addEventListener('change', actualizarHintModelo);

  // Cerrar modal al hacer clic fuera
  document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') cerrarSettings();
  });

  // Tecla Escape para cerrar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarSettings();
  });
}
