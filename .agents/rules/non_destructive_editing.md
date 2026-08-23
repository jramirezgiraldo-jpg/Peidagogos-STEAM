---
name: non-destructive-editing
description: Strict guidelines to prevent deleting or overwriting UI elements and existing functionality when editing code.
trigger: always_on
---

# Regla: Edición Quirúrgica y No Destructiva

1. **Cero Sobreescrituras Completas:** Nunca sobrescribir archivos completos (`write_to_file` con Overwrite=True) para hacer modificaciones. Usa `replace_file_content` o scripts Python con `.replace()` para hacer ediciones quirúrgicas.
2. **Preservación del DOM e Interfaz:** Nunca elimines bloques HTML, botones, modales o scripts existentes, a menos que el usuario lo indique explícitamente.
3. **Uso de CSS para Ocultar:** Si una funcionalidad o elemento visual no debe verse, utiliza estilos CSS (`display: none !important;`) en lugar de borrar el código, previniendo errores de "Element not found" en JavaScript.
4. **Preservación de Variables de Estado:** Nunca borres propiedades de objetos de configuración (como JSONs) ni funciones globales (`window.funcion`) que puedan estar siendo llamadas por otros módulos del sistema.
