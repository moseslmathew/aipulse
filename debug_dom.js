const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });

// Wait a bit for initialization, then read the state
setTimeout(() => {
  const window = dom.window;
  const document = window.document;

  // Find the exact <animate> tag for the winner label (gHigh)
  const gHighs = document.querySelectorAll('g');
  console.log("Looking for gHigh...");
  for (let g of gHighs) {
    const txts = g.querySelectorAll('text');
    if (txts.length > 0 && txts[1] && txts[1].textContent === 'Truck') {
      console.log("Found Truck gHigh!");
      console.log("Opacity attribute:", g.getAttribute('opacity'));
      const anim = g.querySelector('animate');
      if (anim) {
        console.log("Animate opacity values:", anim.getAttribute('values'));
        console.log("Animate opacity keyTimes:", anim.getAttribute('keyTimes'));
        console.log("Animate dur:", anim.getAttribute('dur'));
      }
    }
  }

  // Find output node arriveAt / tc mapping
  const halos = document.querySelectorAll('circle');
  let hi = 0;
  for (let c of halos) {
    const anim = c.querySelector('animate[attributeName="opacity"]');
    if (anim && anim.getAttribute('values').includes(';0;0') && c.getAttribute('r') > 12) {
      console.log("Halo", hi++, "opacity keyTimes:", anim.getAttribute('keyTimes'), "dur:", anim.getAttribute('dur'));
    }
  }

}, 500);
