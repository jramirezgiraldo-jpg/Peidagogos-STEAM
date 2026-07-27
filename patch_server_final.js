const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const regex = /Ejemplo de c├│mo redactar un p├írrafo con juegos intercalados:/g;

const injection = `- 4 actividades para el cuaderno (dibujos, mapas mentales, cuadros comparativos). Etiqueta: [ACTIVIDAD:CUADERNO:Instrucci├│n de lo que debe hacer en el cuaderno]
  - REGLA ESTRICTA DE DIBUJO: Cada vez que pidas al estudiante que dibuje un esquema o mapa mental en su cuaderno, DEBES acompa├▒ar la instrucci├│n de un bloque de c├│digo Markdown tipo 'mermaid' con un diagrama de bloques ('graph TD') o mapa que estructure las partes que deben dibujar.
  - REGLA ESTRICTA DE M├ÜSICA/ARTES: Si el tema involucra m├║sica (notas, escalas, partituras), DEBES usar notaci├│n ABC dentro de un bloque Markdown tipo 'abc' para que la plataforma dibuje el pentagrama autom├íticamente.

Ejemplo de c├│mo redactar un p├írrafo con juegos y actividades intercaladas:`;

c = c.replace(regex, injection);

// Re-enable platform activities which were in my original broken patch
const replaceOldExample = /"El sol es la estrella principal de nuestro sistema solar\. \[JUEGO:ORDENAR_LETRAS:ESTRELLA\] Su gravedad mantiene a los planetas en ├│rbita\. \[JUEGO:CRUCIGRAMA:Astro rey\|SOL;Fuerza de atracci├│n\|GRAVEDAD\] A continuaci├│n, veremos las leyes de Newton\.\.\."/g;

const newExample = `"El sol es la estrella principal de nuestro sistema solar. [JUEGO:ORDENAR_LETRAS:ESTRELLA] Su gravedad mantiene a los planetas en ├│rbita. [ACTIVIDAD:PLATAFORMA:┬┐Cu├íl es la funci├│n de la gravedad del sol?|Mantener los planetas en ├│rbita] En tu cuaderno, [ACTIVIDAD:CUADERNO:Dibuja el sistema solar destacando el sol y la ├│rbita de la tierra]..."`;

c = c.replace(replaceOldExample, newExample);

// Fix Unicode characters in server.js that were messed up by UTF-16 decoding
c = c.replace(/├│/g, 'ó').replace(/├¡/g, 'í').replace(/├í/g, 'á').replace(/├║/g, 'ú').replace(/├®/g, 'é')
     .replace(/├▒/g, 'ñ').replace(/├ô/g, 'Ó').replace(/├ü/g, 'Á').replace(/┬┐/g, '¿').replace(/├ë/g, 'É')
     .replace(/├Ü/g, 'Ú').replace(/­Øä× ÔÖ® ÔÖ½/g, '𝄞 ♩ ♫');

fs.writeFileSync('server.js', c, 'utf8');
