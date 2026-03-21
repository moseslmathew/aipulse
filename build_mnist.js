const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

// 1. Add Navigation Link to both files later
// First, transform index to mnist

const digitsStr = `const VEHICLES = [
  { id:'0', label:'Zero', emoji:'0️⃣', color:'#3b82f6', pixels:[0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0], outWeights:[2.95,.01,.01,.01,.01,.01,.01,.01,.01,.01] },
  { id:'1', label:'One', emoji:'1️⃣', color:'#f59e0b', pixels:[0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0], outWeights:[.01,2.95,.01,.01,.01,.01,.01,.01,.01,.01] },
  { id:'2', label:'Two', emoji:'2️⃣', color:'#10b981', pixels:[0,1,1,1,0, 1,0,0,0,1, 0,0,0,1,0, 0,0,1,0,0, 1,1,1,1,1], outWeights:[.01,.01,2.95,.01,.01,.01,.01,.01,.01,.01] },
  { id:'3', label:'Three', emoji:'3️⃣', color:'#ec4899', pixels:[1,1,1,1,0, 0,0,0,0,1, 0,0,1,1,0, 0,0,0,0,1, 1,1,1,1,0], outWeights:[.01,.01,.01,2.95,.01,.01,.01,.01,.01,.01] },
  { id:'4', label:'Four', emoji:'4️⃣', color:'#8b5cf6', pixels:[0,0,0,1,0, 0,0,1,1,0, 0,1,0,1,0, 1,1,1,1,1, 0,0,0,1,0], outWeights:[.01,.01,.01,.01,2.95,.01,.01,.01,.01,.01] },
  { id:'5', label:'Five', emoji:'5️⃣', color:'#ef4444', pixels:[1,1,1,1,1, 1,0,0,0,0, 1,1,1,1,0, 0,0,0,0,1, 1,1,1,1,0], outWeights:[.01,.01,.01,.01,.01,2.95,.01,.01,.01,.01] },
  { id:'6', label:'Six', emoji:'6️⃣', color:'#06b6d4', pixels:[0,0,1,1,0, 0,1,0,0,0, 1,1,1,1,0, 1,0,0,0,1, 0,1,1,1,0], outWeights:[.01,.01,.01,.01,.01,.01,2.95,.01,.01,.01] },
  { id:'7', label:'Seven', emoji:'7️⃣', color:'#f97316', pixels:[1,1,1,1,1, 0,0,0,1,0, 0,0,1,0,0, 0,1,0,0,0, 1,0,0,0,0], outWeights:[.01,.01,.01,.01,.01,.01,.01,2.95,.01,.01] },
  { id:'8', label:'Eight', emoji:'8️⃣', color:'#14b8a6', pixels:[0,1,1,1,0, 1,0,0,0,1, 0,1,1,1,0, 1,0,0,0,1, 0,1,1,1,0], outWeights:[.01,.01,.01,.01,.01,.01,.01,.01,2.95,.01] },
  { id:'9', label:'Nine', emoji:'9️⃣', color:'#a855f7', pixels:[0,1,1,1,0, 1,0,0,0,1, 0,1,1,1,1, 0,0,0,1,0, 0,1,1,0,0], outWeights:[.01,.01,.01,.01,.01,.01,.01,.01,.01,2.95] }
];`;

let mCode = code.replace(/const VEHICLES = \[[\s\S]*?\];/m, digitsStr);

// Change grid drawing COLS/ROWS
mCode = mCode.replace(/const CELL=26, COLS=4, ROWS=4;/g, 'const CELL=20, COLS=5, ROWS=5;');

// Change rendering method
mCode = mCode.replace(/veh\.drawSVG\(vGroup,panelLeft,imgY,IMG_W,IMG_H,isDark,colorMode\);/g, 
  "vGroup.appendChild(el('text', {x:panelLeft+IMG_W/2,y:imgY+IMG_H*0.75,'text-anchor':'middle','font-size':IMG_H*0.7,fill:isDark?'white':'#0f172a'})).textContent=veh.emoji;");

// Set inputs length default
mCode = mCode.replace(/document\.getElementById\('iv'\)\.value = colorMode \? 48 : 16; document\.getElementById\('sl-input'\)\.value = colorMode \? 48 : 16;/g, 
  "document.getElementById('iv').value = 25; document.getElementById('sl-input').value = 25; colorMode = false;");

// Turn color mode toggle visually off
mCode = mCode.replace(/<button class="sb-btn" id="color-toggle" onclick="toggleColorMode\(\)">/g, 
  '<button class="sb-btn" id="color-toggle" style="display:none" onclick="toggleColorMode()">');

// Headers
mCode = mCode.replace(/class="logo-ai">AI<\/span>Pulse<\/div>/g, 'class="logo-ai">MNIST</span>Vision</div>');
mCode = mCode.replace(/A sleek, modern neural network architecture/g, 'MNIST Handwritten Digit Recognizer');
mCode = mCode.replace(/Build your visualization/g, 'MNIST Digit Visualization');

// Moduler grid modulo operator `ni%16` in flatten animation loop. It's now ni%25!
mCode = mCode.replace(/ni % 16/g, "ni % 25");
mCode = mCode.replace(/ni%16/g, "ni%25");
mCode = mCode.replace(/ni<16\?'#ef4444':ni<32\?'#10b981':'#3b82f6'/g, "veh.color"); // fallback color

// Grid label
mCode = mCode.replace(/4\\xd74\\xd73 \(RGB\)'\:'4\\xd74 \(Grayscale\)'/g, "5\\xd75 (MNIST)':'5\\xd75 (MNIST Grayscale)'");

// Insert MNIST Link in index.html
if(!code.includes('mnist.html')){
  code = code.replace(/<button class="icon-toggle" id="theme-btn"/, `<a href="mnist.html" style="background:#3b82f6; color:#fff; padding:6px 12px; border-radius:8px; text-decoration:none; font-size:12px; font-weight:600; margin-right:12px">MNIST Demo</a>\n      <button class="icon-toggle" id="theme-btn"`);
  fs.writeFileSync('index.html', code);
}

// Insert Vehicle Link in mnist.html
mCode = mCode.replace(/<button class="icon-toggle" id="theme-btn"/, `<a href="index.html" style="background:#ec4899; color:#fff; padding:6px 12px; border-radius:8px; text-decoration:none; font-size:12px; font-weight:600; margin-right:12px">Vehicle Demo</a>\n      <button class="icon-toggle" id="theme-btn"`);


fs.writeFileSync('mnist.html', mCode);
console.log("Successfully built mnist.html");
