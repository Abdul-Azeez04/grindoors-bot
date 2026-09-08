const fs = require('fs');
const path = require('path');

const buttonsDir = path.join(__dirname, 'src', 'interactions', 'buttons');

const files = fs.readdirSync(buttonsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(buttonsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find switch cases to guess prefix
    const cases = Array.from(content.matchAll(/case '([^']+)'/g)).map(m => m[1]);
    
    if (cases.length > 0) {
        // e.g. cases: ['admin_members', 'admin_verification'] -> prefix 'admin_'
        // Find common prefix
        let prefix = cases[0];
        for (const c of cases) {
            let i = 0;
            while(i < prefix.length && prefix[i] === c[i]) i++;
            prefix = prefix.substring(0, i);
        }
        
        if (prefix.length > 0) {
            let regexStr = `/^${prefix}/`;
            content = content.replace(/customIdRegex: \/.+\//, `customIdRegex: ${regexStr}`);
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file} with prefix ${regexStr}`);
        } else {
            console.log(`No common prefix for ${file}:`, cases);
            // Just use a regex matching EXACT cases
            let regexStr = `/^(${cases.join('|')})$/`;
            content = content.replace(/customIdRegex: \/.+\//, `customIdRegex: ${regexStr}`);
            fs.writeFileSync(filePath, content);
        }
    }
});
