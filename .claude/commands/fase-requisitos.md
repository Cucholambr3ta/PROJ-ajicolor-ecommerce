---
description: Operacionalización del Artículo 1 (Filtro de Ambigüedad) mediante elicitación de alta resolución, categorización técnica y validación de interoperabilidad para la generación de PRDs profundos.
---

# /fase-requisitos
**ID:** FLUJO-003 | **Versión:** 3.0.0 | **Nivel:** Operativo (SDD Enabled)
**Mission:** Operacionalización del Artículo 1 (Filtro de Ambigüedad) mediante elicitación de alta resolución y SDD (Spec-Driven Development).

**Orquestador:** Orchestrator (00)
**Subagentes:** Architect, Domain-Expert
**Skills Requeridas:** `skill-gsd-sync`, `skill-requirements-elicitation.md`, `skill-project-architect.md`
**Duración estimada:** 20-40 minutos
**Cultura:** Ambiguity Filter · Spec-Driven · GSD Logic


## 0. PRE-FLIGHT: MEMORY SEAL (START)
- Registro obligatorio en `memoria.md` (Art. 4 Constitución).
## 1. MISIÓN DEL FLUJO

Este workflow operacionaliza el **Artículo 1 (Filtro de Ambigüedad)** de la Constitución con un enfoque de **Spec-Driven Development (SDD)**. Su objetivo es destilar la visión del usuario en un **Documento de Requisitos del Producto (PRD)** detallado y cuestionarios GSD que eliminen la ambigüedad antes de planificar fases.

## 2. DIRECTRICES INQUEBRANTABLES

- **Protocolo Paso Cero:** Prohibido redactar el PRD si existen dudas en áreas críticas (Frontend, Backend, Seguridad, Infraestructura).
- **Categorización Mandataria:** Los requisitos deben estar agrupados por áreas de especialidad técnica.
- **Auditoría de Interoperabilidad:** Cada requisito debe ser validado contra las capacidades de los workflows existentes (Fit-Audit).
- **Formato Gherkin Obligatorio:** Todo requisito funcional debe tener escenarios de prueba claros.

## 3. FLUJO OPERATIVO (SINOPSIS)

El detalle técnico y operativo se encuentra en `skill-requirements-phase-details.md`.

### 3.1 Fase 1: Elicitación de Alta Resolución (Questionnaire GSD)

X-DD-Core inicia el cuestionario iterativo basado en GSD 1.0. Se generan preguntas hasta que el modelo mental del usuario sea < 5% ambiguo. Se investigan áreas críticas: Frontend, Backend, Seguridad e Infraestructura.

### 3.2 Fase 2: Auditoría y Sincronización

Validación de requisitos contra `Memoria/gsd/PROJECT.md`. Sincronización de contexto para asegurar que no hay conflictos de arquitectura.

### 3.3 Fase 3: Generación de PRD y REQUIREMENTS.md

Estructuración del PRD oficial y el archivo `Memoria/gsd/REQUIREMENTS.md`. X-DD-Core audita la trazabilidad y deposita los activos en `Memoria/`.

## 4. PROTOCOLO DE ACTIVOS

Los activos y entregables deben gestionarse según el estándar en `skill-workflow-asset-protocol.md`. El log de eventos se almacena en `tests/results/fase_requisitos_${runId}.ndjson`.

## 5. TEST TIERS DE REQUISITOS

| Tier | Tipo | Qué valida |
| :--- | :--- | :--- |
| **Tier 1** | Estático | Cumplimiento del Art. 1 (No ambigüedad), IDs únicos, MoSCoW. |
| **Tier 2** | Funcional | Consistencia interna entre requisitos y criterios de aceptación Gherkin. |
| **Tier 3** | LLM-Judge | Calidad semántica, alineación con la visión del usuario y KPIs. |

## 6. CONEXIONES DE INTEROPERABILIDAD (ART. 6)

- **Predecesores:** `/x-dd` (Init Meta).
- **Sucesores:** `/plan-fases` (Roadmapping).
- **Skills Vinculadas:** `skill-requirements-elicitation`, `skill-prd-writing`, `skill-bdi-mental-states`.

---
**Versión:** 3.0.0 | **Fecha:** 2026-04-02
Desarrollado por X-DD System


## POST-FLIGHT: MEMORY SEAL (END)
- Cierre de sesión y persistencia final en `memoria.md`.