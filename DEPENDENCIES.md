# DEPENDENCIES — X-DD

Matriz oficial de dependencias del ecosistema X-DD. Mantenida manualmente; verificada por `xdd-doctor.sh` (a partir de Sprint 3) y por Renovate (a partir de Sprint 2).

## Núcleo obligatorio

| Dependencia | Versión mínima | Distribución | Licencia | Rol en X-DD |
|---|---|---|---|---|
| **Git** | `>=2.30` | git-scm.com / apt / brew | GPLv2 | Versionado y hooks (Constitución Art. 7: GitFlow) |
| **Bash** | `>=4.0` (3.2 macOS soportado) | preinstalado | GPLv3 | Scripts `xdd-*.sh` |
| **Python** | `>=3.9` | python.org / apt / brew | PSF | Runtime de MemPalace y futuro gate keeper (ADR-0003) |

## Núcleo recomendado

| Dependencia | Versión mínima | Distribución | Licencia | Rol |
|---|---|---|---|---|
| **MemPalace** | `>=3.3.0` | `pip install mempalace` ([GitHub](https://github.com/MemPalace/mempalace)) | MIT | Memoria semántica local (ChromaDB + SQLite) + MCP server con 29 tools. Ver [ADR-0004](docs/adr/0004-mempalace-dep-externa-no-fork.md). |
| **GitNexus** | latest | `npm i -g gitnexus` o `npx gitnexus` ([GitHub](https://github.com/abhigyanpatwari/GitNexus)) | **PolyForm Noncommercial 1.0.0** ⚠️ | Code intelligence: knowledge graph del codebase (AST + 14 langs) + 16 MCP tools (impact analysis, hybrid search BM25+semantic+RRF). Ver [ADR-0033](docs/adr/0033-gitnexus-tier1-companion.md). |
| **Node.js** | `>=20` | nodejs.org / nvm / asdf | MIT | Runtime para Vitest/Playwright/markdownlint + GitNexus CLI |

> ⚠️ **GitNexus es PolyForm Noncommercial 1.0.0**. Uso personal/research/educational/non-profit gratuito sin restricciones. Uso **comercial** requiere license paid (ver [akonlabs.com](https://akonlabs.com)). X-DD nunca bundle GitNexus — tu proyecto X-DD MIT NO se contamina por consumir su MCP server. Decisión de instalar/pagar es tuya. Detalles en [ADR-0033](docs/adr/0033-gitnexus-tier1-companion.md).

## Pentesting (opcional, ADR-0010)

| Dependencia | Versión | Distribución | Licencia | Rol |
|---|---|---|---|---|
| **Shannon** (KeygraphHQ/shannon) | latest | `npx @keygraph/shannon` o clone | **AGPL-3.0** ⚠️ | Dynamic pentest (white-box), exploits sandboxed, verify findings. Wrapper híbrido en `scripts/xdd-pentest.sh`. Sin Shannon X-DD degrada elegantemente a STRIDE + source review estático |

> ⚠️ **Shannon es AGPL-3.0**. Instalar Shannon en tu equipo está bien (uso libre). Pero: modificarlo + redistribuir/SaaS → AGPL aplica. **X-DD nunca bundle Shannon** — tu proyecto X-DD NO se contamina con AGPL. Decisión de instalar/usar Shannon es tuya. Ver `docs/PENTEST.md` y `ADR-0010`.

## Orquestadores de agentes (al menos uno)

| Dependencia | Versión | Distribución | Licencia | Rol |
|---|---|---|---|---|
| **Claude Code** | latest | `npm i -g @anthropic-ai/claude-code` | Propietaria (Anthropic) | Orquestador oficial — slash commands en `.claude/commands/` |
| **OpenCode** | latest | `npm i -g opencode-ai` | Apache-2.0 | Orquestador alternativo multi-proveedor (Claude/GPT/Gemini/Ollama) |
| **Cursor / Continue / Zed / Windsurf** | latest | sitios oficiales | varía | Compatibles vía MCP server propio de X-DD (Sprint 6, [ADR-0005](docs/adr/0005-mcp-preferido-y-server-propio.md)) |

## Testing

| Dependencia | Versión | Distribución | Licencia | Rol |
|---|---|---|---|---|
| **Vitest** | `>=1.0` | `npm i -D vitest` | MIT | Tests unitarios (TDD/STDD) en proyectos generados |
| **Playwright** | `>=1.40` | `npm i -D @playwright/test` | Apache-2.0 | E2E + BDD |
| **bats-core** | `>=1.10` | apt / brew | MIT | Tests de scripts shell (a partir de Sprint 3) |
| **pytest** | `>=7.0` | `pip install pytest` | MIT | Tests del gate keeper y MCP server (Sprint 4+) |

## Seguridad (pipeline SecDD)

| Dependencia | Versión | Distribución | Licencia | Rol |
|---|---|---|---|---|
| **Semgrep** | `>=1.50` | `pip install semgrep` / brew | LGPL-2.1 | SAST estático |
| **Gitleaks** | `>=8.18` | binario / brew | MIT | Detección de secretos |
| **Trivy** | `>=0.50` | apt / brew | Apache-2.0 | SCA de deps e imágenes |
| **OWASP ZAP** | `>=2.14` | `docker run zaproxy/zap-stable` | Apache-2.0 | DAST sobre staging |
| **Nuclei** | `>=3.0` | go install / brew | MIT | Templates de vulns conocidas |

## Convenciones

- **Versión mínima:** declarada con `>=`. `xdd-doctor.sh` (v2, Sprint 3) compara semánticamente.
- **Licencia compatible con MIT:** todas las deps obligatorias y recomendadas tienen licencia permissive (MIT/Apache-2.0/BSD/LGPL/PSF/GPLv2-runtime-only). Reportar incompatibilidad en `SECURITY.md` (Sprint 8).
- **No empaquetar:** X-DD nunca incluye binarios ni código de las deps en el repo. Ver [ADR-0004](docs/adr/0004-mempalace-dep-externa-no-fork.md).
- **Renovate:** mantiene `version mínima` y `version constraint` de las deps Node/Python al día (Sprint 2).

## Advertencia anti-impostores (MemPalace)

El proyecto oficial es:

- **Repo:** https://github.com/MemPalace/mempalace
- **Sitio:** https://mempalaceofficial.com
- **PyPI:** https://pypi.org/project/mempalace/

Existen dominios impostores (ej. `mempalace.tech`) que **no** son el proyecto oficial. X-DD solo soporta la dist oficial de PyPI. Si encuentras un fork o mirror, repórtalo al maintainer de MemPalace.

## Cómo actualizar esta matriz

1. Bump `versión mínima` en este archivo.
2. Actualizar `xdd-doctor.sh` con el nuevo `REQUIRED=...`.
3. Bump `xdd.config.yml` `version_constraint` (cuando exista, Sprint 3).
4. Añadir entrada en `docs/CHANGELOG.md` bajo `Changed`.
5. Crear ADR si la actualización trae breaking changes para usuarios.
