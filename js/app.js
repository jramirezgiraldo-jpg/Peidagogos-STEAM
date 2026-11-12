import { ACTIVITIES, CATEGORIES } from "./prompts.js";
import { 
  OPENROUTER_MODELS, 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredModel, 
  setStoredModel,
  generateActivityWithOpenRouter,
  suggestKeywordsWithIA,
  checkServerConfig
} from "./openrouter.js";
import { 
  getSavedActivities, 
  saveActivityToHistory, 
  deleteActivityFromHistory, 
  downloadHtmlFile 
} from "./storage.js";
import { getIcon } from "./icons.js";

// Estado de la aplicación
const state = {
  currentTab: "generator", // "generator", "catalog", "library", "settings"
  selectedCategory: "all",
  selectedActivityId: "sopa-de-letras",
  currentHtmlOutput: "",
  currentActivityMetadata: null,
  isGenerating: false,
  previewMode: "mobile", // "mobile" o "desktop"
  searchQuery: "",
  serverHasKey: false,
  elapsedSeconds: 0,
  timerInterval: null
};

// Elementos DOM
const dom = {};

function cacheDom() {
  dom.navTabs = document.querySelectorAll(".nav-tab");
  dom.tabPanels = document.querySelectorAll(".tab-panel");
  
  // Generador
  dom.topicInput = document.getElementById("topic-input");
  dom.gradeSelect = document.getElementById("grade-select");
  dom.keywordsInput = document.getElementById("keywords-input");
  dom.instructionInput = document.getElementById("instruction-input");
  dom.suggestKeywordsBtn = document.getElementById("suggest-keywords-btn");
  dom.generateBtn = document.getElementById("generate-btn");
  dom.activitySelectDropdown = document.getElementById("activity-select-dropdown");
  dom.activitiesGrid = document.getElementById("activities-selector-grid");
  dom.selectedActivitySummary = document.getElementById("selected-activity-summary");

  // Modal emergente de generación con tiempo estimado
  dom.generatingModal = document.getElementById("generating-modal");
  dom.generatingText = document.getElementById("generating-text");
  dom.generatingElapsed = document.getElementById("generating-elapsed");
  dom.generatingEstimate = document.getElementById("generating-estimate");
  dom.generatingPhase = document.getElementById("generating-phase");
  dom.generatingPct = document.getElementById("generating-pct");
  dom.progressBar = document.getElementById("progress-bar");

  // Simulador / Previsualización
  dom.previewSection = document.getElementById("preview-section");
  dom.previewFrame = document.getElementById("preview-iframe");
  dom.previewWrapper = document.getElementById("preview-wrapper");
  dom.previewModeMobileBtn = document.getElementById("preview-mode-mobile");
  dom.previewModeDesktopBtn = document.getElementById("preview-mode-desktop");
  dom.downloadBtn = document.getElementById("download-btn");
  dom.copyHtmlBtn = document.getElementById("copy-html-btn");
  dom.openNewTabBtn = document.getElementById("open-new-tab-btn");
  dom.refreshPreviewBtn = document.getElementById("refresh-preview-btn");
  dom.previewTitle = document.getElementById("preview-title");
  dom.previewSubtitle = document.getElementById("preview-subtitle");

  // Catálogo completo
  dom.catalogGrid = document.getElementById("catalog-grid");
  dom.categoryPills = document.getElementById("category-pills");
  dom.catalogSearch = document.getElementById("catalog-search");

  // Biblioteca / Historial
  dom.libraryGrid = document.getElementById("library-grid");
  dom.libraryEmpty = document.getElementById("library-empty");

  // Configuración
  dom.modelSelect = document.getElementById("model-select");
  dom.saveSettingsBtn = document.getElementById("save-settings-btn");
  dom.apiStatusPill = document.getElementById("api-status-pill");
  dom.headerApiKeyModalBtn = document.getElementById("header-api-key-btn");

  // Modal de Prompts
  dom.promptModal = document.getElementById("prompt-modal");
  dom.promptModalTitle = document.getElementById("prompt-modal-title");
  dom.promptModalCode = document.getElementById("prompt-modal-code");
  dom.promptModalCopyBtn = document.getElementById("prompt-modal-copy-btn");
  dom.promptModalCloseBtn = document.getElementById("prompt-modal-close-btn");

  // Toast
  dom.toastContainer = document.getElementById("toast-container");
}

// Inicialización de la app
function initApp() {
  try { cacheDom(); } catch(e) { console.error("Error cacheDom:", e); }
  try { initApiStatus(); } catch(e) { console.error("Error initApiStatus:", e); }
  try { renderActivitySelectors(); } catch(e) { console.error("Error renderActivitySelectors:", e); }
  try { renderCategoryPills(); } catch(e) { console.error("Error renderCategoryPills:", e); }
  try { renderCatalog(); } catch(e) { console.error("Error renderCatalog:", e); }
  try { renderModelOptions(); } catch(e) { console.error("Error renderModelOptions:", e); }
  try { renderSavedActivities(); } catch(e) { console.error("Error renderSavedActivities:", e); }
  try { attachEvents(); } catch(e) { console.error("Error attachEvents:", e); }
  try { selectActivity("sopa-de-letras"); } catch(e) { console.error("Error selectActivity:", e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.handleGenerateActivity = handleGenerateActivity;
window.showToast = showToast;

async function initApiStatus() {
  // Consultar al servidor si tiene la clave configurada en Render
  try {
    const config = await checkServerConfig();
    state.serverHasKey = !!config.hasServerKey;
  } catch (e) {
    state.serverHasKey = true; // Asumir backend activo por defecto en despliegue
  }

  updateApiStatusUI();
}

function updateApiStatusUI() {
  dom.apiStatusPill.className = "api-pill connected";
  dom.apiStatusPill.innerHTML = `<span class="pulse-dot"></span> IA Conectada`;
  dom.apiStatusPill.title = "Servidor con Inteligencia Artificial conectado";
}

function renderModelOptions() {
  const currentModel = getStoredModel();
  dom.modelSelect.innerHTML = OPENROUTER_MODELS.map(m => `
    <option value="${m.id}" ${m.id === currentModel ? "selected" : ""}>
      ${m.name} (${m.badge} - ${m.cost})
    </option>
  `).join("");
}

function attachEvents() {
  // Navegación por pestañas
  dom.navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });

  // Selector desplegable de actividades
  if (dom.activitySelectDropdown) {
    dom.activitySelectDropdown.addEventListener("change", e => {
      selectActivity(e.target.value);
    });
  }

  // Selector de actividades en el generador (si existe)
  if (dom.activitiesGrid) {
    dom.activitiesGrid.addEventListener("click", e => {
      const card = e.target.closest(".activity-card");
      if (card) {
        const id = card.dataset.id;
        selectActivity(id);
      }
    });
  }

  // Sugerir palabras clave
  dom.suggestKeywordsBtn.addEventListener("click", async () => {
    const topic = dom.topicInput.value.trim();
    const grade = dom.gradeSelect.value;
    if (!topic) {
      showToast("Ingresa primero un tema para poder sugerir palabras clave.", "warning");
      dom.topicInput.focus();
      return;
    }

    try {
      dom.suggestKeywordsBtn.disabled = true;
      dom.suggestKeywordsBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span>Generando...</span>
      `;
      const keywords = await suggestKeywordsWithIA({ topic, grade, model: getStoredModel() });
      dom.keywordsInput.value = keywords;
      showToast("¡10 Palabras clave sugeridas con éxito!", "success");
    } catch (err) {
      showToast(err.message || "Error al sugerir palabras.", "error");
    } finally {
      dom.suggestKeywordsBtn.disabled = false;
      dom.suggestKeywordsBtn.innerHTML = `
        ${getIcon("sparkles")}
        <span>Sugerir con IA</span>
      `;
    }
  });

  // Botón principal Generar Actividad
  dom.generateBtn.addEventListener("click", handleGenerateActivity);

  // Controles del simulador
  dom.previewModeMobileBtn.addEventListener("click", () => setPreviewMode("mobile"));
  dom.previewModeDesktopBtn.addEventListener("click", () => setPreviewMode("desktop"));

  dom.downloadBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    const topicName = (state.currentActivityMetadata?.topic || "actividad").replace(/[^a-zA-Z0-9_-]/g, "_");
    const actType = (state.currentActivityMetadata?.activityTypeId || "juego");
    const fileName = `Peidagogos_${actType}_${topicName}.html`;
    downloadHtmlFile(fileName, state.currentHtmlOutput);
    showToast(`Archivo "${fileName}" descargado con éxito.`, "success");
  });

  dom.copyHtmlBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    navigator.clipboard.writeText(state.currentHtmlOutput).then(() => {
      showToast("¡Código HTML completo copiado al portapapeles!", "success");
    });
  });

  dom.openNewTabBtn.addEventListener("click", () => {
    if (!state.currentHtmlOutput) return;
    const newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(state.currentHtmlOutput);
    newWindow.document.close();
  });

  dom.refreshPreviewBtn.addEventListener("click", () => {
    if (state.currentHtmlOutput) {
      loadIntoPreview(state.currentHtmlOutput);
      showToast("Juego reiniciado.", "info");
    }
  });

  // Filtros del catálogo
  dom.categoryPills.addEventListener("click", e => {
    const pill = e.target.closest(".cat-pill");
    if (pill) {
      state.selectedCategory = pill.dataset.cat;
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active", "bg-blue-600", "text-white"));
      pill.classList.add("active", "bg-blue-600", "text-white");
      renderCatalog();
    }
  });

  dom.catalogSearch.addEventListener("input", e => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderCatalog();
  });

  // Guardar configuración de modelo
  dom.saveSettingsBtn.addEventListener("click", () => {
    const model = dom.modelSelect.value;
    setStoredModel(model);
    showToast("Modelo pedagógico actualizado correctamente.", "success");
  });

  // Pill del header abre configuración
  dom.apiStatusPill.addEventListener("click", () => switchTab("settings"));

  // Modal de prompt
  dom.promptModalCloseBtn.addEventListener("click", closePromptModal);
  dom.promptModal.addEventListener("click", e => {
    if (e.target === dom.promptModal) closePromptModal();
  });
}

function switchTab(tabName) {
  state.currentTab = tabName;
  dom.navTabs.forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tabName);
  });

  dom.tabPanels.forEach(panel => {
    panel.classList.toggle("hidden", panel.id !== `tab-${tabName}`);
  });

  if (tabName === "library") {
    renderSavedActivities();
  }
}

function selectActivity(activityId) {
  state.selectedActivityId = activityId;
  const act = ACTIVITIES.find(a => a.id === activityId);
  if (!act) return;

  // Sincronizar el menú desplegable si cambió desde afuera
  if (dom.activitySelectDropdown && dom.activitySelectDropdown.value !== activityId) {
    dom.activitySelectDropdown.value = activityId;
  }

  // Actualizar clases de tarjetas si existen
  document.querySelectorAll(".activity-card").forEach(c => {
    c.classList.toggle("selected", c.dataset.id === activityId);
  });

  // Actualizar resumen
  dom.selectedActivitySummary.innerHTML = `
    <div class="card-icon">
      ${getIcon(act.icon)}
    </div>
    <div style="flex:1;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <span class="card-badge" style="background:#e0f2fe; padding:2px 8px; border-radius:4px;">Actividad #${act.number}</span>
        <span style="font-size:11px; font-weight:700; color:var(--slate-500);">${act.badge}</span>
      </div>
      <h4 style="font-size:16px; font-weight:800; color:var(--slate-900); margin-bottom:2px;">${act.title}</h4>
      <p style="font-size:12px; color:var(--slate-600); line-height:1.4;">${act.description}</p>
    </div>
  `;

  // Autocompletar instrucción sugerida si está vacía
  if (!dom.instructionInput.value || dom.instructionInput.dataset.autoFilled === "true") {
    dom.instructionInput.value = act.suggestedInstructions || "";
    dom.instructionInput.dataset.autoFilled = "true";
  }
}

function renderActivitySelectors() {
  if (!dom.activitiesGrid) return;
  dom.activitiesGrid.innerHTML = ACTIVITIES.map(act => `
    <div data-id="${act.id}" class="activity-card">
      <div>
        <div class="card-top">
          <div class="card-icon">
            ${getIcon(act.icon)}
          </div>
          <span class="card-num">#${act.number}</span>
        </div>
        <h5 class="card-title">${act.title}</h5>
      </div>
      <div class="card-badge">${act.badge}</div>
    </div>
  `).join("");
}

function renderCategoryPills() {
  dom.categoryPills.innerHTML = CATEGORIES.map(cat => `
    <button data-cat="${cat.id}" class="cat-pill ${cat.id === "all" ? "active" : ""}">
      ${cat.name} (${cat.count})
    </button>
  `).join("");
}

function renderCatalog() {
  let list = ACTIVITIES;
  if (state.selectedCategory !== "all") {
    list = list.filter(a => a.category === state.selectedCategory);
  }
  if (state.searchQuery) {
    list = list.filter(a => 
      a.title.toLowerCase().includes(state.searchQuery) || 
      a.description.toLowerCase().includes(state.searchQuery) ||
      a.badge.toLowerCase().includes(state.searchQuery)
    );
  }

  dom.catalogGrid.innerHTML = list.map(act => `
    <div class="catalog-card">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div class="card-icon" style="background:#e0f2fe; color:var(--primary); width:44px; height:44px; border-radius:10px;">
            ${getIcon(act.icon)}
          </div>
          <span style="font-size:11px; font-weight:800; color:var(--slate-400); background:var(--slate-100); padding:3px 8px; border-radius:12px;">#${act.number}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="card-badge" style="background:#f0fdf4; color:#15803d; padding:2px 8px; border-radius:4px;">${act.badge}</span>
          <span style="font-size:11px; color:var(--slate-500);">${act.gradeRecommended}</span>
        </div>
        <h4 style="font-size:17px; font-weight:800; color:var(--slate-900); margin-bottom:6px;">${act.title}</h4>
        <p style="font-size:13px; color:var(--slate-600); line-height:1.5; margin-bottom:16px;">${act.description}</p>
      </div>

      <div style="padding-top:14px; border-top:1px solid var(--slate-100); display:flex; gap:8px;">
        <button onclick="window.useActivityInGenerator('${act.id}')" class="btn-action" style="flex:1; background:var(--primary); color:white; border:none; justify-content:center;">
          ${getIcon("play")}
          <span>Crear con este Formato</span>
        </button>
        <button onclick="window.showPromptModal('${act.id}')" class="btn-action" title="Ver Prompt Maestro">
          ${getIcon("copy")}
        </button>
      </div>
    </div>
  `).join("");
}

window.useActivityInGenerator = function(activityId) {
  selectActivity(activityId);
  switchTab("generator");
  dom.topicInput.focus();
  showToast("Formato cargado en el generador.", "info");
};

window.showPromptModal = function(activityId) {
  const act = ACTIVITIES.find(a => a.id === activityId);
  if (!act) return;

  const samplePrompt = act.buildPrompt({
    topic: dom.topicInput.value.trim() || "[Tema de clase]",
    grade: dom.gradeSelect.value || "[Nivel Educativo]",
    keywords: dom.keywordsInput.value.trim() || "[10 Palabras clave]",
    instruction: dom.instructionInput.value.trim() || act.suggestedInstructions
  });

  dom.promptModalTitle.textContent = `Prompt Maestro: ${act.title}`;
  dom.promptModalCode.textContent = samplePrompt;
  dom.promptModalCopyBtn.onclick = () => {
    navigator.clipboard.writeText(samplePrompt).then(() => {
      showToast("¡Prompt copiado al portapapeles!", "success");
      closePromptModal();
    });
  };

  dom.promptModal.classList.remove("hidden");
  dom.promptModal.classList.add("flex");
};

function closePromptModal() {
  dom.promptModal.classList.add("hidden");
  dom.promptModal.classList.remove("flex");
}

async function handleGenerateActivity() {
  const topic = dom.topicInput.value.trim();
  const grade = dom.gradeSelect.value;
  const keywords = dom.keywordsInput.value.trim();
  const instruction = dom.instructionInput.value.trim();

  if (!topic) {
    showToast("Por favor ingresa el tema de la actividad.", "warning");
    dom.topicInput.focus();
    return;
  }

  const act = ACTIVITIES.find(a => a.id === state.selectedActivityId);
  if (!act) return;

  const compiledPrompt = act.buildPrompt({
    topic,
    grade,
    keywords: keywords || "[Genera 10 conceptos acordes al tema y grado]",
    instruction: instruction || act.suggestedInstructions
  });

  try {
    state.isGenerating = true;
    updateGeneratingUI(true, "Iniciando conexión con OpenRouter...");
    
    let receivedHtml = "";
    receivedHtml = await generateActivityWithOpenRouter({
      prompt: compiledPrompt,
      model: getStoredModel(),
      onStatus: statusMsg => {
        if (dom.generatingText) dom.generatingText.textContent = statusMsg;
      },
      onChunk: accumulatedText => {
        // Actualizar barra de progreso estimada y fases
        const len = accumulatedText.length;
        const progress = Math.min(96, Math.max(15, Math.floor(len / 45)));
        if (dom.progressBar) dom.progressBar.style.width = `${progress}%`;
        if (dom.generatingPct) dom.generatingPct.textContent = `${progress}%`;

        if (dom.generatingPhase) {
          if (progress < 30) {
            dom.generatingPhase.textContent = "Estructurando contenidos didácticos...";
          } else if (progress < 60) {
            dom.generatingPhase.textContent = "Programando lógica del juego en JavaScript...";
          } else if (progress < 85) {
            dom.generatingPhase.textContent = "Diseñando taller para el cuaderno y estilos CSS...";
          } else {
            dom.generatingPhase.textContent = "Finalizando empaquetado autónomo...";
          }
        }
      }
    });

    state.currentHtmlOutput = receivedHtml;
    state.currentActivityMetadata = {
      activityTypeId: act.id,
      activityTitle: act.title,
      topic,
      grade
    };

    // Guardar en historial local
    saveActivityToHistory({
      activityTypeId: act.id,
      activityTitle: act.title,
      topic,
      grade,
      htmlContent: receivedHtml
    });

    // Cargar en el simulador
    loadIntoPreview(receivedHtml);
    dom.previewTitle.textContent = `${act.title}: ${topic}`;
    dom.previewSubtitle.textContent = `Nivel: ${grade} • Generado con ${getStoredModel()}`;
    
    // Desplazar vista hacia el simulador
    dom.previewSection.scrollIntoView({ behavior: "smooth" });
    showToast("¡Actividad interactiva generada con éxito!", "success");

  } catch (err) {
    console.error(err);
    showToast(err.message || "Error durante la generación de la actividad.", "error");
  } finally {
    state.isGenerating = false;
    updateGeneratingUI(false);
  }
}

function updateGeneratingUI(isGenerating, message = "") {
  dom.generateBtn.disabled = isGenerating;
  
  if (isGenerating) {
    dom.generateBtn.innerHTML = `
      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      <span>Creando Actividad Interactiva...</span>
    `;

    // Abrir ventana emergente
    if (dom.generatingModal) dom.generatingModal.classList.remove("hidden");
    if (dom.generatingText) dom.generatingText.textContent = message || "Diseñando el juego y redactando el taller didáctico...";
    if (dom.progressBar) dom.progressBar.style.width = "10%";
    if (dom.generatingPct) dom.generatingPct.textContent = "10%";
    if (dom.generatingPhase) dom.generatingPhase.textContent = "Iniciando motor pedagógico...";
    if (dom.generatingElapsed) dom.generatingElapsed.textContent = "0s";

    // Iniciar cronómetro de tiempo transcurrido
    state.elapsedSeconds = 0;
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.elapsedSeconds += 1;
      if (dom.generatingElapsed) {
        dom.generatingElapsed.textContent = `${state.elapsedSeconds}s`;
      }
    }, 1000);

  } else {
    dom.generateBtn.innerHTML = `
      ${getIcon("sparkles")}
      <span>Generar Actividad Interactiva con IA</span>
    `;

    // Detener cronómetro
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    // Cerrar ventana emergente
    if (dom.generatingModal) dom.generatingModal.classList.add("hidden");
    if (dom.progressBar) dom.progressBar.style.width = "0%";
    if (dom.generatingPct) dom.generatingPct.textContent = "0%";
  }
}

function loadIntoPreview(htmlContent) {
  dom.previewSection.classList.remove("hidden");
  
  // Usar srcdoc para aislamiento seguro y ejecución perfecta
  dom.previewFrame.srcdoc = htmlContent;
}

function setPreviewMode(mode) {
  state.previewMode = mode;
  const isMobile = mode === "mobile";
  
  dom.previewWrapper.className = isMobile 
    ? "phone-mockup-wrapper" 
    : "desktop-view-wrapper";

  dom.previewFrame.className = isMobile 
    ? "phone-mockup" 
    : "desktop-view";

  dom.previewModeMobileBtn.classList.toggle("active", isMobile);
  dom.previewModeDesktopBtn.classList.toggle("active", !isMobile);
}

function renderSavedActivities() {
  const list = getSavedActivities();
  if (list.length === 0) {
    dom.libraryGrid.innerHTML = "";
    dom.libraryEmpty.classList.remove("hidden");
    return;
  }

  dom.libraryEmpty.classList.add("hidden");
  dom.libraryGrid.innerHTML = list.map(item => {
    const act = ACTIVITIES.find(a => a.id === item.activityTypeId) || { icon: "grid", badge: "Juego" };
    const dateFormatted = new Date(item.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="catalog-card">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="card-icon" style="background:#e0f2fe; color:var(--primary); width:40px; height:40px; border-radius:8px;">
              ${getIcon(act.icon)}
            </div>
            <span style="font-size:11px; color:var(--slate-400);">${dateFormatted}</span>
          </div>
          <span class="card-badge" style="background:#f0fdf4; color:#15803d; padding:2px 8px; border-radius:4px;">${item.activityTitle}</span>
          <h4 style="font-size:17px; font-weight:800; color:var(--slate-900); margin-top:8px; margin-bottom:4px;">${item.topic}</h4>
          <p style="font-size:12px; color:var(--slate-500); margin-bottom:16px;">Nivel: ${item.grade}</p>
        </div>

        <div style="padding-top:12px; border-top:1px solid var(--slate-100); display:flex; gap:8px;">
          <button onclick="window.loadSavedActivity('${item.id}')" class="btn-action" style="flex:1; background:var(--primary); color:white; border:none; justify-content:center;">
            ${getIcon("play")}
            <span>Jugar</span>
          </button>
          <button onclick="window.downloadSavedActivity('${item.id}')" class="btn-action" title="Descargar HTML">
            ${getIcon("download")}
          </button>
          <button onclick="window.deleteSavedActivity('${item.id}')" class="btn-action" style="color:#b91c1c; border-color:#fecaca;" title="Eliminar">
            ${getIcon("trash")}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.loadSavedActivity = function(id) {
  const list = getSavedActivities();
  const found = list.find(item => item.id === id);
  if (!found) return;

  state.currentHtmlOutput = found.htmlContent;
  state.currentActivityMetadata = {
    activityTypeId: found.activityTypeId,
    activityTitle: found.activityTitle,
    topic: found.topic,
    grade: found.grade
  };

  loadIntoPreview(found.htmlContent);
  dom.previewTitle.textContent = `${found.activityTitle}: ${found.topic}`;
  dom.previewSubtitle.textContent = `Nivel: ${found.grade} • Guardado en tu biblioteca`;
  
  switchTab("generator");
  dom.previewSection.scrollIntoView({ behavior: "smooth" });
  showToast("Actividad cargada en el simulador.", "success");
};

window.downloadSavedActivity = function(id) {
  const list = getSavedActivities();
  const found = list.find(item => item.id === id);
  if (!found) return;

  const fileName = `Peidagogos_${found.activityTypeId}_${found.topic.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  downloadHtmlFile(fileName, found.htmlContent);
  showToast("Descarga iniciada.", "success");
};

window.deleteSavedActivity = function(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta actividad de tu biblioteca?")) {
    deleteActivityFromHistory(id);
    renderSavedActivities();
    showToast("Actividad eliminada.", "info");
  }
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
