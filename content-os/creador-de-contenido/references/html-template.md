# HTML TEMPLATE v4 — Output Visual del Creador de Contenido
## Versión definitiva con todos los features activos

Este template es el output que Claude debe generar para cada reel.
Todos los valores entre [CORCHETES] deben reemplazarse con los datos reales del reel.

---

## FEATURES DEL TEMPLATE

1. **Header** — nombre del reel, badges de metadatos
2. **Tabs** — Estrategia / Guion / Brief
3. **Ficha estratégica** — cuadrícula 2 columnas, botón de variación en cada campo
4. **Hooks** — 3 cards con botón de variación individual + botón para regenerar todos
5. **CTA** — con botón de variación
6. **Guion** — tabla con re-hooks como conectores narrativos del diálogo (resaltados en ámbar), PIPs como concepto, ritmo de líneas por tamaño tipográfico
7. **Brief visual** — paleta, tipografía, sonido, imagen
8. **Campo general de cambios** — al final, textarea libre con sendPrompt
9. **Exportar MD y CSV**

---

## DISEÑO — PALETA OBLIGATORIA

```css
--vd: #14262D   /* fondo principal — SIEMPRE */
--v2: #1F434E   /* fondo secundario, cards */
--tl: #2ABFB0   /* acento, labels, badges */
--hs: #F4F5F0   /* texto principal */
--bg: #CCC2A7   /* acentos cálidos */
--rh-c: #C9862A /* re-hooks — ámbar */
```

El fondo del widget SIEMPRE es #14262D. Nunca gris del sistema.

---

## LÓGICA DE RE-HOOKS

Los re-hooks NO son filas separadas de "tipo especial".
Son conectores narrativos del diálogo mismo:
- "Pero hay algo que nadie te ha dicho..."
- "Pero eso no es todo..."
- "Y no obstante todo eso..."
- "Y ahora viene lo importante..."
- "Pero espera — hay algo más..."

En la tabla del guion: las filas de re-hook tienen `class="row-rh"` y el diálogo
usa `class="drh"` (color ámbar, itálica, peso 500). Incluyen pill de identificación
`<div class="prh">Re-hook #N</div>`.

---

## LÓGICA DE VARIACIONES (botones de reciclaje)

Cada campo de la ficha, cada hook, el guion y el CTA tienen un botón `rbtn`.
Al tocarlo: `toggleV('id-del-panel', this)` — abre acordeón inline.

Dentro del acordeón:
- 2 opciones contextuales inteligentes (específicas para ese campo)
- 1 campo libre + botón de envío

Al elegir opción o enviar campo libre: `sendPrompt(prompt completo con contexto)`.
El prompt SIEMPRE incluye el contexto del reel: nombre, marca, pilar, etc.

---

## LÓGICA DE RITMO DEL GUION

Cada línea del diálogo tiene un tamaño visual diferente según su peso narrativo:
- `.dxs` — línea muy corta, golpe directo (font-size grande, font-weight 500)
- `.dsm` — línea corta-media (font-size medio, font-weight 400)
- `.dmd` — línea larga, explicación (font-size pequeño, font-weight 300)
- `.drh` — línea de re-hook (color ámbar, itálica, font-weight 500)
- `.dsi` — silencio o acción (color gris, itálica)

---

## OBJETO DE DATOS `GD` (para exportación)

El objeto JavaScript `GD` debe contener TODOS los datos del reel:
nombre, slug, pilar, funnel, emocion, objP, objA, formato, edicion,
duracion, ubicacion, vestuario, rehooks, hooks[], guion[], ctaV,
ctaVis, ctaKw, musica, imagen, dia, fase, historias.

El objeto `GD` alimenta ambas exportaciones (MD y CSV) automáticamente.

---

## CAMPO GENERAL AL FINAL

```html
<div class="general-b">
  <textarea id="general-input" placeholder="Cualquier cambio general..."></textarea>
  <button onclick="spGeneral()">Enviar cambio general</button>
</div>
```

`spGeneral()` lee el textarea y llama `sendPrompt('[Reel: nombre]\n\nCAMBIO GENERAL:\n' + valor)`.

---

## NOTA DE IMPLEMENTACIÓN

El template completo funcional (con todos los estilos y JS) está en el
artefacto HTML de referencia de la última conversación con el Dr. Molina.
Claude debe replicar esa estructura exacta, solo cambiando los datos del REEL.
