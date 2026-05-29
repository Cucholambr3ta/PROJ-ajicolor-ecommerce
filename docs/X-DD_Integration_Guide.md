# X-DD — Guía de Integración
**Versión:** 3.0 | **Fecha:** 2026-05-26 | **Gobernanza:** Constitución X-DD v1.4

---

## Índice

1. [Matriz de metodologías](#1-matriz-de-metodologías)
2. [Filosofía de integración](#2-filosofía-de-integración)
3. [El pipeline X-DD ampliado](#3-el-pipeline-x-dd-ampliado)
4. [Integración fase a fase](#4-integración-fase-a-fase)
5. [Capa de seguridad: SecDD, STDD y Threat-Driven Development](#5-capa-de-seguridad)
6. [Árbol de decisión](#6-árbol-de-decisión)
7. [Estructura de carpetas del proyecto](#7-estructura-de-carpetas)
8. [Skills y workflows](#8-skills-y-workflows)
9. [Guía de adopción](#9-guía-de-adopción)
10. [Automatización de contexto — MemPalace](#10-automatización-de-contexto--mempalace)
11. [Agencia de subagentes especializados](#11-agencia-de-subagentes-especializados)

---

## 1. Matriz de metodologías

### Estado de metodologías X-DD

| Metodología | Fase del Pipeline | Estado | Agentes dedicados |
|-------------|-------------------|--------|-------------------|
| **SDD** | Fases 1–6 (completo) | ✅ Completo | `Orchestrator` + `Product-Manager` |
| **BDD** | Fase 1 + Fase 5 | ✅ Listo | `Rapid-Prototyper` + `QA-Reviewer` |
| **ATDD** | Fase 1 + Fase 5 | ✅ Listo | `QA-Reviewer` + `Architect` |
| **FDD** | Fase 1 + Fase 3 | ✅ Listo | `Product-Manager` + `Project-Manager` |
| **TDD** | Fase 4 (Build) | ✅ Listo | `Builder` + `Reviewer` |
| **DDD** | Fase 2 (Spec) | ✅ Listo | `Architect` + `Domain-Expert` |
| **SecDD/STDD** | Fase 4 + Fase 5 | ✅ Listo | `Security-Engineer` + `SecOps` |
| **Threat-Driven** | Fase 2 (Spec) | ✅ Listo | `Threat-Detection-Engineer` + `SecOps` |

### Mitigación de gaps

* **TDD:** La Fase 4 escribe stubs de pruebas unitarias (`tests/unit/**/*.test.ts`) *antes* del código de producción mediante `Builder`, rompiendo el hábito de escribir pruebas de forma puramente reactiva.
* **DDD:** Plantillas en `prompts/phases/ddd_01_domain_model.md` para que `Architect` diseñe un `DOMAIN.md` explícito en Fase 2, definiendo bounded contexts, aggregates y domain events.
* **BDD:** Los escenarios Gherkin son archivos ejecutables `.feature` (`tests/features/`) generados en Fase 1 por `Rapid-Prototyper`, listos para automatización en Playwright.
* **ATDD:** Criterios de aceptación automatizados que bloquean el pipeline de CI/CD, validados por `QA-Reviewer` en Fase 5.
* **FDD:** Catálogo formal de características (`docs/features/FEATURES.md`) en Fase 1, priorizado con RICE/MoSCoW por `Product-Manager`.
* **Threat Modeling:** Framework preventivo (`docs/specs/THREATS.md`) en Fase 2: `Threat-Detection-Engineer` y `SecOps` analizan brechas antes del desarrollo.
* **STDD:** Fase 4 integra Security TDD — `Security-Engineer` genera casos de prueba de inyección y fallos de RBAC que deben fallar al inicio y ser mitigados por diseño.

---

## 2. Filosofía de integración

> **Principio maestro: las metodologías son capas, no fases nuevas.**

El pipeline de 6 fases NO cambia. Cada metodología se embebe en la fase donde más aporta:

```
FASE 1 (Briefing)  ──► + BDD formalizado + ATDD + FDD catálogo
FASE 2 (Spec)      ──► + DDD modelo de dominio + Threat Modeling (THREATS.md)
FASE 3 (Plan)      ──► + FDD reorganización por valor
FASE 4 (Build)     ──► + TDD ciclo Rojo-Verde-Refactor + STDD security tests
FASE 5 (QA)        ──► + BDD ejecutable + ATDD + SAST + DAST + Secrets scanning
FASE 6 (Retro)     ──► Sin cambios (Learning Loop)
```

**Regla de composición:** Cada proyecto define su "nivel X-DD" según la complejidad. No todos los proyectos necesitan las 9 metodologías. El árbol de decisión (Sección 6) determina qué camino tomar.

---

## 3. El pipeline X-DD ampliado

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            PIPELINE X-DD (v3.0)                                  │
│                                                                                  │
│  FASE 1          FASE 2             FASE 3       FASE 4      FASE 5    FASE 6   │
│  Briefing    ──► Spec           ──► Plan     ──► Build   ──► QA    ──► Retro   │
│                                                                                  │
│  + FDD           + DDD              + FDD        + TDD       + BDD              │
│  (catálogo)      (dominio)          (por valor)  (first)     (exec)             │
│  + BDD           + Threat Model     │            + STDD 🛡️   + ATDD             │
│  (features)      (THREATS.md) 🛡️   │            (sec tests) + SAST 🛡️          │
│  + ATDD          │                  │            │           + DAST 🛡️          │
│  (criterios)     │                  │            │           + Secrets 🛡️       │
│                                                                                  │
│              [APROBADO]         [APROBADO]   [APROBADO]                         │
│         (SPEC+DOMAIN+THREATS)                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Mapa: metodología → agente → artefacto

| Metodología | Fase | Agente líder | Artefacto |
|------------|------|--------------|-----------|
| **FDD** | Fase 1 + 3 | `Project-Manager` | `docs/features/FEATURES.md` |
| **BDD** | Fase 1 + 5 | `Rapid-Prototyper` + `Reviewer` | `tests/features/*.feature` |
| **ATDD** | Fase 1 + 5 | `Architect` + `QA-Reviewer` | `tests/acceptance/*.test.ts` |
| **DDD** | Fase 2 | `Architect` | `docs/specs/DOMAIN.md` |
| **Threat-Driven** 🛡️ | Fase 2 | `SecOps` + `Architect` | `docs/specs/THREATS.md` |
| **TDD** | Fase 4 | `Builder` | `tests/unit/*.test.ts` (antes de `src/`) |
| **STDD** 🛡️ | Fase 4 | `Builder` + `SecOps` | `tests/security/**/*.security.test.ts` |
| **SecDD** 🛡️ | Fase 5 | `Reviewer` + `SecOps` | SAST + DAST + Secrets reports |
| **SDD** | Todas | `Orchestrator` | `SPEC.md` |

---

## 4. Integración fase a fase

### FASE 1 — Briefing: agregar FDD, BDD y ATDD

**Qué cambia:** El cuestionario GSD produce tres artefactos adicionales además del REQUIREMENTS.md.

**Artefacto 1 — Catálogo de Features (FDD):**
Cada feature en formato `[acción] [resultado] [objeto]`. Ejemplo: *"Generar reporte PDF del período de facturación para un cliente"*

Cada feature incluye: nombre, beneficio al usuario, prioridad (MoSCoW/RICE), estimación, criterios de aceptación de alto nivel.

Archivo: `docs/features/FEATURES.md` (plantilla: `prompts/phases/fdd_01_feature_catalog.md`)

**Artefacto 2 — Archivos .feature (BDD):**
Escenarios Gherkin convertidos en archivos `.feature` ejecutables por Cucumber/Playwright-BDD.

Directorio: `tests/features/feature-[id]-[nombre-kebab].feature`

**Artefacto 3 — Tests de aceptación stub (ATDD):**
Por cada criterio de aceptación, el stub del test (falla por diseño hasta que la implementación lo satisfaga).

Directorio: `tests/acceptance/<nombre-feature>.acceptance.test.ts`

**Agentes involucrados:** `Orchestrator`, `Product-Manager`, `Rapid-Prototyper`

**Gate de salida:** `FEATURES.md` + al menos un `.feature` por épica antes de avanzar.

---

### FASE 2 — Spec: agregar DDD y Threat Modeling

**Artefacto 1 — Modelo de Dominio (DDD):** `docs/specs/DOMAIN.md`

Estructura obligatoria:
```markdown
## Ubiquitous Language      ← Glosario de términos del dominio
## Bounded Contexts         ← Mapa de subdominios y sus fronteras
## Context Map              ← Relaciones entre contexts (ACL, Shared Kernel)
## Core Aggregates          ← Por bounded context: aggregates, entities, value objects
## Domain Events            ← Eventos que cruzan contexts y disparan flujos
```

**Regla crítica:** El ubiquitous language del DOMAIN.md es **vocabulario obligatorio** para nombres de variables, funciones, clases y endpoints. Code drift semántico = Code Drift.

**Artefacto 2 — Modelo de Amenazas (Threat-Driven):** `docs/specs/THREATS.md`

Proceso:
1. `Architect` entrega `DOMAIN.md` aprobado
2. `SecOps` lidera threat modeling con `/threat-model`
3. Por cada aggregate, endpoint y domain event: aplicar STRIDE
4. Identificar activos, actores adversariales y superficies de ataque
5. Por amenaza: probabilidad, impacto, riesgo y control propuesto
6. Amenazas CRÍTICAS generan `SEC-REQ-*` copiados obligatoriamente al `SPEC.md`
7. Cada amenaza genera stub de security test en `tests/security/`

**Gate de salida:** `THREATS.md` + `DOMAIN.md` + `SPEC.md` aprobados juntos. Ninguna amenaza CRÍTICA sin control documentado.

---

### FASE 3 — Plan: reforzar FDD

**Qué cambia:** El PLAN.md se organiza por **features completos y verticales**, no por capas técnicas.

**Antes (por capas):**
```
Tarea 1: Modelo de datos   Tarea 2: CRUD API   Tarea 3: UI   Tarea 4: Tests
```

**Después (por features — FDD):**
```
Feature 1: [acción] [resultado] [objeto] — alta prioridad, 1 día
  - 1.1: Tabla + modelo ORM
  - 1.2: Endpoint POST
  - 1.3: Componente UI
  - 1.4: Test unitario TDD
  - 1.5: Test de aceptación E2E
  DoD: El archivo .feature del feature pasa al 100%
```

**Gate de salida:** `PLAN.md` con features ordenados por prioridad RICE. Cada feature tiene DoD atado a su `.feature`.

---

### FASE 4 — Build: integrar TDD (el cambio más importante)

**El ciclo TDD dentro de `/xdd-build`:**
```
Por cada subtarea de tipo "lógica de negocio":

  1. 🔴 ROJO     — Test que describe lo que la función DEBE hacer (falla, no existe)
  2. 🟢 VERDE    — Mínimo código para que el test pase (sin sobre-ingeniería)
  3. 🔵 REFACTOR — Mejorar sin romper el test (SOLID, DRY, Clean Code)
```

| Aplica TDD | No aplica TDD |
|------------|---------------|
| Lógica de negocio (cálculos, reglas) | Scaffolding (rutas básicas, modelos ORM) |
| Transformaciones de datos | Configuración (env, docker-compose) |
| Algoritmos de dominio | UI puramente visual (sin lógica) |
| Validaciones de dominio | Integraciones externas (mockear, no TDD) |
| Reglas de seguridad | |

**Gate de salida:** Build completo cuando: tests TDD en verde + `.feature` BDD al 100% + test ATDD en verde.

---

### FASE 5 — QA: conectar BDD y ATDD a los Tiers

| Tier | Tipo | Qué valida | Nuevo |
|------|------|-----------|-------|
| **Tier 1** | Estático | Linters, tipos, tests unitarios TDD | Sin cambios |
| **Tier 2** | Funcional | Tests E2E + **archivos .feature (BDD)** + **tests de aceptación (ATDD)** | ✅ |
| **Tier 3** | LLM-Judge | Calidad semántica + **coherencia con DOMAIN.md** | ✅ Ampliado |

**Tier 3:** El LLM-Judge verifica que el código use el vocabulario del DOMAIN.md. Un método `calculateBillingPeriod` cuando el dominio define `computeCycleTotals` es drift semántico reportable.

---

## 5. Capa de seguridad

> La seguridad es una **capa transversal**, no una fase nueva.

### Las tres metodologías de seguridad

**Threat-Driven** (Fase 2): aplica STRIDE sobre el `DOMAIN.md` para identificar amenazas antes de codificar → produce `THREATS.md`.

**STDD** (Fase 4): extiende TDD con security tests escritos *antes* del código. Ciclo: 🔴 test funcional falla → 🔴🛡️ security test falla → 🟢 implementación con controles → 🔵 refactor + hardening.

**SecDD** (Fase 5): herramientas automatizadas que escanean código y aplicación en ejecución (SAST, DAST, Secrets, SCA).

```
Threat-Driven (Fase 2)   →  Define QUÉ amenazas existen y qué controles son obligatorios
       ↓
STDD (Fase 4)            →  Implementa los controles como código + los valida con tests
       ↓
SecDD / QA (Fase 5)      →  Verifica automáticamente que los controles funcionan en runtime
       ↓
SecOps (bajo demanda)    →  Ataca el sistema como adversario real — Red Team ofensivo
```

### FASE 4 — Ciclo STDD

```
Para cada función en THREATS.md con "security test requerido":

  1. 🔴        TDD test funcional   → falla (función no existe)
  2. 🔴🛡️      STDD security test   → falla (función no existe)
  3. 🟢        Implementación mínima → ambos tests pasan
  4. 🔵        Refactor + hardening  → ambos tests siguen en verde
```

| Requiere STDD | No requiere STDD |
|--------------|-----------------|
| Autenticación y manejo de tokens | Scaffolding y CRUD básico sin lógica |
| Endpoints con input externo | Configuración y scripts de migración |
| Lógica de autorización (RBAC, IDOR) | UI puramente visual |
| Funciones con datos PII | Utilidades internas sin superficie de ataque |
| Cálculos financieros / pagos | |
| Integraciones con sistemas externos | |

```
tests/security/
├── injection/     ← SQL, XSS, path traversal, command injection
├── auth/          ← JWT spoofing, brute force, token expiry
├── authz/         ← RBAC, IDOR, privilege escalation
├── disclosure/    ← Error handling, PII exposure
├── availability/  ← Rate limiting, payload size, timeouts
├── audit/         ← Audit log integridad, tamper detection
└── transport/     ← TLS enforcement, security headers, CORS
```

### FASE 5 — Tier de seguridad

| Tier | Tipo | Herramienta | Bloquea merge |
|------|------|-------------|---------------|
| Tier 1 | SAST | **Semgrep** | ✅ |
| Tier 1 | Secrets | **Gitleaks** | ✅ |
| Tier 1 | SCA | **npm audit / Trivy** | ✅ |
| Tier 2 | DAST | **OWASP ZAP** | ✅ (producción) |
| Tier 2 | DAST | **Nuclei** | ✅ (producción) |
| Tier 2 | Security tests | **Vitest** (STDD) | ✅ |
| Tier 3 | Red Team | **SecOps** | Manual |

```bash
# Tier 1
npx semgrep --config=auto src/
gitleaks detect --source=. --verbose
npm audit --audit-level=high

# Tier 2 — security tests STDD
npx vitest run tests/security/

# Tier 2 — DAST (staging)
docker run -t owasp/zap2docker-stable zap-baseline.py -t $STAGING_URL
nuclei -u $STAGING_URL -t cves/ -t vulnerabilities/
```

### Árbol de decisión de seguridad

```
¿El proyecto maneja datos de usuarios, pagos o infraestructura crítica?
│
├─► SÍ → Camino COMPLETO: Threat Model + STDD + SecDD (SAST+DAST+Secrets)
│         + SecOps Red Team antes de cada release a producción
│
└─► NO → Camino MÍNIMO: SAST (Semgrep) + Secrets (Gitleaks)
```

---

## 6. Árbol de decisión

```
¿Es un proyecto greenfield o feature nueva?
│
├─► SÍ ─► ¿La lógica de negocio es compleja?
│         │
│         ├─► SÍ ─► Camino COMPLETO: FDD + DDD + SDD + ATDD + BDD + TDD + Threat + STDD + SecDD
│         │
│         └─► NO ─► ¿El cliente/usuario define criterios de aceptación?
│                   │
│                   ├─► SÍ ─► Camino ESTÁNDAR: FDD + SDD + ATDD + BDD + TDD + SecDD
│                   └─► NO ─► Camino ÁGIL: FDD + SDD + TDD
│
└─► NO (mantenimiento/bugfix)
        ├─► < 10 líneas → Directo (Art. 8 bypassed)
        └─► > 20 líneas → Camino MÍNIMO: SDD + TDD
```

### Tabla de selección rápida

| Escenario | FDD | DDD | SDD | ATDD | BDD | TDD | Threat | STDD | SecDD |
|-----------|:---:|:---:|:---:|:----:|:---:|:---:|:------:|:----:|:-----:|
| Módulo nuevo con lógica compleja | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Feature con usuario definido | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Tool interna / script | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ |
| Bugfix > 20 líneas | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ⚠️ | ❌ |
| Refactoring de dominio | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ |
| Integración con sistema externo | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Infraestructura / DevOps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> ⚠️ = Opcional según complejidad

---

## 7. Estructura de carpetas

```
PROJ-NombreProyecto/
├── CLAUDE.md
├── README.md
├── memoria.md
├── lecciones.md
│
├── .claude/
│   └── settings.json          ← Hook PostToolUse: re-indexa MemPalace tras Write/Edit
│
├── scripts/
│   ├── xdd-start.sh           ← Arranque unificado: MemPalace + git hooks + orquestador
│   └── hooks/
│       └── post-commit        ← Re-indexa MemPalace tras cada commit
│
├── prompts/                   ← Agencia de subagentes (portátil, relativa)
│   └── agents/
│
├── .agent/
│   └── workflows/             ← Slash commands del pipeline
│
├── idea/
│   └── briefing.md
│
├── docs/
│   ├── features/
│   │   └── FEATURES.md        ← FDD: catálogo de features
│   ├── specs/
│   │   ├── SPEC.md            ← Especificación técnica (DRIFT-ZERO)
│   │   ├── DOMAIN.md          ← DDD: modelo de dominio
│   │   └── THREATS.md         ← Threat-Driven: modelo de amenazas 🛡️
│   └── plans/
│       ├── PLAN.md            ← Reorganizado por features (FDD)
│       └── archive/
│
├── src/
│
├── tests/
│   ├── unit/                  ← TDD: tests unitarios (antes de src/)
│   ├── features/              ← BDD: archivos Cucumber .feature
│   ├── acceptance/            ← ATDD: tests de aceptación
│   ├── security/              ← STDD: security tests 🛡️
│   │   ├── injection/
│   │   ├── auth/
│   │   ├── authz/
│   │   ├── disclosure/
│   │   ├── availability/
│   │   ├── audit/
│   │   └── transport/
│   ├── e2e/
│   └── results/
│
├── api/
├── interop/
└── design/
```

### Reglas de integridad

- No existe `tests/features/*.feature` sin entrada en `docs/features/FEATURES.md`
- No existe `src/*.ts` con lógica de negocio sin su `tests/unit/*.test.ts` previo
- No existe `SPEC.md` aprobado sin `THREATS.md` aprobado (proyectos con datos sensibles)
- No existe función en `THREATS.md` marcada "security test requerido" sin archivo en `tests/security/`

---

## 8. Skills y workflows

### Skills nuevas

| Skill | Agente | Propósito |
|-------|--------|-----------|
| `skill-tdd-coach` | Builder | Ciclo Rojo-Verde-Refactor, detecta lógica sin test |
| `skill-ddd-modeler` | Architect | Bounded contexts, aggregates, ubiquitous language |
| `skill-bdd-writer` | Architect | Convierte requisitos en `.feature` Gherkin ejecutables |
| `skill-atdd-generator` | QA-Reviewer | Genera stubs de acceptance tests desde criterios |
| `skill-threat-modeler` 🛡️ | SecOps | STRIDE sobre DOMAIN.md, genera THREATS.md |
| `skill-stdd-coach` 🛡️ | Builder + SecOps | Ciclo STDD, payloads adversariales |
| `skill-devsecops-pipeline` 🛡️ | SecOps | Integra Semgrep, Gitleaks, Trivy, ZAP, Nuclei |

### Nuevos workflows

| Comando | Fase | Propósito |
|---------|------|-----------|
| `/domain-model` | Fase 2 | Genera `DOMAIN.md` con Architect + Domain-Expert |
| `/threat-model` 🛡️ | Fase 2 | Genera `THREATS.md` con SecOps + Architect |
| `/feature-catalog` | Fase 1 | Genera `FEATURES.md` con RICE/MoSCoW |
| `/bdd-generate` | Fase 1 | Convierte REQUIREMENTS.md en archivos `.feature` |
| `/tdd-cycle` | Fase 4 | Guía ciclo Rojo-Verde-Refactor para una función |
| `/stdd-cycle` 🛡️ | Fase 4 | Ciclo STDD para función/endpoint crítico |
| `/atdd-verify` | Fase 5 | Ejecuta acceptance tests y genera reporte |
| `/security-scan` 🛡️ | Fase 5 | SAST + Secrets + SCA consolidado |

### Modificaciones a workflows existentes

| Workflow | Cambio |
|----------|--------|
| `/fase-requisitos` | Genera `FEATURES.md` y archivos `.feature` skeleton |
| `/xdd-build` | Ciclo TDD antes de cada función de negocio |
| `/qa-review` | Tier 2 ejecuta `.feature` y acceptance tests |

---

## 9. Guía de adopción

### Proyectos existentes (no greenfield)

**Prioridad 1 — TDD en Build:**
- Crear `tests/unit/` y adoptar ciclo Rojo→Verde→Refactor para toda lógica nueva
- No retro-testear código viejo (es deuda, no emergencia)

**Prioridad 2 — Seguridad básica:**
- Integrar Semgrep + Gitleaks en el pipeline (< 30 min de setup)

**Prioridad 3 — Modelo de dominio:**
- Crear `docs/specs/DOMAIN.md` retroalimentando el dominio del proyecto
- A partir de ese punto, el ubiquitous language es vocabulario obligatorio

**Prioridad 4 — BDD:**
- Convertir criterios de aceptación existentes en archivos `.feature`

### Regla de adopción progresiva

```
Semana 1-2:  TDD en Build + Semgrep + Gitleaks
Semana 3-4:  DOMAIN.md para proyectos activos
Semana 3-4:  THREATS.md para proyectos con datos sensibles
Mes 2:       BDD con archivos .feature
Mes 2:       STDD para funciones críticas (auth, pagos, autorización)
Mes 3:       ATDD + DAST (ZAP/Nuclei) en Tier 2
En curso:    FDD al crear FEATURES.md en cada proyecto nuevo
En curso:    SecOps ejecuta /advanced-agentic-pentesting antes de cada release
```

### Checklist de proyecto X-DD listo

```
─── Funcional ───────────────────────────────────────────────────────────
[ ] docs/features/FEATURES.md con priorización RICE
[ ] docs/specs/DOMAIN.md aprobado (si aplica DDD)
[ ] Al menos 1 archivo .feature por épica en tests/features/
[ ] Stubs de acceptance tests en tests/acceptance/
[ ] PLAN.md organizado por features verticales (no por capas)
[ ] Builder en modo TDD-first para lógica de negocio
[ ] Tier 2 ejecuta .feature files en /qa-review
[ ] REQUIREMENTS.md referencia los archivos .feature correspondientes

─── Seguridad 🛡️ ────────────────────────────────────────────────────────
[ ] docs/specs/THREATS.md aprobado (proyectos con datos sensibles)
[ ] Ninguna amenaza CRÍTICA sin control documentado
[ ] SEC-REQ-* del THREATS.md copiados al SPEC.md
[ ] Stubs de security tests en tests/security/
[ ] Semgrep y Gitleaks integrados en Tier 1
[ ] Builder en modo STDD para funciones/endpoints críticos
[ ] npm audit / Trivy en CI/CD sin CVEs críticos o altos
[ ] OWASP ZAP / Nuclei configurados para staging
[ ] SecOps ejecuta /advanced-agentic-pentesting antes de cada release

─── Contexto y Memoria 🧠 ───────────────────────────────────────────────
[ ] MemPalace inicializado: mempalace init + mempalace mine
[ ] .claude/settings.json con PostToolUse hook activo
[ ] scripts/xdd-start.sh copiado al proyecto
[ ] scripts/hooks/post-commit copiado al proyecto
[ ] Git configurado: git config core.hooksPath ./scripts/hooks
[ ] xdd-start.sh ejecutado al iniciar cada sesión
```

---

## 10. Automatización de contexto — MemPalace

MemPalace indexa semánticamente el codebase, decisiones y artefactos del proyecto de forma local. El ecosistema X-DD lo mantiene actualizado automáticamente en tres capas para que al iniciar una nueva sesión (por ejemplo, tras agotar tokens) el contexto esté completamente disponible.

### Las tres capas de automatización

**Capa A — Arranque de sesión (`scripts/xdd-start.sh`)**
Ejecuta `mempalace init` + `mempalace mine` antes de lanzar el orquestador. Garantiza que al abrir una sesión nueva el índice refleje el estado más reciente del proyecto.

```bash
bash ./scripts/xdd-start.sh
```

**Capa B — Tras cada Write/Edit (`.claude/settings.json`)**
Hook `PostToolUse` que dispara `mempalace mine` en background cada vez que el agente crea o modifica un archivo. El índice se actualiza en tiempo real sin bloquear la sesión.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|NotebookEdit",
        "hooks": [{ "type": "command", "command": "mempalace mine \"$PWD\" 2>/dev/null &" }]
      }
    ]
  }
}
```

Compatible con Claude Code y OpenCode.

**Capa C — Tras cada commit (`scripts/hooks/post-commit`)**
Hook git que re-indexa MemPalace después de cada commit. Activado automáticamente por `xdd-start.sh` con `git config core.hooksPath ./scripts/hooks`.

### Flujo completo

```
Agente edita archivo  →  PostToolUse hook  →  mempalace mine (background)
git commit            →  post-commit hook  →  mempalace mine (background)
Nueva sesión          →  xdd-start.sh      →  mempalace mine → orquestador
```

### Consulta de contexto

Una vez indexado, el orquestador puede consultar el índice para recuperar decisiones pasadas, lecciones aprendidas y estado del dominio antes de responder.

---

## 11. Agencia de subagentes especializados

77+ subagentes consolidados en `./prompts/agents/` bajo 16 categorías. Los agentes viajan con el proyecto — sin dependencias globales, sin rutas absolutas.

### Delegación en el flujo diario

Para tareas de nicho vertical, instanciar el agente cargando su prompt de forma relativa:

```
Optimización visual:       ./prompts/agents/design/design-whimsy-injector.md
Rendimiento de DB:         ./prompts/agents/engineering/engineering-database-optimizer.md
Lógica DeFi/Web3:         ./prompts/agents/engineering/engineering-solidity-smart-contract-engineer.md
Refactor quirúrgico:       ./prompts/agents/engineering/engineering-minimal-change-engineer.md
Threat modeling:           ./prompts/agents/security/shannon-secops-expert.md
Accesibilidad WCAG:        ./prompts/agents/design/design-inclusive-visuals-specialist.md
```

Ver directorio completo en [equipo.md](./equipo.md).

---

> **Mantenido por:** Architect + Orchestrator
> **Gobernado por:** [Constitución X-DD v1.4](./constitucion.md)
