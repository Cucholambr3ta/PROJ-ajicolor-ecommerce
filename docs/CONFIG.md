# X-DD Configuration Reference

> Referencia operacional de [`xdd.config.yml`](../xdd.config.yml).
> Schema canónico: [`schemas/xdd.config.schema.json`](../schemas/xdd.config.schema.json).
> Ver también [ADR-0002](adr/0002-profile-vs-config-coexisten.md): `profile.yml` vs `config.yml`.

## Visión general

`xdd.config.yml` declara **cómo se ejecuta** un proyecto X-DD: integración con MemPalace, comportamiento del pipeline, registry de agentes, adapters IDE. Cambia con cada bump del framework. Es opcional — sin él, X-DD usa los defaults definidos en el schema.

`xdd.profile.yml` declara **qué es** el proyecto: tipo (saas/mobile/lib/internal), capabilities activadas, stacks. Es estable.

## Autocompletado en IDE

La directiva `# yaml-language-server: $schema=./schemas/xdd.config.schema.json` en la primera línea habilita autocompletado y validación en VSCode, IntelliJ, Zed y cualquier editor con el [YAML Language Server](https://github.com/redhat-developer/yaml-language-server).

## Secciones

### `xdd_version` (requerido)

Versión de la especificación de configuración. Sigue SemVer del framework.

```yaml
xdd_version: "0.1.0-dev"
```

### `mempalace`

Integración con MemPalace ([dependencia externa MIT, ver DEPENDENCIES.md](../DEPENDENCIES.md)).

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `enabled` | bool | `true` | Si MemPalace se integra en este proyecto |
| `version_constraint` | string | `">=3.3.0"` | Constraint de versión PEP440-style |
| `default_wing` | string | `"${project_name}"` | Wing por defecto (concepto MemPalace) |
| `index.paths` | array | `[./src, ./docs, ./.xdd]` | Paths a indexar |
| `index.exclude` | array | ver schema | Patrones excluidos del indexado |
| `triggers[]` | array | ver below | Acciones por evento |
| `fallback.on_failure` | enum | `warn` | `warn` \| `block` \| `silent` |
| `fallback.log_path` | string | `~/.mempalace/mine.log` | Destino de logs |
| `mcp.enabled` | bool | `true` | Exponer 29 tools de MemPalace vía MCP |
| `mcp.transport` | enum | `stdio` | `stdio` \| `sse` |

**Triggers válidos:**

| Evento | Acción típica | Notas |
|--------|---------------|-------|
| `session_start` | `mempalace wake-up --wing X` | Al lanzar el orquestador |
| `file_write` | `mempalace mine --incremental --wing X` | Hook PostToolUse; usar `debounce_ms` para evitar bursts |
| `git_commit` | `mempalace mine --incremental --wing X` | Hook post-commit; `delay_ms` para no interferir con git |

### `pipeline`

Configuración del Gated Pipeline.

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `gates.enforce_artifacts` | bool | `true` | Validar artefactos antes de transición |
| `gates.require_approval` | bool | `true` | `"APROBADO"` obligatorio |
| `gates.require_signature` | bool | `true` | Firma HMAC-SHA256 (ADR-0006); activable desde v0.1.0 / Sprint 4 |
| `gates.block_on_missing_spec` | bool | `true` | No permitir `src/` sin `SPEC.md` aprobado |
| `phases[].id` | enum | — | `briefing\|spec\|plan\|build\|qa\|retro` |
| `phases[].artifacts` | array | — | Paths esperados para considerar la fase "lista para aprobación" |

### `agents` (Sprint 5)

Registry tipado de agentes. Llegará formalmente en Sprint 5; mientras tanto, los defaults son suficientes.

### `ide_adapters` (Sprint 7)

Lista de IDE adapters a generar vía `xdd-adapt.sh`. v0.1.0 solo soporta `claude-code` y `opencode` ([ADR-0007](adr/0007-adapters-iniciales-claude-opencode-mcp.md)). Otros IDEs vía MCP server propio (Sprint 6).

## Validación

```bash
# Validación sintáctica (YAML)
python3 -c "import yaml; yaml.safe_load(open('xdd.config.yml'))"

# Validación contra schema (requiere `pip install jsonschema pyyaml`)
python3 -c "
import json, yaml, jsonschema
schema = json.load(open('schemas/xdd.config.schema.json'))
config = yaml.safe_load(open('xdd.config.yml'))
jsonschema.validate(config, schema)
print('OK')
"

# Validación automática del doctor
bash scripts/xdd-doctor.sh
```

## Migración entre versiones

Cada bump mayor (`xdd_version: X.0.0`) puede traer breaking changes. Ver [`docs/CHANGELOG.md`](CHANGELOG.md) y los ADRs relacionados. Una herramienta de migración (`xdd config migrate`) está prevista para post-v0.1.0 ([ADR-0008](adr/0008-consolidacion-xdd-cli-diferida.md)).
