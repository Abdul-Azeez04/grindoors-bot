const fs = require('fs');
const path = require('path');

function fixColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      fixColors(full);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;
      content = content.replace(/Colors\.Primary/g, 'Colors.PRIMARY');
      content = content.replace(/Colors\.Success/g, 'Colors.SUCCESS');
      content = content.replace(/Colors\.Warning/g, 'Colors.WARNING');
      content = content.replace(/Colors\.Info/g, 'Colors.PRIMARY');
      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Fixed: ' + full);
      }
    }
  }
}

fixColors(path.join(__dirname, 'src', 'games'));
fixColors(path.join(__dirname, 'src', 'panels'));
console.log('Done!');
