const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', (filePath) => {
    if (!filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix imports
    content = content.replace(/import\s+prisma\s+from\s+['"]([^'"]+)['"]/g, 'import { prisma } from "$1"');
    content = content.replace(/import\s+logger\s+from\s+['"]([^'"]+)['"]/g, 'import { logger } from "$1"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed imports in', filePath);
    }
});
