# 🏛️ MEMORY BANK: 01_ARQUITECTURA_CORE
**Documento Maestro de Arquitectura y Marco Pedagógico Oficial**  
**Proyecto:** Peidagogos STEAM (`peidagogosteam.com`)  
**Titular de Derechos (DNDA):** Juan Felipe Ramírez Giraldo  
**Radicado DNDA:** N.° 1-2026-000055  
**Institución Piloto:** IE Instituto Montenegro (Quindío, Colombia)  

---

## 1. MARCO PEDAGÓGICO DEFINITIVO

### Enfoque Pedagógico Core
**Constructivismo con enfoque en la Enseñanza para la Comprensión (EpC).**

### Elementos Transversales
**Gamificación, Aprendizaje Basado en Juegos (ABJ) y Enseñanza Personalizada.**

### Directiva Intelectual
**Toda herramienta interactiva debe fomentar la comprensión profunda mediante la aplicación del conocimiento (no la memorización mecánica), utilizar dinámicas lúdicas para generar tensión cognitiva y adaptarse al ritmo del estudiante.**

---

## 2. SISTEMA DE EVALUACIÓN OFICIAL (ESCALA 1.0 A 5.0)

- **Escala de Calificación Oficial (MEN Colombia):**
  - **Rango Numérico Obligatorio:** 1.0 a 5.0 (redondeado a 1 decimal).
  - **Desempeños Oficiales MEN:**
    - **Bajo:** 1.0 – 2.9 (Requiere refuerzo pedagógico).
    - **Básico:** 3.0 – 3.9 (Superación de metas mínimas).
    - **Alto:** 4.0 – 4.5 (Desempeño destacado en competencias).
    - **Superior:** 4.6 – 5.0 (Dominio excepcional y transferencia del conocimiento).
- **Cálculo de Nota en Juegos e Interactivos:**
  - Toda herramienta lúdica debe mapear el desempeño (aciertos, tiempo, calidad de respuestas, nodos resueltos) matemáticamente a la escala formativa de 1.0 a 5.0.
  - Se prohíben calificaciones fuera del rango (ej. menores a 1.0 o mayores a 5.0).
- **Gamificación Complementaria:**
  - Asignación de puntos XP (Experiencia), subida de niveles y medallas que acompañan la nota sin distorsionar la escala numérica institucional.

---

## 3. REGLA DE PERSISTENCIA (SINCRONIZACIÓN DUAL)

- **Sincronización Dual en Tiempo Real:**
  - Todo evento de evaluación, progreso, entrega de actividades o cambio en la clase debe sincronizarse bidireccionalmente y en vivo entre:
    1. **El Servidor Backend (Persistencia Permanente en Archivos `.json`):**
       - `docentes.json`: Planillas docentes de calificaciones por asignatura, periodo y grupo.
       - `estudiantes.json`: Calificaciones, bitácoras individuales y saldos de XP.
       - `actividades_asignadas.json`: Misiones activas asignadas por los docentes.
       - `usuarios.json`: Perfiles y credenciales de acceso.
    2. **El Almacenamiento Local del Cliente (`localStorage`):**
       - Caché de acceso offline inmediato (`actividades_asignadas_db`, `docentes_db`, `usuarios_db`).
       - Resiliencia ante caídas temporales de red en el aula física.
- **Protocolo de Guardado:**
  - El frontend emite llamadas autenticadas a los endpoints del servidor (`/api/guardar-calificacion-actividad`, `/api/asignar-actividad`, `/api/sincronizar-estado-clase`).
  - Al recibir respuesta exitosa (HTTP 200 OK), el cliente actualiza el `localStorage` y la interfaz de usuario en vivo.

---

## 4. DIRECTIVAS ARQUITECTÓNICAS Y DE SEGURIDAD (/learn)

1. **REGLA SUPREMA: `/learn no borres nada`:**
   - Preservar incondicionalmente todos los archivos, modales, rutas, endpoints y esquemas de base de datos preexistentes. Modificaciones exclusivamente quirúrgicas.
2. **Matrícula Directa y Enlaces Intransferibles:**
   - Sin códigos de clase engorrosos: acceso mediante Links directos y QR proyectables en VideoBeam.
   - Tokens firmados para docentes (`TK-DOC-XXXXX`).
3. **Control Anti-Evasión de Tiempo en Aula:**
   - En exámenes y simulaciones de aula, el botón oficial `[💾 Guardar Progreso & Salir]` permanece deshabilitado hasta cumplir el tiempo reglamentario (mínimo 45 minutos) para garantizar inmersión cognitiva.
4. **Independencia Tecnológica (Soberanía Educativa):**
   - Código 100% Vanilla JavaScript, CSS3 y HTML5 autocontenido sin librerías CDN externas ni dependencias vulnerables, permitiendo uso offline y alta velocidad de carga.
5. **Auditoría Forense y Testing Automatizado:**
   - Cero asunciones: toda intervención debe pasar por análisis estático y suites de pruebas automatizadas en Node.js puro antes del commit.
