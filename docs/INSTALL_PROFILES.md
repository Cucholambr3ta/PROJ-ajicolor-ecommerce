# Install Profiles & Modules — X-DD

> Sistema manifest-driven inspirado en ECC (Sprint 7).
> Permite "instalo solo lo que necesito" sin tener que clonar todo el repo.

## Cómo funciona

X-DD declara su contenido en 3 manifests en `manifests/`:

| Manifest | Contenido | Schema |
|----------|-----------|--------|
| `install-modules.json` | Unidades de capacidad (core, hooks-runtime, mcp-server, etc.) | `schemas/install-modules.schema.json` |
| `install-profiles.json` | Perfiles que agrupan módulos por caso de uso | `schemas/install-profiles.schema.json` |
| `install-components.json` | Componentes individuales (granularidad más fina que módulos) | `schemas/install-components.schema.json` |

El instalador (`xdd-init.sh` o `install.ps1`) resuelve el perfil → módulos → archivos
a copiar, y solo escribe lo que no existe en el destino (idempotente).

## Perfiles

| Perfil | Para qué | Módulos incluidos |
|--------|----------|-------------------|
| `minimal` | Probar X-DD sin compromisos | core + workflows-core + memory |
| `core` | **Recomendado para empezar** | + agents-core + gate-keeper + ci-runtime |
| `developer` | Desarrollo activo con IA | + hooks-runtime + mcp-server + platform-configs |
| `security` | SecDD énfasis | core + hooks (strict) + AgentShield (Sprint 12) |
| `research` | Exploración + eval | core + eval-harness (Sprint 10) + continuous-learning (Sprint 9) |
| `full` | Todo (incluyendo Sprints 9-12 cuando estén) | todos los módulos |

## Uso

### Linux / macOS / WSL

```bash
# Listar perfiles
bash scripts/xdd-init.sh --list-profiles

# Bootstrap con perfil específico
bash scripts/xdd-init.sh /ruta/al/proyecto --profile=developer

# Bootstrap con módulos override (granularidad fina)
bash scripts/xdd-init.sh /ruta/al/proyecto --modules=core,workflows-core,mcp-server

# Bootstrap default (perfil=core)
bash scripts/xdd-init.sh /ruta/al/proyecto
```

### Windows (PowerShell)

```powershell
# Listar perfiles
.\install.ps1 -ListProfiles

# Bootstrap con perfil
.\install.ps1 -Dest C:\proyectos\mi-app -Profile developer

# Bootstrap con módulos override
.\install.ps1 -Dest C:\proyectos\mi-app -Modules "core,workflows-core,mcp-server"
```

> Requiere Python 3.9+ en PATH para resolver manifests. Sin Python, el instalador
> hace fallback a comportamiento legacy (instala todo el repo).

## Módulos disponibles

| Módulo | Descripción | Disponible desde |
|--------|-------------|------------------|
| `core` | Núcleo (scripts doctor/init/start/adapt, templates, CLAUDE.md, configs base) | Sprint 7 |
| `workflows-core` | 49 workflows X-DD en `.agent/workflows/` | Sprint 7 |
| `agents-core` | Registry tipado de 180 agentes | Sprint 5 |
| `gate-keeper` | Gate keeper programático con HMAC | Sprint 4 |
| `hooks-runtime` | Hook system event-driven (8 hooks) | Sprint 7 |
| `mcp-server` | MCP server propio (6 tools) | Sprint 6 |
| `platform-configs` | Configs por IDE | Sprint 7 |
| `ci-runtime` | GitHub Actions + pre-commit + Renovate | Sprint 2 |
| `memory` | Plantillas memoria.md, lecciones.md | Sprint 0 |
| `eval-harness` | Eval con grader types | Sprint 10 (próximo) |
| `continuous-learning` | Instincts + /evolve | Sprint 9 (próximo) |
| `orchestration` | Multi-agent runtime | Sprint 11 (próximo) |
| `agent-shield` | Security audit del framework | Sprint 12 (próximo) |

## Validación

```bash
# Validar todos los manifests contra sus schemas
python3 -c "
import json, jsonschema
for m in ['install-modules', 'install-profiles', 'install-components']:
    sch = json.load(open(f'schemas/{m}.schema.json'))
    doc = json.load(open(f'manifests/{m}.json'))
    jsonschema.validate(doc, sch)
    print(f'OK: {m}.json')
"
```

## Filosofía

X-DD evita el problema "framework gigante que asusta al primer contacto" típico de
ECC. Con `minimal` (3 módulos) podés probar X-DD en 30 segundos. Con `core` (6
módulos) tenés gates + agentes + CI. Solo cuando necesites runtime de hooks o MCP
agregás `developer`. Las capacidades v0.2.0 (`continuous-learning`, `eval-harness`,
`orchestration`, `agent-shield`) están declaradas en manifests **antes** de existir,
para que el instalador no rompa al detectar perfiles `research`/`security`/`full`.

## Diferencias con ECC

| Aspecto | ECC | X-DD |
|---|---|---|
| Profiles | 5 (minimal/core/developer/security/research/full) | 6 (igual + minimal) |
| Modules | ~25 | 13 (subset cuidadoso) |
| Granularidad fina | components | components (≥12) |
| Instalador Win | `install.ps1` | `install.ps1` (paridad) |
| Instalador Unix | `install.sh` | `xdd-init.sh` (heredado, ahora con `--profile`) |
| Resolver | Node.js | Python 3 stdlib |
| State store | SQLite con tracking de instalado | (post-v0.1.0) |
