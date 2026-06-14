# HTML TEMPLATE — Output Visual del Creador de Contenido

Este es el template base que Claude debe completar con los datos reales de cada reel.
Todos los valores entre [CORCHETES] deben ser reemplazados con la información generada.

---

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[NOMBRE_REEL] — @cirujanomolina</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Archivo:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --verde:#14262D;
  --verde2:#1F434E;
  --beige:#CCC2A7;
  --teal:#2ABFB0;
  --hueso:#F4F5F0;
}
body{
  background:var(--verde);
  color:var(--hueso);
  font-family:'Archivo',sans-serif;
  font-weight:300;
  min-height:100vh;
  padding:0;
}

/* ── HEADER ── */
.header{
  background:linear-gradient(135deg,var(--verde) 0%,var(--verde2) 100%);
  border-bottom:0.5px solid rgba(42,191,176,0.3);
  padding:2.5rem 2rem 2rem;
  position:relative;
  overflow:hidden;
}
.header::before{
  content:'';position:absolute;top:-60px;right:-60px;
  width:220px;height:220px;border-radius:50%;
  background:var(--teal);opacity:0.06;
}
.header-eyebrow{
  font-size:11px;font-weight:500;letter-spacing:2px;
  text-transform:uppercase;color:var(--teal);margin-bottom:0.5rem;
}
.header-title{
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(24px,5vw,38px);font-weight:300;
  color:var(--hueso);line-height:1.1;margin-bottom:0.6rem;
}
.header-title em{color:var(--teal);font-style:italic}
.header-meta{
  font-size:13px;font-weight:300;color:var(--beige);
  display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;
}
.header-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 12px;border-radius:20px;
  background:rgba(42,191,176,0.12);
  border:0.5px solid rgba(42,191,176,0.4);
  font-size:12px;font-weight:500;color:var(--teal);
}

/* ── LAYOUT ── */
.container{max-width:900px;margin:0 auto;padding:2rem 1.5rem}
.section{margin-bottom:2rem}
.section-label{
  font-size:11px;font-weight:500;letter-spacing:2px;
  text-transform:uppercase;color:var(--teal);
  margin-bottom:1rem;display:flex;align-items:center;gap:8px;
}
.section-label i{font-size:14px}
.section-title{
  font-family:'Cormorant Garamond',serif;
  font-size:20px;font-weight:600;color:var(--hueso);
  margin-bottom:1rem;
}
.section-title em{color:var(--teal);font-style:italic}

/* ── CARDS ── */
.card{
  background:var(--verde2);
  border:0.5px solid rgba(244,245,240,0.08);
  border-radius:12px;padding:1.25rem;margin-bottom:0.75rem;
}
.card-sm{
  background:rgba(255,255,255,0.04);
  border:0.5px solid rgba(244,245,240,0.08);
  border-radius:8px;padding:0.75rem 1rem;
}

/* ── FICHA ESTRATÉGICA ── */
.ficha-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.ficha-item{background:rgba(255,255,255,0.04);border-radius:8px;padding:0.75rem 1rem}
.ficha-label{
  font-size:10px;font-weight:500;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--teal);margin-bottom:4px;
}
.ficha-value{
  font-size:13px;font-weight:400;color:var(--hueso);line-height:1.4;
}
.badge{
  display:inline-block;padding:3px 10px;border-radius:20px;
  font-size:11px;font-weight:500;
  background:rgba(42,191,176,0.12);
  border:0.5px solid rgba(42,191,176,0.35);
  color:var(--teal);
}
.badge-beige{
  background:rgba(204,194,167,0.12);
  border:0.5px solid rgba(204,194,167,0.35);
  color:var(--beige);
}
.badge-red{
  background:rgba(220,100,80,0.12);
  border:0.5px solid rgba(220,100,80,0.35);
  color:#E8957A;
}

/* ── HOOKS ── */
.hooks-grid{display:grid;gap:12px}
.hook-card{
  background:var(--verde2);
  border-left:3px solid var(--teal);
  border-radius:0 12px 12px 0;
  padding:1.25rem 1.25rem 1.25rem 1.5rem;
  transition:background 0.15s;
}
.hook-card:hover{background:rgba(31,67,78,0.8)}
.hook-type{
  font-size:10px;font-weight:500;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--teal);margin-bottom:8px;
}
.hook-letter{
  font-family:'Cormorant Garamond',serif;
  font-size:32px;font-weight:300;color:rgba(42,191,176,0.3);
  line-height:1;margin-bottom:8px;
}
.hook-visual{
  font-family:'Cormorant Garamond',serif;
  font-size:18px;font-weight:600;color:var(--hueso);
  margin-bottom:6px;line-height:1.2;
}
.hook-visual em{color:var(--teal);font-style:italic}
.hook-verbal{
  font-size:13px;font-weight:300;color:var(--beige);
  line-height:1.5;font-style:italic;
  border-top:0.5px solid rgba(244,245,240,0.1);
  padding-top:8px;margin-top:8px;
}

/* ── TABLA GUION ── */
.guion-table{width:100%;border-collapse:collapse;font-size:12px}
.guion-table th{
  background:var(--verde);
  font-size:10px;font-weight:500;letter-spacing:1.2px;
  text-transform:uppercase;color:var(--teal);
  padding:10px 12px;text-align:left;
  border-bottom:1px solid rgba(42,191,176,0.2);
}
.guion-table td{
  padding:10px 12px;
  border-bottom:0.5px solid rgba(244,245,240,0.06);
  vertical-align:top;line-height:1.5;color:var(--hueso);
}
.guion-table tr:nth-child(even) td{background:rgba(255,255,255,0.02)}
.guion-table tr:hover td{background:rgba(42,191,176,0.04)}
.time-badge{
  display:inline-block;padding:2px 8px;border-radius:10px;
  background:rgba(42,191,176,0.12);color:var(--teal);
  font-size:11px;font-weight:500;white-space:nowrap;
}
.escena-num{
  font-family:'Cormorant Garamond',serif;
  font-size:18px;font-weight:300;color:rgba(42,191,176,0.4);
}
.dialogo-text{color:var(--hueso);font-weight:300}
.dialogo-text em{color:var(--beige);font-style:italic}
.plano-tag{
  display:inline-block;padding:2px 8px;border-radius:6px;
  background:rgba(204,194,167,0.1);color:var(--beige);
  font-size:11px;margin-bottom:3px;
}
.texto-screen{
  font-family:'Cormorant Garamond',serif;
  font-size:13px;font-style:italic;color:var(--teal);
}
.nota-dir{font-size:11px;font-weight:300;color:rgba(244,245,240,0.5);line-height:1.4}

/* ── CTA ── */
.cta-block{
  background:linear-gradient(135deg,var(--verde2),rgba(42,191,176,0.08));
  border:0.5px solid rgba(42,191,176,0.25);
  border-radius:12px;padding:1.5rem;
}
.cta-verbal{
  font-family:'Cormorant Garamond',serif;
  font-size:20px;font-style:italic;color:var(--hueso);
  line-height:1.4;margin-bottom:1rem;
}
.cta-visual-tag{
  display:inline-block;
  font-family:'Archivo',sans-serif;font-size:13px;font-weight:500;
  letter-spacing:1px;color:var(--teal);
  border:0.5px solid var(--teal);
  padding:6px 16px;border-radius:6px;margin-right:8px;margin-bottom:8px;
}
.cta-keyword{
  font-size:12px;font-weight:300;color:var(--beige);margin-top:0.75rem;
}
.cta-keyword strong{color:var(--teal);font-weight:500}

/* ── BRIEF VISUAL ── */
.paleta-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem}
.paleta-chip{
  display:flex;align-items:center;gap:8px;
  padding:6px 12px;border-radius:8px;
  background:rgba(255,255,255,0.04);
  border:0.5px solid rgba(244,245,240,0.08);
}
.paleta-swatch{width:20px;height:20px;border-radius:4px;flex-shrink:0}
.paleta-info{font-size:11px}
.paleta-name{font-weight:500;color:var(--hueso);display:block}
.paleta-hex{color:var(--beige);font-family:monospace}
.brief-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:0.75rem}
.brief-item{background:rgba(255,255,255,0.04);border-radius:8px;padding:0.75rem}
.brief-item-label{
  font-size:10px;font-weight:500;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--teal);margin-bottom:4px;
}
.brief-item-val{font-size:12px;font-weight:300;color:var(--hueso);line-height:1.5}

/* ── CALENDARIO ── */
.cal-block{
  display:flex;gap:12px;align-items:stretch;flex-wrap:wrap;
}
.cal-card{
  flex:1;min-width:160px;
  background:rgba(255,255,255,0.04);border-radius:10px;
  padding:1rem;border:0.5px solid rgba(244,245,240,0.08);
}
.cal-card-label{
  font-size:10px;font-weight:500;letter-spacing:1.5px;
  text-transform:uppercase;color:var(--teal);margin-bottom:4px;
}
.cal-card-val{
  font-family:'Cormorant Garamond',serif;
  font-size:18px;font-weight:600;color:var(--hueso);
}
.cal-card-sub{font-size:11px;font-weight:300;color:var(--beige);margin-top:3px;line-height:1.4}

/* ── EXPORT BUTTONS ── */
.export-bar{
  background:var(--verde2);
  border-top:0.5px solid rgba(244,245,240,0.08);
  padding:1.5rem;
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:12px;
  position:sticky;bottom:0;
}
.export-label{
  font-size:12px;font-weight:500;letter-spacing:1px;
  text-transform:uppercase;color:var(--beige);
}
.export-btns{display:flex;gap:10px;flex-wrap:wrap}
.btn-export{
  display:inline-flex;align-items:center;gap:7px;
  font-family:'Archivo',sans-serif;font-size:12px;font-weight:500;
  letter-spacing:0.5px;padding:9px 18px;border-radius:8px;
  border:none;cursor:pointer;transition:all 0.15s;
}
.btn-md{background:var(--teal);color:var(--verde)}
.btn-md:hover{background:#25a99b;transform:translateY(-1px)}
.btn-csv{
  background:transparent;color:var(--teal);
  border:0.5px solid var(--teal);
}
.btn-csv:hover{background:rgba(42,191,176,0.1);transform:translateY(-1px)}
.btn-export i{font-size:14px}

/* ── DIVIDER ── */
.divider{
  height:0.5px;background:rgba(244,245,240,0.08);
  margin:2rem 0;
}
</style>
</head>
<body>

<!-- ══ HEADER ══ -->
<div class="header">
  <div class="header-eyebrow">Estrategia de Reel · @cirujanomolina</div>
  <div class="header-title">[NOMBRE_DEL_REEL_CON_<em>ÉNFASIS</em>]</div>
  <div class="header-meta">
    <span class="header-badge"><i class="ti ti-layers-intersect"></i> [PILAR]</span>
    <span class="header-badge"><i class="ti ti-funnel"></i> [TOFU/MOFU/BOFU]</span>
    <span class="header-badge"><i class="ti ti-clock"></i> [DURACIÓN]</span>
    <span class="header-badge"><i class="ti ti-calendar"></i> [DÍA RECOMENDADO]</span>
  </div>
</div>

<div class="container">

  <!-- ══ FICHA ESTRATÉGICA ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-target"></i> Ficha estratégica</div>
    <div class="ficha-grid">
      <div class="ficha-item">
        <div class="ficha-label">Pilar</div>
        <div class="ficha-value"><span class="badge">[PILAR]</span></div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Etapa del funnel</div>
        <div class="ficha-value"><span class="badge">[TOFU/MOFU/BOFU]</span></div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Emoción central</div>
        <div class="ficha-value"><span class="badge-beige badge">[EMOCIÓN]</span></div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Objetivo psicológico</div>
        <div class="ficha-value">[OBJETIVO PSICOLÓGICO]</div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Objetivo algorítmico</div>
        <div class="ficha-value">[GUARDADOS / COMPARTIDOS / DMs]</div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Formato</div>
        <div class="ficha-value">[TALKING HEAD / VOICEOVER+BROLL / etc.]</div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Tipo de edición</div>
        <div class="ficha-value">[EMOCIONAL LENTO / CONTRARIAN / DOCUMENTAL]</div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Duración ideal</div>
        <div class="ficha-value"><span class="badge">[Xs]</span></div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Ubicación</div>
        <div class="ficha-value">[CONSULTORIO / QUIRÓFANO / FONDO NEUTRO]</div>
      </div>
      <div class="ficha-item">
        <div class="ficha-label">Vestuario</div>
        <div class="ficha-value">[BATA / CASUAL PREMIUM / SCRUBS]</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ══ HOOKS ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-bolt"></i> Hooks propuestos</div>
    <div class="hooks-grid">

      <div class="hook-card">
        <div class="hook-type">Hook A · [TIPO: emocional / pregunta / contrarian / estadística]</div>
        <div class="hook-letter">A</div>
        <div class="hook-visual">[TEXTO VISUAL — MÁX 7 PALABRAS — con <em>énfasis en teal</em>]</div>
        <div class="hook-verbal">"[Texto verbal del Dr. — lo que dice, máx 15 palabras]"</div>
      </div>

      <div class="hook-card">
        <div class="hook-type">Hook B · [TIPO]</div>
        <div class="hook-letter">B</div>
        <div class="hook-visual">[TEXTO VISUAL]</div>
        <div class="hook-verbal">"[Texto verbal]"</div>
      </div>

      <div class="hook-card">
        <div class="hook-type">Hook C · [TIPO]</div>
        <div class="hook-letter">C</div>
        <div class="hook-visual">[TEXTO VISUAL]</div>
        <div class="hook-verbal">"[Texto verbal]"</div>
      </div>

    </div>
  </div>

  <div class="divider"></div>

  <!-- ══ GUION DE PRODUCCIÓN ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-movie"></i> Guion de producción</div>
    <div class="card" style="padding:0;overflow:hidden;overflow-x:auto">
      <table class="guion-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tiempo</th>
            <th>Diálogo</th>
            <th>Plano / Cámara</th>
            <th>Movimiento</th>
            <th>Texto en pantalla</th>
            <th>Notas de dirección</th>
          </tr>
        </thead>
        <tbody>
          <!-- REPETIR ESTE BLOQUE POR CADA ESCENA -->
          <tr>
            <td><span class="escena-num">01</span></td>
            <td><span class="time-badge">0–2s</span></td>
            <td class="dialogo-text">— <em>(silencio)</em></td>
            <td><span class="plano-tag">Close-up</span><br>[descripción]</td>
            <td>[movimiento]</td>
            <td class="texto-screen">[texto en pantalla]</td>
            <td class="nota-dir">[instrucción de dirección]</td>
          </tr>
          <!-- ... más filas ... -->
        </tbody>
      </table>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ══ CTA ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-message-circle"></i> Call to action</div>
    <div class="cta-block">
      <div class="cta-verbal">"[TEXTO EXACTO DEL CTA VERBAL — LO QUE DICE EL DR.]"</div>
      <div>
        <span class="cta-visual-tag">[CTA visual 1]</span>
        <span class="cta-visual-tag">[CTA visual 2 si aplica]</span>
      </div>
      <div class="cta-keyword">Palabra clave: <strong>"Comenta [PALABRA] y [acción]"</strong></div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ══ BRIEF VISUAL ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-palette"></i> Brief visual — post producción</div>

    <div class="section-title" style="font-size:15px;margin-bottom:0.75rem">Paleta del reel</div>
    <div class="paleta-row">
      <!-- Repetir por cada color usado en este reel -->
      <div class="paleta-chip">
        <div class="paleta-swatch" style="background:#14262D;border:0.5px solid rgba(255,255,255,0.2)"></div>
        <div class="paleta-info"><span class="paleta-name">Verde Noche</span><span class="paleta-hex">#14262D</span></div>
      </div>
      <div class="paleta-chip">
        <div class="paleta-swatch" style="background:#2ABFB0"></div>
        <div class="paleta-info"><span class="paleta-name">Teal Vibrante</span><span class="paleta-hex">#2ABFB0</span></div>
      </div>
      <div class="paleta-chip">
        <div class="paleta-swatch" style="background:#F4F5F0"></div>
        <div class="paleta-info"><span class="paleta-name">Hueso Claro</span><span class="paleta-hex">#F4F5F0</span></div>
      </div>
      <!-- Añadir o quitar chips según la combinación del reel -->
    </div>

    <div class="brief-grid">
      <div class="brief-item">
        <div class="brief-item-label">Tipografía hooks</div>
        <div class="brief-item-val">Cormorant Garamond · [peso] · énfasis en <span style="color:var(--teal)">itálica teal</span></div>
      </div>
      <div class="brief-item">
        <div class="brief-item-label">Tipografía cuerpo</div>
        <div class="brief-item-val">Archivo · Peso 300 · #F4F5F0</div>
      </div>
      <div class="brief-item">
        <div class="brief-item-label">Subtítulos</div>
        <div class="brief-item-val">Siempre activos · Archivo 300 · #F4F5F0 · Zona segura</div>
      </div>
      <div class="brief-item">
        <div class="brief-item-label">Handle</div>
        <div class="brief-item-val">@cirujanomolina · Cormorant Garamond · [arriba/abajo] · Opacidad 60%</div>
      </div>
      <div class="brief-item">
        <div class="brief-item-label">Logo</div>
        <div class="brief-item-val">Ícono JSM · Esquina [posición] · Opacidad 50%</div>
      </div>
      <div class="brief-item">
        <div class="brief-item-label">Música / ambiente</div>
        <div class="brief-item-val">[descripción del mood sonoro]</div>
      </div>
      <div class="brief-item" style="grid-column:1/-1">
        <div class="brief-item-label">Tratamiento de imagen</div>
        <div class="brief-item-val">[descripción del tratamiento visual: oscuro/cálido/documental/íntimo + regla de gradiente si aplica]</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- ══ ENCAJE EN CALENDARIO ══ -->
  <div class="section">
    <div class="section-label"><i class="ti ti-calendar-event"></i> Encaje en calendario</div>
    <div class="cal-block">
      <div class="cal-card">
        <div class="cal-card-label">Día recomendado</div>
        <div class="cal-card-val">[LUNES / MIÉRCOLES / VIERNES]</div>
        <div class="cal-card-sub">[tipo de reel ese día según calendario]</div>
      </div>
      <div class="cal-card">
        <div class="cal-card-label">Fase 90 días</div>
        <div class="cal-card-val">[IGNITE / AUTHORITY / CONVERSION]</div>
        <div class="cal-card-sub">[días X–Y del plan]</div>
      </div>
      <div class="cal-card">
        <div class="cal-card-label">Historias complementarias</div>
        <div class="cal-card-sub" style="font-size:12px;margin-top:0">[sugerencia de historias para el mismo día o semana que complementen este reel]</div>
      </div>
    </div>
  </div>

</div><!-- /container -->

<!-- ══ EXPORT BAR ══ -->
<div class="export-bar">
  <span class="export-label"><i class="ti ti-download" style="margin-right:5px"></i>Exportar estrategia</span>
  <div class="export-btns">
    <button class="btn-export btn-md" onclick="exportarMD()">
      <i class="ti ti-markdown"></i> Exportar .MD
    </button>
    <button class="btn-export btn-csv" onclick="exportarCSV()">
      <i class="ti ti-table"></i> Exportar guion .CSV
    </button>
  </div>
</div>

<script>
// ── DATOS DEL REEL (rellenar con los datos generados) ──
const REEL = {
  nombre: "[NOMBRE DEL REEL]",
  nombreSlug: "[nombre-del-reel]",
  pilar: "[PILAR]",
  funnel: "[TOFU/MOFU/BOFU]",
  emocion: "[EMOCIÓN]",
  objetivoPsicologico: "[OBJETIVO PSICOLÓGICO]",
  objetivoAlgoritmico: "[OBJETIVO ALGORÍTMICO]",
  formato: "[FORMATO]",
  edicion: "[TIPO DE EDICIÓN]",
  duracion: "[DURACIÓN]",
  ubicacion: "[UBICACIÓN]",
  vestuario: "[VESTUARIO]",
  hooks: [
    {
      tipo: "[TIPO A]",
      visual: "[TEXTO VISUAL A]",
      verbal: "[TEXTO VERBAL A]"
    },
    {
      tipo: "[TIPO B]",
      visual: "[TEXTO VISUAL B]",
      verbal: "[TEXTO VERBAL B]"
    },
    {
      tipo: "[TIPO C]",
      visual: "[TEXTO VISUAL C]",
      verbal: "[TEXTO VERBAL C]"
    }
  ],
  guion: [
    {
      escena: "01",
      tiempo: "0–2s",
      dialogo: "[diálogo o — para silencio]",
      plano: "[tipo de plano]",
      movimiento: "[movimiento]",
      texto: "[texto en pantalla]",
      notas: "[notas de dirección]"
    }
    // ... más escenas
  ],
  ctaVerbal: "[CTA verbal]",
  ctaVisual: "[CTA visual]",
  ctaKeyword: "Comenta [PALABRA] y [acción]",
  musica: "[descripción mood sonoro]",
  tratamientoImagen: "[descripción visual]",
  dia: "[DÍA]",
  fase: "[FASE]",
  historias: "[sugerencia de historias complementarias]"
};

// ── EXPORTAR MARKDOWN ──
function exportarMD() {
  const R = REEL;
  const hooksText = R.hooks.map((h,i) =>
    `### Hook ${String.fromCharCode(65+i)} — ${h.tipo}\n> **Visual:** "${h.visual}"\n> **Verbal:** "${h.verbal}"`
  ).join('\n\n');
  const guionRows = R.guion.map(r =>
    `| ${r.escena} | ${r.tiempo} | ${r.dialogo} | ${r.plano} | ${r.movimiento} | ${r.texto} | ${r.notas} |`
  ).join('\n');

  const md = `# 🎬 ${R.nombre}
> Estrategia de reel · @cirujanomolina · *"Recupera quien eres."*

---

## FICHA ESTRATÉGICA

| Campo | Detalle |
|---|---|
| **Pilar** | ${R.pilar} |
| **Etapa del funnel** | ${R.funnel} |
| **Emoción central** | ${R.emocion} |
| **Objetivo psicológico** | ${R.objetivoPsicologico} |
| **Objetivo algorítmico** | ${R.objetivoAlgoritmico} |
| **Formato** | ${R.formato} |
| **Tipo de edición** | ${R.edicion} |
| **Duración ideal** | ${R.duracion} |
| **Ubicación** | ${R.ubicacion} |
| **Vestuario** | ${R.vestuario} |

---

## HOOKS PROPUESTOS

${hooksText}

---

## GUION DE PRODUCCIÓN

| # | Tiempo | Diálogo | Plano | Movimiento | Texto en pantalla | Notas dirección |
|---|---|---|---|---|---|---|
${guionRows}

---

## CALL TO ACTION

**Verbal:** "${R.ctaVerbal}"
**Visual:** ${R.ctaVisual}
**Palabra clave:** ${R.ctaKeyword}

---

## BRIEF VISUAL

- **Música / Ambiente:** ${R.musica}
- **Tratamiento de imagen:** ${R.tratamientoImagen}
- **Tipografía hooks:** Cormorant Garamond · énfasis en itálica #2ABFB0
- **Tipografía cuerpo:** Archivo · Peso 300 · #F4F5F0
- **Subtítulos:** Siempre activos · Archivo 300 · #F4F5F0
- **Handle:** @cirujanomolina · Cormorant Garamond · Discreto
- **Logo:** Ícono JSM · Esquina · Opacidad 50%

---

## ENCAJE EN CALENDARIO

- **Día recomendado:** ${R.dia}
- **Fase del plan 90 días:** ${R.fase}
- **Historias complementarias:** ${R.historias}
`;

  descargar(md, R.nombreSlug + '.md', 'text/markdown');
}

// ── EXPORTAR CSV ──
function exportarCSV() {
  const R = REEL;
  const headers = ['Escena','Tiempo','Dialogo','Plano','Movimiento','TextoEnPantalla','NotasDireccion'];
  const rows = R.guion.map(r =>
    [r.escena, r.tiempo, r.dialogo, r.plano, r.movimiento, r.texto, r.notas]
      .map(v => `"${(v||'').replace(/"/g,'""')}"`)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  descargar(csv, R.nombreSlug + '-guion.csv', 'text/csv');
}

// ── HELPER DESCARGA ──
function descargar(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  URL.revokeObjectURL(url);
}
</script>
</body>
</html>
```

---

## Notas de implementación

1. **Rellenar el objeto `REEL`** en el JS con todos los datos generados — esto alimenta ambas exportaciones automáticamente.
2. **El HTML visual** debe completarse independientemente con los mismos datos (tabla del guion, hooks, etc).
3. **Los `[CORCHETES]`** son placeholders — reemplazar todos sin excepción.
4. **El template es responsive** — funciona en mobile y desktop.
5. **La barra de exportación es sticky** — siempre visible al fondo.
6. **Hooks con `em`** — usar etiqueta `<em>` para las 1-2 palabras de énfasis en teal dentro del hook visual.
