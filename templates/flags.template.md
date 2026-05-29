# FLAGS.md — Inventario de Feature Flags

> Producido por `/feature-flag`. Mantenido al día por el agente Feature Flag Manager.

<!-- CONFIGURAR: Stack de feature flags -->
<!-- Opciones (elige una al adoptar en proyecto):                              -->
<!--  - LaunchDarkly: SaaS comercial, mejor DX y targeting, pago por seat      -->
<!--  - Unleash: OSS auto-hospedable, control total, requiere infra            -->
<!--  - Flagsmith: híbrido (OSS o SaaS), buen balance precio/control           -->
<!--  - GrowthBook: OSS con foco en experimentación A/B y análisis             -->

## 1. Inventario activo

| Key | Tipo | Owner | Audiencia | Estado | Default off | Métrica de éxito | Fecha kill |
|-----|------|-------|-----------|--------|-------------|------------------|------------|
| `nuevo_checkout_v2` | Release | @ana | 10% beta | rollout | true | conversion +2pp | 2026-07-01 |
| `experiment_recom`  | A/B    | @luis | 50/50    | running | true | CTR uplift | 2026-06-15 |
| `kill_search`       | Kill switch | @ops | all | armed | false | n/a | n/a |

## 2. Tipos de flag
- **Release:** desacoplar deploy de release. Vida corta.
- **Experiment (A/B):** validar hipótesis. Vida corta, definida por análisis.
- **Permissioning:** entitlements por plan/rol. Vida larga.
- **Kill switch / Ops:** degradación controlada en producción. Vida larga.

## 3. Convenciones
- Nombre: `snake_case`, prefijo según tipo (`release_`, `exp_`, `perm_`, `kill_`).
- Default OFF en producción salvo kill switches.
- Cada flag con owner y fecha de retiro al crearse.
- Limpieza automática: PR de retiro si flag lleva > 90 días al 100%.

## 4. Workflow de retiro
1. Owner confirma rollout estable.
2. Crear PR `chore(flags): remove <flag_key>`.
3. Eliminar usos en código + entrada en este inventario.
4. Eliminar definición en el proveedor.

## 5. Auditoría
- **Última revisión:** YYYY-MM-DD
- **Flags vencidos sin acción:** ver consulta `mempalace ask "flags vencidos"`.
