# Handoff Report — Feature 1: Toolbox Layout Fix (M1)

## 1. Observation

### Observation 1.1: Missing `#vista-cajas-hub` wrapper in `login.html`
- **File**: `d:\Peidagogos_Oficial\login.html`
- **Lines**: 2473–2638
- **Exact Code Context**:
```html
2473: <div id="modal-caja-herramientas" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); align-items: center; justify-content: center; z-index: 100000; padding: 20px; overflow-y: auto;">
2474:     <div style="background: #F8FAFC; border-radius: 24px; padding: 26px 30px; max-width: 1200px; width: 100%; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 25px 70px -15px rgba(0,0,0,0.5); text-align: left; overflow-y: auto; -webkit-overflow-scrolling: touch; border: 1px solid #CBD5E1;">
2475:         
2476:         <!-- Header Modal -->
2477:         <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 15px; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
...
2490:         </div>
2491: 
2492:         <!-- ============================================================== -->
2493:         <!-- NIVEL 1: VISTA PRINCIPAL DE LAS 6 CAJAS TEMÁTICAS GRANDES -->
2494:         <!-- ============================================================== -->
2495:             <!-- ============================================================== -->
2496:             <!-- HERO CARD PRINCIPAL: CAJA 1 - PLANIFICACIÓN CURRICULAR -->
2497:             <!-- ============================================================== -->
2498:             <div onclick="window.abrirDetalleCajaTematica('imprimibles')" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #FFFFFF 100%); border: 3px solid #2563EB; ...">
...
2518:             </div>
2519: 
2520:             <div style="font-size: 0.95rem; font-weight: 800; color: #334155; display: flex; align-items: center; gap: 8px; margin-top: 4px;">
2521:                 <span>🧰</span> Otras Cajas Temáticas del Ecosistema STEAM:
2522:             </div>
2523: 
2524:             <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; padding-bottom: 8px;">
... (Cajas 2 to 6)
2631:             </div>
2632:         </div>
2633: 
2634:         <!-- ============================================================== -->
2635:         <!-- NIVEL 2: VISTA INTERIOR DE LA CAJA SELECCIONADA -->
2636:         <!-- ============================================================== -->
2637:         <div id="vista-categoria-detalle" style="display: none; flex: 1; overflow-y: auto; flex-direction: column; gap: 14px;">
```
- Direct finding: Between the header closing tag (`</div>` at line 2490) and the Hero Card comment (`<!-- HERO CARD PRINCIPAL... -->` at line 2496), there is NO `<div id="vista-cajas-hub">` opening element.
- The `</div>` at line 2632 was an unmatched closing tag originally intended for `#vista-cajas-hub`.

### Observation 1.2: Controller Logic in `app.js` expects `#vista-cajas-hub`
- **File**: `d:\Peidagogos_Oficial\app.js`
- **Lines**: 11364–11386
- **Verbatim Code**:
```javascript
11364: window.volverACajasHub = function() {
11365:     const hub = document.getElementById('vista-cajas-hub');
11366:     const det = document.getElementById('vista-categoria-detalle');
11367:     if (hub) hub.style.display = 'flex';
11368:     if (det) det.style.display = 'none';
11369: };
11370: 
11371: window.abrirDetalleCajaTematica = function(categoria = 'juegos') {
11372:     window.categoriaToolboxActual = categoria;
11373:     const hub = document.getElementById('vista-cajas-hub');
11374:     const det = document.getElementById('vista-categoria-detalle');
11375:     const icon = document.getElementById('categoria-detalle-icono');
11376:     const title = document.getElementById('categoria-detalle-titulo');
11377: 
11378:     if (hub) hub.style.display = 'none';
11379:     if (det) det.style.display = 'flex';
11380: 
11381:     const meta = window.METADATOS_CAJAS_TEMATICAS[categoria] || window.METADATOS_CAJAS_TEMATICAS['juegos'];
11382:     if (icon) icon.innerText = meta.icono;
11383:     if (title) title.innerText = meta.titulo;
11384: 
11385:     window.renderizarTarjetasCajaHerramientas(categoria);
11386: };
```
- Direct finding: When `window.abrirDetalleCajaTematica` ran, `document.getElementById('vista-cajas-hub')` returned `null`. Because `hub` was `null`, `hub.style.display = 'none'` was never executed, leaving Level 1 cards rendered concurrently with Level 2 cards.

### Observation 1.3: Non-Destructive Invariants
- All 6 category cards, their click handlers (`window.abrirDetalleCajaTematica('imprimibles')`, `'juegos'`, `'aula'`, `'visual'`, `'evaluacion'`, `'homeschool'`), and the Level 2 navigation elements (`window.volverACajasHub()`, quick access buttons) are already fully defined and correctly wired.
- No HTML elements or styles need to be removed; adding the single opening container tag `<div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">` balances the DOM tree and restores proper view-switching mechanics.

---

## 2. Logic Chain

1. **Premise**: In SPA architecture, sub-views within a modal must be isolated inside distinct container elements with unique IDs so their display state (`display: none` vs `display: flex`) can be toggled without DOM mutation.
2. **Observation Reference**: Observation 1.2 shows that `app.js` (lines 11365, 11373) specifically queries `document.getElementById('vista-cajas-hub')` to toggle the visibility of Level 1.
3. **Observation Reference**: Observation 1.1 shows that in `login.html`, Level 1 (Hero Card + 5 Grid Cards) was placed bare inside the modal card without the `<div id="vista-cajas-hub">` wrapper.
4. **Deduction**: Wrapping Level 1 elements inside `<div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">` makes `document.getElementById('vista-cajas-hub')` resolve to the wrapper element.
5. **Deduction**: When `window.abrirDetalleCajaTematica()` is triggered, `#vista-cajas-hub` is set to `display: none` and `#vista-categoria-detalle` is set to `display: flex`, cleanly replacing Level 1 with Level 2 in place without layout clutter or double scrollbars.
6. **Deduction**: When `window.volverACajasHub()` is clicked ("◀ Volver a las 6 Cajas Temáticas"), `#vista-cajas-hub` returns to `display: flex` and `#vista-categoria-detalle` is set to `display: none`.
7. **Scroll Optimization**: Adding scroll position resets (`parentElement.scrollTop = 0`) ensures that switching between views always starts at the top.

---

## 3. Caveats

- **No Caveats**: The DOM structure in `login.html` and the controller methods in `app.js` were thoroughly traced. No side-effects on other modules (e.g. Slide Presenter, Tool Runner modal, AI Game Config modal) exist because `#modal-caja-herramientas` is completely self-contained.

---

## 4. Conclusion & Implementation Instructions for Worker

### Target 1: `login.html`
**Location**: Lines 2492–2496
**Action**: Replace the comment header above the Level 1 Hero Card to insert `<div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">`.

#### Exact Diff for `login.html`:
```diff
<<<<
            <!-- ============================================================== -->
            <!-- NIVEL 1: VISTA PRINCIPAL DE LAS 6 CAJAS TEMÁTICAS GRANDES -->
            <!-- ============================================================== -->
                <!-- ============================================================== -->
                <!-- HERO CARD PRINCIPAL: CAJA 1 - PLANIFICACIÓN CURRICULAR -->
====
            <!-- ============================================================== -->
            <!-- NIVEL 1: VISTA PRINCIPAL DE LAS 6 CAJAS TEMÁTICAS GRANDES -->
            <!-- ============================================================== -->
            <div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">
                <!-- ============================================================== -->
                <!-- HERO CARD PRINCIPAL: CAJA 1 - PLANIFICACIÓN CURRICULAR -->
>>>>
```

### Target 2: `app.js` (Optional Polish / Hardening)
**Location**: Lines 11364–11386
**Action**: Ensure `scrollTop = 0` is reset upon view transitions to prevent scrolling disorientation.

#### Exact Diff for `app.js`:
```diff
<<<<
window.volverACajasHub = function() {
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    if (hub) hub.style.display = 'flex';
    if (det) det.style.display = 'none';
};

window.abrirDetalleCajaTematica = function(categoria = 'juegos') {
    window.categoriaToolboxActual = categoria;
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    const icon = document.getElementById('categoria-detalle-icono');
    const title = document.getElementById('categoria-detalle-titulo');

    if (hub) hub.style.display = 'none';
    if (det) det.style.display = 'flex';

    const meta = window.METADATOS_CAJAS_TEMATICAS[categoria] || window.METADATOS_CAJAS_TEMATICAS['juegos'];
    if (icon) icon.innerText = meta.icono;
    if (title) title.innerText = meta.titulo;

    window.renderizarTarjetasCajaHerramientas(categoria);
};
====
window.volverACajasHub = function() {
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    if (hub) hub.style.display = 'flex';
    if (det) det.style.display = 'none';
    const card = hub ? hub.parentElement : null;
    if (card) card.scrollTop = 0;
};

window.abrirDetalleCajaTematica = function(categoria = 'juegos') {
    window.categoriaToolboxActual = categoria;
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    const icon = document.getElementById('categoria-detalle-icono');
    const title = document.getElementById('categoria-detalle-titulo');

    if (hub) hub.style.display = 'none';
    if (det) det.style.display = 'flex';

    const meta = window.METADATOS_CAJAS_TEMATICAS[categoria] || window.METADATOS_CAJAS_TEMATICAS['juegos'];
    if (icon) icon.innerText = meta.icono;
    if (title) title.innerText = meta.titulo;

    window.renderizarTarjetasCajaHerramientas(categoria);

    const card = det ? det.parentElement : null;
    if (card) card.scrollTop = 0;
    if (det) det.scrollTop = 0;
};
>>>>
```

---

## 5. Verification Method

1. **DOM Tree Validation**:
   - Check that `document.getElementById('vista-cajas-hub')` exists and contains 2 child elements (the Hero card and the secondary 5-card grid container).
   - Check that `document.getElementById('vista-categoria-detalle')` is a sibling of `#vista-cajas-hub`.
2. **Behavioral Test**:
   - Execute `window.abrirCajaHerramientas('todas')`: Verify `#modal-caja-herramientas` is visible (`display: flex`), `#vista-cajas-hub` is visible (`display: flex`), and `#vista-categoria-detalle` is hidden (`display: none`).
   - Execute `window.abrirDetalleCajaTematica('juegos')`: Verify `#vista-cajas-hub` is hidden (`display: none`), `#vista-categoria-detalle` is visible (`display: flex`), `#categoria-detalle-titulo` displays `"Caja 2: Juegos Dinámicos y Activación (10 Herramientas)"`, and 10 game cards are populated in `#grid-caja-herramientas-cards`.
   - Execute `window.volverACajasHub()`: Verify `#vista-cajas-hub` is visible (`display: flex`) and `#vista-categoria-detalle` is hidden (`display: none`).
3. **Automated Test Suite**:
   - Passes `T1_R1_01`, `T1_R1_02`, `T1_R1_03` in `TEST_INFRA.md`.
