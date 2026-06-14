const fs = require('fs');

function migrateCalendario() {
    const file = 'modules/calendario-editorial.html';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove everything from <style> to <div class="topbar">
    const styleStart = content.indexOf('<style>');
    const topbarStart = content.indexOf('<div class="topbar">');

    if (styleStart > -1 && topbarStart > -1) {
        const newHeader = `    <link rel="stylesheet" href="../design-system.css">
</head>
<body>
<div class="container fade-in" data-module="calendario-editorial" style="display: flex; flex-direction: column; padding:0; height: 100vh;">
    <!-- TOPBAR -->
    `;
        content = content.substring(0, styleStart) + newHeader + content.substring(topbarStart + '<div class="topbar">'.length);
        
        // Also wrap the topbar with the right class or just leave it as is.
        // Let's add the topbar div back because we skipped it above.
        content = content.replace('<!-- TOPBAR -->\n    ', '<!-- TOPBAR -->\n    <div class="topbar" style="padding:11px 20px;border-bottom:1px solid var(--border2);display:flex;align-items:center;justify-content:space-between;background:var(--bg);flex-shrink:0;z-index:20;gap:10px;flex-wrap:wrap">');
    }

    // 2. Replace old font awesome and insert tabler icons
    content = content.replace(/fa-solid fa-calendar-days/g, 'ti ti-calendar');
    content = content.replace(/fa-solid fa-chevron-left/g, 'ti ti-chevron-left');
    content = content.replace(/fa-solid fa-chevron-right/g, 'ti ti-chevron-right');
    content = content.replace(/fa-solid fa-plus/g, 'ti ti-plus');
    content = content.replace(/fa-brands fa-instagram/g, 'ti ti-brand-instagram');
    content = content.replace(/fa-brands fa-tiktok/g, 'ti ti-brand-tiktok');
    content = content.replace(/fa-brands fa-facebook/g, 'ti ti-brand-facebook');
    content = content.replace(/fa-brands fa-youtube/g, 'ti ti-brand-youtube');
    content = content.replace(/fa-solid fa-sliders/g, 'ti ti-adjustments');
    content = content.replace(/fa-solid fa-video/g, 'ti ti-video');
    content = content.replace(/fa-solid fa-table-columns/g, 'ti ti-layout-columns');
    content = content.replace(/fa-solid fa-circle-check/g, 'ti ti-circle-check');
    content = content.replace(/fa-solid fa-clock/g, 'ti ti-clock');
    content = content.replace(/fa-solid fa-xmark/g, 'ti ti-x');
    content = content.replace(/fa-solid fa-file-lines/g, 'ti ti-file-text');
    content = content.replace(/fa-solid fa-tower-broadcast/g, 'ti ti-broadcast');
    content = content.replace(/fa-solid fa-book-open/g, 'ti ti-book');
    content = content.replace(/fa-solid fa-floppy-disk/g, 'ti ti-device-floppy');
    content = content.replace(/fa-solid fa-/g, 'ti ti-'); // catch-all

    // 3. Replace theme toggle in JS
    const scriptStart = content.indexOf('<script>');
    if (scriptStart > -1) {
        const newJs = `<script>
/* ── MODULE INIT ── */
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'THEME_CHANGE') {
        document.body.classList.toggle('light', e.data.payload === 'light');
    }
});
window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

`;
        content = content.substring(0, scriptStart) + newJs + content.substring(scriptStart + 8);
    }
    
    // Replace toggleTheme function if present
    content = content.replace(/function toggleTheme\(\)\{.*?\}/gs, '');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Migrated ${file}`);
}

migrateCalendario();
