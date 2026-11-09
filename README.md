# Peidagogos 🎓✨
### Micro-App de Gamificación y Creación de Actividades Educativas con IA para Maestros

**Peidagogos** permite a los docentes crear en menos de 15 segundos juegos y actividades interactivas completas (con artículo teórico de 500 palabras y taller de repaso de 10 ejercicios para el cuaderno) en un único archivo `.html` 100% interactivo, autónomo y sin conexión.

---

## 🌟 Características Principales

1. **22 Formatos Didácticos Listos:**
   - Sopa de letras táctil
   - Crucigrama clásico auto-recortado
   - Emparejar columnas
   - Concéntrese (Memoria 3D)
   - Laberinto de decisiones ramificado
   - Clasificador Tap & Sort
   - Escape Room digital (Cyberpunk/Keypad)
   - Completar el párrafo con distractores
   - Anagrama / Fichas Scrabble
   - Ordenar la secuencia (Línea de tiempo)
   - Etiquetar diagrama en SVG inline
   - Tarjetas Swipe (Verdadero/Falso estilo Tinder)
   - Misión Rescate (Ahorcado moderno con escudo/batería)
   - Lluvia de conceptos (Arcade)
   - Rompecabezas de frases y leyes
   - Trivia contra reloj con racha multiplicadora
   - Ruleta del saber con giro físico
   - Criptograma científico con runas
   - Tablero Jeopardy de puntos progresivos
   - Simulador de Piano interactivo con síntesis ADSR
   - Lectoescritura adaptada (Neuroeducación, inclusión y voz nativa)
   - Super Prompt: Lectoescritura inicial desde cero

2. **Fase 3 Pedagógica Obligatoria:**
   - Artículo teórico profundo (mínimo 500 palabras).
   - Taller escolar de 10 retos variados para resolver en el cuaderno.

3. **Cero Dependencias y 100% Offline:**
   - Los juegos generados no usan CDNs ni librerías externas. Los estudiantes pueden jugar en cualquier celular o computador de la escuela sin acceso a internet.

4. **Conector con OpenRouter:**
   - Soporte directo para **DeepSeek V3** (costo ~$0.001 USD por actividad), **Gemini 2.0 Flash**, **GPT-4o Mini** y **Llama 3.3 70B**.
   - Asistente de "Sugerir 10 palabras clave con IA" en 1 clic.

5. **Simulador en Vivo:**
   - Juega la actividad inmediatamente en un marco de smartphone o pantalla completa.
   - Descarga con 1 clic del archivo `.html` listo para compartir por WhatsApp o Classroom.
   - Historial de creaciones guardado en tu navegador.

---

## 🚀 Cómo Usarla Localmente

Simplemente abre el archivo `index.html` con cualquier navegador web moderno (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).

No requiere instalar Node.js ni configurar servidores complicados.

---

## ☁️ Cómo Desplegarla en Internet Gratis (en 1 minuto)

### Opción 1: Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita.
2. Arrastra esta carpeta o conéctala con tu repositorio de GitHub.
3. Haz clic en **Deploy**. ¡Listo! Ya tienes tu enlace público HTTPS gratis.

### Opción 2: Netlify
1. Ve a [netlify.com](https://app.netlify.com/drop).
2. Arrastra la carpeta `d:\Creador de actividades` al área de carga.
3. Se publicará instantáneamente.

---

## 🏷️ Conectar tu Dominio de Namecheap

Una vez desplegada en Vercel o Netlify:
1. En Vercel o Netlify ve a **Settings > Domains > Add Domain** y escribe tu dominio (ej: `Peidagogos.com`).
2. En tu cuenta de **Namecheap**:
   - Ve a **Advanced DNS**.
   - Agrega un registro **A Record** apuntando a la IP que te indica Vercel (ej: `76.76.21.21`).
   - Agrega un registro **CNAME Record** (`www`) apuntando a `cname.vercel-dns.com`.
3. En menos de 10 minutos tu web app estará activa con certificado SSL gratuito (https://).
