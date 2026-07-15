const fs = require('fs');
let code = fs.readFileSync('d:/tai_lieu/SDN302/SDN302/frontend/src/pages/HomePage.jsx', 'utf8');
code = code.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
code = code.replace(/^\s*\/\/.*$/gm, '');
fs.writeFileSync('d:/tai_lieu/SDN302/SDN302/frontend/src/pages/HomePage.jsx', code);
console.log('Comments removed');
