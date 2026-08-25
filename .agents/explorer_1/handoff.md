# Reporte de Investigación: Arquitectura UI & DOM (Director de Grupo R1-R5)

**Agente**: Explorer 1 (UI & DOM Architecture)  
**Fecha**: 2026-08-24T01:35:00Z  
**Directorio de Trabajo**: `d:\Peidagogos_Oficial\.agents\explorer_1`  
**Objetivo**: Mapeo completo y estructurado de la arquitectura DOM en `login.html`, controladores en `app.js` y persistencia para la integración no destructiva del módulo **"Director de Grupo"** (Requisitos R1 a R5).

---

## 1. Observation (Observaciones Directas)

### 1.1 Estructura Actual de `docente-dashboard-container` en `login.html`
- **Ubicación del contenedor raíz**: `login.html`, líneas 608–751.
- **Declaración DOM**:
  ```html
  <div id="docente-dashboard-container" style="display: none; height: 100vh; overflow-y: auto; background-color: #F8FAFC;">
  ```
- **Cabecera (`<header>`)**: Líneas 609–629.
  * Logo institucional: `logo-peidagogos.png` (línea 612).
  * Elemento de nombre de docente: `<span id="docente-nombre-header">Docente</span>` (línea 616).
  * Elemento de institución: `<div id="docente-institucion-subhead">🏛️ IE Instituto Montenegro • Sede Principal</div>` (línea 618).
  * Botón de cierre de sesión: `<button onclick="location.reload()"><span>🚪</span> Cerrar Sesión</button>` (línea 625).
- **Contenedor principal de contenidos**: Líneas 631–750 (`<div style="padding: 40px 35px; max-width: 1440px; margin: 0 auto;">`).
- **Estado de pestañas actual**: Actualmente **NO** existen botones de navegación por pestañas en el HTML del panel docente.
- **Contenido actual del dashboard**: Consta de una sola sección con el encabezado `"Centro de Servicios y Herramientas Pedagógicas"` (líneas 636–641) y una cuadrícula (`grid`, línea 645) con 6 tarjetas:
  1. `Crear Asignatura (IA)` (líneas 648–662) — `onclick="window.abrirModalCrearAsignaturaDocente('docente')"`
  2. `Mis Materias y Grados` (líneas 665–679) — `style="display: none !important;"` (oculto por solicitud previa)
  3. `Caja STEAM (42 Apps)` (líneas 682–696) — `onclick="window.abrirCajaHerramientas('todas', 'docente')"`
  4. `10 Diapositivas Semanales` (líneas 699–713) — `onclick="window.abrirConfiguradorDiapositivas('docente')"`
  5. `Modo Proyector (Sin PC)` (líneas 716–730) — Enlace a `proyector.html`
  6. `Proyectar QR Matrícula` (líneas 733–747) — `style="display: none !important;"` (oculto por solicitud previa)

---

### 1.2 Mecanismos de Cambio de Vistas y Pestañas en la Aplicación
- **Navegación SPA Global**: `mostrarVista(id, pushState = true)` en `login.html` (líneas 3640–3679).
  * Oculta todas las vistas principales (`login-screen-container`, `register-screen-container`, `docente-dashboard-container`, `dashboard-screen-container`, `student-dashboard-container`, `tutor-dashboard-container`).
  * Muestra el contenedor objetivo con `display: 'block'` (o `grid` / `flex` según corresponda).
- **Pestañas en Panel de Estudiante** (`login.html`, líneas 1635–1646 & `app.js`, líneas 9388–9430):
  * Contenedor: `<div id="student-nav-tabs" ...>`
  * Botones: `#btn-tab-estudiante-materias`, `#btn-tab-estudiante-malla`, `#btn-tab-estudiante-inbox`.
  * Controlador: `window.cambiarTabEstudiante(tab)` que conmuta estilos (fondo `#2563EB` vs `white`) y alterna `display: 'block' | 'none'` en `#vista-estudiante-materias`, `#vista-estudiante-malla`, `#vista-estudiante-inbox`.
- **Pestañas en Panel de Administrador** (`login.html`, líneas 778–784 & `app.js`, líneas 15470–15496):
  * Botones con clase `.admin-tab-btn` y atributo `data-tab="..."`.
  * Controlador: `window.cambiarTabAdmin(tabName)` que conmuta la clase `.active` y alterna `display: 'block' | 'none'` en `#admin-view-grupos`, `#admin-view-docentes`, `#admin-view-feedback`.
- **Estado de `window.cambiarTabDocente` en `app.js`** (líneas 9234–9273):
  * Contiene una definición heredada que hace referencia a elementos inexistentes en el DOM (`btn-tab-docente-estudiantes`, `btn-tab-docente-mallas`, `vista-docente-estudiantes`, `vista-docente-mallas`).

---

### 1.3 Estructura Exacta de `register-screen-container`
- **Ubicación**: `login.html`, líneas 271–605.
- **Declaración DOM**:
  ```html
  <div id="register-screen-container" style="display: none; height: 100vh; max-height: 100vh; width: 100%; background-color: #f3f4f6; justify-content: center; align-items: flex-start; padding: 30px 15px 80px 15px; overflow-y: auto !important; -webkit-overflow-scrolling: touch; box-sizing: border-box;">
  ```
- **Campos de entrada**:
  * Tipo y número de documento: `<select id="reg-tipo-doc">` (línea 278) + `<input id="reg-documento">` (línea 284).
  * Nombres y apellidos: `<input id="reg-apellidos">` (línea 286) + `<input id="reg-nombre">` (línea 287).
  * Edad y género: `<input id="reg-edad">` (línea 289) + `<select id="reg-genero">` (línea 290).
  * Institución / Perfil: `<select id="reg-ie" onchange="toggleIEOptions()">` (línea 294).
  * Campos de Docente: `#campo-docente-asignatura` (línea 303) y `#campo-tipo-rol-docente` (`#reg-rol-docente-select`, línea 318).
  * Grado: `<select id="reg-grado" onchange="actualizarMaterias()" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; display: none;">` (líneas 330–349, valores `1`–`11`, `Ciclo I`–`VI`).
  * Grupo: `<select id="registro-grupo" onchange="actualizarMaterias()" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; display: none;">` (líneas 351–365, opciones `6A`, `6B`, `7A`, `7B`, `7C`, `8A`, `8B`, `9A`, `10A`, `10D`, `PENS`, `Ciclo I`–`VI`).
  * Asignaturas: `<input type="hidden" id="registro-asignatura">` (línea 367) + `<div id="materias-asignadas-view">` (línea 368).
  * Checkbox Legal / Habeas Data: `<input type="checkbox" id="reg-check-tratamiento-datos">` (línea 594).
  * Botón de envío: `<button type="button" id="btn-submit-register" onclick="window.ejecutarRegistroEstudiante(event)">` (línea 601).
  * Botón de cancelación: `<button type="button" id="btn-cancel-register" onclick="mostrarVista('login-screen-container')">` (línea 602).
- **Procesamiento de Parámetros URL de Matrícula**:
  * Implementado en `app.js` en `window.verificarParametrosMatriculaDirecta` (líneas 16328–16485) y en `login.html` (líneas 3772–3802).
  * Se requiere que al recibir `?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<documento_director>`, el formulario se abra automáticamente, seleccione la institución Montenegro, preseleccione o cree la opción del grupo en `#registro-grupo` y `#reg-grado`, y ejecute `actualizarMaterias()`.

---

## 2. Logic Chain (Cadena Lógica de Diseño)

1. **Diseño de Pestañas en el Panel Docente (R1)**:
   - Dado que el panel docente (`#docente-dashboard-container`) actualmente no tiene barra de pestañas y muestra directamente la cuadrícula de herramientas (Observación 1.1), se debe insertar una barra de navegación `#docente-nav-tabs` al inicio de `<div style="padding: 40px 35px; max-width: 1440px; margin: 0 auto;">` (línea 632).
   - Esta barra contendrá dos botones:
     * `#btn-tab-docente-herramientas`: Activo por defecto (`background: #2563EB; color: white;`), etiqueta `"🧰 Centro de Servicios & STEAM"`.
     * `#btn-tab-docente-mi-grupo`: Oculto por defecto (`display: none;`), etiqueta `"👥 Mi Grupo"`.
   - Cuando el docente inicia sesión o se procesa su rol, si `window.rolDocente === 'director'`, el botón `#btn-tab-docente-mi-grupo` cambia a `display: flex`. Si `window.rolDocente === 'regular'` o es un docente estándar, permanece con `display: none`.
   - El contenido existente de las 6 tarjetas de herramientas se encapsula dentro de `<div id="vista-docente-herramientas" style="display: block;">` sin alterar ningún atributo ni evento existente.

2. **Diseño del Contenedor de la Pestaña "Mi Grupo" (R2, R3, R4, R5)**:
   - Se crea el contenedor hermano `<div id="vista-docente-mi-grupo" style="display: none;">` inmediatamente después de `#vista-docente-herramientas`.
   - Dentro de `#vista-docente-mi-grupo`, se estructuran tres sub-secciones lógicas:
     * **A. Formulario "Crear Mi Grupo" (`#docente-seccion-crear-grupo`) [R2]**:
       - Visible si `localStorage.getItem('grupo_director_' + docId)` no existe.
       - Contiene: Dropdown de Grado (`Preescolar`, `1` a `11`), Dropdown de Grupo (`A` a `J`), y botón `"✅ Crear Grupo"`.
       - Al presionar el botón, guarda en `localStorage` bajo `grupo_director_<documento>` el objeto `{ grado, grupo, docentes: [], creadoEn: Date.now() }`, intenta `fetch('/api/guardar-grupo-director')` y conmuta la vista interna al panel de gestión.
     * **B. Panel de Gestión del Grupo Creado (`#docente-seccion-gestion-grupo`) [R3 & R4]**:
       - Visible si el grupo ya fue creado.
       - Muestra el encabezado del grupo asignado (ej. `Grado 6° - Grupo A`).
       - **Módulo R4 (Generador de Link para Estudiantes)**:
         * Input de solo lectura `#input-link-matricula-estudiantes` que contiene `https://peidagogosteam.com/login.html?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<docId>`.
         * Botón de copiar al portapapeles y botón para compartir vía WhatsApp.
       - **Módulo R3 (Gestión de Docentes del Grupo)**:
         * Lista de docentes de la institución obtenidos desde `/api/docentes` (con fallback a `localStorage.docentes_db`), filtrando aquellos cuya institución sea `montenegro`.
         * Cada docente cuenta con un botón interactivo `+ Agregar` / `✓ Agregado` que actualiza el array `docentes[]` en `localStorage` en tiempo real.
     * **C. Módulo R5: Sección "Mis Otros Grupos" (`#docente-seccion-otros-grupos`)**:
       - Ubicado en la parte inferior de la vista `#vista-docente-mi-grupo`.
       - Itera sobre todas las claves `grupo_director_*` en `localStorage` para encontrar grupos donde el `documento` del docente actual esté incluido en el array `docentes[]`.
       - Renderiza tarjetas con Director, Grado y Grupo, o el mensaje `"Aún no apareces en grupos de otros directores"` si la lista está vacía.

3. **Pre-llenado de Matrícula para Estudiantes (R4)**:
   - Al acceder a la URL con parámetros `?reg=estudiante&grupo=6A&inst=montenegro&director=123456`, la función `verificarParametrosMatriculaDirecta`:
     * Activa `mostrarVista('register-screen-container')`.
     * Asigna `#reg-ie.value = 'InstitutoMontenegro'` y ejecuta `toggleIEOptions()`.
     * Asigna el valor del grupo a `#registro-grupo` (creando la opción dinámica si no existía) y a `#reg-grado`.
     * Ejecuta `actualizarMaterias()` para que el estudiante vea sus materias asignadas automáticamente sin fricción.

4. **Preservación y No Destrucción**:
   - Ningún bloque existente en `login.html` se elimina ni se sobreescribe.
   - Las tarjetas ocultas (`Mis Materias y Grados`, `Proyectar QR Matrícula`) mantienen su estilo `display: none !important;`.
   - Se mantiene la compatibilidad total con todas las variables globales (`window.usuario_actual`, `window.rol_actual`, `window.todosEstudiantes`, etc.).

---

## 3. Caveats (Advertencias y Consideraciones)

1. **Persistencia Híbrida**: `/api/docentes` entrega los docentes de `docentes.json`. Dado que en modo de desarrollo offline el servidor puede no tener implementado `/api/guardar-grupo-director`, todas las operaciones deben utilizar `localStorage` como fuente primaria con intento asíncrono a la API.
2. **Formato del Grupo en la URL**: Los nombres de grupo pueden venir concatenados (ej. `6A`, `10D`) o con espacios (ej. `Preescolar A`, `Ciclo I`). La rutina de pre-llenado en `register-screen-container` debe ser lo suficientemente robusta para manejar tanto cadenas alfanuméricas directas como valores decodificados con `decodeURIComponent`.
3. **Sincronización de Rol Docente**: `window.rolDocente` debe inicializarse desde múltiples fuentes en orden de prioridad: parámetro de URL `?rol=director`, objeto en `localStorage.usuario_sesion`, `localStorage.usuario_actual` o `sessionStorage.peidagogos_auth`.

---

## 4. Conclusion (Propuesta Arquitectónica Concreta)

### 4.1 Plan Quirúrgico en `login.html`

**Punto de Inserción**: Dentro de `#docente-dashboard-container > div` (línea 632):
```html
<!-- Pestañas de Navegación del Panel Docente (R1) -->
<div id="docente-nav-tabs" style="display: flex; gap: 12px; margin-bottom: 30px; border-bottom: 2px solid #E2E8F0; padding-bottom: 14px; flex-wrap: wrap;">
    <button id="btn-tab-docente-herramientas" onclick="window.cambiarTabDocente('herramientas')" style="background: #2563EB; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); transition: 0.2s;">
        <span>🧰</span> Centro de Servicios & STEAM
    </button>
    <button id="btn-tab-docente-mi-grupo" onclick="window.cambiarTabDocente('mi-grupo')" style="display: none; background: white; color: #475569; border: 1.5px solid #CBD5E1; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; align-items: center; gap: 8px; transition: 0.2s;">
        <span>👥</span> Mi Grupo
    </button>
</div>

<!-- VISTA 1: CENTRO DE SERVICIOS Y HERRAMIENTAS PEDAGÓGICAS (HERRAMIENTAS EXISTENTES) -->
<div id="vista-docente-herramientas" style="display: block;">
    <!-- Aquí se mantienen intactas las 6 tarjetas existentes (líneas 634-750) -->
</div>

<!-- VISTA 2: MÓDULO DIRECTOR DE GRUPO (R1 - R5) -->
<div id="vista-docente-mi-grupo" style="display: none;">
    <!-- R2: Formulario Crear Mi Grupo -->
    <div id="docente-seccion-crear-grupo" style="display: none; background: white; border-radius: 20px; padding: 30px; border: 2px solid #DBEAFE; box-shadow: 0 10px 25px rgba(37,99,235,0.08); margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; background: #EFF6FF; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #2563EB;">✨</div>
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E293B;">Crear Mi Grupo Base (Director de Grupo)</h3>
                <p style="margin: 4px 0 0 0; color: #64748B; font-size: 0.95rem;">Selecciona el grado y grupo que orientas como director para matricular estudiantes y asignar docentes de apoyo.</p>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px;">
            <div>
                <label style="display: block; font-weight: 800; color: #1E3A8A; margin-bottom: 8px; font-size: 0.9rem;">Grado Escolar:</label>
                <select id="select-crear-grupo-grado" style="width: 100%; padding: 12px; border: 2px solid #CBD5E1; border-radius: 10px; font-weight: bold; font-size: 0.95rem; background: white;">
                    <option value="">Selecciona el Grado...</option>
                    <option value="Preescolar">Preescolar</option>
                    <option value="1">1° de Primaria</option>
                    <option value="2">2° de Primaria</option>
                    <option value="3">3° de Primaria</option>
                    <option value="4">4° de Primaria</option>
                    <option value="5">5° de Primaria</option>
                    <option value="6">6° de Secundaria</option>
                    <option value="7">7° de Secundaria</option>
                    <option value="8">8° de Secundaria</option>
                    <option value="9">9° de Secundaria</option>
                    <option value="10">10° Media</option>
                    <option value="11">11° Media</option>
                </select>
            </div>
            <div>
                <label style="display: block; font-weight: 800; color: #1E3A8A; margin-bottom: 8px; font-size: 0.9rem;">Grupo / Letra:</label>
                <select id="select-crear-grupo-letra" style="width: 100%; padding: 12px; border: 2px solid #CBD5E1; border-radius: 10px; font-weight: bold; font-size: 0.95rem; background: white;">
                    <option value="">Selecciona el Grupo...</option>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
                    <option value="F">F</option><option value="G">G</option><option value="H">H</option><option value="I">I</option><option value="J">J</option>
                </select>
            </div>
        </div>
        <button id="btn-crear-grupo-director" onclick="window.crearGrupoDirector()" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
            <span>✅</span> Crear Grupo
        </button>
    </div>

    <!-- R3 & R4: Panel de Gestión del Grupo Creado -->
    <div id="docente-seccion-gestion-grupo" style="display: none; margin-bottom: 35px;">
        <!-- Tarjeta de Información del Grupo Creado -->
        <div style="background: linear-gradient(135deg, #1E40AF, #3B82F6); color: white; border-radius: 18px; padding: 25px 30px; box-shadow: 0 10px 25px rgba(37,99,235,0.2); margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div>
                <span style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px;">Mi Grupo Base</span>
                <h2 id="titulo-mi-grupo-director" style="margin: 8px 0 4px 0; font-size: 1.8rem; font-weight: 900;">Grado 6 - Grupo A</h2>
                <p id="subhead-mi-grupo-director" style="margin: 0; color: #DBEAFE; font-size: 0.95rem;">Director(a): Juan Pérez • IE Instituto Montenegro</p>
            </div>
            <button onclick="window.reconfigurarGrupoDirector()" style="background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.4); color: white; padding: 10px 18px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">
                ⚙️ Cambiar Grupo
            </button>
        </div>

        <!-- R4: Generador de Link de Matrícula para Estudiantes -->
        <div style="background: white; border-radius: 18px; padding: 25px 30px; border: 2px solid #A7F3D0; box-shadow: 0 8px 20px rgba(16,185,129,0.08); margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                <span style="font-size: 1.8rem;">🔗</span>
                <div>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #065F46;">Link de Matrícula para Estudiantes</h3>
                    <p style="margin: 2px 0 0 0; color: #047857; font-size: 0.9rem;">Comparte este enlace con tus estudiantes para que se matriculen directamente en tu grupo sin códigos.</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="input-link-matricula-estudiantes" readonly style="flex: 1; min-width: 280px; padding: 12px 16px; border: 2px solid #10B981; border-radius: 10px; font-family: monospace; font-size: 0.9rem; background: #F0FDF4; color: #065F46; font-weight: 700;">
                <button onclick="window.copiarLinkMatriculaEstudiantes()" style="background: #10B981; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
                    📋 Copiar Link
                </button>
                <button onclick="window.compartirLinkMatriculaWhatsApp()" style="background: #25D366; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(37,211,102,0.3);">
                    📲 WhatsApp
                </button>
            </div>
        </div>

        <!-- R3: Gestión de Docentes del Grupo -->
        <div style="background: white; border-radius: 18px; padding: 25px 30px; border: 2px solid #E2E8F0; box-shadow: 0 8px 20px rgba(0,0,0,0.04); margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #1E293B;">👨‍🏫 Docentes de Apoyo para este Grupo</h3>
                    <p style="margin: 4px 0 0 0; color: #64748B; font-size: 0.92rem;">Agrega a los docentes de la institución que dictarán clases en este grupo.</p>
                </div>
                <span id="badge-contador-docentes-grupo" style="background: #EFF6FF; color: #1D4ED8; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; border: 1px solid #BFDBFE;">
                    Docentes asignados: 0
                </span>
            </div>
            
            <div id="contenedor-lista-docentes-grupo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                <!-- Renderizado dinámico vía JS -->
            </div>
        </div>
    </div>

    <!-- R5: Sección Mis Otros Grupos -->
    <div id="docente-seccion-otros-grupos" style="background: white; border-radius: 18px; padding: 25px 30px; border: 2px solid #E2E8F0; box-shadow: 0 8px 20px rgba(0,0,0,0.04);">
        <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #1E293B; display: flex; align-items: center; gap: 8px;">
                <span>📚</span> Mis Otros Grupos
            </h3>
            <p style="margin: 4px 0 0 0; color: #64748B; font-size: 0.92rem;">Grupos de la institución donde has sido asignado como docente por otros directores.</p>
        </div>
        <div id="grid-mis-otros-grupos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            <!-- Renderizado dinámico o mensaje de lista vacía -->
        </div>
    </div>
</div>
```

---

## 5. Verification Method (Método de Verificación)

### 5.1 Inspección Estática de Integridad DOM
1. Verificar que `#docente-dashboard-container` contiene `#docente-nav-tabs`, `#vista-docente-herramientas` y `#vista-docente-mi-grupo`.
2. Verificar que `#btn-tab-docente-mi-grupo` posee `style="display: none;"` por defecto en el HTML inicial.
3. Verificar que las 6 tarjetas existentes del Centro de Servicios STEAM permanecen intactas dentro de `#vista-docente-herramientas`.
4. Verificar que `#register-screen-container` conserva todos los campos de matrícula (`#reg-tipo-doc`, `#reg-documento`, `#reg-apellidos`, `#reg-nombre`, `#reg-edad`, `#reg-genero`, `#reg-ie`, `#reg-grado`, `#registro-grupo`, `#reg-check-tratamiento-datos`, `#btn-submit-register`).

### 5.2 Verificación Funcional Dinámica
1. **Acceso como Docente Regular**:
   - `window.rolDocente = 'regular'` -> El botón `#btn-tab-docente-mi-grupo` debe permanecer oculto (`display: none`).
2. **Acceso como Director de Grupo**:
   - `window.rolDocente = 'director'` -> El botón `#btn-tab-docente-mi-grupo` debe mostrarse (`display: flex`).
   - Al hacer clic en "Mi Grupo", se muestra `#vista-docente-mi-grupo` y se oculta `#vista-docente-herramientas`.
3. **Flujo de Creación de Grupo**:
   - Sin grupo previo: se muestra el formulario `#docente-seccion-crear-grupo`.
   - Seleccionar Grado `6` y Grupo `A`, clic en "Crear Grupo".
   - Se genera la clave en `localStorage.grupo_director_<documento>` con `{ grado: '6', grupo: 'A', docentes: [], creadoEn: ... }`.
   - La vista conmuta a `#docente-seccion-gestion-grupo`.
4. **Flujo de Link de Matrícula**:
   - El input `#input-link-matricula-estudiantes` contiene `https://peidagogosteam.com/login.html?reg=estudiante&grupo=6A&inst=montenegro&director=<docId>`.
   - Al hacer clic en "Copiar Link", se copia al portapapeles.
   - Al simular navegación con ese enlace, `#register-screen-container` se abre con la institución Montenegro seleccionada y el grupo `6A` pre-cargado.
5. **Flujo de Gestión de Docentes**:
   - Se listan los docentes de IE Instituto Montenegro desde `/api/docentes`.
   - Al hacer clic en `+ Agregar`, cambia a `✓ Agregado`, el contador aumenta y el array `docentes[]` en `localStorage` se actualiza.
6. **Flujo de Mis Otros Grupos**:
   - Si otro director guardó a este docente en su grupo, aparece listado en tarjetas.
   - Si no hay grupos, muestra `"Aún no apareces en grupos de otros directores"`.

---
*Reporte elaborado por Explorer 1 (UI & DOM Architecture) — Listo para entrega a la orquestación.*
