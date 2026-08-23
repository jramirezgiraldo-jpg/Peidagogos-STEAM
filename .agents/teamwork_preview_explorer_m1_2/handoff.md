# Handoff Report: Milestone 1 - Features 2 & 3 (Subject Modal Icons & Fundamental Subjects)

## 1. Observation

### 1.1 Current Icon Selector in `login.html`
- **Location**: `login.html` (lines 3070–3084).
- **Verbatim Code**:
```html
<div>
    <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Icono Representativo:</label>
    <select id="modal-asig-icono" style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 1rem;">
        <option value="🤖">🤖 Robótica / Domótica</option>
        <option value="💡">💡 Emprendimiento / Innovación</option>
        <option value="🕊️">🕊️ Paz y Ciudadanía</option>
        <option value="📊">📊 Estadística / Economía</option>
        <option value="🎨">🎨 Diseño y Artes Digitales</option>
        <option value="🌱">🌱 Agroecología y Café</option>
        <option value="🎼">🎼 Música y Expresión</option>
        <option value="🔬">🔬 Investigación Científica</option>
        <option value="💻">💻 Programación y Algoritmos</option>
    </select>
</div>
```
- **Deficiency**: Only 9 niche/vocational options exist. Core fundamental curriculum areas such as Natural Sciences (🌿), Biology (🧬), Physics (⚛️), Chemistry (🧪), Mathematics (📐), Spanish Language (📖), Social Studies (🌍), English/Foreign Languages (🇬🇧), Physical Education (⚽), Philosophy (🏛️), Ethics (🤝), Tourism/Heritage (🧭) are absent.

### 1.2 Subject Creation and Icon Handling in `app.js`
- **Location**: `app.js` (lines 1400–1486 and 1555–1574).
- In `window.abrirModalCrearAsignaturaDocente` (lines 1400–1418):
  * Only renders grade pills in `#modal-asig-grados-container`.
  * Does not provide preset buttons for fundamental curriculum subjects.
- In `window.ejecutarCrearAsignaturaDocenteConIA` (lines 1449–1486):
  * Reads `inIcono.value`, but calls `window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, window._nombreArchivoAsignaturaDocente)` without passing `icono`.
  * Inside `window.procesarDocumentoYCrearMalla` (lines 1558–1567), `asigPayload` hardcodes `icono: "💡"`, which is then patched retroactively only if `nuevaMalla` is truthy.
- In student dashboard subject cards (`app.js` lines 854–875):
  * Employs inline conditional checks for a few subjects with default fallback `iconAsig = "🔬"`.
- In `asignaturas.json` (lines 1–148):
  * Contains official Colombian curriculum subjects per grade (Ciencias Naturales, Matemáticas, Lengua Castellana, Ciencias Sociales, Inglés, Física, Química, Filosofía, Ética, Artística, Tecnología, Turismo).

---

## 2. Logic Chain

1. **User Requirement & Test Contract**:
   * Requirement R1 states: "Add more representative icons to the subject creation modal and allow creating fundamental subjects."
   * Contract `R1-F2` and Test `T1_R1_04` require `#modal-asig-icono` to contain all fundamental subjects.
   * Contract `R1-F3` requires quick presets for creating official fundamental subjects easily.

2. **Expanded 22-Area Icon Taxonomy**:
   * The complete set of 22 fundamental and STEAM subject areas required:
     1. 🌿 `Ciencias Naturales`
     2. 🧬 `Biología`
     3. ⚛️ `Física`
     4. 🧪 `Química`
     5. 📐 `Matemáticas`
     6. 📖 `Lengua Castellana`
     7. 🌍 `Ciencias Sociales`
     8. 🇬🇧 `Inglés / Idiomas`
     9. 🖥️ `Tecnología e Informática`
     10. 🎨 `Educación Artística`
     11. ⚽ `Educación Física`
     12. 🏛️ `Filosofía`
     13. 🤝 `Ética y Valores Humanos`
     14. 🧭 `Turismo y Patrimonio`
     15. 🤖 `Robótica STEAM`
     16. 💡 `Emprendimiento`
     17. 🕊️ `Paz y Convivencia`
     18. 📊 `Estadística`
     19. 🌱 `Agroecología`
     20. 🎼 `Música`
     21. 🔬 `Investigación`
     22. 💻 `Programación`

3. **Preset Architecture**:
   * Adding a `#modal-asig-presets-container` in `login.html` inside `#modal-crear-asignatura-docente`.
   * Rendering interactive chips using `window.CATALOGO_AREAS_FUNDAMENTALES` in `app.js`.
   * Clicking a chip calls `window.seleccionarPlantillaAsignatura(idx)`, which auto-populates the subject name (`#modal-asig-nombre`), selects the correct icon (`#modal-asig-icono`), and sets a pedagogical description (`#modal-asig-desc`).
   * Adding an `oninput` handler `window.autoSeleccionarIconoAsignatura(this.value)` so that if a teacher manually types a subject name, the icon dropdown automatically synchronizes.

4. **Centralized Icon Resolver**:
   * Creating `window.obtenerIconoAsignatura(nombreAsig)` unifying:
     1. Custom subjects stored in `asignaturas_personalizadas_db`.
     2. `CATALOGO_AREAS_FUNDAMENTALES`.
     3. Keyword regex/includes matching for aliases.
     4. Safe fallback to `"📚"`.
   * Passing `icono` directly into `window.procesarDocumentoYCrearMalla`.

---

## 3. Caveats

- **No Caveats**: The changes are purely additive and surgical. They do not alter any existing database schema, JSON files, or existing modal containers, adhering 100% to the Non-Destructive Editing Rules.

---

## 4. Conclusion & Implementation Specifications

### 4.1 Specification for `login.html`

#### Edit in `login.html`: `#modal-crear-asignatura-docente` (lines 3064–3085)

**Target Content**:
```html
            <div style="padding: 30px; display: flex; flex-direction: column; gap: 18px;">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Nombre de la Asignatura:</label>
                        <input type="text" id="modal-asig-nombre" placeholder="Ej: Robótica STEAM / Emprendimiento / Cátedra de la Paz" style="width: 100%; padding: 12px; border: 2px solid #818CF8; border-radius: 8px; box-sizing: border-box; font-size: 0.95rem; font-weight: 700;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Icono Representativo:</label>
                        <select id="modal-asig-icono" style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 1rem;">
                            <option value="🤖">🤖 Robótica / Domótica</option>
                            <option value="💡">💡 Emprendimiento / Innovación</option>
                            <option value="🕊️">🕊️ Paz y Ciudadanía</option>
                            <option value="📊">📊 Estadística / Economía</option>
                            <option value="🎨">🎨 Diseño y Artes Digitales</option>
                            <option value="🌱">🌱 Agroecología y Café</option>
                            <option value="🎼">🎼 Música y Expresión</option>
                            <option value="🔬">🔬 Investigación Científica</option>
                            <option value="💻">💻 Programación y Algoritmos</option>
                        </select>
                    </div>
                </div>
```

**Replacement Content**:
```html
            <div style="padding: 30px; display: flex; flex-direction: column; gap: 18px;">
                <!-- Selector / Chips Rápidos de Áreas Fundamentales -->
                <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 12px 16px;">
                    <div style="font-weight: 800; color: #4338CA; font-size: 0.85rem; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <span>⚡</span> Plantillas Rápidas de Áreas Fundamentales (Haz clic para auto-llenar):
                    </div>
                    <div id="modal-asig-presets-container" style="display: flex; gap: 6px; flex-wrap: wrap; max-height: 90px; overflow-y: auto;">
                        <!-- Inyectado dinámicamente por app.js -->
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Nombre de la Asignatura:</label>
                        <input type="text" id="modal-asig-nombre" placeholder="Ej: Robótica STEAM / Emprendimiento / Cátedra de la Paz" oninput="if(window.autoSeleccionarIconoAsignatura) window.autoSeleccionarIconoAsignatura(this.value)" style="width: 100%; padding: 12px; border: 2px solid #818CF8; border-radius: 8px; box-sizing: border-box; font-size: 0.95rem; font-weight: 700;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Icono Representativo:</label>
                        <select id="modal-asig-icono" style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 1rem;">
                            <option value="🌿">🌿 Ciencias Naturales</option>
                            <option value="🧬">🧬 Biología</option>
                            <option value="⚛️">⚛️ Física</option>
                            <option value="🧪">🧪 Química</option>
                            <option value="📐">📐 Matemáticas</option>
                            <option value="📖">📖 Lengua Castellana</option>
                            <option value="🌍">🌍 Ciencias Sociales</option>
                            <option value="🇬🇧">🇬🇧 Inglés / Idiomas</option>
                            <option value="🖥️">🖥️ Tecnología e Informática</option>
                            <option value="🎨">🎨 Educación Artística</option>
                            <option value="⚽">⚽ Educación Física</option>
                            <option value="🏛️">🏛️ Filosofía</option>
                            <option value="🤝">🤝 Ética y Valores Humanos</option>
                            <option value="🧭">🧭 Turismo y Patrimonio</option>
                            <option value="🤖">🤖 Robótica STEAM</option>
                            <option value="💡">💡 Emprendimiento</option>
                            <option value="🕊️">🕊️ Paz y Convivencia</option>
                            <option value="📊">📊 Estadística</option>
                            <option value="🌱">🌱 Agroecología</option>
                            <option value="🎼">🎼 Música</option>
                            <option value="🔬">🔬 Investigación</option>
                            <option value="💻">💻 Programación</option>
                        </select>
                    </div>
                </div>
```

---

### 4.2 Specification for `app.js`

#### Edit in `app.js`: Add Catalogue & Helper Functions (around line 1330)

**Target Content** (lines 1330–1354):
```javascript
window.obtenerCatalogoAsignaturas = function() {
    let base = [
        "Ciencias Naturales y Educación Ambiental",
        "Física",
        "Química",
        "Matemáticas",
        "Tecnología e Informática",
        "Ciencias Sociales",
        "Lengua Castellana",
        "Idioma Extranjero Inglés",
        "Educación Artística",
        "Ética y Valores Humanos",
        "Filosofía",
        "Turismo y Proyectos Especiales",
        "Educación Física"
    ];
    try {
        let custom = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        custom.forEach(c => {
            if (c.nombre && !base.includes(c.nombre)) base.push(c.nombre);
        });
    } catch(e) {}
    return base;
};
```

**Replacement Content**:
```javascript
window.CATALOGO_AREAS_FUNDAMENTALES = [
    { nombre: "Ciencias Naturales y Educación Ambiental", icono: "🌿", desc: "Desarrollo del pensamiento científico, indagación, relaciones ecológicas y preservación ambiental." },
    { nombre: "Biología", icono: "🧬", desc: "Estudio de los seres vivos, genética, biodiversidad, sistemas biológicos y biotecnología." },
    { nombre: "Física", icono: "⚛️", desc: "Comprensión de las leyes de la materia, la energía, el movimiento, fuerzas y electromagnetismo." },
    { nombre: "Química", icono: "🧪", desc: "Estructura atómica, transformaciones de la materia, reacciones químicas y estequiometría." },
    { nombre: "Matemáticas", icono: "📐", desc: "Pensamiento numérico, espacial, métrico, aleatorio y variacional para resolución de problemas." },
    { nombre: "Lengua Castellana", icono: "📖", desc: "Competencias comunicativas, comprensión lectora, producción textual, literatura y análisis crítico." },
    { nombre: "Ciencias Sociales", icono: "🌍", desc: "Historia, geografía, ordenamiento territorial, relaciones sociales y memoria histórica." },
    { nombre: "Idioma Extranjero Inglés", icono: "🇬🇧", desc: "Habilidades de listening, reading, writing y speaking alineadas con el marco MCER (A1-B2)." },
    { nombre: "Tecnología e Informática", icono: "🖥️", desc: "Solución de problemas tecnológicos, diseño, alfabetización digital, hardware y sistemas." },
    { nombre: "Educación Artística", icono: "🎨", desc: "Sensibilidad estética, expresión creativa visual, plástica, teatral y apreciación cultural." },
    { nombre: "Educación Física", icono: "⚽", desc: "Desarrollo motriz, condición física, juego limpio, hábitos saludables y deporte formativo." },
    { nombre: "Filosofía", icono: "🏛️", desc: "Pensamiento crítico, epistemología, lógica, ontología y dilemas ético-políticos contemporáneos." },
    { nombre: "Ética y Valores Humanos", icono: "🤝", desc: "Formación ciudadana, dilemas morales, empatía, derechos humanos y convivencia pacífica." },
    { nombre: "Turismo y Patrimonio", icono: "🧭", desc: "Identidad cultural, ecoturismo sostenible, patrimonio material/inmaterial y desarrollo regional." },
    { nombre: "Robótica STEAM", icono: "🤖", desc: "Automatización, sensores, pensamiento computacional, diseño mecatrónico y prototipado." },
    { nombre: "Emprendimiento", icono: "💡", desc: "Cultura emprendedora, modelos de negocio, innovación social, finanzas y liderazgo." },
    { nombre: "Paz y Convivencia", icono: "🕊️", desc: "Cátedra de la Paz, resolución dialógica de conflictos, derechos humanos y memoria." },
    { nombre: "Estadística", icono: "📊", desc: "Recolección, organización, análisis e interpretación de datos, probabilidad y muestreo." },
    { nombre: "Agroecología", icono: "🌱", desc: "Sistemas agropecuarios sostenibles, soberanía alimentaria, suelos y cultivos orgánicos." },
    { nombre: "Música", icono: "🎼", desc: "Lenguaje musical, ritmo, solfeo, práctica coral/instrumental y apreciación sonora." },
    { nombre: "Investigación", icono: "🔬", desc: "Metodología de la investigación científica, formulación de hipótesis y proyectos de indagación." },
    { nombre: "Programación", icono: "💻", desc: "Pensamiento algorítmico, lógica de código, desarrollo de software y estructuras de datos." }
];

window.obtenerIconoAsignatura = function(asig) {
    if (!asig) return "📚";
    const asigLow = String(asig).toLowerCase().trim();

    try {
        const customAsigs = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const cMatch = customAsigs.find(c => c.nombre && c.nombre.toLowerCase().trim() === asigLow);
        if (cMatch && cMatch.icono) return cMatch.icono;
    } catch(e) {}

    if (Array.isArray(window.CATALOGO_AREAS_FUNDAMENTALES)) {
        const fMatch = window.CATALOGO_AREAS_FUNDAMENTALES.find(f => f.nombre.toLowerCase().trim() === asigLow);
        if (fMatch && fMatch.icono) return fMatch.icono;
    }

    if (asigLow.includes('biolog') || asigLow.includes('biológ')) return "🧬";
    if (asigLow.includes('físic') || asigLow.includes('fisic')) return "⚛️";
    if (asigLow.includes('químic') || asigLow.includes('quimic')) return "🧪";
    if (asigLow.includes('matemát') || asigLow.includes('matemat') || asigLow.includes('álgebra') || asigLow.includes('geometr')) return "📐";
    if (asigLow.includes('social') || asigLow.includes('historia') || asigLow.includes('geograf')) return "🌍";
    if (asigLow.includes('lengua') || asigLow.includes('castell') || asigLow.includes('español') || asigLow.includes('literat')) return "📖";
    if (asigLow.includes('inglés') || asigLow.includes('ingles') || asigLow.includes('idioma') || asigLow.includes('english')) return "🇬🇧";
    if (asigLow.includes('tecno') || asigLow.includes('informát') || asigLow.includes('informat')) return "🖥️";
    if (asigLow.includes('turismo') || asigLow.includes('patrimon')) return "🧭";
    if (asigLow.includes('artístic') || asigLow.includes('artist') || asigLow.includes('artes') || asigLow.includes('dibujo')) return "🎨";
    if ((asigLow.includes('física') && asigLow.includes('educación')) || asigLow.includes('educacion fisica') || asigLow.includes('deporte')) return "⚽";
    if (asigLow.includes('filosof') || asigLow.includes('filosóf')) return "🏛️";
    if (asigLow.includes('ética') || asigLow.includes('etica') || asigLow.includes('valores') || asigLow.includes('relig')) return "🤝";
    if (asigLow.includes('robot') || asigLow.includes('robót') || asigLow.includes('steam')) return "🤖";
    if (asigLow.includes('emprend') || asigLow.includes('innovac') || asigLow.includes('financ')) return "💡";
    if (asigLow.includes('paz') || asigLow.includes('conviv') || asigLow.includes('ciudadan')) return "🕊️";
    if (asigLow.includes('estadíst') || asigLow.includes('estadist') || asigLow.includes('econom')) return "📊";
    if (asigLow.includes('agro') || asigLow.includes('café') || asigLow.includes('cafe') || asigLow.includes('ambient') || asigLow.includes('ecolog')) return "🌱";
    if (asigLow.includes('músic') || asigLow.includes('music') || asigLow.includes('sonor')) return "🎼";
    if (asigLow.includes('investig') || asigLow.includes('cienc')) return "🔬";
    if (asigLow.includes('program') || asigLow.includes('algorit') || asigLow.includes('software') || asigLow.includes('código')) return "💻";
    if (asigLow.includes('natural')) return "🌿";

    return "📚";
};

window.seleccionarPlantillaAsignatura = function(idx) {
    const item = window.CATALOGO_AREAS_FUNDAMENTALES ? window.CATALOGO_AREAS_FUNDAMENTALES[idx] : null;
    if (!item) return;
    const inNom = document.getElementById("modal-asig-nombre");
    const inIco = document.getElementById("modal-asig-icono");
    const inDesc = document.getElementById("modal-asig-desc");
    if (inNom) inNom.value = item.nombre;
    if (inIco) {
        for (let opt of inIco.options) {
            if (opt.value === item.icono) {
                inIco.value = item.icono;
                break;
            }
        }
    }
    if (inDesc && !inDesc.value.trim()) inDesc.value = item.desc;
};

window.autoSeleccionarIconoAsignatura = function(nombre) {
    const ico = window.obtenerIconoAsignatura ? window.obtenerIconoAsignatura(nombre) : "📚";
    const inIco = document.getElementById("modal-asig-icono");
    if (inIco && ico) {
        for (let opt of inIco.options) {
            if (opt.value === ico) {
                inIco.value = ico;
                break;
            }
        }
    }
};

window.obtenerCatalogoAsignaturas = function() {
    let base = [
        "Ciencias Naturales y Educación Ambiental",
        "Biología",
        "Física",
        "Química",
        "Matemáticas",
        "Tecnología e Informática",
        "Ciencias Sociales",
        "Lengua Castellana",
        "Idioma Extranjero Inglés",
        "Educación Artística",
        "Educación Física",
        "Ética y Valores Humanos",
        "Filosofía",
        "Turismo y Patrimonio",
        "Robótica STEAM",
        "Emprendimiento",
        "Paz y Convivencia",
        "Estadística",
        "Agroecología",
        "Música",
        "Investigación",
        "Programación"
    ];
    try {
        let custom = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        custom.forEach(c => {
            if (c.nombre && !base.includes(c.nombre)) base.push(c.nombre);
        });
    } catch(e) {}
    return base;
};
```

#### Edit in `app.js`: In `window.abrirModalCrearAsignaturaDocente` (around lines 1400–1418)

**Target Content**:
```javascript
window.abrirModalCrearAsignaturaDocente = function(origen = 'docente') {
    window._origenModalAsig = origen;
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (modal) {
        modal.style.display = "flex";
        
        // Renderizar pills de grados en modal
        const gCont = document.getElementById("modal-asig-grados-container");
        if (gCont) {
            const gradosList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
            gCont.innerHTML = gradosList.map(g => `
                <label style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    <input type="checkbox" name="modal_asig_grado_check" value="${g}" ${['6','7','8','9','10','11'].includes(g) ? 'checked' : ''}>
                    <span>${g.includes('Ciclo') ? g : g + '°'}</span>
                </label>
            `).join('');
        }
    }
};
```

**Replacement Content**:
```javascript
window.abrirModalCrearAsignaturaDocente = function(origen = 'docente') {
    window._origenModalAsig = origen;
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (modal) {
        modal.style.display = "flex";
        
        // Renderizar pills de plantillas de áreas fundamentales
        const pCont = document.getElementById("modal-asig-presets-container");
        if (pCont && Array.isArray(window.CATALOGO_AREAS_FUNDAMENTALES)) {
            pCont.innerHTML = window.CATALOGO_AREAS_FUNDAMENTALES.map((cat, idx) => `
                <button type="button" onclick="window.seleccionarPlantillaAsignatura(${idx})" style="background: white; border: 1px solid #CBD5E1; color: #1E293B; padding: 4px 10px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366F1'; this.style.background='#EEF2FF';" onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='white';">
                    <span>${cat.icono}</span>
                    <span>${cat.nombre}</span>
                </button>
            `).join('');
        }

        // Renderizar pills de grados en modal
        const gCont = document.getElementById("modal-asig-grados-container");
        if (gCont) {
            const gradosList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
            gCont.innerHTML = gradosList.map(g => `
                <label style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    <input type="checkbox" name="modal_asig_grado_check" value="${g}" ${['6','7','8','9','10','11'].includes(g) ? 'checked' : ''}>
                    <span>${g.includes('Ciclo') ? g : g + '°'}</span>
                </label>
            `).join('');
        }
    }
};
```

#### Edit in `app.js`: In `window.ejecutarCrearAsignaturaDocenteConIA` and `window.procesarDocumentoYCrearMalla` (around lines 1470–1574)

**Target Content** (lines 1470–1480):
```javascript
    // Motor de Aprendizaje y Estructuración Curricular
    const nuevaMalla = window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, window._nombreArchivoAsignaturaDocente);
    if (nuevaMalla) {
        nuevaMalla.icono = icono;
        let asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const ex = asigList.find(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
        if (ex) ex.icono = icono;
        localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));
    }
```

**Replacement Content**:
```javascript
    // Motor de Aprendizaje y Estructuración Curricular
    const nuevaMalla = window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, window._nombreArchivoAsignaturaDocente, icono);
    if (nuevaMalla) {
        nuevaMalla.icono = icono;
        let asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const ex = asigList.find(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
        if (ex) ex.icono = icono;
        localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));
    }
```

**Target Content in `window.procesarDocumentoYCrearMalla`** (lines 1488 and 1558–1568):
```javascript
window.procesarDocumentoYCrearMalla = function(nombreAsig, gradosArray, descripcion, textoDocumento, archivoNombre = "") {
```
and
```javascript
    const asigPayload = {
        id: nombreAsig.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        nombre: nombreAsig,
        grados: gradosArray,
        descripcion: objMeta,
        icono: "💡",
        color: "#6366F1",
        colorFondo: "#EEF2FF",
        malla: estructuraMallaPorGrado
    };
```

**Replacement Content**:
```javascript
window.procesarDocumentoYCrearMalla = function(nombreAsig, gradosArray, descripcion, textoDocumento, archivoNombre = "", icono = "") {
```
and
```javascript
    const iconoFinal = icono || (window.obtenerIconoAsignatura ? window.obtenerIconoAsignatura(nombreAsig) : "💡");
    const asigPayload = {
        id: nombreAsig.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        nombre: nombreAsig,
        grados: gradosArray,
        descripcion: objMeta,
        icono: iconoFinal,
        color: "#6366F1",
        colorFondo: "#EEF2FF",
        malla: estructuraMallaPorGrado
    };
```

---

## 5. Verification Method

To verify these changes independently:

1. **HTML Static Verification**:
   Inspect `login.html`:
   - Verify `<select id="modal-asig-icono">` has 22 options covering all requested areas (🌿, 🧬, ⚛️, 🧪, 📐, 📖, 🌍, 🇬🇧, 🖥️, 🎨, ⚽, 🏛️, 🤝, 🧭, 🤖, 💡, 🕊️, 📊, 🌱, 🎼, 🔬, 💻).
   - Verify `<div id="modal-asig-presets-container">` exists inside `#modal-crear-asignatura-docente`.

2. **JavaScript Execution Verification**:
   Run via Node or browser runtime:
   - Call `window.abrirModalCrearAsignaturaDocente()`.
   - Assert `#modal-asig-presets-container` contains 22 buttons.
   - Call `window.seleccionarPlantillaAsignatura(0)` -> `#modal-asig-nombre.value` becomes "Ciencias Naturales y Educación Ambiental" and `#modal-asig-icono.value` becomes "🌿".
   - Call `window.obtenerIconoAsignatura('Matemáticas')` -> returns `"📐"`.
   - Call `window.obtenerIconoAsignatura('Robótica STEAM')` -> returns `"🤖"`.
   - Call `window.procesarDocumentoYCrearMalla('Química', ['10', '11'], '', '', '', '🧪')` -> returned object has `.icono === '🧪'`.

3. **E2E Test Tier 1 Verification**:
   - Run `node test_e2e_runner.js` -> `T1_R1_04` passes.
