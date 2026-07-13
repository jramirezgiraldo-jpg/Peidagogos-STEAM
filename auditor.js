const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, 'guias_cache');

if (!fs.existsSync(cacheDir)) {
    console.error("El directorio guias_cache no existe.");
    process.exit(1);
}

const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'));

console.log(`Iniciando auditoría de ${files.length} guías...`);

let validas = 0;
let invalidas = 0;

const requiredKeys = [
    "saberes_previos",
    "texto_inductivo",
    "recurso_visual",
    "preguntas_inductivas_pagina",
    "preguntas_inductivas_cuaderno",
    "juegos_ordenar_letras_1",
    "juego_ordenar_frase_1",
    "texto_deductivo",
    "preguntas_deductivas_pagina",
    "preguntas_deductivas_cuaderno",
    "juegos_ordenar_letras_2",
    "juego_ordenar_frase_2",
    "sopa_letras",
    "crucigrama",
    "icfes"
];

for (const file of files) {
    const filePath = path.join(cacheDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        
        let isValid = true;
        let missingKeys = [];

        for (const key of requiredKeys) {
            if (json[key] === undefined || json[key] === null) {
                isValid = false;
                missingKeys.push(key);
            }
        }
        
        // Check array lengths just to be sure
        if (isValid) {
            if (!Array.isArray(json.icfes) || json.icfes.length === 0) {
                isValid = false;
                missingKeys.push("icfes (vacío)");
            }
            if (!Array.isArray(json.saberes_previos) || json.saberes_previos.length === 0) {
                isValid = false;
                missingKeys.push("saberes_previos (vacío)");
            }
            if (!Array.isArray(json.crucigrama) || json.crucigrama.length === 0) {
                isValid = false;
                missingKeys.push("crucigrama (vacío)");
            }
            if (!Array.isArray(json.sopa_letras) || json.sopa_letras.length === 0) {
                isValid = false;
                missingKeys.push("sopa_letras (vacío)");
            }
        }

        if (isValid) {
            validas++;
        } else {
            console.error(`[INVALIDA] ${file} - Faltan o están vacíos: ${missingKeys.join(', ')}`);
            invalidas++;
            // Eliminar el archivo para que el generador lo vuelva a crear
            fs.unlinkSync(filePath);
            console.log(` -> Archivo eliminado para re-generación.`);
        }

    } catch (e) {
        console.error(`[CORRUPTA] ${file} - El JSON está malformado. Error: ${e.message}`);
        invalidas++;
        fs.unlinkSync(filePath);
        console.log(` -> Archivo eliminado para re-generación.`);
    }
}

console.log(`\n=== RESULTADO DE LA AUDITORÍA ===`);
console.log(`Total analizadas: ${files.length}`);
console.log(`Guías Válidas: ${validas}`);
console.log(`Guías Borradas (para regenerar): ${invalidas}`);
