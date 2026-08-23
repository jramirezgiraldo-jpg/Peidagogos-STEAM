# BRIEFING — 2026-08-23T20:00:00Z

## Mission
Implement Milestones M2, M3, M4 and Dashboard Enhancements for Peidagogos STEAM dashboard following non-destructive surgical editing rules.

## 🔒 My Identity
- Archetype: implementer_qa_specialist
- Roles: implementer, qa, specialist
- Working directory: d:\Peidagogos_Oficial\.agents\teamwork_preview_worker_m2_m3_m4
- Original parent: 2d91d812-8bf7-4d53-8360-2b32c67bc78f
- Milestone: M2, M3, M4 & Enhancements

## 🔒 Key Constraints
- Zero Full Overwrites: Never overwrite entire files. Use replace_file_content for surgical edits.
- DOM & UI Preservation: Never delete existing HTML blocks, buttons, modals, or scripts unless explicitly requested.
- CSS for Hiding: Use display: none !important; rather than deleting DOM elements.
- State Variable Preservation: Never delete config properties or global functions (window.func).
- Invariant: DO NOT modify assigned groups in the admin panel.
- Mandatory Integrity: No hardcoding test outputs, genuine logic only.

## Current Parent
- Conversation ID: 2d91d812-8bf7-4d53-8360-2b32c67bc78f
- Updated: 2026-08-23T20:00:00Z

## Task Summary
- **What to build**:
  1. M2: Multi-file ingestion in login.html & app.js (up to 20 files, PDF/Word/PPT/TXT, safe token/text extractor, preview list, removal, aggregation into curriculum generation).
  2. M3: Dynamic AI generation across 42 tools + 6 user items: Per-tool pre-generation modal with tabs (Keywords vs Upload document), group selection dropdown, assignment creation, saving to localStorage & API, launching tool viewer, hiding module 2 and module 6 cards via CSS, leaderboards group prompt, slide configurator doc upload, emotional first aid online interactive activities.
  3. M4: Student inbox and activity notifications: Reading assigned activities for student's group, rendering notification cards, badge counter, launching viewer with activity payload.
  4. Verification: 52 automated tests verified across Tiers 1-4.
- **Success criteria**: All 52 tests pass, all features fully operational, non-destructive editing adhered to.
- **Interface contracts**: PROJECT.md, TEST_INFRA.md, ORIGINAL_REQUEST.md.

## Change Tracker
- **Files modified**:
  * `login.html`: Added document upload in `#modal-generar-diapositivas`, preserved all DOM IDs, hid module 2 & 6 with `display: none !important;`, preserved multi-file ingestion UI and pre-gen AI modal.
  * `app.js`: Added document ingestion for slides, online interactive AI post-earthquake activities in `#modal-primeros-auxilios-emocionales`, group selection prompt in `abrirRankingDocenteNuevaPestana`, aliases for AI pre-gen modal and assignment dispatch, robust completion check in `cargarActividadesEstudiante`.
- **Build status**: PASS (52/52 tests valid)
- **Pending issues**: None

## Quality Status
- **Build/test result**: 52/52 tests passing (100% pass rate)
- **Lint status**: Clean
- **Tests added/modified**: Tiers 1 to 4 fully verified

## Loaded Skills
- None
