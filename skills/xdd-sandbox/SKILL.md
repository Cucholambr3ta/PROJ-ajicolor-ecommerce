---
name: xdd-sandbox
description: Provider-agnostic sandbox skill. Backends E2B, Daytona, Microsandbox, local docker, none.
origin: x-dd
inspired_by: E2B, Daytona, Microsandbox, ai-boost sandboxing section, Picrew sandbox enumeration
category: security
when_to_use:
  - Antes de ejecutar código generado por LLM
  - Antes de tool calls con severity ≥ high (xdd-intent)
  - Antes de comandos shell con args dinámicos
triggers:
  - "/sandbox"
  - "run in sandbox"
  - XDD_AUTO_SANDBOX
---

# xdd-sandbox — Provider-agnostic sandbox

## Propósito
Aislar ejecución de código/comandos en sandbox antes de tocar el host. Provider-agnostic: declara backend en `xdd.config.yml`, usa cualquiera de los 5 soportados.

## Backends

| Backend | License | Cost | Setup | Best for |
|---|---|---|---|---|
| `e2b` | Apache-2.0 | $ (cloud) | `pip install e2b` + API key | Cloud sandboxes con browser/desktop |
| `daytona` | Apache-2.0 | $/free | Daytona instance | Dev environments AI-generated code |
| `microsandbox` | MIT | free local | rootless VM tool | Local sandbox sin cloud |
| `docker` | Apache-2.0 | free local | docker daemon | Quick container isolation |
| `none` | - | - | - | Disable (NOT recommended for prod) |

## Configuración

```yaml
# xdd.config.yml
sandbox:
  backend: docker            # e2b | daytona | microsandbox | docker | none
  default_image: "python:3.12-slim"
  network: "deny"            # deny | allow_localhost | full
  cpu_limit: "1.0"
  mem_limit: "512m"
  timeout_sec: 30
  auto_for_intents:
    - lang_exec
    - filesystem_delete
    - fork_subprocess
```

## Flow

1. Tool call clasificado por `xdd-intent` → severity ≥ threshold
2. Skill consulta `sandbox.auto_for_intents` en config
3. Si match → wrap call en sandbox backend
4. Backend ejecuta, captura stdout/stderr, retorna a host

## Boundaries

- ❌ Sandbox != authz. `xdd-authz` decide IF permitir; `xdd-sandbox` decide CÓMO ejecutar.
- ❌ `network: full` deshabilita beneficio principal de sandbox.
- ✅ `network: deny` recommended para code untrusted.
- ✅ Combinable con `xdd-authz require_approval`: human confirma → ejecutar en sandbox.

## Referencias
- [ADR-0027 Sandbox provider abstraction](../../docs/adr/0027-sandbox-provider-abstraction.md)
- E2B: https://e2b.dev
- Daytona: https://daytona.io
- Microsandbox: https://github.com/microsandbox/microsandbox
