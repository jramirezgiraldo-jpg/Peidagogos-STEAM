const text = `[ACTIVIDAD:CUADERNO:Elabora un cuadro comparativo entre el movimiento real de un planeta y su movimiento aparente vista desde la Tierra usando este esquema:
mermaid
graph TD
    A[Movimiento Planetario] --> B[Movimiento Real: Órbita elíptica continua alrededor del Sol]
    A --> C[Movimiento Aparente: Retrocesos temporales vistos desde la Tierra]

]`;

const regex = /\[ACTIVIDAD:CUADERNO:([\s\S]*?)\]/g;

let result = text.replace(regex, (match, contenido) => {
    let instruction = contenido;
    let mermaidCode = "";
    let abcCode = "";
    
    if (contenido.includes('mermaid\n')) {
        let parts = contenido.split('mermaid\n');
        instruction = parts[0].trim();
        mermaidCode = parts[1].trim();
    } else if (contenido.includes('abc\n')) {
        let parts = contenido.split('abc\n');
        instruction = parts[0].trim();
        abcCode = parts[1].trim();
    }
    
    let html = `<div style="background:#FEF3C7; border:2px dashed #D97706; padding:15px; margin:15px 0; border-radius:8px;">
        <h5 style="color:#92400E; margin-top:0;">📓 Actividad en Cuaderno</h5>
        <p style="color:#92400E;">${instruction}</p>`;
        
    if (mermaidCode) {
        html += `<div class="mermaid-auto-render" style="background:white; padding:10px; border-radius:4px; margin-top:10px;">${mermaidCode}</div>`;
    }
    if (abcCode) {
        html += `<div class="abc-auto-render" style="background:white; padding:10px; border-radius:4px; margin-top:10px;">${abcCode}</div>`;
    }
    
    html += `</div>`;
    return html;
});

console.log(result);
