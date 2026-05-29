---
description: Proceso de ingesta universal de documentos para el ecosistema X-DD.
---
# /xdd-ingest
**ID:** FLUJO-INGEST | **Versión:** 1.0 | **Agente:** Architect
**Misión:** Convertir documentos heterogéneos (PDF, XLSX, DOCX) en conocimiento estructurado Markdown.

## 1. PRE-FLIGHT
- Verificar que el archivo fuente existe.
- Identificar el departamento destino (ej. `Ventas`, `Soporte`, `Cuentas`).

## 2. EJECUCIÓN (CONVERSIÓN)
- Ejecutar el wrapper de MarkItDown:
  ```bash
  python .agent/skills/skill-markitdown/scripts/markitdown_wrapper.py <fuente> <destino.md>
  ```
- Si es un archivo de audio o imagen, asegurar que los plugins de IA estén activos (opcional).

## 3. VALIDACIÓN Y LIMPIEZA
- Eliminar metadatos innecesarios del Markdown generado.
- Formatear tablas para que sean legibles por el motor RAG.
- Verificar integridad de datos sensibles (Art. 7).

## 4. PERSISTENCIA
- Mover el archivo final a `documents/markdown/` (Almacén Universal) o `docs/knowledge/` (Específico).
- Registrar la ingesta en `memoria.md`.

## 5. CIERRE
- Notificar al usuario la disponibilidad del nuevo conocimiento.
- Actualizar el índice de GitNexus si es necesario.
