const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.css') || file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Replace all font-family: 'Noto Serif KR', serif; 
  // Allow optional spaces and quotes
  content = content.replace(/font-family:\s*['"]Noto Serif KR['"],\s*serif;?/g, '');
  
  // Also inline styles in tsx
  content = content.replace(/fontFamily:\s*['"]'Noto Serif KR', serif['"]/g, 'fontFamily: "\'Noto Sans KR\', sans-serif"');

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Updated: ' + f);
  }
});
