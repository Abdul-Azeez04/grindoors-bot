const fs = require('fs');
const path = require('path');

const buttonsDir = path.join(__dirname, 'src', 'interactions', 'buttons');

const files = fs.readdirSync(buttonsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(buttonsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it already exports default
    if (content.includes('export default {') || content.includes('export default interaction')) return;

    // Find the exported function name
    const match = content.match(/export async function (handle[a-zA-Z]+)\(interaction/);
    if (match) {
        const funcName = match[1];
        
        // guess prefix by customIds in switch
        let regexStr = '/.*/';
        
        const appended = `\nexport default {\n  customIdRegex: ${regexStr},\n  execute: async (interaction: any) => {\n    return ${funcName}(interaction);\n  }\n};\n`;
        fs.writeFileSync(filePath, content + appended);
        console.log(`Patched ${file} with default export`);
    }
});
