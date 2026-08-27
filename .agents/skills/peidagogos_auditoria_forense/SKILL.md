---
name: peidagogos-auditoria-forense
description: >-
  Protocolo obligatorio de Auditoría Forense Estricta para depuración de software en Peidagogos STEAM.
  Prohíbe asunciones y obliga al rastreo del flujo de datos (Data Tracing) desde el DOM hasta el backend.
---

# Peidagogos Auditoría Forense Estricta

## Overview
Protocolo de diagnóstico e investigación profunda de código para resolver bugs en Peidagogos STEAM sin romper componentes ni asumir nombres de funciones o rutas.

### 🔍 DIRECTIVAS DE AUDITORÍA FORENSE ESTRICTA
1. PROHIBICIÓN DE ASUNCIONES: Nunca asumas cómo se llama una función o una ruta. Lee siempre el código fuente real antes de proponer cualquier edición.
2. RASTREO DE FLUJO DE DATOS (DATA TRACING):
   - Frontend: Busca en el HTML el ID o clase del elemento visual o botón implicado. Sigue el evento (`onclick`, `submit`, etc.) en `app.js` hasta la función exacta.
   - Red: Identifica los endpoints HTTP exactos (`/api/...`) involucrados.
   - Backend: Ubica las rutas en `server.js` y verifica qué colecciones en memoria (`global.db`), archivos `.json` y tablas en Supabase está leyendo y escribiendo.
3. CAZA DE DATOS FANTASMA (GHOST DATA HUNTING): Revisa si hay funciones de inicialización que estén restaurando datos obsoletos, o si el `localStorage` está reenviando arreglos locales que resucitan eliminaciones en el servidor.
4. PLAN DE ACCIÓN Y BACKUP: Genera una hipótesis de causa raíz basada en evidencia empírica de lectura de archivos, realiza copia de seguridad local en `backups/` y aplica ediciones quirúrgicas.
