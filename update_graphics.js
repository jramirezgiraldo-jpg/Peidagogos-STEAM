const fs = require('fs');
let data = JSON.parse(fs.readFileSync('proyectorData.json', 'utf8'));

// 1. Fisica 6
const fisica6Html = `<div style="background:#FFFFFF; padding:20px; border-radius:15px; border:2px solid #E2E8F0; position:relative; overflow:hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
   <div style="position:absolute; top:10px; right:15px; font-size:0.8rem; color:#64748B; font-weight:bold;"><i class="ph ph-info"></i> Análisis de Tendencia</div>
   <svg viewBox="0 0 400 200" width="100%" height="200" style="margin-top:10px;">
      <path d="M50 20 L400 20 M50 60 L400 60 M50 100 L400 100 M50 140 L400 140" stroke="#F1F5F9" stroke-width="1" />
      <path d="M100 20 L100 180 M170 20 L170 180 M240 20 L240 180 M310 20 L310 180" stroke="#F1F5F9" stroke-width="1" />
      <line x1="50" y1="20" x2="50" y2="180" stroke="#94A3B8" stroke-width="3"/>
      <line x1="50" y1="180" x2="400" y2="180" stroke="#94A3B8" stroke-width="3"/>
      <text x="15" y="100" fill="#64748B" font-size="12" transform="rotate(-90 15 100)" font-weight="bold">Distancia (m)</text>
      <text x="225" y="198" fill="#64748B" font-size="12" font-weight="bold">Tiempo (s)</text>
      <path d="M50 180 Q 200 100 380 40" fill="none" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/>
      <circle cx="380" cy="40" r="6" fill="#10B981"/>
      <circle cx="215" cy="110" r="6" fill="#F59E0B"/>
   </svg>
</div>`;
data.clases.fisica6['1'][0][6].customHtml = fisica6Html;
if (data.clases.fisica6['1'].length > 1) data.clases.fisica6['1'][1][6].customHtml = fisica6Html;

// 2. Fisica 7
const fisica7Html = `<div style="background:#FFFFFF; padding:20px; border-radius:15px; border:2px solid #E2E8F0; position:relative; display:flex; justify-content:center; align-items:center; height:200px; box-shadow: inset 0 0 20px rgba(0,0,0,0.02);">
    <svg viewBox="0 0 300 200" width="100%" height="100%">
        <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" stroke-width="1"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <line x1="100" y1="150" x2="100" y2="50" stroke="#2563EB" stroke-width="5" marker-end="url(#arrowBlue)" />
        <text x="25" y="100" fill="#2563EB" font-weight="bold" font-size="14">Avión = 40</text>
        <line x1="100" y1="50" x2="200" y2="50" stroke="#EF4444" stroke-width="5" marker-end="url(#arrowRed)" />
        <text x="130" y="40" fill="#EF4444" font-weight="bold" font-size="14">Viento = 30</text>
        <line x1="100" y1="150" x2="200" y2="50" stroke="#059669" stroke-width="4" stroke-dasharray="6,4" marker-end="url(#arrowGreen)"/>
        <text x="160" y="110" fill="#059669" font-weight="bold" font-size="16">Resultante = ?</text>
        <defs>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563EB" /></marker>
            <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#EF4444" /></marker>
            <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#059669" /></marker>
        </defs>
    </svg>
</div>`;
data.clases.fisica7['1'][0][6].customHtml = fisica7Html;
if (data.clases.fisica7['1'].length > 1) data.clases.fisica7['1'][1][6].customHtml = fisica7Html;

// 3. Quimica
const quimicaHtml = `<div style="display:flex; gap:15px; margin-top:10px;">
    <div style="flex:1; background:linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.01) 100%); border:1px solid #34D399; border-radius:15px; padding:15px; box-shadow:0 4px 15px rgba(16,185,129,0.05);">
        <h3 style="color:#059669; text-align:center; margin-top:0; border-bottom:2px dashed #10B981; padding-bottom:10px;"><i class="ph ph-drop"></i> HOMOGÉNEA<br><span style="font-size:0.7rem; color:#10B981; font-weight:normal;">(1 Sola Fase Visible)</span></h3>
        <div style="min-height:80px; display:flex; align-items:center; justify-content:center;">
           <span style="color:#059669; font-style:italic; font-size:0.9rem;">Dibuja tus ejemplos aquí...</span>
        </div>
    </div>
    <div style="flex:1; background:linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.01) 100%); border:1px solid #FBBF24; border-radius:15px; padding:15px; box-shadow:0 4px 15px rgba(245,158,11,0.05);">
        <h3 style="color:#D97706; text-align:center; margin-top:0; border-bottom:2px dashed #F59E0B; padding-bottom:10px;"><i class="ph ph-intersect"></i> HETEROGÉNEA<br><span style="font-size:0.7rem; color:#D97706; font-weight:normal;">(Varias Fases Visibles)</span></h3>
        <div style="min-height:80px; display:flex; align-items:center; justify-content:center;">
           <span style="color:#D97706; font-style:italic; font-size:0.9rem;">Dibuja tus ejemplos aquí...</span>
        </div>
    </div>
</div>
<div style="text-align:center; margin-top:15px;">
    <span style="background:#FFFFFF; padding:8px 15px; border-radius:20px; font-weight:bold; margin:5px; display:inline-block; border:1px solid #E2E8F0; color:#1E293B;">Agua con Sal</span>
    <span style="background:#FFFFFF; padding:8px 15px; border-radius:20px; font-weight:bold; margin:5px; display:inline-block; border:1px solid #E2E8F0; color:#1E293B;">Sangre</span>
    <span style="background:#FFFFFF; padding:8px 15px; border-radius:20px; font-weight:bold; margin:5px; display:inline-block; border:1px solid #E2E8F0; color:#1E293B;">Ensalada</span>
    <span style="background:#FFFFFF; padding:8px 15px; border-radius:20px; font-weight:bold; margin:5px; display:inline-block; border:1px solid #E2E8F0; color:#1E293B;">Aire</span>
</div>`;
data.clases.quimica['1'][0][1].customHtml = quimicaHtml;
if (data.clases.quimica['1'].length > 1) data.clases.quimica['1'][1][1].customHtml = quimicaHtml;

// 4. Etica
const eticaHtml = `<div style="background:#FFFFFF; padding:20px; border-radius:15px; border:2px solid #E2E8F0; display:flex; justify-content:center; align-items:center; gap:30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-top:10px;">
    <svg viewBox="0 0 100 300" width="60" height="180">
        <rect x="35" y="20" width="30" height="220" rx="15" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="3"/>
        <rect x="40" y="30" width="20" height="70" fill="#EF4444" opacity="0.9"/>
        <rect x="40" y="100" width="20" height="70" fill="#F59E0B" opacity="0.9"/>
        <rect x="40" y="170" width="20" height="60" fill="#3B82F6" opacity="0.9"/>
        <circle cx="50" cy="250" r="25" fill="#3B82F6" stroke="#CBD5E1" stroke-width="3"/>
    </svg>
    <div style="display:flex; flex-direction:column; justify-content:space-between; height:180px; padding:10px 0; text-align:left;">
        <div style="background:rgba(239,68,68,0.05); border-left:4px solid #EF4444; padding:10px 15px; border-radius:4px;"><span style="color:#DC2626; font-weight:bold; font-size:1.1rem;">ACOSADOR</span><br><span style="font-size:0.8rem; color:#475569;">Busca poder y control.</span></div>
        <div style="background:rgba(245,158,11,0.05); border-left:4px solid #F59E0B; padding:10px 15px; border-radius:4px;"><span style="color:#D97706; font-weight:bold; font-size:1.1rem;">TESTIGO SILENCIOSO</span><br><span style="font-size:0.8rem; color:#475569;">Siente miedo. Su silencio aprueba.</span></div>
        <div style="background:rgba(59,130,246,0.05); border-left:4px solid #3B82F6; padding:10px 15px; border-radius:4px;"><span style="color:#2563EB; font-weight:bold; font-size:1.1rem;">VÍCTIMA</span><br><span style="font-size:0.8rem; color:#475569;">Siente aislamiento y dolor profundo.</span></div>
    </div>
</div>`;
data.clases.etica['1'][0][7].customHtml = eticaHtml;

// 5. Turismo
const turismoHtml = `<div style="background:#FFFFFF; padding:20px; border-radius:15px; border:2px solid #E2E8F0; margin-top:20px; position:relative;">
    <h3 style="text-align:center; color:#1E293B; margin-top:0; margin-bottom:20px; font-weight:300;">Comparativa de Percepción de Valor</h3>
    <div style="display:flex; align-items:flex-end; justify-content:space-around; height:120px; border-bottom:2px solid #CBD5E1; padding-bottom:10px;">
        <div style="width:30%; display:flex; flex-direction:column; align-items:center;">
            <div style="width:100%; height:50px; background:linear-gradient(0deg, #94A3B8, #CBD5E1); border-radius:8px 8px 0 0; display:flex; justify-content:center; align-items:flex-start; padding-top:10px; font-weight:bold; color:#FFFFFF;">$</div>
            <span style="margin-top:10px; color:#475569; font-weight:bold; font-size:0.9rem;">Competencia</span>
            <span style="font-size:0.7rem; color:#94A3B8;">Producto Básico</span>
        </div>
        <div style="width:40%; display:flex; flex-direction:column; align-items:center;">
            <div style="width:100%; height:110px; background:linear-gradient(0deg, #10B981, #34D399); border-radius:8px 8px 0 0; display:flex; justify-content:center; align-items:flex-start; padding-top:15px; font-weight:bold; color:#FFFFFF; font-size:1.5rem; box-shadow: 0 -5px 15px rgba(16,185,129,0.2);">$$$</div>
            <span style="margin-top:10px; color:#059669; font-weight:bold; font-size:1rem;">TU PRODUCTO</span>
            <span style="font-size:0.75rem; color:#FFFFFF; font-weight:bold; background:#059669; padding:2px 8px; border-radius:10px; margin-top:2px;">+ VALOR AGREGADO</span>
        </div>
    </div>
</div>`;
data.clases.turismo['1'][0][5].customHtml = turismoHtml;

fs.writeFileSync('proyectorData.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Light theme SVGs injected!');
