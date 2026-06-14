const fs = require('fs');
const path = require('path');
const srcDir = 'referencias';
const dstDir = 'modules';
const files = [
  {src: 'calendario_editorial.html', dst: 'calendario-editorial.html'},
  {src: 'constructor_reels_v2.html', dst: 'constructor-reels.html'},
  {src: 'deposito_ideas_FINAL.html', dst: 'deposito-ideas.html'}
];

const scriptTag = `<script>
  window.addEventListener('message', (e) => {
    if (e.data.type === 'THEME_CHANGE') {
      if (e.data.theme === 'light') document.body.classList.add('light');
      else document.body.classList.remove('light');
    }
  });
</script>
</body>`;

files.forEach(f => {
  let content = fs.readFileSync(path.join(srcDir, f.src), 'utf8');
  
  // Remove sidebar completely (from <!-- SIDEBAR --> to <!-- MAIN -->)
  content = content.replace(/<!-- SIDEBAR -->[\s\S]*?(?=<!-- MAIN -->)/g, '');
  
  // Add theme toggle listener
  content = content.replace(/<\/body>/i, scriptTag);
  
  fs.writeFileSync(path.join(dstDir, f.dst), content);
});
console.log('Migrated successfully!');
