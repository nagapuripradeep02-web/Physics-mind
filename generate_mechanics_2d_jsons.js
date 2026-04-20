const fs = require('fs');
const path = require('path');

const constantsDir = path.join(__dirname, 'src', 'lib', 'physics_constants');
const outputFile = 'C:\\Users\\PRADEEEP\\.gemini\\antigravity\\brain\\f978bc9c-3f16-4a79-b3bb-967b7f4894ba\\mechanics_2d_jsons_detail.md';

let markdown = '# Mechanics 2D JSON Configurations\n\n';
markdown += 'This document lists all JSON files in `src/lib/physics_constants` that are mapped to the `mechanics_2d` renderer. It includes the exact file contents for each.\n\n';

const files = fs.readdirSync(constantsDir).filter(f => f.endsWith('.json'));
let count = 0;

files.forEach(file => {
  const filePath = path.join(constantsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('"mechanics_2d"')) {
    count++;
    markdown += `## ${file}\n`;
    markdown += `**Path:** \`src/lib/physics_constants/${file}\`\n\n`;
    markdown += '```json\n';
    markdown += content.trim() + '\n';
    markdown += '```\n\n';
    markdown += '---\n\n';
  }
});

markdown += `*Total JSON files mapped to mechanics_2d: ${count}*\n`;

fs.writeFileSync(outputFile, markdown);
console.log(`Successfully generated markdown report for ${count} files at ${outputFile}`);
