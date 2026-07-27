require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json()); // Permitir parseo de JSON en el body
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

// Inicializar el sistema de rotación de API Keys
const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
let currentKeyIndex = 0;

function getAIClient() {
    if (apiKeys.length === 0) return null;
    const key = apiKeys[currentKeyIndex];
    const keyNumber = currentKeyIndex + 1;
    // Rotar al siguiente para la próxima petición
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`[IA] Usando API Key #${keyNumber} de ${apiKeys.length} (${key.substring(0,8)}...)`);
    return new GoogleGenAI({ apiKey: key });
}

// Endpoint para generar la guía
app.post('/api/generate-guide', async (req, res) => {
    try {
        const {
            asignatura,
            periodo,
            semana,
            meta,
            topico,
            rol,
            ambiente,
            
        } =













































2. Si la materia es "Artística", "Música" o "Ética", debes cuidar profundamente la legibilidad. Especialmente para "Artística", DEBES utilizar tamaños de fuente muy grandes (ej. <span style="font-size:3rem">𝄞 ♩ ♫</span>) para las notas musicales, tempos y crear pentagramas clarísimos usando HTML/CSS o caracteres Unicode amplificados, garantizando total claridad visual en pantalla.

INSTRUCCIÓN VITAL: LA PREGUNTA PROBLEMATIZADORA
Al inicio de tu "texto_inductivo", debes plantear una GRAN PREGUNTA PROBLEMATIZADORA (destacada en negrita y cursiva) que conecte el Tópico Generativo con la vida real del estudiante. Todo el desarrollo posterior de la guía, tanto inductivo como deductivo, debe girar en torno a resolver y darle respuesta a esta pregunta, manteniendo el rol y la narrativa gamificada.

INSTRUCCIÓN MUY IMPORTANTE SOBRE MINIJUEGOS:
Para dar descansos mentales y reforzar el conocimiento, debes incrustar OBLIGATORIAMENTE minijuegos DIRECTAMENTE dentro de los párrafos del "texto_inductivo" y del "texto_deductivo". En cada uno de estos dos textos debe haber intercalados exactamente:
- 5 juegos de ordenar letras. Etiqueta: [JUEGO:ORDENAR_LETRAS:PALABRA]
- 5 juegos de ordenar frases. Etiqueta: [JUEGO:ORDENAR_FRASE:LA FRASE COMPLETA SIN TILDES NI SIGNOS]
- 5 juegos de sopa de letras. Etiqueta: [JUEGO:SOPA_LETRAS:PALABRA1,PALABRA2,PALABRA3] (mínimo 3, máximo 6 palabras por sopa)
- 5 juegos de crucigrama. Etiqueta: [JUEGO:CRUCIGRAMA:Pista 1|RESPUESTA1;Pista 2|RESPUESTA2] (mínimo 2, máximo 4 pistas por crucigrama)






























































































































































    let encontrado = false;
    let nombre = "", grado = "", grupo = "", asignatura = "", rol_asignado = "";

    if (rol === 'admin') {
        if (usuario === 'jramirezgiraldo' && clave === 'Biol2008%') {
            encontrado = true; nombre = "Administrador"; rol_asignado = "admin";
        }
    } else if (rol === 'docente') {
        const docentes = readJSON('docentes.json');
        const doc = docentes.find(d => String(d.documento).trim() === String(usuario).trim() && String(d.clave).trim() === String(clave).trim());
        if (doc) {
            encontrado = true; nombre = `${doc.nombre} ${doc.apellidos}`; rol_asignado = "docente";
        }
    } else {
        const usuarios = readJSON('usuarios.json');
        const est = usuarios.find(u => String(u.documento).trim() === String(usuario).trim() && String(u.documento).trim() === String(clave).trim());
        if (est) {
            encontrado = true; nombre = `${est.nombre} ${est.apellidos}`;
            grado = est.grado || ""; grupo = est.grupo || ""; asignatura = est.asignatura || "";
            rol_asignado = "estudiante";
        }
    }

    if (encontrado) {
        res.json({ status: "success", usuario, nombre, rol: rol_asignado, grado, grupo, asignatura });
    } else {
        res.status(401).json({ status: "error", message: "Credenciales invalidas" });
    }
});

// Ruta principal para servir el index.html en cualquier otra ruta
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Backend de IA listo (Esperando API Key en .env)`);
});
