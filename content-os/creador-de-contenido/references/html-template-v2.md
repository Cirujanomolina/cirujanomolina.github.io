# HTML TEMPLATE v2 — Output Visual del Creador de Contenido

Este template incluye todas las nuevas secciones: re-hooks, transiciones, overlays/PIP,
ritmo visual S/M/L/XL, ficha en 2 columnas, y panel de feedback con IA conectada.

Ver el archivo `html-template-v2.html` para el HTML completo funcional y probado.

## Secciones del HTML (en orden)

1. **Header** — nombre del reel con `<em>` en palabras de énfasis + badges de metadatos
2. **Ficha estratégica** — grid 2 columnas con `.ficha-grid`, última card `.wide` para el objetivo
3. **Hooks** — 3 cards con border-left teal, letra grande de fondo, visual + verbal
4. **Guion de producción** — tabla con 3 tipos de fila:
   - `.row-normal` → escenas normales con columna de ritmo (S/M/L/XL + barra visual)
   - `.row-rehook` → re-hooks en naranja (#E8A87C) con símbolo ↺
   - `.row-trans` → transiciones en azul (#7C9EB8) con símbolo →
   - Columna overlay incluye `.overlay-box` para PIP/B-roll con timing y opacidad
5. **CTA** — bloque con frase verbal en Cormorant itálica + tags de CTA visual
6. **Brief visual** — swatches de paleta + grid de especificaciones técnicas
7. **Encaje en calendario** — 3 cards en fila: día, fase 90 días, historias complementarias
8. **Panel de feedback con IA** — botones rápidos + campo libre + respuesta streaming
9. **Export bar** — sticky bottom con botones .MD y .CSV

## Reglas de la tabla del guion

Cada línea de diálogo en las escenas normales lleva:
```html
<div class="ritmo-wrap">
  <span class="ritmo-badge r-s">S</span>  <!-- r-s / r-m / r-l / r-xl -->
  <div class="ritmo-bar r-s" style="width:20px"></div>  <!-- 20/40/65/90px -->
</div>
[texto del diálogo]
```

Anchos de barra por ritmo:
- S (1–6 palabras): 20px
- M (7–15 palabras): 40px
- L (16–25 palabras): 65px
- XL (26+ palabras): 90px

## El objeto REEL en JavaScript

Siempre completar el objeto `const REEL = {...}` con todos los datos del reel.
Este objeto alimenta AMBAS exportaciones (MD y CSV) automáticamente.
Los campos de guion incluyen: escena, tiempo, tipo (ESCENA/REHOOK/TRANSICIÓN),
ritmo, dialogo, plano, movimiento, overlay, texto, notas.

## Panel de feedback con IA

El BRAND_CONTEXT al inicio del script contiene el system prompt completo.
Actualizar siempre los datos del reel actual dentro del BRAND_CONTEXT para que
la IA tenga contexto del reel específico que está revisando.
