---
name: creador-de-contenido
description: >
  Skill especializada para el Dr. Juan Santiago Molina V. (@cirujanomolina).
  Úsala SIEMPRE que el usuario mencione una idea de contenido, quiera crear un reel,
  necesite desarrollar una pieza de Instagram, pida un guion, hable de hooks, mencione
  un tema para redes sociales, o use frases como "tengo una idea", "quiero hacer un reel",
  "¿cómo haría este contenido?", "desarrolla esta idea", "crea el guion", o similares.
  Esta skill convierte cualquier idea en una estrategia de producción completa lista
  para filmar. No la omitas aunque la idea parezca simple.
---

# SKILL: Creador de Contenido — Dr. Juan Santiago Molina V.

## Objetivo
Transformar cualquier idea en una estrategia de producción de reel COMPLETA,
entregada como un artefacto HTML interactivo con la estética exacta de la marca.

---

## CONTEXTO DE MARCA (resumen ejecutivo)

- **Posicionamiento:** Cirujano bariátrico premium. Humano, cercano, con autoridad médica real.
- **Tagline:** *"Recupera quien eres."*
- **Audiencia:** Mujeres 32–48 años agotadas de intentar sin resultado. Pacientes metabólicos.
- **Fórmula:** 70% emoción / 30% ciencia. Validar ANTES de explicar. SIEMPRE.
- **Paleta:** #14262D (verde noche) · #1F434E (verde azulado) · #2ABFB0 (teal) · #F4F5F0 (hueso) · #CCC2A7 (beige)
- **Tipografía:** Cormorant Garamond (hooks/títulos) · Archivo (cuerpo/CTAs)
- **Estética:** Cinematográfica · Premium · Netflix médico oscuro — NUNCA TikTok genérico
- **NUNCA:** Motivación vacía · Tecnicismos · Arrogancia · Competir por precio

Ver detalles completos en `references/brand-brain.md`.

---

## FLUJO DE TRABAJO

### FASE 1 — INTERROGATORIO (máximo 3 preguntas)

Al recibir una idea, hacer solo las preguntas más relevantes:
- ¿Tienes material de quirófano/consultorio o será talking head puro?
- ¿Hay una emoción principal que quieres activar?
- ¿Tienes historia de paciente o dato clínico que incluir?
- ¿Va en alguna semana específica del calendario?

Si el usuario dice "procede" o ya dio suficiente contexto → saltar directo a Fase 2.

### FASE 2 — ANÁLISIS ESTRATÉGICO (interno)

Determinar antes de generar el HTML:
- Pilar de contenido (ver `references/pillars.md`)
- Etapa del funnel: TOFU / MOFU / BOFU
- Emoción central y objetivo psicológico
- Objetivo algorítmico (guardados / compartidos / DMs / comentarios)
- Formato (talking head / voiceover+B-roll / native text / etc.)
- Duración ideal (15s / 30s / 45s / 60s)
- Tipo de edición (emocional lento / contrarian intenso / documental / conversacional)
- Ubicación, vestuario, PIP concepts
- 3 re-hooks como conectores narrativos del diálogo

### FASE 3 — OUTPUT: ARTEFACTO HTML

**CRÍTICO:** El output final ES un artefacto HTML interactivo con fondo #14262D.
NUNCA entregar solo texto. NUNCA fondo gris del sistema.

---

## ESPECIFICACIONES DEL HTML

### Estructura obligatoria

1. **Header** — nombre del reel (con `<em>` en palabra clave = color teal), badges de pilar/funnel/duración/formato/día
2. **Tabs** — Estrategia / Guion / Brief
3. **Tab Estrategia:**
   - Ficha en cuadrícula 2 columnas — cada campo tiene botón `rbtn` con acordeón de variaciones
   - 3 hooks con botón individual + botón "Todos" para regenerar
   - CTA con botón de variación
4. **Tab Guion:**
   - Leyenda de colores (escena / re-hook / PIP)
   - Tabla con botón de variación general
   - Filas re-hook con `class="row-rh"` — resaltadas en ámbar
   - Ritmo del diálogo: `.dxs` (golpe corto) · `.dsm` (medio) · `.dmd` (largo/lento) · `.drh` (re-hook ámbar) · `.dsi` (silencio)
5. **Tab Brief** — paleta, tipografía, sonido, imagen/PIPs
6. **Campo general** al final — textarea + sendPrompt
7. **Exportar** — botones .MD y .CSV

### Re-hooks en el guion

Los re-hooks son CONECTORES NARRATIVOS del diálogo, no elementos separados.
Formas correctas: "Pero...", "Pero eso no es todo...", "Y no obstante...",
"Pero espera, hay algo más...", "Y ahora viene lo importante..."

Un reel de 45s lleva 3 re-hooks (cada ~15s). De 30s: 2. De 60s: 4.

### Ritmo del guion

Cada línea del diálogo tiene un tamaño visual según su peso narrativo:
- `.dxs` → font-size: 14-15px, font-weight: 500 (golpe directo, frase corta)
- `.dsm` → font-size: 12.5-13px, font-weight: 400 (frase media)
- `.dmd` → font-size: 11.5px, font-weight: 300 (frase larga, explicación)
- `.drh` → font-size: 12.5px, font-weight: 500, color: #C9862A, font-style: italic
- `.dsi` → font-size: 11px, font-style: italic, color baja opacidad (silencio/acción)

### Variaciones contextuales

Cada `rbtn` abre un acordeón con:
- 2 opciones inteligentes y específicas para ese campo
  (ej. para "Ubicación": "Exterior abierto" con justificación + "Sala de espera" con justificación)
- 1 campo libre + botón de envío

Todas las opciones llaman `sendPrompt()` con el contexto completo del reel.

### PIPs / fondos visuales

Solo el concepto: qué tipo de imagen/video va ahí y por qué emocional/narrativamente.
Sin detalles de búsqueda ni fuentes. Ejemplo: "Mujer sola frente a espejo, de espaldas.
Interior cálido, luz tenue — refleja el dolor de no reconocerse."

### Objeto de datos GD

El objeto JS `GD` contiene TODOS los datos del reel y alimenta las exportaciones:
nombre, slug, pilar, funnel, emocion, objP, objA, formato, edicion,
duracion, ubicacion, vestuario, rehooks, hooks[], guion[], ctaV, ctaVis,
ctaKw, musica, imagen, dia, fase, historias.

### CSS variables obligatorias

```css
--vd:#14262D; --v2:#1F434E; --tl:#2ABFB0; --hs:#F4F5F0;
--bg:#CCC2A7; --rh-c:#C9862A;
```

Fondo del widget: `background: var(--vd)` — SIEMPRE. Nunca gris del sistema.

---

## REGLAS ABSOLUTAS

1. El output siempre es el artefacto HTML. Nunca solo texto.
2. Fondo siempre #14262D. Nunca el gris de Claude.
3. Re-hooks = conectores del diálogo ("pero", "no obstante", "eso no es todo").
4. Validar antes de explicar. 70% emoción / 30% ciencia.
5. Nunca motivación vacía. "¡Tú puedes!" o "fuerza de voluntad" — prohibido.
6. CTA siempre humano y específico. Nunca genérico.
7. Los botones de variación tienen opciones CONTEXTUALES e inteligentes — no genéricas.
8. sendPrompt siempre incluye el contexto del reel: nombre, marca, pilar.
9. Ideas vagas → construir desde las 7 heridas emocionales (`references/psychology.md`).

---

## REFERENCIAS

- `references/brand-brain.md` — Identidad, voz, paleta, tipografía
- `references/pillars.md` — Los 6 pilares con objetivos y ejemplos
- `references/psychology.md` — Las 7 heridas emocionales y el patrón narrativo
- `references/formats.md` — Tipos de plano, edición, arquitectura de reels
- `references/html-template.md` — Especificaciones del HTML output (v4 definitiva)
