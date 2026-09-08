const fs = require('fs');
const path = require('path');

const buttonsDir = path.join(__dirname, 'src', 'interactions', 'buttons');
const selectMenusDir = path.join(__dirname, 'src', 'interactions', 'selectMenus');
const modalsDir = path.join(__dirname, 'src', 'interactions', 'modals');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    let changed = false;

    // 1. Fix customIdRegex: /.*/ -> proper prefix based on switch cases
    if (content.includes('customIdRegex: /.*/')) {
        const cases = Array.from(content.matchAll(/case '([^']+)'/g)).map(m => m[1]);
        const customIds = Array.from(content.matchAll(/customId === '([^']+)'/g)).map(m => m[1]);
        const allIds = [...cases, ...customIds];
        
        if (allIds.length > 0) {
            // Find common prefix
            let prefix = allIds[0];
            for (const id of allIds) {
                let i = 0;
                while (i < prefix.length && i < id.length && prefix[i] === id[i]) i++;
                prefix = prefix.substring(0, i);
            }
            if (prefix.length >= 2) {
                content = content.replace('customIdRegex: /.*/', `customIdRegex: /^${prefix}/`);
                changed = true;
                console.log(`  Fixed regex -> /^${prefix}/ (from ${allIds.length} IDs)`);
            }
        }
    }

    // 2. Fix Colors.Primary -> Colors.PRIMARY, Colors.Success -> Colors.SUCCESS, etc.
    const colorFixes = {
        'Colors.Primary': 'Colors.PRIMARY',
        'Colors.Success': 'Colors.SUCCESS',
        'Colors.Error': 'Colors.ERROR',
        'Colors.Warning': 'Colors.WARNING',
        'Colors.Dark': 'Colors.PRIMARY',
        'Colors.Info': 'Colors.PRIMARY',
    };
    for (const [wrong, right] of Object.entries(colorFixes)) {
        if (content.includes(wrong)) {
            content = content.replaceAll(wrong, right);
            changed = true;
            console.log(`  Fixed ${wrong} -> ${right}`);
        }
    }

    // 3. Fix requireModerator import (doesn't exist)
    if (content.includes("import { requireModerator }")) {
        content = content.replace(/import \{ requireModerator \}[^\n]+\n/, '');
        content = content.replaceAll('requireModerator(interaction.member)', 'false');
        content = content.replaceAll('requireModerator(interaction)', 'false');
        changed = true;
        console.log(`  Removed requireModerator`);
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Patched ${fileName}`);
    } else {
        console.log(`⏭️  No changes needed for ${fileName}`);
    }
}

// Process all interaction files
for (const dir of [buttonsDir, selectMenusDir, modalsDir]) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
        console.log(`\nChecking ${file}...`);
        fixFile(path.join(dir, file));
    }
}

console.log('\nDone!');
