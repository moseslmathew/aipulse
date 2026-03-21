const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/const arrivals=\[\{arriveAt: (.*?)\}\];/);
console.log("arrivals match:", match[0]);

const match2 = html.match(/const opAnim = smil\('animate',\{(.|[\r\n])*?\}\);/);
console.log("opAnim match:", match2[0]);

const match3 = html.match(/drawClassPanel\(svg,veh,pos,NODE_R,H,tc,tArr\)\{(.|[\r\n])*?\n\}\n/);
if (!match3 || match3.length === 0) console.log("drawClassPanel missing!");
else console.log("drawClassPanel snippet:", match3[0].substring(0, 300));
