# Handoff Report — Explorer 3 (Backend & Data Integration)

## Executive Summary
This report analyzes the backend architecture (`server.js`), data models (`docentes.json`, `usuarios.json`, `actividades_asignadas.json`, and Supabase in-memory replication), and API contract for the **Director de Grupo** module. It verifies route availability, teacher object serialization, institution filtering (case-insensitive `'montenegro'`), persistence mechanics, and server testability.

---

## 1. Observation

### 1.1 Existing API Endpoints in `server.js`
Direct examination of `d:\Peidagogos_Oficial\server.js` shows 24 endpoints:

| Endpoint | Method | Line Numbers | Description |
|---|---|---|---|
| `/api/docentes` | `GET` | Line 561 | Returns array of teachers via `readJSON('docentes.json')` |
| `/api/estudiantes` | `GET` | Line 560 | Returns array of students via `readJSON('usuarios.json')` |
| `/api/usuarios` | `GET` | Line 559 | Returns array of users via `readJSON('usuarios.json')` |
| `/api/asignaturas` | `GET` | Line 562 | Returns array of subjects |
| `/api/registro-docente` | `POST` | Lines 659–675 | Appends teacher object to `docentes.json` |
| `/api/registro-tutor` | `POST` | Lines 677–697 | Registers homeschool tutor to `docentes.json` |
| `/api/registro-estudiante`| `POST` | Lines 566–657 | Registers or updates student |
| `/api/login` | `POST` | Lines 1113–1216 | Authenticates admin, docentes/tutores, and estudiantes |
| `/api/actividades-asignadas` | `GET` | Lines 1221–1224 | Returns all assigned activities |
| `/api/actividades-estudiante`| `GET` | Lines 1226–1252 | Returns activities for student doc / group |
| `/api/asignar-actividad` | `POST` | Lines 1254–1310 | Assigns activity to group/student |
| `/api/completar-actividad` | `POST` | Lines 1312–1340 | Marks activity completion & awards XP |
| `/api/guardar-grupo-director` | *N/A* | **MISSING** | Currently does not exist in `server.js` |

*Code Observation from `server.js` (lines 559-563):*
```javascript
app.get('/api/usuarios', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/estudiantes', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/docentes', (req, res) => res.json(readJSON('docentes.json')));
app.get('/api/asignaturas', (req, res) => res.json(readJSON('asignaturas.json')));
```

### 1.2 Teacher Data Model in `docentes.json` & In-Memory State
Inspection of `d:\Peidagogos_Oficial\docentes.json` reveals:
```json
[
    {
        "documento": "123456",
        "clave": "profe123",
        "nombre": "Juan",
        "apellidos": "Pérez",
        "institucion": "IE Instituto Montenegro",
        "tipo": "docente_colegio",
        "es_director": true,
        "grupos_direccion": ["7C"]
    },
    {
        "documento": "tutor123",
        "clave": "tutor123",
        "nombre": "Carlos",
        "apellidos": "Gómez",
        "institucion": "HomeSchool",
        "tipo": "tutor_homeschool",
        "correo": "tutor.carlos@homeschool.edu.co",
        "telefono": "3101234567",
        "es_director": false,
        "grupos_direccion": []
    }
]
```

Fields present:
- `documento`: unique string identifier (e.g. `"123456"`)
- `nombre`: first name string (e.g. `"Juan"`)
- `apellidos`: last name string (e.g. `"Pérez"`)
- `institucion`: institution string (e.g. `"IE Instituto Montenegro"`)
- `tipo`: category string (`"docente_colegio"`, `"tutor_homeschool"`)
- `es_director`: boolean flag (`true` or `false`)
- `grupos_direccion`: array of assigned group names (e.g. `["7C"]`)
- `rol`: dynamically evaluated / stored as `'director'` or `'regular'` / `'docente'`

### 1.3 Institution Filtering Mechanism
Inspection of institution matching in `server.js` (line 597) and `app.js` (lines 3293, 16428, 17036):
- In `server.js`:
  ```javascript
  const esIEInstituto = nuevo.institucion === 'InstitutoMontenegro' || 
                        nuevo.institucion === 'IE Instituto Montenegro' || 
                        (nuevo.institucion && String(nuevo.institucion).toLowerCase().includes('montenegro'));
  ```
- Evaluating `d.institucion` with `String(d.institucion || '').toLowerCase().includes('montenegro')`:
  - `"IE Instituto Montenegro"`.toLowerCase().includes('montenegro') -> `true`
  - `"InstitutoMontenegro"`.toLowerCase().includes('montenegro') -> `true`
  - `"HomeSchool"`.toLowerCase().includes('montenegro') -> `false`

### 1.4 Database & Cache In-Memory Layer
Inspection of `server.js` (lines 509–557):
- `global.db` holds `{ usuarios, docentes, actividades_asignadas, asignaturas, herramientas_guardadas }`.
- `initDB()` attempts asynchronous sync from Supabase.
- If Supabase is unavailable (local/offline environment), `readJSON(file)` reads `global.db[table] || []`.
- `writeJSON(file, data)` updates `global.db[table]` and triggers async upsert to Supabase.

---

## 2. Logic Chain

1. **Route Status (`/api/docentes`, `/api/estudiantes`, `/api/guardar-grupo-director`)**:
   - Observations 1.1 confirm that `GET /api/docentes` and `GET /api/estudiantes` are active and functional in `server.js`.
   - `POST /api/guardar-grupo-director` does not exist in `server.js`.
   - Requirement R2 states:
     *"Al crear el grupo, guardar en localStorage bajo la clave `grupo_director_<documento_docente>` el objeto: `{ grado, grupo, docentes: [], creadoEn: Date.now() }`. Intentar también un `POST /api/guardar-grupo-director` con fallback a solo localStorage si el endpoint no existe."*
   - Therefore, adding `POST /api/guardar-grupo-director` to `server.js` will provide full server persistence with dual fallback support.

2. **Teacher Model Compatibility**:
   - The user specification states `/api/docentes` provides objects with `{ nombre, documento, institucion, rol }`.
   - In `docentes.json`, teachers have `nombre`, `apellidos`, `documento`, `institucion`, `tipo`, `es_director`, `grupos_direccion`.
   - When frontend or backend formats the teacher list, the full display name is `${d.nombre} ${d.apellidos || ''}`.trim(), and the role is computed as:
     `const rol = d.rol || (d.es_director ? 'director' : 'regular');`
   - This ensures 100% interoperability with both legacy records and newly registered teachers.

3. **Montenegro Filtering Correctness**:
   - Applying `String(doc.institucion || '').toLowerCase().includes('montenegro')` correctly matches all variations: `"IE Instituto Montenegro"`, `"InstitutoMontenegro"`, `"ie instituto montenegro"`.
   - It cleanly excludes non-Montenegro institutions such as `"HomeSchool"`, `"Colegio Particular"`, or `"Validacion"`.

4. **Backward Compatibility of Backend Additions**:
   - Adding `POST /api/guardar-grupo-director` to `server.js` is purely additive.
   - It does not modify existing route signatures or response structures of `/api/docentes`, `/api/estudiantes`, or `/api/login`.
   - The endpoint can store the group in `global.db.grupos_director`, update the teacher's `grupos_direccion` array in `docentes.json`, and return `{ status: "success", data: nuevoGrupo }`.

5. **Server Runtime & Testing Harness**:
   - The backend runs on Node.js/Express (`package.json` specifies `"start": "node server.js"`).
   - E2E tests in `test_e2e_runner.js` use the standalone testing framework `tests/helpers/test_framework.js`.
   - Backend contract tests can be verified using native `http` requests or direct route testing within `test_e2e_runner.js` without conflicting with existing test suites.

---

## 3. Proposed Backend Implementation for Worker

### 3.1 New Route: `POST /api/guardar-grupo-director`
To be added to `server.js` (around line 698 or in user endpoints section):

```javascript
app.post('/api/guardar-grupo-director', (req, res) => {
    try {
        const body = req.body || {};
        const docDirector = String(body.documento_director || body.documento || '').trim();
        const grado = String(body.grado || '').trim();
        const grupo = String(body.grupo || '').trim();
        const docentes = Array.isArray(body.docentes) ? body.docentes : [];
        const creadoEn = body.creadoEn || Date.now();

        if (!docDirector || !grado || !grupo) {
            return res.status(400).json({ error: "Faltan datos obligatorios (documento, grado, grupo)." });
        }

        // 1. Guardar en memoria global.db
        if (!Array.isArray(global.db.grupos_director)) {
            global.db.grupos_director = [];
        }
        
        const nuevoGrupo = {
            id: `gd_${docDirector}_${grado}${grupo}`,
            documento_director: docDirector,
            documento: docDirector,
            grado,
            grupo,
            nombre_grupo: `${grado}${grupo}`,
            docentes,
            creadoEn,
            actualizadoEn: Date.now()
        };

        const idx = global.db.grupos_director.findIndex(g => 
            String(g.documento_director).trim() === docDirector && 
            (String(g.grupo).trim() === grupo || String(g.nombre_grupo).trim() === `${grado}${grupo}`)
        );

        if (idx !== -1) {
            global.db.grupos_director[idx] = { ...global.db.grupos_director[idx], ...nuevoGrupo };
        } else {
            global.db.grupos_director.push(nuevoGrupo);
        }

        // 2. Actualizar el docente en docentes.json
        let docentesList = readJSON('docentes.json');
        const dIdx = docentesList.findIndex(d => normalizarStr(d.documento || d.id || d.usuario) === normalizarStr(docDirector));
        if (dIdx !== -1) {
            docentesList[dIdx].es_director = true;
            docentesList[dIdx].rol = 'director';
            if (!Array.isArray(docentesList[dIdx].grupos_direccion)) {
                docentesList[dIdx].grupos_direccion = [];
            }
            const nomG = `${grado}${grupo}`;
            if (!docentesList[dIdx].grupos_direccion.includes(nomG) && !docentesList[dIdx].grupos_direccion.includes(grupo)) {
                docentesList[dIdx].grupos_direccion.push(nomG);
            }
            writeJSON('docentes.json', docentesList);
        }

        console.log(`[GRUPO DIRECTOR] Grupo ${grado}${grupo} guardado para director ${docDirector} con ${docentes.length} docentes.`);
        res.json({ status: "success", data: nuevoGrupo });
    } catch(err) {
        console.error("Error guardando grupo director:", err);
        res.status(500).json({ error: "Error en el servidor: " + err.message });
    }
});

app.get('/api/grupos-director', (req, res) => {
    const directorDoc = req.query.director;
    if (directorDoc) {
        const grupos = (global.db.grupos_director || []).filter(g => String(g.documento_director).trim() === String(directorDoc).trim());
        return res.json(grupos);
    }
    res.json(global.db.grupos_director || []);
});
```

### 3.2 Offline / Local Fallback Initialization
In `server.js`, ensure seed JSON files (`docentes.json`, `usuarios.json`) are loaded into `global.db` synchronously on startup prior to async Supabase calls:
```javascript
// Carga sincrónica inicial desde archivos locales como respaldo
['usuarios', 'docentes', 'actividades_asignadas', 'asignaturas'].forEach(t => {
    const p = path.join(__dirname, `${t}.json`);
    if (fs.existsSync(p)) {
        try {
            global.db[t] = JSON.parse(fs.readFileSync(p, 'utf8'));
        } catch(e) {}
    }
});
```

---

## 4. Caveats

- Supabase synchronizes asynchronously in the background. If Supabase table `grupos_director` is not provisioned on remote PostgreSQL, the in-memory store and `localStorage` serve as the reliable source of truth.
- When generating student registration links (`?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<doc>`), the frontend student registration dropdown (`#registro-grupo`) must dynamically ensure the `<option value="GRADO+GRUPO">` exists if it was created on the fly (e.g. `PreescolarA` or `3B`).

---

## 5. Conclusion

1. `/api/docentes` and `/api/estudiantes` exist and operate correctly.
2. `/api/guardar-grupo-director` should be added to `server.js` to persist group assignments and mark the creator as `es_director = true` / `rol = 'director'`.
3. Teacher data structure in `docentes.json` contains `{ documento, nombre, apellidos, institucion, tipo, es_director, grupos_direccion }`. Full name and role can be computed seamlessly.
4. Montenegro filtering with `.toLowerCase().includes('montenegro')` is robust and matches all required records.
5. All proposed backend changes are non-destructive and backward compatible.

---

## 6. Verification Method

1. **Verify Existing Endpoints**:
   ```powershell
   node -e "const fs = require('fs'); const d = JSON.parse(fs.readFileSync('docentes.json', 'utf8')); console.log('Docentes count:', d.length); const m = d.filter(x => String(x.institucion||'').toLowerCase().includes('montenegro')); console.log('Montenegro docs:', m.map(x => x.nombre));"
   ```
2. **Verify Route Existence & Syntax in `server.js`**:
   ```powershell
   node -c server.js
   ```
3. **Run Automated Test Runner**:
   ```powershell
   node test_e2e_runner.js
   ```
