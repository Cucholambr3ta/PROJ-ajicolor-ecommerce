# DISCOVERY — Ajicolor E-commerce

> **Fase 1 del Pipeline X-DD** — Briefing formal
> **Product Manager:** Dueño único
> **Fecha:** 2026-05-29
> **Estado:** Briefing aprobado → Fase 2 (Spec)

---

## 1. Problema / Oportunidad

El dueño — diseñador y músico — vende poleras de estética toon-pop (rubber hose 1930s + pop art moderno) con temática musical en drops limitados. Hoy opera **sin plataforma digital**: los pedidos llegan por Instagram DMs, WhatsApp, y ferias presenciales. No hay trazabilidad de pedidos, control de stock, historial de clientes ni métricas.

**Oportunidad:** Una tienda SaaS que unifique catálogo, pedidos, producción, stock, envíos y dashboard financiero para que el dueño opere todo el negocio desde un solo lugar, sin depender de spreadsheets ni mensajes sueltos.

**Target:** Nicho de músicos, coleccionistas de indumentaria alternativa, y público young-adult que valora ediciones limitadas con identidad visual fuerte (estética cartoonesca + vinilos/bandas).

---

## 2. User Persona

| Atributo | Detalle |
|----------|---------|
| **Nombre** | Diego Larraín |
| **Rol** | Fundador, diseñador, productor, community manager, logística — todo en uno |
| **Perfil técnico** | Bajo. No code. Usa Excel para cuentas, Canva para diseño, Instagram para vender. |
| **Necesidades clave** | (1) Publicar drops sin tocar código. (2) Ver pedidos entrantes en tiempo real. (3) Saber qué tallas se agotaron. (4) Generar etiqueta de envío sin copiar datos a mano. (5) Saber cuánta plata entró este mes. |
| **Frustraciones** | "Perdí un pedido porque se me mezcló con un mensaje de la mamá." "No sé cuántas poleras M debo producir para el próximo drop." "No tengo idea cuánto gasté en envíos el mes pasado." |
| **Canales actuales** | Instagram (@ajicolor.cl) + WhatsApp Business + ferias presenciales |

---

## 3. Customer Journey

```
CATÁLOGO                   PEDIDO                     PRODUCCIÓN                  ENVÍO                    POSTVENTA
  │                          │                           │                          │                         │
  v                          v                           v                          v                         v
Explora drops →        Selecciona talle →   Dueño recibe pedido →   Prepara paquete →      Cliente recibe →   
Filtra por género     WhatsApp/Checkout     Imprime orden         Genera etiqueta       Confirma entrega
(funk/rock/jazz)      Elige color           Produce (serigrafía)  Stark/Chilexpress     Deja reseña
                        → Paga (TP/MP)        → Secado / control       → Tracking link      → Puntos fidelidad
                                                                        calidad             → Sube foto
```

### Touchpoints clave detectados en mockups

| Pantalla | Touchpoint |
|----------|------------|
| `index.html` | Catálogo con filtro, badges "BEST SELLER" / "SOLD OUT", vista rápida |
| `product.html` | Selector de talle, precio con descuento, botón WhatsApp, galería frontal/dorso/etiqueta |
| `profile.html` | Historial de órdenes, tracking, estado (Processing/Delivered), lealtad |
| `admin.html` | Revenue, drops activos, usuarios, chart semanal, tabla de inventario, botón "Launch New Drop!" |

### Estados de pedido observados

- **Processing** (amarillo) → recién creado
- **Delivered** (verde) → completado
- **Sold Out** → producto agotado

---

## 4. Hipótesis validadas (basadas en mockups)

1. **Catalogo navegable por género musical:** Funk, Rock, Jazz como taxonomía principal. Se asume que el catálogo crece por "drops" (colecciones limitadas), no por SKUs infinitos.
2. **Checkout vía WhatsApp:** No hay carrito tradicional. El botón "Get it on WhatsApp" sugiere conversación humana como canal de venta (típico de negocios unipersonales chilenos).
3. **Precios en CLP ($):** Montos como $32.000 y $45.000 indican moneda chilena. Se asume integración con Transbank / Mercado Pago / Khipu.
4. **Producción bajo demanda:** El producto tiene descripción técnica detallada (240gsm, serigrafía de alta densidad). Se asume que el dueño produce por batch, no stock infinito.
5. **Fidelización con esquema VIP:** "Tees collected: 15", "Music Level: VIP". Hay un sistema de fidelidad, probablemente manual o por acumulación de compras.
6. **Envíos por operador local:** "Stark Logistics" en mockup. Se asumen courriers chilenos (Chilexpress, Starken, Bluexpress).
7. **Admin todo-en-uno:** Dashboard, inventario, clientes, drops, settings — todo desde una interfaz. El dueño necesita una "central de comando", no múltiples herramientas.
8. **Estética toon-pop como ventaja competitiva:** No es un template genérico. El branding (Lobster + Outfit, magenta/purple/yellow, film-grain, thick-border) es parte del producto.

---

## 5. Riesgos identificados

### Técnicos
- **API de WhatsApp Business:** La integración con WhatsApp para checkout requiere API oficial (Meta) con costos y aprobación. Alternativa: link directo `wa.me` sin API.
- **Pasarela de pago chilena:** Transbank requiere商户 (comercio) constituido, Webpay REST tiene SDKs pero documentación densa. Mercado Pago es más ágil pero fees más altos.
- **Tracking de envíos:** Obtener tracking en tiempo real desde Chilexpress/Starken requiere scrapping o API B2B (no siempre disponible para volumes pequeños).
- **Single-owner como único operador admin:** No hay roles ni permisos. No hay multi-tenancy. Diseñar para 1 persona ejecutando todo.

### De negocio
- **Dependencia de WhatsApp:** Si el dueño se enferma o satura, no hay auto-servicio. El checkout humano no escala.
- **Producción contra pedido vs. stock:** Drops limitados vs. producción just-in-time. El modelo híbrido (preventa → producción → envío) tiene lead time que el cliente debe entender.
- **Estacionalidad de nicho:** Ropa musical toon-pop es ultra-nicho. Crecimiento depende de comunidad, no de ads masivos.

### De operación
- **Inventario inconsistente:** El dueño puede vender la misma polera en dos canales (web + feria). El sistema debe ser fuente de verdad, no un reflejo.
- **Fidelidad manual:** Si el esquema VIP es manual, no escala. Debe ser automático: x compras → sube nivel.
- **Devoluciones / cambios:** No hay pantalla de devolución en mockups. Sin política clara, cada caso es una excepción que el dueño gestiona por WhatsApp.

---

## 6. Criterios de éxito

| Métrica | Cómo se mide | Target inicial | Prioridad |
|---------|-------------|----------------|-----------|
| **Órdenes sin pérdida** | 100% de pedidos web llegan al dashboard admin | Semana 1 | 🔴 Crítica |
| **Stock actualizado en tiempo real** | Diferencia stock web vs. real = 0 | Semana 2 | 🔴 Crítica |
| **Tiempo publicación de drop** | De crear producto a live en tienda | < 15 min | 🟡 Alta |
| **Revenue visible** | Dashboard muestra $ del mes sin cálculos manuales | Semana 1 | 🔴 Crítica |
| **Tracking de envíos** | Cliente ve estado sin preguntar al dueño | Semana 4 | 🟡 Alta |
| **Fidelidad automática** | Cliente sube de nivel sin intervención del dueño | Semana 6 | 🟢 Media |
| **Chat reducido** | % de pedidos que NO requieren WhatsApp post-checkout | > 70% | 🟢 Media |

---

## 7. Próximos pasos (Spec)

Debería ir a **Spec** (Fase 2) con estas prioridades:

| # | Prioridad | Feature | Artefacto destino |
|---|-----------|---------|-------------------|
| 1 | P0 | Catálogo de productos con drops + géneros musicales | SPEC.md / FEATURES.md |
| 2 | P0 | Checkout → WhatsApp link con datos precargados (talle, producto) | SPEC.md |
| 3 | P0 | Admin Dashboard con revenue, órdenes, stock (1-pantalla) | SPEC.md |
| 4 | P1 | Historial de pedidos por cliente (profile) | SPEC.md |
| 5 | P1 | Estados de pedido: Processing → Shipped → Delivered | DOMAIN.md / eventos |
| 6 | P1 | Integración de pago (Mercado Pago / Webpay) | SPEC.md / THREATS.md |
| 7 | P2 | Esquema de lealtad / niveles | SPEC.md / DOMAIN.md |
| 8 | P2 | Tracking de envíos (Chilexpress / Starken) | SPEC.md |
| 9 | P3 | Panel de devoluciones / cambios | SPEC.md / PRIVACY.md |

---

*Fin de DISCOVERY — Ajicolor E-commerce Briefing*
