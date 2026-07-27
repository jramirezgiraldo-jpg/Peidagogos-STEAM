const fs = require('fs');

const content = fs.readFileSync('app.js', 'utf8');

// We will construct the materias array dynamically
// Wait, we can evaluate a part of app.js, or just use regex.

const output = [];

function extractMalla(name, asignatura, grados) {
    const regex = new RegExp(`window\\.${name} = ({[\\s\\S]*?});\\s*(//|window|$)`, 'm');
    const match = content.match(regex);
    if (match) {
        let objStr = match[1];
        // Fix up the string to be valid JSON-like object for evaluation
        let obj;
        try {
            obj = eval(`(${objStr})`);
        } catch(e) {
            console.error("Error parsing", name, e);
            return;
        }

        for (const grado of grados) {
            if (obj[grado] && obj[grado].periodos['3']) {
                const meta = obj[grado].objetivo;
                const p3 = obj[grado].periodos['3'];
                for (const semana of ['1', '3', '5', '7']) {
                    if (p3[semana]) {
                        output.push(`    { asignatura: "${asignatura}", grado: "${grado}", periodo: "3", semana: "${semana}", meta: "${meta.replace(/\n/g, ' ')}", topico: "${p3[semana].replace(/\n/g, ' ')}" },`);
                    }
                }
            }
        }
    }
}

extractMalla('mallaFisica', 'Física', ['6', '7']);
extractMalla('mallaTurismo', 'Turismo', ['7']);
extractMalla('mallaArtistica', 'Artística', ['7', '8', '9']);
extractMalla('mallaEtica', 'Ética', ['7', '10']);

fs.writeFileSync('periodo3_materias.txt', "const allMaterias = [\n" + output.join('\n') + "\n];");
console.log("Done");
