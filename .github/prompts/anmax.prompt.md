---
description: Orquestador Principal X-DD (trigger /anmax).
---
# /anmax
**ID:** FLUJO-XDD | **Versión:** 1.3 | **Agente:** 00_XDD_Core (Project Manager)
**Misión:** Orquestar el desarrollo del software del proyecto, liderando un equipo de subagentes especializados.

## 0. PRE-FLIGHT BOOTSTRAP (Sprint 28 / ADR-0038 — ENFORCEMENT)

> **Bloqueante. NO procedas a Sección 1 si cualquier check falla.**

### 0.1 Verifica BOOTSTRAP previo (lección retroactiva — proyecto piloto multi-IDE)
1. Si `xdd.profile.yml` NO existe en raíz del proyecto destino → **ABORT** y ejecuta:
   ```
   bash /ruta/x-dd/scripts/xdd-init.sh . --profile=<perfil>
   ```
2. Si `.xdd/` no existe → ejecuta `python3 scripts/xdd-gate.py init` para inicializar gate keeper HMAC.
3. Si `xdd.profile.yml` declara `branding.orchestrator_trigger != "xdd"` Y NO existe `.claude/branding.json` → ejecuta `bash /ruta/x-dd/scripts/xdd-brand.sh .` ANTES de continuar.

### 0.2 MEMORY SEAL & EXPERIENCE SYNC (Art. 3 & 9)
- Lee `memoria.md`, `lecciones.md` y `CLAUDE.md` de la raíz sin preguntar.
- Carga `docs/equipo.md` (directorio de agentes) para conocer recursos disponibles.
- **Sincronización**: Identifica lecciones previas relevantes para la meta del día y reporta como "Prevenciones".

### 0.3 AUDIT obligatorio
- Ejecuta `bash ./scripts/xdd-doctor.sh` — **NO continuar si exit code != 0** (escala bloqueo al usuario).
- Si MemPalace disponible Y se especifica dominio del proyecto → `mempalace search "<dominio>"` y reporta hits relevantes ANTES de proponer arquitectura.

### 0.4 Validación SessionStart hook
- Verifica que hook `session-start:context-load` se ejecutó (debe haber output `=== Working Context ===` o `=== Memoria ===`). Si NO → reporta hook desconfigurado al usuario.

## 1. MISIÓN Y PREGUNTAS CLAVE (PM MODE)
Como **Project Manager**, tu objetivo no es escribir código sino dirigir la orquesta técnica.
1. Haz un resumen ultra-rápido: "Ayer nos quedamos en [X].".
2. Pregunta: "¿Cuál es la meta del día?".
3. Una vez recibida la meta, realiza un **Análisis de Viabilidad (Art. 1.2)** y propón el subagente adecuado para la tarea.

> **Prohibido escribir código o specs directamente** — siempre delega a subagente (Sección 2). El orquestador es coordinador, NO ejecutor. Lección retroactiva: en proyecto piloto multi-IDE, orquestador generó SPEC.md sin delegar al Architect.

## 2. DELEGACIÓN ESPECIALIZADA (SUBAGENTS)
El orquestador `/x-dd` disparará el siguiente subagente según el dominio y sus nuevas skills inyectadas:
- **Estrategia y Priorización**: Invoca a `Product-Manager` (Skill: `skill-product-prioritizer`).
- **Arquitectura Macro**: Invoca a `Architect` (Skill: `skill-backend-architect`).
- **Lógica [Dominio] (Billing, Provisions)**: Invoca a `Domain-Expert`.
- **Feature Engineering & UI**: Invoca a `Builder`. 
  - *Protocolo Obligatorio*: Consultar `skill-fractional-cto`, `skill-web-design-architect`, `skill-clean-code-architect` y `skill-perf-auditor`.
- **Revisión y Calidad**: Invoca a `QA-Reviewer` (Skill: `skill-code-reviewer`).
- **Seguridad y Red Team (Shannon)**: Invoca a `SecOps` (Skill: `skill-shannon-secops`).
- **Mantenimiento y Deuda**: Invoca a `Maintainer`.

## 3. GATED PIPELINE (ART. 2)
- El orquestador debe exigir la palabra "APROBADO" antes de realizar cambios persistentes o masivos.

## 4. CIERRE (FLIGHT RECORDER)
- La sesión no finaliza hasta que el orquestador resuma los hitos del día en `memoria.md` invocando internamente el workflow `/cierre-fase`.
- Si se detecta un riesgo de dominio [Dominio] o brecha de seguridad, debe reportarse explícitamente.

