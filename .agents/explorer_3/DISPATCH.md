## 2026-08-23T20:27:48-05:00

You are Explorer 3 (Backend & Data Integration).
Inspect `d:\Peidagogos_Oficial\server.js` and any data files or API routes:
1. Check existing routes for `/api/docentes`, `/api/estudiantes`, and see if `/api/guardar-grupo-director` exists or needs to be added.
2. Check how teachers are stored in the backend (data structure of `/api/docentes`: `{ nombre, documento, institucion, rol }`).
3. Check if Montenegro institution filtering works as expected (case-insensitive search for 'montenegro').
4. Check if backend changes are needed or if `server.js` can gracefully support `/api/guardar-grupo-director` while maintaining full backward compatibility.
5. Check how the server runs (Node/Express) and how tests/verification can be performed without breaking existing endpoints.

Read `d:\Peidagogos_Oficial\.agents\ORIGINAL_REQUEST.md`.
Produce a detailed report with line numbers, code snippets, and endpoints analysis.
