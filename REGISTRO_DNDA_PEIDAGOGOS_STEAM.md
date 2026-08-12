# 🏛️ Dossier y Memoria Descriptiva para Registro en DNDA (Colombia)
### Dirección Nacional de Derecho de Autor — Ministerio del Interior de Colombia

---

## 📌 Datos Clave para el Formulario Virtual de Registro

| Campo en la plataforma DNDA | Valor a Diligenciar |
| :--- | :--- |
| **Tipo de Obra** | **Soporte Lógico (Software)** |
| **Título de la Obra** | **PEIDAGOGOS STEAM** |
| **Subtítulo / Nombre Descriptivo** | *Plataforma Educativa Gamificada con Inteligencia Artificial para el Aprendizaje Adaptativo y Evaluación por Competencias STEAM* |
| **Año de Creación** | **2026** |
| **País de Origen** | **Colombia** |
| **Carácter de la Obra** | **Inédita** (o **Publicada/Editada** si ya está en uso comercial) |
| **Autor(es)** | Juan Felipe Ramírez Giraldo (100% de los Derechos Morales) |
| **Titular(es) de Derechos Patrimoniales** | Juan Felipe Ramírez Giraldo (o la persona jurídica / empresa si aplica) |
| **Costo del Trámite** | **$0 COP (100% Gratuito en línea)** |
| **Tiempo de Respuesta Legal** | **15 días hábiles** (expedición del Certificado de Registro de Soporte Lógico con número de radicado nacional) |

---

## 📋 Paso a Paso para Radicar el Registro en Línea

1. **Ingreso al Portal Oficial:**
   - Entra a: **[https://registro.derechodeautor.gov.co/](https://registro.derechodeautor.gov.co/)** (Portal de Trámites en Línea de la DNDA).
2. **Crear / Iniciar Sesión de Usuario:**
   - Inicia sesión como Persona Natural con tu número de documento de identidad y contraseña (o regístrate si es primera vez).
3. **Seleccionar el Trámite:**
   - En el menú lateral izquierdo, haz clic en **"Solicitud de Registro de Obras"** y selecciona la opción: **"Soporte Lógico (Software)"**.
4. **Diligenciar los Formularios del Asistente:**
   - **Paso 1 (Datos del Solicitante):** Verifica tus datos de contacto (dirección, municipio, correo electrónico y teléfono).
   - **Paso 2 (Datos del Autor):** Selecciona *Persona Natural*, ingresa tus nombres y apellidos, documento de identidad y nacionalidad (Colombiana).
   - **Paso 3 (Datos del Titular):** Marca que el titular es el mismo autor (o adjunta cesión de derechos si lo registras a nombre de una empresa).
   - **Paso 4 (Datos de la Obra):**
     - **Título:** *PEIDAGOGOS STEAM*
     - **Año de creación:** *2026*
     - **Descripción:** Copiar el texto de la **Memoria Descriptiva** (sección inferior de este documento).
5. **Cargar los Archivos del Software:**
   - **Archivo 1 (Memoria Descriptiva y Manual Técnico):** Puedes guardar este documento en PDF y adjuntarlo como Memoria Descriptiva.
   - **Archivo 2 (Ejemplar del Código Fuente):** Archivo comprimido `.zip` o archivo `.pdf` que contenga el código fuente del sistema (`server.js`, `app.js`, `login.html`, `mallas.js`, `diagnostico_nocturno.js`).
6. **Radicación Oficial:**
   - Haz clic en **"Finalizar y Radicar"**. El sistema generará inmediatamente un comprobante con el número de radicado oficial.

---

## 📄 Memoria Descriptiva del Software (Texto para Copiar/Pegar)

### 1. Objeto y Descripción General
*PEIDAGOGOS STEAM es una plataforma tecnológica integral de software educativo (EdTech) diseñada para la gestión, enseñanza y evaluación por competencias en ciencias, tecnología, ingeniería, artes y matemáticas (STEAM). El sistema articula los Derechos Básicos de Aprendizaje (DBA) y las mallas curriculares oficiales de Colombia con un motor pedagógico asistido por Inteligencia Artificial generativa, complementado con mecánicas de gamificación, progresión por puntos de experiencia (XP), niveles jerárquicos y aulas virtuales adaptadas para educación presencial, validación de bachillerato virtual y educación en casa (Home School).*

### 2. Especificación Técnica y Arquitectura de Software
- **Entorno de Ejecución:** Node.js (V8 JavaScript Engine) y navegadores web modernos estándar (HTML5 / ES6+ / CSS3).
- **Arquitectura de Servidor:** Servidor RESTful en Express.js con control de sesiones, middlewares de seguridad (`X-Frame-Options`, `X-Content-Type-Options`), enrutamiento modular y manejo asíncrono de eventos.
- **Motor Pedagógico y de IA:** Integración server-side con modelos generativos para la contextualización de guías didácticas, preguntas orientadoras, retos inductivos/deductivos y reactivos tipo prueba Saber 11 (ICFES).
- **Persistencia de Datos:** Estructuras JSON indexadas para registro de usuarios, trazabilidad de pagos y avance curricular, junto a sincronización local en cliente (`localStorage`).
- **Seguridad y Trazabilidad:** Marcas de agua digitales de seguridad, bloqueo de clonación de código y canal de notificaciones automáticas y alertas transaccionales en tiempo real.

### 3. Módulos y Funcionalidades Principales
- **Módulo 1 (Aulas Virtuales y Mallas Curriculares):** Explorador interactivo de mallas DBA estructuradas por periodo académico y semanas de clase para todas las áreas fundamentales y optativas.
- **Módulo 2 (Generador de Guías de Aprendizaje Continuo):** Motor interactivo que genera y conserva el progreso de las guías didácticas por semana y estudiante.
- **Módulo 3 (Gamificación y Salón de la Fama):** Motor de puntuación en tiempo real (XP), rangos de aprendizaje (*Novato, Explorador, Científico, Maestro, Sabio Cuántico*), bonificaciones, sanciones formativas y panel VideoBeam para proyección en el aula.
- **Módulo 4 (Administración y Modalidades Flexibles):** Paneles especializados con roles para Docentes de Colegio, Tutores Home School, Estudiantes de Validación y Administrador Central.
