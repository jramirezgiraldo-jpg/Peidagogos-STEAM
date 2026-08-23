# Project: Peidagogos STEAM Dashboard Refactor

## Architecture
- Single Page Application (`login.html`, `app.js`, `server.js`).
- Role-based views: Teacher Dashboard (`#docente-dashboard-container`), Student Dashboard (`#student-dashboard-container`).
- Modals & Services:
  * Caja de Herramientas (`#modal-caja-herramientas`) with Hub (`#vista-cajas-hub`) and Category Detail (`#vista-categoria-detalle`).
  * Unified Subject Creation (`#modal-crear-asignatura-docente`).
  * Per-Tool Pre-generation AI Config Modal (`#modal-configuracion-juego-ia` / `#modal-configuracion-herramienta-ia`) for ALL 42 tools across ALL 6 Cajas Temáticas.
  * Slide Generator with Document Upload (`#modal-configuracion-diapositivas` / `#modal-generar-diapositivas`).
  * Post-Earthquake Interactive Emotional First Aid Modal (`#modal-primeros-auxilios-emocionales`).
  * Live Ranking Group Selector (`window.abrirRankingDocenteNuevaPestana`).
  * Tool Visor / Runner (`#modal-visor-herramienta`).
- UI Cleanups:
  * Module 6 "Proyectar QR Matrícula" HIDDEN (`display: none !important;`).
  * Module 2 "Configuración de Materias y Grados" HIDDEN (`display: none !important;`).
  * Global toolbox ingestion bar HIDDEN (`display: none !important;`).
- Hard Invariant:
  * Admin panel assigned groups MUST NOT be modified (PRESERVED 100%).
- Persistence: JSON files (`usuarios.json`, `docentes.json`, `asignaturas.json`, `actividades_asignadas.json`) synchronized with `localStorage` (`actividades_asignadas_db`, `docentes_db`, `usuarios_db`).

## Feature Inventory
Every feature from the Survey phase and user instructions appears here with its assigned milestone.
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Toolbox Layout Fix (R1) | Wrap Level 1 cards in `#vista-cajas-hub` so selecting a box cleanly replaces the main view without screen clutter | M1 | Survey 1 | DONE |
| 2 | Subject Modal Icons (R1) | Add comprehensive icons for fundamental subjects (Sciences, Math, Language, Social Studies, English, etc.) | M1 | Survey 1 | DONE |
| 3 | Fundamental Subjects Presets (R1) | Allow creating official fundamental subjects easily in subject creation modal | M1 | Survey 1 | DONE |
| 4 | Director de Grupo Restriction (R1) | Restrict group selection in subject modal if teacher is NOT Director de Grupo (`es_director === true`) | M1 | Survey 1 | DONE |
| 5 | Multi-file Document Ingestion (R2) | Support uploading up to 20 files (PDF, Word, PPT) in subject creation modal with multi-file UI & preview | M2 | Survey 1 | DONE |
| 6 | Remove Global Side-Panel Ingestion Form (R3) | Remove/hide the top global "INGESTA DE CONTENIDO PARA ESTA CAJA:" menu across category views | M3 | User Update 2026-08-23 | DONE |
| 7 | Per-Tool Pre-Generation Modal Across ALL Cajas (R3) | Add individual pre-generation config modal for EVERY SINGLE TOOL across ALL 6 Cajas (Keywords vs Upload) | M3 | User Update 2026-08-23 | DONE |
| 8 | Dynamic Group Selector for All Tools (R3) | Dropdown of teacher's assigned grades/groups in per-tool config to apply/assign the generated activity | M3 | User Update 2026-08-23 | DONE |
| 9 | Dynamic AI Activity Assignment (R3->R4) | Push generated activity to `actividades_asignadas_db` and backend API `/api/asignar-actividad` | M3 | Survey 2/3 | DONE |
| 10 | Live Ranking Group Selector | In "Ránking en Vivo", ask teacher which group to project before opening leaderboard | M3 | User Update 2026-08-23 | DONE |
| 11 | Hide Proyectar QR Matrícula | Hide module 6 "Proyectar QR Matrícula" completely (`display: none !important;`) | M3 | User Update 2026-08-23 | DONE |
| 12 | Hide Redundant Materias y Grados Card | Hide module 2 "Configuración de Materias y Grados" card (`display: none !important;`) | M3 | User Update 2026-08-23 | DONE |
| 13 | Document Upload in Diapositivas Semanales | Add PDF/Word/PPT document upload option to "Generador de Diapositivas Semanales" | M3 | User Update 2026-08-23 | DONE |
| 14 | Post-Earthquake Interactive Emotional First Aid | Remove "imprimir taller" and add interactive online AI activities for post-earthquake psychological first aid | M3 | User Update 2026-08-23 | DONE |
| 15 | Admin Panel Group Invariant | Strict preservation: Do NOT modify groups assigned in the admin panel | Cross-Cutting | User Update 2026-08-23 | DONE |
| 16 | Student Inbox Implementation (R4) | Render notifications in Student Dashboard for assigned activities with subject, teacher name, XP, and direct launch | M4 | Survey 3 | DONE |
| 17 | Unify Student Inbox State & Loaders (R4) | Harmonize backend `/api/actividades-estudiante` and frontend `cargarActividadesEstudiante` | M4 | Survey 3 | DONE |
| 18 | Comprehensive E2E Testing Suite | Multi-tier automated tests (Tiers 1-4) verifying all features via Node/Python E2E harness | Test Track | Survey 3 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 0 | E2E Test Suite Creation (Test Track) | Requirement-driven test harness and test cases (Tiers 1-4) | none | DONE |
| 1 | M1: Teacher Dashboard UI & Role Restrictions | Caja de Herramientas view replacement, subject icons, fundamental subjects, Director de Grupo check | none | DONE |
| 2 | M2: Multi-file Document Ingestion | Up to 20 files (PDF, Word, PPT) in subject creation modal | M1 | DONE |
| 3 | M3: Dynamic AI Tool Generation & Dashboard Enhancements | Per-tool modal for ALL 42 tools + Hide global ingestion bar + Ranking group prompt + Hide QR Matrícula & Materias/Grados cards + Diapositivas upload + Post-earthquake emotional first aid + Admin group preservation | M1, M2 | DONE |
| 4 | M4: Student Inbox | Student Dashboard inbox notifications, subject + teacher display, activity launch | M3 | DONE |
| 5 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Pass 100% of E2E test suite (52 tests across Tiers 1-4) | M0, M1, M2, M3, M4 | DONE |

## Verification Results
- **Automated Master Test Runner**: `node test_e2e_runner.js` -> **52 / 52 Tests Passed (100% Pass Rate)**.
- **Reviewer Verdict**: **APPROVE** (Reviewer 1, Reviewer 2, Final Reviewer).
- **Challenger Verdict**: **APPROVE** (Challenger 1, Challenger 2, Final Challenger).
- **Forensic Auditor Verdict**: **CLEAN** (Auditor M1, Final Auditor).
