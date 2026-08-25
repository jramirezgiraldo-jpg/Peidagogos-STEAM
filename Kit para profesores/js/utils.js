// ===========================================
// UTILIDADES GLOBALES - Peidagogos STEAM
// Funciones compartidas por toda la plataforma
// ===========================================

/**
 * Normaliza texto: quita tildes, convierte a mayúsculas, elimina espacios
 * Útil para las palabras de juegos (sopa de letras, crucigrama, etc.)
 * @param {string} str - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizarTexto(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/**
 * Mezcla aleatoriamente un arreglo usando el algoritmo Fisher-Yates
 * @param {Array} arr - Arreglo a mezclar
 * @returns {Array} Nuevo arreglo mezclado (no modifica el original)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Genera una letra mayúscula aleatoria (A-Z, sin Ñ)
 * @returns {string} Una letra aleatoria
 */
function generarLetraAleatoria() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letras[Math.floor(Math.random() * letras.length)];
}

/**
 * Formatea un nombre de archivo para descarga HTML
 * @param {string} tipo - Tipo de actividad (ej. "Sopa de Letras")
 * @param {string} tema - Tema de la actividad
 * @param {string} docente - Nombre del docente
 * @returns {string} Nombre de archivo formateado
 */
function formatearNombreArchivo(tipo, tema, docente) {
  const limpiar = (s) => s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${limpiar(tipo)}_${limpiar(tema)}_${limpiar(docente)}.html`;
}

/**
 * Descarga un string como archivo HTML
 * @param {string} contenido - Contenido HTML completo
 * @param {string} nombreArchivo - Nombre del archivo a descargar
 */
function descargarHTML(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Abre el contenido HTML en una nueva ventana para imprimir como PDF
 * @param {string} contenido - Contenido HTML completo
 */
function imprimirHTML(contenido) {
  const ventana = window.open('', '_blank');
  ventana.document.write(contenido);
  ventana.document.close();
  setTimeout(() => { ventana.print(); }, 500);
}

/**
 * Escapa caracteres HTML especiales para evitar inyección
 * @param {string} str - Texto a escapar
 * @returns {string} Texto escapado
 */
function escaparHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
function generarID() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}
