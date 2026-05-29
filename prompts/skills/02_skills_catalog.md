# 🛠️ Catálogo Maestro de Skills: Ecosistema X-DD

Este manual detalla las **23 skills personalizadas** ubicadas en `.agent/skills/`, explicando su propósito operativo y cómo se adaptan a la arquitectura de memoria local-first de **MemPalace**.

---

## 🗃️ Listado de Skills y Mapeo Operativo

A continuación se catalogan las 23 skills activas del ecosistema, agrupadas por su rol funcional en el ciclo de desarrollo:

### 1. Núcleo de Gestión de Memoria y Contexto (MemPalace Loci)
*   **`skill-mempalace-manager` (Nueva / Refactorizada)**: Reemplaza y unifica el rol de `skill-obsidian-manager`. Gestiona la creación de Wings (proyectos), Rooms (módulos) y Halls (hechos, eventos, descubrimientos) dentro del Palacio de la Memoria.
*   **`skill-librarian-indexer`**: Especialista en la ingesta, indexación semántica y catalogación de metadatos de código fuente. Se conecta a `mempalace mine` para vectorizar el código.
*   **`skill-mempalace-loci` (Nueva / Refactorizada)**: Reemplaza a `skill-obsidian-markdown`. Define el estándar de formato de anotaciones espaciales y notas Loci optimizadas para embeddings y el RAG vectorial de MemPalace.
*   **`skill-identity-context`**: Establece el contexto de identidad del arquitecto de software de X-DD, definiendo el idioma (español), las directivas globales de trato y gobernanza, previniendo respuestas genéricas.
*   **`ai-context-optimizer`**: Comprime y optimiza la ventana de contexto del LLM, descartando logs redundantes pero preservando los pasillos de hechos inmutables.
*   **`smart-file-search`**: Ejecución de búsquedas locales rápidas por relevancia conceptual y patrones de archivos en lugar de simples strings estáticos.

### 2. Roles Estratégicos y Liderazgo (Team Lead)
*   **`skill-x-dd-pm`**: El Gestor de Proyectos de X-DD. Coordina las fases del Gated Pipeline, valida que cada fase tenga su aprobación (`APPROVED`) y actualiza `memoria.md`.
*   **`skill-fractional-cto`**: Mentor de viabilidad técnica. Evalúa las deudas de código, sugiere alternativas arquitectónicas e inyecta análisis de pros y contras.
*   **`skill-x-dd-learning-loop`**: Ejecuta la retrospectiva post-cierre. Genera `lecciones.md` y las envía directamente al almacén de hechos (Halls) de MemPalace para el auto-aprendizaje.
*   **`skill-x-dd-workflow-bridge`**: Permite la delegación y sincronización de tareas entre subagentes paralelos y el agente principal.

### 3. Arquitectura y Diseño Visual Premium
*   **`skill-project-architect`**: Garantiza que todo proyecto siga las directivas `PROJ-PascalCase` y mantenga la estructura obligatoria: `/docs`, `/api`, `/design`, `/src`, `/tests`.
*   **`skill-clean-code-architect`**: El guardián de los estándares SOLID, DRY y KISS en el código fuente.
*   **`skill-design-system-atomic`**: Diseñador de interfaces basado en Atomic Design (Átomos, Moléculas, Organismos).
*   **`skill-color-theory`**: Genera esquemas cromáticos premium basados en HSL/OKLCH para evitar colores planos y genéricos.
*   **`skill-web-design-architect`**: Estética UI/UX de alta gama, tipografía cuidada (Inter, Outfit), efectos de glassmorphism y micro-animaciones dinámicas.
*   **`skill-perf-auditor`**: Auditor de rendimiento de frontend y Core Web Vitals (LCP, FID, CLS).

### 4. Seguridad Avanzada y SecOps (Shannon Edition)
*   **`skill-shannon-secops`**: El motor ofensivo de auditoría y PenTesting automatizado potenciado por IA. Simula ataques y detecta fallos lógicos, analizando secretos y variables de entorno para evitar leaks.

### 5. Desarrollo Backend, Utilidades e Interoperabilidad
*   **`skill-backend-architect`**: Diseñador de APIs robustas (REST, GraphQL, tRPC) con esquemas de datos eficientes.
*   **`skill-code-reviewer`**: Revisor de código de élite que evalúa las implicaciones de rendimiento y deudas técnicas de cada PR antes de integrarse.
*   **`skill-markitdown`**: Conversión inteligente de documentos PDF, DOCX y presentaciones de ventas a Markdown limpio para su indexación en MemPalace.
*   **`skill-product-prioritizer`**: Evalúa e implementa metodologías de priorización (ej. MoSCoW, RICE) para las tareas de desarrollo en base a esfuerzo/impacto.
*   **`skill-gsd-sync`**: Sincronización ágil y bidireccional entre la documentación y el código ejecutable de la suite.
*   **`systematic-debugging`**: Caja de herramientas para el diagnóstico científico de errores antes de proponer cambios (TDD Red Stage).

---

## 🔗 Integración de las Skills con Hermes Agent

Cuando **Hermes Agent** se conecta a **MemPalace** vía el protocolo MCP, estas skills ya no son simples scripts estáticos en disco; se transforman en **herramientas dinámicas (Tools)** que el agente puede invocar de forma autónoma:

1. **Lectura Contextual Directa:** El agente usa `skill-mempalace-manager` para consultar la memoria histórica antes de editar cualquier archivo, evitando conflictos de código.
2. **Registro de Aprendizaje Post-Fase:** Mediante `skill-x-dd-learning-loop`, al terminar un desarrollo exitoso, el agente genera un hecho de aprendizaje y lo registra directamente en el Palacio de Memoria, enriqueciendo su base de conocimiento de forma indefinida.
