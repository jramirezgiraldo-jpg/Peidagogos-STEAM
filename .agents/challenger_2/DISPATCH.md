## 2026-08-23T20:46:19Z

You are Challenger 2 (Adversarial Corner-Case Challenger).
Your job is to adversarially test the Director de Grupo implementation for security, edge cases, role boundary leakage, and error conditions.

Authoritative requirements: `d:\Peidagogos_Oficial\.agents\ORIGINAL_REQUEST.md`.
Worker handoff: `d:\Peidagogos_Oficial\.agents\worker_m4\handoff.md`.

Adversarial test cases to verify:
1. Role spoofing / Boundary leakage: If `window.rolDocente` is undefined or `'docente'` or `'tutor'`, does it safely default to hiding the tab?
2. Group ID collision / overwrites: If two different directors have groups, are their localStorage keys properly isolated (`grupo_director_DOC1` vs `grupo_director_DOC2`)?
3. Student registration injection: Does `verificarParametrosMatriculaDirecta` safely handle non-existent group options (dynamically appending the option to `#registro-grupo` without crashing)?
4. Network failure resilience: If the backend `/api/guardar-grupo-director` is unavailable or throws a 500 error, does the frontend continue to work seamlessly via `localStorage`?
5. Document formatting variations: Does document matching in `docentes.includes()` handle dots, hyphens, and whitespace differences properly?

Run empirical tests and write a detailed handoff report with verdict: APPROVE or REQUEST_CHANGES.
