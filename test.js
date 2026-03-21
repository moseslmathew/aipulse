
gsap.registerPlugin(MotionPathPlugin);

// ═══ Particle Background ═══════════════════════════════════════
class ParticleNetwork {
  constructor(){
    this.canvas=document.getElementById('bg-canvas');
    this.ctx=this.canvas.getContext('2d');
    this.particles=[];this.mouse={x:-999,y:-999};this.enabled=true;
    this._resize();
    window.addEventListener('resize',()=>this._resize());
    document.addEventListener('mousemove',e=>{this.mouse.x=e.clientX;this.mouse.y=e.clientY});
    this._spawn(35);this._tick();
  }
  _resize(){this.canvas.width=window.innerWidth;this.canvas.height=window.innerHeight}
  _spawn(n){this.particles=Array.from({length:n},()=>({x:Math.random()*this.canvas.width,y:Math.random()*this.canvas.height,vx:(Math.random()-.5)*.32,vy:(Math.random()-.5)*.32,r:Math.random()*1.4+.3,ph:Math.random()*Math.PI*2,spd:.007+Math.random()*.005}))}
  _tick(){
    requestAnimationFrame(()=>this._tick());
    const{ctx,canvas,particles,mouse,enabled}=this;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!enabled)return;
    const rgb=isDark?'99,102,241':'79,70,229';
    particles.forEach((p,i)=>{
      const dm=Math.hypot(p.x-mouse.x,p.y-mouse.y);
      if(dm<90&&dm>0){const f=(90-dm)/90*.4;p.vx+=(p.x-mouse.x)/dm*f;p.vy+=(p.y-mouse.y)/dm*f;p.vx*=.92;p.vy*=.92}
      p.x=(p.x+p.vx+canvas.width)%canvas.width;p.y=(p.y+p.vy+canvas.height)%canvas.height;p.vx*=.999;p.vy*=.999;p.ph+=p.spd;
      for(let j=i+1;j<particles.length;j++){const q=particles[j];const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(${rgb},${(1-d/110)*.09})`;ctx.lineWidth=(1-d/110)*.7;ctx.stroke()}}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb},${.07+Math.sin(p.ph)*.05})`;ctx.fill();
    });
  }
}

// ═══ Vehicle definitions ═══════════════════════════════════════
// Pure SVG element builders — no canvas/foreignObject
// pixels: 4×4 array of intensity values (row-major, 0-1)
// drawSVG(svg, x, y, w, h, dark): appends SVG shapes for the vehicle illustration
// ─── shared image drawSVG ─────────────────────────────────────
function makeImgDrawSVG(imgUrl, accent){
  return function(S,x,y,w,h,dk,cm){
    const g=_el('g',{});
    // clipping rect so image stays inside box
    const clipId='clip-'+Math.random().toString(36).slice(2,8);
    const defs=_el('defs',{});
    const clip=_el('clipPath',{id:clipId});
    clip.appendChild(_el('rect',{x,y,width:w,height:h,rx:8}));
    defs.appendChild(clip);
    g.appendChild(defs);
    // dark overlay behind image
    g.appendChild(_el('rect',{x,y,width:w,height:h,rx:8,fill:dk?'#0f172a':'#f1f5f9'}));
    // real photo
    const img=_el('image',{x,y,width:w,height:h,'clip-path':`url(#${clipId})`,preserveAspectRatio:'xMidYMid slice',href:imgUrl});
    img.setAttribute('href', imgUrl);
    // also set xlink:href for SVG 1.1 compat
    img.setAttributeNS('http://www.w3.org/1999/xlink','href',imgUrl);
    if (typeof cm!=='undefined' && !cm) img.setAttribute('filter', 'grayscale(100%)');
    // img.setAttribute('crossorigin','anonymous');
    g.appendChild(img);
    // coloured bottom bar label strip
    g.appendChild(_el('rect',{x,y:y+h*.82,width:w,height:h*.18,rx:0,fill:`rgba(0,0,0,.45)`}));
    // border glow
    g.appendChild(_el('rect',{x,y,width:w,height:h,rx:8,fill:'none',stroke:accent,'stroke-width':'1.8'}));
    S.appendChild(g);
  };
}

const VEHICLES = [
  {
    id:'car', label:'Sedan', emoji:'🚗', color:'#3b82f6',
    imgUrl:'images/car.png',
    pixels:[.05,.55,.60,.05, .70,.85,.85,.72, .88,.92,.90,.88, .60,.20,.20,.62],
    R:[.05,.20,.22,.05, .22,.30,.30,.24, .28,.32,.30,.28, .18,.08,.08,.20],
    G:[.05,.42,.48,.05, .55,.70,.70,.58, .72,.78,.74,.72, .50,.15,.15,.52],
    B:[.08,.80,.88,.08, .92,.95,.95,.88, .98,.99,.97,.98, .75,.28,.28,.78],
    outWeights:[.96,.04,.08,.02],
    drawSVG(S,x,y,w,h,dk,cm){ makeImgDrawSVG(this.imgUrl, this.color)(S,x,y,w,h,dk,cm); }
  },
  {
    id:'truck', label:'Truck', emoji:'🚚', color:'#f59e0b',
    imgUrl:'images/truck.png',
    pixels:[.90,.90,.50,.10, .92,.95,.80,.85, .92,.95,.88,.88, .65,.65,.22,.65],
    R:[.96,.96,.58,.12, .98,.99,.90,.92, .98,.99,.94,.94, .72,.72,.28,.72],
    G:[.72,.72,.38,.08, .75,.78,.62,.68, .75,.78,.70,.70, .50,.50,.18,.50],
    B:[.08,.08,.12,.04, .10,.12,.10,.10, .10,.12,.10,.10, .08,.08,.05,.08],
    outWeights:[.05,.94,.06,.03],
    drawSVG(S,x,y,w,h,dk,cm){ makeImgDrawSVG(this.imgUrl, this.color)(S,x,y,w,h,dk,cm); }
  },
  {
    id:'motorcycle', label:'Moto', emoji:'🏍️', color:'#10b981',
    imgUrl:'images/motorcycle.png',
    pixels:[.00,.30,.30,.00, .10,.88,.88,.10, .15,.60,.60,.15, .50,.15,.15,.50],
    R:[.00,.05,.05,.00, .05,.12,.12,.05, .06,.10,.10,.06, .08,.05,.05,.08],
    G:[.00,.42,.42,.00, .14,.95,.95,.14, .20,.78,.78,.20, .62,.20,.20,.62],
    B:[.00,.18,.18,.00, .08,.45,.45,.08, .10,.32,.32,.10, .28,.08,.08,.28],
    outWeights:[.04,.02,.95,.05],
    drawSVG(S,x,y,w,h,dk,cm){ makeImgDrawSVG(this.imgUrl, this.color)(S,x,y,w,h,dk,cm); }
  },
  {
    id:'bus', label:'Bus', emoji:'🚌', color:'#ec4899',
    imgUrl:'images/bus.png',
    pixels:[.88,.88,.88,.88, .92,.75,.75,.92, .92,.80,.80,.92, .68,.20,.20,.68],
    R:[.96,.96,.96,.96, .99,.85,.85,.99, .99,.90,.90,.99, .78,.28,.28,.78],
    G:[.12,.12,.12,.12, .14,.10,.10,.14, .14,.12,.12,.14, .10,.05,.05,.10],
    B:[.72,.72,.72,.72, .75,.60,.60,.75, .75,.65,.65,.75, .55,.15,.15,.55],
    outWeights:[.03,.06,.04,.95],
    drawSVG(S,x,y,w,h,dk,cm){ makeImgDrawSVG(this.imgUrl, this.color)(S,x,y,w,h,dk,cm); }
  }
];

// ─── SVG shape helpers ────────────────────────────────────────
function _el(tag,attrs){const e=document.createElementNS(SVG_NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function _c(S,cx,cy,r,fill){S.appendChild(_el('circle',{cx,cy,r,fill}));}
function _r(S,x,y,w,h,fill='none',stroke,sw,rx=0){const e=_el('rect',{x,y,width:w,height:h,rx});if(fill!=='none')e.setAttribute('fill',fill);if(stroke){e.setAttribute('stroke',stroke);e.setAttribute('stroke-width',sw||1.5);}else if(fill==='none'){e.setAttribute('fill','none');}S.appendChild(e);}
function _poly(S,pts,fill,stroke,sw){const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+'Z';const e=_el('path',{d,fill:fill||'none'});if(stroke){e.setAttribute('stroke',stroke);e.setAttribute('stroke-width',sw||1.5);}S.appendChild(e);}
function _line(S,x1,y1,x2,y2,stroke,sw){S.appendChild(_el('line',{x1,y1,x2,y2,stroke,'stroke-width':sw||1.5,'stroke-linecap':'round'}));}

// ═══ Globals ══════════════════════════════════════════════════
const SVG_NS='http://www.w3.org/2000/svg', XLINK='http://www.w3.org/1999/xlink';
const SPEED_MAP=[1.6,1.1,.7,.45,.25];
let lineMode='dynamic', weights={}, isDark=true, intensity=6;
let showLabels=true, loopAnim=true, entranceAnim=true, gradEdges=true, animStyle='dot';
function setStyle(s){
  animStyle=s;
  ['dot','pulse','dash'].forEach(id=>{
    document.getElementById('opt-'+id).classList.toggle('active', s===id);
    document.getElementById('opt-'+id).textContent=s===id?'✔ '+id.charAt(0).toUpperCase()+id.slice(1) : id.charAt(0).toUpperCase()+id.slice(1);
  });
  buildNetwork(true);
}
let rep='indefinite', fz='freeze', pc=0, particleSys=null;
let demoMode=false, demoVehicleIdx=0, colorMode=false;

function el(tag,attrs){return _el(tag,attrs);}
function smil(tag,attrs){return _el(tag,attrs);}
function hexToRgb(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)].join(',');}
function randWeight(){return+(Math.random()*2-1).toFixed(2);}
function initWeights(layers){weights={};for(let li=0;li<layers.length-1;li++)for(let ai=0;ai<layers[li];ai++)for(let bi=0;bi<layers[li+1];bi++)weights[`${li}-${ai}-${bi}`]=randWeight();}
function iScale(){return .2+(intensity-1)*(1.8/9);}
function wSW(w){return Math.max(.7,(.4+Math.abs(w)*2.8+(intensity-1)*.08)).toFixed(2);}
function wOp(w){return Math.min(1,(.08+Math.abs(w)*.75)*iScale()).toFixed(3);}
function lineColor(){return isDark?'#334155':'#cbd5e1';}

let animPaused=false;
function stepCounter(id, delta){
  const inp=document.getElementById(id);
  const min=+inp.min, max=+inp.max;
  const next=Math.min(max, Math.max(min, +inp.value + delta));
  inp.value=next;
  const labelMap={'sl-input':'iv','sl-layers':'lv','sl-nodes':'nv','sl-output':'ov'};
  if(labelMap[id]){ const el=document.getElementById(labelMap[id]); el.value=next; }
  const counter=inp.previousElementSibling;
  counter.querySelector('.counter-btn:first-child').style.opacity=next<=min?'.3':'1';
  counter.querySelector('.counter-btn:last-child').style.opacity=next>=max?'.3':'1';
  buildNetwork(false);
}

function typeCounter(id, inputEl, blur=false){
  const inp=document.getElementById(id);
  const min=+inp.min, max=+inp.max;
  const raw=parseInt(inputEl.value,10);
  if(isNaN(raw)||inputEl.value==='') return;
  const clamped=blur ? Math.min(max, Math.max(min, raw)) : Math.min(max, Math.max(1, raw));
  inp.value=clamped;
  if(blur && raw!==clamped) inputEl.value=clamped;
  const counter=inputEl.closest('.counter');
  counter.querySelector('.counter-btn:first-child').style.opacity=clamped<=min?'.3':'1';
  counter.querySelector('.counter-btn:last-child').style.opacity=clamped>=max?'.3':'1';
  buildNetwork(false);
}

function initCounters(){
  ['sl-input','sl-layers','sl-nodes','sl-output'].forEach(id=>{
    const inp=document.getElementById(id);
    if(!inp) return;
    const counter=inp.previousElementSibling;
    const v=+inp.value;
    counter.querySelector('.counter-btn:first-child').style.opacity=v<=+inp.min?'.3':'1';
    counter.querySelector('.counter-btn:last-child').style.opacity=v>=+inp.max?'.3':'1';
  });
}

function togglePause(){
  const svg=document.getElementById('nn-svg');
  svg.style.animationPlayState=animPaused?'paused':'running';
  // Toggle SMIL animations
  const anims=svg.querySelectorAll('animate,animateMotion');
  anims.forEach(a=>{try{animPaused?a.pauseAnimations?.():a.unpauseAnimations?.();}catch(e){}});
  // Fallback: pause/resume on the SVG element itself
  try{animPaused?svg.pauseAnimations():svg.unpauseAnimations();}catch(e){}
  document.getElementById('btn-pause').textContent=animPaused?'▶ Resume':'⏸ Pause';
}

function getActFn(){
  const v=document.getElementById('sel-act')?.value||'sigmoid';
  if(v==='relu')return x=>Math.max(0,x);
  if(v==='tanh')return x=>Math.tanh(x);
  return x=>1/(1+Math.exp(-x)); // sigmoid
}

function computeActivations(layers,inputOverride){
  const actFn=getActFn();
  const acts=[inputOverride||Array(layers[0]).fill(1)];
  for(let li=1;li<layers.length;li++){
    const prev=acts[li-1],layer=[];
    for(let ni=0;ni<layers[li];ni++){let s=0;for(let pi=0;pi<prev.length;pi++)s+=prev[pi]*(weights[`${li-1}-${pi}-${ni}`]||0);layer.push(Math.min(1,Math.max(0,actFn(s))));}
    acts.push(layer);
  }
  return acts;
}
function edgeStrength(acts,li,a,b){return Math.min(1,acts[li][a]*Math.abs(weights[`${li}-${a}-${b}`]||0));}

const LIGHT_N=[
  {stroke:'#8b5cf6',fill:'#f3e8ff',core:'#8b5cf6',text:'#5b21b6'},
  {stroke:'#3b82f6',fill:'#dbeafe',core:'#3b82f6',text:'#1e40af'},
  {stroke:'#06b6d4',fill:'#cffafe',core:'#06b6d4',text:'#155e75'},
  {stroke:'#10b981',fill:'#d1fae5',core:'#10b981',text:'#065f46'},
  {stroke:'#f59e0b',fill:'#fef3c7',core:'#f59e0b',text:'#78350f'},
  {stroke:'#ef4444',fill:'#fee2e2',core:'#ef4444',text:'#991b1b'},
  {stroke:'#ec4899',fill:'#fce7f3',core:'#f472b6',text:'#9d174d'},
];
const DARK_N=[
  {stroke:'#a78bfa',fill:'#2e1065',core:'#a78bfa',text:'#ddd6fe'},
  {stroke:'#60a5fa',fill:'#1e3a8a',core:'#60a5fa',text:'#bfdbfe'},
  {stroke:'#22d3ee',fill:'#164e63',core:'#22d3ee',text:'#a5f3fc'},
  {stroke:'#34d399',fill:'#064e3b',core:'#34d399',text:'#a7f3d0'},
  {stroke:'#fbbf24',fill:'#78350f',core:'#fbbf24',text:'#fde68a'},
  {stroke:'#f87171',fill:'#7f1d1d',core:'#f87171',text:'#fecaca'},
  {stroke:'#f472b6',fill:'#831843',core:'#f472b6',text:'#fbcfe8'},
];
function getNode(li,total){const C=isDark?DARK_N:LIGHT_N;if(li===0)return C[0];if(li===total-1)return C[6];return C.slice(1)[(li-1)%(C.length-1)];}

// ═══ Toggles ══════════════════════════════════════════════════
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('collapsed');}
function toggleTheme(){isDark=!isDark;document.getElementById('app').className='app '+(isDark?'dark':'light');document.getElementById('theme-icon').textContent=isDark?'☀️':'🌙';document.getElementById('theme-lbl').textContent=isDark?'Light Mode':'Dark Mode';buildNetwork(true);}
function toggleDynamic(){const t=document.getElementById('dyn-toggle'),on=!t.classList.contains('on');t.classList.toggle('on',on);document.getElementById('dyn-lbl').textContent=on?'Dynamic Flow':'Static Layout';lineMode=on?'dynamic':'static';buildNetwork(true);}
function toggleLoop(){const t=document.getElementById('loop-toggle');loopAnim=!t.classList.contains('on');t.classList.toggle('on',loopAnim);buildNetwork(true);}
function toggleLabels(){const t=document.getElementById('lbl-toggle');showLabels=!t.classList.contains('on');t.classList.toggle('on',showLabels);buildNetwork(true);}
function toggleEntrance(){const t=document.getElementById('entrance-toggle');entranceAnim=!t.classList.contains('on');t.classList.toggle('on',entranceAnim);}
function toggleParticles(){const t=document.getElementById('particle-toggle');const on=!t.classList.contains('on');t.classList.toggle('on',on);if(particleSys)particleSys.enabled=on;}
function toggleGradEdges(){const t=document.getElementById('grad-toggle');gradEdges=!t.classList.contains('on');t.classList.toggle('on',gradEdges);buildNetwork(true);}
function toggleColorMode(){const t=document.getElementById('color-toggle');colorMode=!t.classList.contains('on');t.classList.toggle('on',colorMode);buildNetwork(false);}
function onIntensity(){intensity=+document.getElementById('sl-intensity').value;document.getElementById('intv').textContent=intensity;buildNetwork(true);}

function toggleDemo(){
  demoMode=!demoMode;
  document.getElementById('demo-toggle').classList.toggle('on',demoMode);
  document.getElementById('arch-section').classList.remove('dim');
  document.getElementById('sl-output').closest('.sl-row').style.opacity=demoMode?'0.35':'1';
  document.getElementById('sl-output').closest('.sl-row').style.pointerEvents=demoMode?'none':'auto';
  document.getElementById('img-mode-row').style.display=demoMode?'flex':'none';
  document.getElementById('veh-grid').classList.toggle('show',demoMode);
  if(demoMode)buildVehiclePicker();
  buildNetwork(false);
}

function buildVehiclePicker(){
  const g=document.getElementById('veh-grid');g.innerHTML='';
  VEHICLES.forEach((v,i)=>{
    const b=document.createElement('button');
    b.className='veh-card'+(i===demoVehicleIdx?' active':'');
    b.style.cssText='padding:5px;overflow:hidden;';
    b.innerHTML=`
      <div style="width:100%;height:44px;border-radius:6px;overflow:hidden;margin-bottom:4px;background:#1e293b">
        <img src="${v.imgUrl}" alt="${v.label}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.parentNode.innerHTML='${v.emoji}'">
      </div>
      <span style="font-size:10px">${v.label}</span>`;
    b.onclick=()=>{demoVehicleIdx=i;buildVehiclePicker();buildNetwork(true);};
    g.appendChild(b);
  });
}

// ═══ SMIL animation helpers ════════════════════════════════════
function addDot(svg,ax,ay,bx,by,color,strength,ws,wd,tc){
  const pid=`p${pc++}`;
  svg.appendChild(el('path',{id:pid,d:`M${ax},${ay} L${bx},${by}`,fill:'none',stroke:'none'}));
  const t0=+(ws/tc).toFixed(7),t1=+((ws+wd)/tc).toFixed(7),e=.00005;
  const r=((1.8+strength*4.5)*(.8+intensity*.05)).toFixed(1);
  const op=Math.min(1,.35+strength*.65).toFixed(2);
  const dot=el('circle',{r,fill:color,opacity:'0','pointer-events':'none'});
  const m=smil('animateMotion',{dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'linear',keyTimes:`0; ${t0}; ${t1}; 1`,keyPoints:'0; 0; 1; 1',rotate:'none'});
  const mp=document.createElementNS(SVG_NS,'mpath');mp.setAttributeNS(XLINK,'href',`#${pid}`);m.appendChild(mp);dot.appendChild(m);
  dot.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;${op};${op};0;0`,keyTimes:`0;${Math.max(0,t0-e).toFixed(7)};${Math.min(1,t0+e).toFixed(7)};${Math.max(0,t1-e).toFixed(7)};${Math.min(1,t1+e).toFixed(7)};1`,dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'linear'}));
  svg.appendChild(dot);
}

function addFlash(svg,x,y,col,r,ws,wd,tc){
  const dur=wd*.4,t0=+(ws/tc).toFixed(7),tm=+((ws+dur*.5)/tc).toFixed(7),t1=+((ws+dur)/tc).toFixed(7);
  const fo=Math.min(1,.55+intensity*.04).toFixed(2);
  const ring=el('circle',{cx:x,cy:y,r:r+10,fill:col.fill,opacity:'0','pointer-events':'none'});
  ring.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;${fo};${fo};0;0`,keyTimes:`0;${t0};${tm};${tm};${t1};1`,dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'spline',keySplines:'0 0 1 1;.2 0 .8 1;0 0 1 1;.2 0 .8 1;0 0 1 1'}));svg.appendChild(ring);
  const p2=el('circle',{cx:x,cy:y,r:r*.65,fill:col.core,opacity:'0','pointer-events':'none'});
  p2.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;1;1;0;0`,keyTimes:`0;${t0};${tm};${tm};${t1};1`,dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'spline',keySplines:'0 0 1 1;.2 0 .8 1;0 0 1 1;.2 0 .8 1;0 0 1 1'}));svg.appendChild(p2);
}

function addMathAnim(svg,ax,ay,bx,by,val,w,ws,wd,tc){
  const mx=(ax+bx)/2,my=(ay+by)/2-7;
  const k1=(ws+wd*.3)/tc,k2=(ws+wd*.45)/tc,k3=(ws+wd*.75)/tc,k4=(ws+wd*.9)/tc;
  if(k4>=1)return;
  const g=el('g',{opacity:'0','pointer-events':'none'});
  const t=el('text',{x:mx,y:my,'text-anchor':'middle','font-size':'10','font-family':'JetBrains Mono,monospace','font-weight':'600',fill:isDark?'#fbbf24':'#ea580c'});
  t.textContent=`${val.toFixed(2)}×${w.toFixed(2)}`;
  g.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;1;1;0;0`,keyTimes:`0;${k1.toFixed(5)};${k2.toFixed(5)};${k3.toFixed(5)};${k4.toFixed(5)};1`,dur:`${tc}s`,repeatCount:rep,fill:fz}));
  t.appendChild(smil('animate',{attributeName:'y',values:`${my};${my};${my-10};${my-10};${my}`,keyTimes:`0;${k1.toFixed(5)};${k4.toFixed(5)};1;1`,dur:`${tc}s`,repeatCount:rep,fill:fz}));
  g.appendChild(t);svg.appendChild(g);
}

function drawOutputNode(svg,x,y,act,col,r,arrivals,tc){
  const iSc=iScale(),flashDur=.15+(1-act)*.3;
  const peakHalo=Math.min(1,(.15+act*.85)*iSc).toFixed(3);
  const peakBurst=Math.min(1,(.3+act*.7)*iSc).toFixed(3);
  const haloR=r+4+Math.round(act*22),coreR=(r*.35+act*r*.4).toFixed(1);
  svg.appendChild(el('circle',{cx:x,cy:y,r,fill:isDark?col.fill:'#fff',stroke:col.stroke,'stroke-width':'2'}));
  svg.appendChild(el('circle',{cx:x,cy:y,r:(r*.44).toFixed(1),fill:col.core,opacity:(.15+act*.35).toFixed(2)}));
  for(const{arriveAt}of arrivals){
    const t0=+(arriveAt/tc).toFixed(7),tm=+((arriveAt+flashDur*.4)/tc).toFixed(7),t1=+((arriveAt+flashDur)/tc).toFixed(7);
    const kt=`0;${Math.max(0,t0-.00003).toFixed(7)};${tm};${tm};${t1};1`,sp='.2 0 .8 1;.2 0 .8 1;.2 0 .8 1;.2 0 .8 1;.2 0 .8 1';
    const halo=el('circle',{cx:x,cy:y,r:haloR,fill:col.fill,opacity:'0','pointer-events':'none'});
    halo.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;${peakHalo};${peakHalo};0;0`,keyTimes:kt,dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'spline',keySplines:sp}));svg.appendChild(halo);
    const burst=el('circle',{cx:x,cy:y,r:coreR,fill:col.core,opacity:'0','pointer-events':'none'});
    burst.appendChild(smil('animate',{attributeName:'opacity',values:`0;0;${peakBurst};${peakBurst};0;0`,keyTimes:kt,dur:`${tc}s`,repeatCount:rep,fill:fz,calcMode:'spline',keySplines:sp}));svg.appendChild(burst);
  }
  if(arrivals.length>0 && !demoMode){
    const pw=34,bg=el('g',{opacity:'0'});
    bg.appendChild(el('rect',{x:x+r+4,y:y-8.5,width:pw,height:17,rx:'6',fill:isDark?'#0f172a':'#fff',stroke:col.stroke,'stroke-width':'1.5'}));
    const bt=el('text',{x:x+r+4+pw/2,y:y+4.5,'text-anchor':'middle','font-family':'JetBrains Mono,monospace','font-size':'10','font-weight':'700',fill:col.text});
    bt.textContent=act.toFixed(2);bg.appendChild(bt);
    const t0=+(arrivals[0].arriveAt/tc).toFixed(7);
    const kt=loopAnim?`0;${Math.max(0,t0-.02).toFixed(7)};${t0};.90;.95;1`:`0;${Math.max(0,t0-.02).toFixed(7)};${t0};1`;
    bg.appendChild(smil('animate',{attributeName:'opacity',values:loopAnim?'0;0;1;1;0;0':'0;0;1;1',keyTimes:kt,dur:`${tc}s`,repeatCount:rep,fill:fz}));
    svg.appendChild(bg);
  }
}

function drawWeightLabels(svg,li,pos){
  const nA=pos[li].length,nB=pos[li+1].length,conns=[];
  for(let a=0;a<nA;a++)for(let b=0;b<nB;b++)conns.push({a,b,w:weights[`${li}-${a}-${b}`],abs:Math.abs(weights[`${li}-${a}-${b}`])});
  conns.sort((x,y)=>y.abs-x.abs);
  const toShow=conns.slice(0,Math.ceil(Math.sqrt(nA*nB))+1);
  const pBg=isDark?'rgba(15,23,42,.98)':'rgba(255,255,255,.98)',pTxt=isDark?'#ffffff':'#1e293b',pBdr=isDark?'#1e293b':'#e2e8f0';
  const drawn=new Set();
  for(const{a,b,w}of toShow){
    drawn.add(`${a}-${b}`);
    const{x:ax,y:ay}=pos[li][a],{x:bx,y:by}=pos[li+1][b];
    const mx=(ax+bx)/2,my=(ay+by)/2,txt=(w>=0?'+':'')+w.toFixed(2),lw=txt.length*6.5+10;
    const g=el('g',{});
    g.appendChild(el('rect',{x:mx-lw/2,y:my-9,width:lw,height:18,rx:'9',fill:pBg,stroke:pBdr,'stroke-width':'1'}));
    const t=el('text',{x:mx,y:my+3.5,'text-anchor':'middle','font-family':'JetBrains Mono,monospace','font-size':'9.5','font-weight':'600',fill:pTxt});
    t.textContent=txt;g.appendChild(t);svg.appendChild(g);
  }
  return drawn;
}

function runEntranceAnimation(){
  const svg=document.getElementById('nn-svg');
  const edges=svg.querySelectorAll('.nn-edge'),outers=svg.querySelectorAll('.nn-node-outer'),cores=svg.querySelectorAll('.nn-node-core'),labels=svg.querySelectorAll('.nn-label');
  const tl=gsap.timeline();
  if(edges.length) tl.fromTo(edges,{opacity:0},{opacity:1,duration:.5,stagger:{amount:.4,from:'start'},ease:'power2.out'},0);
  if(outers.length)tl.fromTo(outers,{scale:0,transformOrigin:'center center',opacity:0},{scale:1,opacity:1,duration:.45,stagger:{amount:.45,from:'start'},ease:'back.out(2)'},.12);
  if(cores.length) tl.fromTo(cores,{scale:0,transformOrigin:'center center',opacity:0},{scale:1,opacity:.88,duration:.4,stagger:{amount:.38,from:'start'},ease:'elastic.out(1.1,.5)'},.25);
  if(labels.length)tl.fromTo(labels,{y:8,opacity:0},{y:0,opacity:1,duration:.35,stagger:.07,ease:'power2.out'},0);
}

function updateStats(layers,acts){
  let p=0;for(let li=0;li<layers.length-1;li++)p+=layers[li]*layers[li+1];
  const allA=acts.flat(),maxA=Math.max(...allA);
  const ws=Object.values(weights),avgW=ws.reduce((s,v)=>s+Math.abs(v),0)/ws.length;
  document.getElementById('stat-params').textContent=p.toLocaleString();
  document.getElementById('stat-layers').textContent=layers.length;
  document.getElementById('stat-maxact').textContent=maxA.toFixed(3);
  document.getElementById('stat-avgw').textContent=avgW.toFixed(3);
  document.getElementById('act-bar').style.width=(maxA*100).toFixed(0)+'%';
  const classRow=document.getElementById('stat-class-row');
  if(demoMode){
    classRow.style.display='flex';
    const veh=VEHICLES[demoVehicleIdx];
    const winnerIdx=veh.outWeights.indexOf(Math.max(...veh.outWeights));
    document.getElementById('stat-class').textContent=VEHICLES[winnerIdx].emoji+' '+VEHICLES[winnerIdx].label;
  } else {
    classRow.style.display='none';
  }
}

// === Vehicle input panel ===================================
function drawVehiclePanel(svg,veh,pos,NODE_R,H,tc,nInput){
  const CELL=26, COLS=4, ROWS=4;
  const GRID_W=COLS*CELL, GRID_H=ROWS*CELL;
  const IMG_W=130, IMG_H=100;
  const PILL_W=44, PILL_H=18, PILL_R=5;
  const panelLeft=10;

  const dispN=Math.min(16, nInput, pos[0].length);
  const pixelData=colorMode?veh.R.concat(veh.G).concat(veh.B):veh.pixels;

  // Vertical centering — anchor everything to match input node span
  const firstNodeY=pos[0][0].y;
  const lastNodeY=pos[0][Math.min(dispN-1, pos[0].length-1)].y;
  const nodeSpanCenter=(firstNodeY+lastNodeY)/2;

  const imgY=Math.max(50, nodeSpanCenter - IMG_H/2 - 20);
  const gridY=Math.max(imgY, nodeSpanCenter - GRID_H/2);
  const gridX=panelLeft+IMG_W+40;
  const flatX=gridX+GRID_W+80;

  const g=el('g',{class:'demo-panel-left'});

  // ── Image box ──────────────────────────────────────────
  // card background
  g.appendChild(el('rect',{x:panelLeft,y:imgY,width:IMG_W,height:IMG_H,rx:12,
    fill:isDark?'rgba(15,23,42,.95)':'#ffffff',
    stroke:veh.color,'stroke-width':'1.8'}));
  const vGroup=el('g',{});
  veh.drawSVG(vGroup,panelLeft,imgY,IMG_W,IMG_H,isDark,colorMode);
  g.appendChild(vGroup);

  // Scan line on image
  if(lineMode==='dynamic'){
    const sc=el('rect',{x:panelLeft+2,y:imgY+2,width:IMG_W-4,height:3,rx:1,
      fill:veh.color,opacity:'0','pointer-events':'none'});
    sc.appendChild(smil('animate',{attributeName:'y',
      values:[imgY+2,imgY+2,imgY+IMG_H-5,imgY+IMG_H-5].join(';'),
      keyTimes:'0;.04;.26;.30',dur:tc+'s',repeatCount:rep,fill:fz}));
    sc.appendChild(smil('animate',{attributeName:'opacity',
      values:'0;.75;.75;0',keyTimes:'0;.04;.26;.30',
      dur:tc+'s',repeatCount:rep,fill:fz}));
    g.appendChild(sc);
  }

  // ── "Next Image" button (foreignObject) ────────────────
  const btnY=imgY+IMG_H+8;
  const fo=document.createElementNS(SVG_NS,'foreignObject');
  fo.setAttribute('x',panelLeft); fo.setAttribute('y',btnY);
  fo.setAttribute('width',IMG_W); fo.setAttribute('height',28);
  const btn=document.createElement('button');
  btn.textContent='Next Image';
  btn.style.cssText=`width:100%;height:28px;border-radius:7px;border:none;
    background:#3b82f6;color:#fff;font-size:11px;font-weight:700;
    cursor:pointer;font-family:Inter,sans-serif;letter-spacing:.03em;
    transition:background .2s`;
  btn.onmouseenter=()=>{btn.style.background='#2563eb';};
  btn.onmouseleave=()=>{btn.style.background='#3b82f6';};
  btn.onclick=()=>{
    demoVehicleIdx=(demoVehicleIdx+1)%VEHICLES.length;
    buildVehiclePicker();buildNetwork(true);
  };
  fo.appendChild(btn);
  g.appendChild(fo);

  // ── Grid label above ───────────────────────────────────
  const gridLbl=el('text',{x:gridX+GRID_W/2,y:gridY-9,'text-anchor':'middle',
    'font-family':'Inter,sans-serif','font-size':'10','font-weight':'700',
    'letter-spacing':'.06em',fill:isDark?'#64748b':'#94a3b8'});
  gridLbl.textContent=colorMode?'4\xd74\xd73 (RGB)':'4\xd74 (Grayscale)';
  g.appendChild(gridLbl);

  // ── Grid cells ─────────────────────────────────────────
  
  const channels = colorMode ? 3 : 1;
  const channelColors = ['#ef4444','#10b981','#3b82f6'];
  for(let ch=0; ch<channels; ch++) {
      const offsetX = colorMode ? (ch - 2) * -12 : 0; 
      const offsetY = colorMode ? (ch - 2) * -12 : 0;
      for(let r=0;r<ROWS;r++){
        for(let cc=0;cc<COLS;cc++){
          const idx=r*COLS+cc;
          const v = colorMode ? (ch===0?veh.R[idx] : ch===1?veh.G[idx] : veh.B[idx]) : (veh.pixels[idx]??0);
          const grey=Math.round(v*255);
          const cx2=gridX+cc*CELL + offsetX, cy2=gridY+r*CELL + offsetY;
          
          let fillCol = "rgb("+grey+","+grey+","+grey+")";
          if (colorMode && ch===0) fillCol = "rgba("+grey+",0,0,0.85)";
          if (colorMode && ch===1) fillCol = "rgba(0,"+grey+",0,0.85)";
          if (colorMode && ch===2) fillCol = "rgba(0,0,"+grey+",0.85)";
          if (!colorMode) fillCol = "rgb("+grey+","+grey+","+grey+")";

          g.appendChild(el('rect',{x:cx2,y:cy2,width:CELL,height:CELL,
            fill:fillCol,
            stroke:isDark?'rgba(0,0,0,.6)':'rgba(226,232,240,.9)','stroke-width':'1'}));

          if (!colorMode || ch===2) {
              const bright=v>.5;
              const tv=el('text',{x:cx2+CELL/2,y:cy2+CELL/2+3.5,'text-anchor':'middle',
                'font-family':'JetBrains Mono,monospace','font-size':'8','font-weight':'600',
                fill:bright?'#0f172a':(isDark?'rgba(240,244,255,.9)':'rgba(240,244,255,.9)')});
              tv.textContent=v.toFixed(2);
              g.appendChild(tv);
          }
        }
      }
      g.appendChild(el('rect',{x:gridX+offsetX,y:gridY+offsetY,width:GRID_W,height:GRID_H,rx:4,
        fill:'none',stroke:colorMode?channelColors[ch]:(isDark?'#475569':'#94a3b8'),'stroke-width':'1.8'}));
  }


  // Grid scan line
  if(lineMode==='dynamic'){
    const gs=el('rect',{x:gridX,y:gridY,width:GRID_W,height:2.5,rx:1,
      fill:isDark?'#e2e8f0':'#64748b',opacity:'0','pointer-events':'none'});
    gs.appendChild(smil('animate',{attributeName:'y',
      values:[gridY-24,gridY-24,gridY+GRID_H-3,gridY+GRID_H-3].join(';'),
      keyTimes:`0;${(tExt*0.1)/tc};${(tExt*0.6)/tc};${(tExt*0.65)/tc}`,dur:tc+'s',repeatCount:rep,fill:fz}));
    gs.appendChild(smil('animate',{attributeName:'opacity',
      values:'0;.8;.8;0',keyTimes:`0;${(tExt*0.1)/tc};${(tExt*0.6)/tc};${(tExt*0.65)/tc}`,
      dur:tc+'s',repeatCount:rep,fill:fz}));
    g.appendChild(gs);
  }

  // ── Flat vector label ──────────────────────────────────
  const flatLbl=el('text',{x:flatX+PILL_W/2,y:firstNodeY-14,'text-anchor':'middle',
    'font-family':'Inter,sans-serif','font-size':'9.5','font-weight':'700',
    'letter-spacing':'.05em',fill:isDark?'#818cf8':'#6366f1'});
  flatLbl.textContent=`${dispN}\xd71 (Flat)`;
  g.appendChild(flatLbl);

  // ── Flat vector pills ──────────────────────────────────
  for(let ni=0;ni<dispN;ni++){
    const nd=pos[0][ni];
    const pillCY=nd.y;
    const pillY=pillCY-PILL_H/2;
    const pv=pixelData[ni]??0;

    // pill background
    g.appendChild(el('rect',{x:flatX,y:pillY,width:PILL_W,height:PILL_H,rx:PILL_R,
      fill:isDark?'rgba(30,41,59,.85)':'rgba(240,244,255,.95)',
      stroke:isDark?'#334155':'#cbd5e1','stroke-width':'1'}));

    // value text
    const ptv=el('text',{x:flatX+PILL_W/2,y:pillY+PILL_H/2+3.5,'text-anchor':'middle',
      'font-family':'JetBrains Mono,monospace','font-size':'9','font-weight':'600',
      fill:isDark?'#94a3b8':'#475569'});
    ptv.textContent=pv.toFixed(2);
    g.appendChild(ptv);

    // pill → input node connector
    svg.appendChild(el('line',{
      x1:flatX+PILL_W,y1:pillCY,x2:nd.x-NODE_R-2,y2:pillCY,
      stroke:isDark?'#1e3a5f':'#bfdbfe','stroke-width':'1',
      'stroke-dasharray':'3 3',opacity:'.45'}));
  }

  // ── Grid → flat pill connectors ────────────────────────
  for(let ni=0;ni<dispN;ni++){
    const ch = colorMode ? Math.floor(ni/16) : 0; const r = Math.floor((ni%16)/COLS); const cc = (ni%16)%COLS; const offsetX = colorMode ? (ch - 2) * -12 : 0; const offsetY = colorMode ? (ch - 2) * -12 : 0;
    const cellCX=gridX+cc*CELL+CELL/2 + offsetX;
    const cellCY=gridY+r*CELL+CELL/2 + offsetY;
    const nd=pos[0][ni];
    svg.appendChild(el('line',{
      x1:gridX+GRID_W,y1:cellCY,x2:flatX,y2:nd.y,
      stroke:isDark?'#1e3a5f':'#bfdbfe','stroke-width':'0.9',
      'stroke-dasharray':'3 3',opacity:'.3'}));
  }

  svg.appendChild(g);

  // ── Flatten Animation ──────────────────────────────────
  // Tiles fly from grid cells → flat pills, then node flash on arrival
  if(lineMode==='dynamic'){
    const phaseStart = 0, phaseEnd = tExt/tc * 0.82;
    const phaseLen=phaseEnd-phaseStart;
    const perCell=phaseLen/Math.max(1,dispN);
    const flyDur=Math.min(perCell*1.5, phaseLen*0.24);
    const TILE=CELL-4;

    for(let ni=0;ni<dispN;ni++){
      const cc=ni%COLS, r=Math.floor(ni/COLS);
      const cellCX=gridX+cc*CELL+CELL/2;
      const cellCY=gridY+r*CELL+CELL/2;
      const nd=pos[0][ni];
      const destX=flatX+PILL_W/2;
      const destY=nd.y;

      const pv=pixelData[ni]??0;
      const dotColor=colorMode?(ni<16?'#ef4444':ni<32?'#10b981':'#3b82f6'):veh.color;

      const t0=phaseStart+ni*perCell;
      const t1=Math.min(phaseEnd, t0+flyDur);
      const t0f=t0.toFixed(5), t1f=t1.toFixed(5);
      const tPre=Math.max(0,t0-.001).toFixed(5);

      // Cell highlight pulse
      const hl=el('rect',{x:cellCX-TILE/2,y:cellCY-TILE/2,width:TILE,height:TILE,rx:3,
        fill:dotColor,opacity:'0','pointer-events':'none'});
      hl.appendChild(smil('animate',{attributeName:'opacity',
        values:`0;0;0.75;0.75;0;0`,
        keyTimes:`0;${tPre};${t0f};${(t0+.008).toFixed(5)};${(t0+.022).toFixed(5)};1`,
        dur:`${tc}s`,repeatCount:rep,fill:fz}));
      svg.appendChild(hl);

      // Flying tile path (curves to flat pill)
      const pid='pt'+pc++;
      const midX=(cellCX+destX)/2;
      const midY=Math.min(cellCY,destY)-20;
      svg.appendChild(el('path',{id:pid,
        d:`M${cellCX},${cellCY} Q${midX},${midY} ${destX},${destY}`,
        fill:'none',stroke:'none'}));

      const tile=el('rect',{x:-TILE/2,y:-TILE/2,width:TILE,height:TILE,rx:3,
        fill:dotColor,opacity:'0','pointer-events':'none'});
      const mm=smil('animateMotion',{dur:`${tc}s`,repeatCount:rep,fill:fz,
        calcMode:'spline',
        keyTimes:`0;${tPre};${t1f};1`,keyPoints:`0;0;1;1`,
        keySplines:`0 0 1 1;.42 0 .18 1;0 0 1 1`,rotate:'none'});
      const mpp=document.createElementNS(SVG_NS,'mpath');
      mpp.setAttributeNS(XLINK,'href','#'+pid);
      mm.appendChild(mpp); tile.appendChild(mm);
      tile.appendChild(smil('animate',{attributeName:'opacity',
        values:`0;0;${(0.6+pv*.4).toFixed(2)};${(0.6+pv*.4).toFixed(2)};0;0`,
        keyTimes:`0;${tPre};${t0f};${(t1-.012).toFixed(5)};${t1f};1`,
        dur:`${tc}s`,repeatCount:rep,fill:fz}));
      svg.appendChild(tile);

      // Value label on tile
      const valLbl=el('text',{x:0,y:3.5,'text-anchor':'middle',
        'font-family':'JetBrains Mono,monospace','font-size':'7','font-weight':'700',
        fill:'#fff',opacity:'0','pointer-events':'none'});
      valLbl.textContent=pv.toFixed(2);
      const mm2=smil('animateMotion',{dur:`${tc}s`,repeatCount:rep,fill:fz,
        calcMode:'spline',
        keyTimes:`0;${tPre};${t1f};1`,keyPoints:`0;0;1;1`,
        keySplines:`0 0 1 1;.42 0 .18 1;0 0 1 1`,rotate:'none'});
      const mpp2=document.createElementNS(SVG_NS,'mpath');
      mpp2.setAttributeNS(XLINK,'href','#'+pid);
      mm2.appendChild(mpp2); valLbl.appendChild(mm2);
      valLbl.appendChild(smil('animate',{attributeName:'opacity',
        values:`0;0;1;1;0;0`,
        keyTimes:`0;${tPre};${t0f};${(t1-.02).toFixed(5)};${t1f};1`,
        dur:`${tc}s`,repeatCount:rep,fill:fz}));
      svg.appendChild(valLbl);

      // Pill flash on arrival
      const pillFlash=el('rect',{
        x:flatX,y:nd.y-PILL_H/2,width:PILL_W,height:PILL_H,rx:PILL_R,
        fill:dotColor,opacity:'0','pointer-events':'none'});
      pillFlash.appendChild(smil('animate',{attributeName:'opacity',
        values:`0;0;0;0.55;0;0`,
        keyTimes:`0;${tPre};${t1f};${Math.min(1,t1+.014).toFixed(5)};${Math.min(1,t1+.04).toFixed(5)};1`,
        dur:`${tc}s`,repeatCount:rep,fill:fz}));

      svg.appendChild(pillFlash);
    }
  }
  
  if (lineMode==='dynamic') {
     for(let ni=0;ni<dispN;ni++){
        const pv=pixelData[ni]??0;
        const color = colorMode?(ni<16?'#ef4444':ni<32?'#10b981':'#3b82f6'):veh.color;
        addDot(svg, flatX+PILL_W, pos[0][ni].y, pos[0][ni].x-NODE_R-2, pos[0][ni].y, color, pv, tExt * 0.7, tExt * 0.3, tc);
      }
  }
}

// ═══ Classification output panel ══════════════════════════════
// Clean bar chart — no crowding with confidence badge on winner only.
function drawClassPanel(svg,veh,pos,NODE_R,H,tc){
  const outputX=pos[pos.length-1][0].x;
  const panelX=outputX+NODE_R+18;
  const BAR_W=110, BAR_H=11;

  const expW=veh.outWeights.map(w=>Math.exp(w*3));
  const sumE=expW.reduce((a,b)=>a+b,0);
  const probs=expW.map(e=>e/sumE);
  const winnerIdx=veh.outWeights.indexOf(Math.max(...veh.outWeights));

  // Panel header — positioned below the "Classifier" layer label pill (which sits at y=13..35)
  const hW=BAR_W+80;
  const hY=40;
  /* CLASSIFICATION OUTPUT label removed */

  VEHICLES.forEach((v2,idx)=>{
    if(!pos[pos.length-1][idx])return;
    const{y}=pos[pos.length-1][idx];
    const conf=probs[idx];
    const isW=(idx===winnerIdx);

    // Emoji
    const emo=el('text',{x:panelX+2,y:y+5,'font-size':'13',opacity:isW?'1':'.45'});
    emo.textContent=v2.emoji;svg.appendChild(emo);

    // Label
    const lbl=el('text',{x:panelX+22,y:y+5,'font-family':'Inter,sans-serif','font-size':'11','font-weight':isW?'700':'500',fill:isW?v2.color:(isDark?'#475569':'#94a3b8')});
    lbl.textContent=v2.label;svg.appendChild(lbl);

    // Bar track
    const barX=panelX+22+48;
    svg.appendChild(el('rect',{x:barX,y:y-5.5,width:BAR_W,height:BAR_H,rx:5.5,fill:isDark?'rgba(30,41,59,.6)':'rgba(203,213,225,.35)'}));

    // Bar fill
    const fillW=Math.max(2,BAR_W*conf);
    const bf=el('rect',{x:barX,y:y-5.5,width:lineMode==='dynamic'?0:fillW,height:BAR_H,rx:5.5,fill:v2.color,opacity:isW?'1':'.45'});
    if(lineMode==='dynamic'){
      const t0=+(tc*.87/tc).toFixed(5);
      bf.appendChild(smil('animate',{attributeName:'width',values:loopAnim?`0;0;${fillW.toFixed(1)};${fillW.toFixed(1)};0;0`:`0;0;${fillW.toFixed(1)};${fillW.toFixed(1)}`,keyTimes:loopAnim?`0;${t0};${(+t0+.07).toFixed(5)};.95;.98;1`:`0;${t0};${(+t0+.07).toFixed(5)};1`,dur:`${tc}s`,repeatCount:rep,fill:fz}));
    }
    svg.appendChild(bf);

    // Percentage
    const pct=el('text',{x:barX+BAR_W+7,y:y+4.5,'font-family':'JetBrains Mono,monospace','font-size':'10.5','font-weight':'700',fill:isW?v2.color:(isDark?'#334155':'#94a3b8'),opacity:lineMode==='dynamic'?'0':'1'});
    pct.textContent=(conf*100).toFixed(1)+'%';
    if(lineMode==='dynamic'){
      const t0=+(tc*.87/tc).toFixed(5);
      pct.appendChild(smil('animate',{attributeName:'opacity',values:loopAnim?`0;0;1;1;0;0`:`0;0;1;1`,keyTimes:loopAnim?`0;${t0};${(+t0+.05).toFixed(5)};.96;.99;1`:`0;${t0};${(+t0+.05).toFixed(5)};1`,dur:`${tc}s`,repeatCount:rep,fill:fz}));
    }
    svg.appendChild(pct);
  });
}

// ═══ Build Network ════════════════════════════════════════════
function buildNetwork(keepWeights=false){
  const nHidden=+document.getElementById('sl-layers').value;
  const nNodes =+document.getElementById('sl-nodes').value;
  const spIdx  =+document.getElementById('sl-speed').value-1;
  const layerDur=SPEED_MAP[spIdx];

  const nInput =+document.getElementById('sl-input').value;
  const nOutput=demoMode?4 :+document.getElementById('sl-output').value;

  document.getElementById('lv').value=nHidden;
  document.getElementById('nv').value=nNodes;
  document.getElementById('iv').value=nInput;
  document.getElementById('ov').value=nOutput;
  document.getElementById('spv').textContent=spIdx+1;

  const layers=[nInput,...Array(nHidden).fill(nNodes),nOutput];
  const total=layers.length, nSeg=total-1;

  if(!keepWeights){
    initWeights(layers);
    if(demoMode){
      const veh=VEHICLES[demoVehicleIdx];
      for(let ni=0;ni<nOutput;ni++)
        for(let pi=0;pi<nNodes;pi++)
          weights[`${total-2}-${pi}-${ni}`]=+((-0.3+veh.outWeights[ni]*.9)*(Math.random()*.6+.7)).toFixed(2);
    }
  }

  const fullPixels=demoMode?(colorMode?[...VEHICLES[demoVehicleIdx].R,...VEHICLES[demoVehicleIdx].G,...VEHICLES[demoVehicleIdx].B]:VEHICLES[demoVehicleIdx].pixels):null;
  const inputActs=demoMode?fullPixels.slice(0,nInput).concat(Array(Math.max(0,nInput-fullPixels.length)).fill(0)):undefined;
  const acts=computeActivations(layers,inputActs);

  if(demoMode){
    const veh=VEHICLES[demoVehicleIdx];
    const expW=veh.outWeights.map(w=>Math.exp(w*3));
    const sumE=expW.reduce((a,b)=>a+b,0);
    for(let i=0;i<nOutput;i++)acts[total-1][i]=expW[i]/sumE;
  }

  const outActs=acts[total-1];
  const tExt = demoMode ? layerDur * 1.5 : 0;
  const tc = nSeg*layerDur+layerDur*.8 + tExt;
  pc=0; rep=loopAnim?'indefinite':'1';

  const maxN=Math.max(...layers);
  // Scale node radius down smoothly as count increases: 16px at ≤8, ~3px at 100
  const NODE_R=Math.max(3,Math.min(16,Math.floor(220/(maxN*2.2))));
  // Vertical spacing: tighter at high counts, never smaller than 2×radius+1
  const VSP=Math.max(NODE_R*2+1,Math.min(62,Math.floor(680/(maxN+1))));
  // Auto-hide weight labels and pixel values above 20 nodes for readability
  const autoHideLabels=maxN>20;
  const PAD_Y=78;
  // In demo mode: leave room on left (input panel) and right (output panel)
  const PAD_X=demoMode?480:90;
  const RIGHT_PAD=demoMode?200:70;
  const xStep=Math.min(165,Math.max(90,(1400-PAD_X-RIGHT_PAD)/Math.max(1,total-1)));
  const W=PAD_X+xStep*(total-1)+RIGHT_PAD;
  const H=Math.max(560,VSP*(maxN+1)+PAD_Y*2);

  const svg=document.getElementById('nn-svg');
  svg.innerHTML='';svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

  // Defs
  const defs=el('defs',{});
  const glow=el('filter',{id:'glow',x:'-30%',y:'-30%',width:'160%',height:'160%'});
  glow.appendChild(el('feGaussianBlur',{in:'SourceGraphic',stdDeviation:'2.5',result:'blur'}));
  const fm1=el('feMerge',{});fm1.appendChild(el('feMergeNode',{in:'blur'}));fm1.appendChild(el('feMergeNode',{in:'SourceGraphic'}));glow.appendChild(fm1);defs.appendChild(glow);
  const glowLg=el('filter',{id:'glow-large',x:'-50%',y:'-50%',width:'200%',height:'200%'});
  glowLg.appendChild(el('feGaussianBlur',{in:'SourceGraphic',stdDeviation:'7',result:'blur'}));
  const fm2=el('feMerge',{});fm2.appendChild(el('feMergeNode',{in:'blur'}));fm2.appendChild(el('feMergeNode',{in:'SourceGraphic'}));glowLg.appendChild(fm2);defs.appendChild(glowLg);
  if(gradEdges){
    for(let li=0;li<total-1;li++){
      const c1=getNode(li,total),c2=getNode(li+1,total);
      const grad=el('linearGradient',{id:`eg${li}`,x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
      grad.appendChild(el('stop',{offset:'0%','stop-color':c1.stroke,'stop-opacity':'.6'}));
      grad.appendChild(el('stop',{offset:'100%','stop-color':c2.stroke,'stop-opacity':'.6'}));
      defs.appendChild(grad);
    }
  }
  svg.appendChild(defs);

  const pos=layers.map((n,li)=>{
    const x=PAD_X+li*xStep;
    return Array.from({length:n},(_,ni)=>({x,y:PAD_Y+VSP*(ni+1)+(VSP*(maxN-n))/2}));
  });

  // Demo input panel
  if(demoMode) drawVehiclePanel(svg,VEHICLES[demoVehicleIdx],pos,NODE_R,H,tc,nInput);

  // Edges
  const tip=document.getElementById('wt-tip');
  const arrivals=[{arriveAt:nSeg*layerDur}];
  const lc=lineColor(), visWt={};
  const edgeG=el('g',{class:'nn-edge-g'});

  for(let li=0;li<total-1;li++){
    for(let a=0;a<pos[li].length;a++){
      for(let b=0;b<pos[li+1].length;b++){
        const{x:ax,y:ay}=pos[li][a],{x:bx,y:by}=pos[li+1][b];
        const w=weights[`${li}-${a}-${b}`],sw=wSW(w),op=wOp(w);
        const stroke=gradEdges?`url(#eg${li})`:lc;
        const line=el('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke,'stroke-width':sw,fill:'none','stroke-opacity':op,class:'nn-edge'});
        edgeG.appendChild(line);
        const hit=el('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:'transparent','stroke-width':'12',style:'cursor:pointer'});
        const str=edgeStrength(acts,li,a,b);
        hit.addEventListener('mouseenter',ev=>{tip.textContent=`w: ${(w>=0?'+':'')+w.toFixed(2)}  signal: ${str.toFixed(3)}`;tip.style.opacity='1';gsap.to(line,{attr:{'stroke-width':parseFloat(sw)*2.4},duration:.25,ease:'back.out(2)',overwrite:true});});
        hit.addEventListener('mousemove',ev=>{tip.style.left=(ev.clientX+14)+'px';tip.style.top=(ev.clientY-28)+'px';});
        hit.addEventListener('mouseleave',()=>{tip.style.opacity='0';gsap.to(line,{attr:{'stroke-width':parseFloat(sw)},duration:.32,ease:'elastic.out(1,.5)',overwrite:true});});
        edgeG.appendChild(hit);
      }
    }
    visWt[li]=(showLabels&&lineMode==='dynamic'&&!autoHideLabels)?drawWeightLabels(svg,li,pos):new Set();
  }
  svg.appendChild(edgeG);

  // Signal dots
  if(lineMode==='dynamic'){
    for(let li=0;li<nSeg;li++){
      const dc=getNode(Math.min(li+1,total-1),total).stroke;
      const ws = (demoMode ? layerDur * 1.5 : 0) + li*layerDur, wd=layerDur;
      const connCount = pos[li].length * pos[li+1].length;
      const strThreshold = connCount > 100 ? 0.04 : (connCount > 40 ? 0.01 : 0);
      for(let a=0;a<pos[li].length;a++){
        for(let b=0;b<pos[li+1].length;b++){
          const str = edgeStrength(acts,li,a,b);
          if (str >= strThreshold) {
            const{x:ax,y:ay}=pos[li][a],{x:bx,y:by}=pos[li+1][b];
            if(animStyle==='dot'){
              addDot(svg,ax,ay,bx,by,dc,str,ws,wd,tc);
            } else if(animStyle==='dash') {
              const l=el('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:dc,'stroke-width':1.5,'stroke-dasharray':'4 8',opacity:Math.min(1,str*1.5).toFixed(2)});
              l.appendChild(smil('animate',{attributeName:'stroke-dashoffset',values:'12;0',dur:`${tc*0.3}s`,repeatCount:'indefinite'}));
              document.querySelector('.nn-edge-g').appendChild(l);
            } else {
              const l=el('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:dc,'stroke-width':3,opacity:'0'});
              const t0=+(ws/tc).toFixed(4), t1=+((ws+wd)/tc).toFixed(4);
              l.appendChild(smil('animate',{attributeName:'opacity',values:`0;${Math.min(1,str*2)};0`,keyTimes:`0;${t0};${t1}`,dur:`${tc}s`,repeatCount:'indefinite',fill:'freeze'}));
              document.querySelector('.nn-edge-g').appendChild(l);
            }
            if(showLabels&&visWt[li]&&visWt[li].has(`${a}-${b}`))
              addMathAnim(svg,ax,ay,bx,by,acts[li][a]||1,weights[`${li}-${a}-${b}`]||0,ws,wd,tc);
          }
        }
      }
    }
  }

  // Nodes
  for(let li=0;li<total;li++){
    const col=getNode(li,total),cx=pos[li][0].x,topY=pos[li][0].y;
    let name=li===0?'Input':li===total-1?'Output':`Hidden ${li}`;
    if(demoMode&&li===0)name='Pixel Features';
    if(demoMode&&li===total-1)name='Classifier';
    const pw=name.length*6.8+20;
    const pg=el('g',{class:'nn-label'});
    pg.appendChild(el('rect',{x:cx-pw/2,y:13,width:pw,height:22,rx:11,fill:isDark?'rgba(10,15,30,.9)':'#fff',stroke:col.stroke,'stroke-width':'1.4'}));
    const pt=el('text',{x:cx,y:28,'text-anchor':'middle','font-family':'Inter,sans-serif','font-size':'10.5','font-weight':'600',fill:col.text});
    pt.textContent=name;pg.appendChild(pt);

    // In demo mode, show actual tensor size as a small badge clearly below the layer pill
    if(demoMode&&li===0){
      const tensorSize=colorMode?'3×4×4=48':'4×4=16';
      const sw2=tensorSize.length*6+14;
      pg.appendChild(el('rect',{x:cx-sw2/2,y:38,width:sw2,height:15,rx:7.5,
        fill:isDark?'rgba(99,102,241,.18)':'rgba(99,102,241,.1)',
        stroke:isDark?'rgba(99,102,241,.4)':'rgba(99,102,241,.35)','stroke-width':'1'}));
      const sizeNote=el('text',{x:cx,y:49,'text-anchor':'middle',
        'font-family':'JetBrains Mono,monospace','font-size':'8','font-weight':'700',
        fill:isDark?'#818cf8':'#6366f1'});
      sizeNote.textContent=tensorSize;pg.appendChild(sizeNote);
    }

    svg.appendChild(pg);
    svg.appendChild(el('line',{x1:cx,y1:demoMode&&li===0?56:35,x2:cx,y2:topY-NODE_R-4,stroke:col.stroke,'stroke-width':'1',opacity:'.25','stroke-dasharray':'3 4'}));

    for(let ni=0;ni<pos[li].length;ni++){
      const{x,y}=pos[li][ni],r=NODE_R;
      if(li===total-1){
        drawOutputNode(svg,x,y,outActs[ni],col,r,lineMode==='dynamic'?arrivals:[],tc);
      } else {
        // Pixel intensity tint on input nodes in demo mode
        let outerFill=isDark?col.fill:'#fff',coreFill=col.core,coreOp='.88';
        if(demoMode&&li===0&&VEHICLES[demoVehicleIdx].pixels[ni]!==undefined){
          const pv=VEHICLES[demoVehicleIdx].pixels[ni];
          coreFill=VEHICLES[demoVehicleIdx].color;
          coreOp=(0.2+pv*.8).toFixed(2);
          outerFill=`rgba(${hexToRgb(VEHICLES[demoVehicleIdx].color)},${(.04+pv*.16).toFixed(2)})`;
        }
        const outer=el('circle',{cx:x,cy:y,r,fill:outerFill,stroke:col.stroke,'stroke-width':'2',class:'nn-node-outer'});
        const core=el('circle',{cx:x,cy:y,r:r*.44,fill:coreFill,opacity:coreOp,class:'nn-node-core'});
        svg.appendChild(outer);svg.appendChild(core);

        // Pixel value above input node (demo) — only when nodes are large enough
        if(demoMode&&li===0&&!autoHideLabels&&VEHICLES[demoVehicleIdx].pixels[ni]!==undefined){
          const pv=VEHICLES[demoVehicleIdx].pixels[ni];
          const pvl=el('text',{x,y:y-r-4,'text-anchor':'middle','font-family':'JetBrains Mono,monospace','font-size':'7.5','font-weight':'600',fill:VEHICLES[demoVehicleIdx].color,opacity:'.7'});
          pvl.textContent=pv.toFixed(2);svg.appendChild(pvl);
        }

        const hn=el('circle',{cx:x,cy:y,r:Math.max(r+5,8),fill:'transparent',style:'cursor:pointer'});
        hn.addEventListener('mouseenter',()=>{
          gsap.to(outer,{attr:{r:r*1.26,'stroke-width':3},duration:.28,ease:'back.out(2.5)',overwrite:true});
          gsap.to(core,{attr:{r:r*.62},duration:.28,ease:'back.out(2.5)',overwrite:true});
          const actVal=acts[li]&&acts[li][ni]!=null?acts[li][ni].toFixed(3):'—';
          tip.textContent=`act: ${actVal}`;tip.style.opacity='1';
        });
        hn.addEventListener('mousemove',ev=>{tip.style.left=(ev.clientX+14)+'px';tip.style.top=(ev.clientY-28)+'px';});
        hn.addEventListener('mouseleave',()=>{
          tip.style.opacity='0';
          gsap.to(outer,{attr:{r,'stroke-width':2},duration:.45,ease:'elastic.out(1,.5)',overwrite:true});
          gsap.to(core,{attr:{r:r*.44},duration:.45,ease:'elastic.out(1,.5)',overwrite:true});
        });
        svg.appendChild(hn);
        if(li===0&&lineMode==='dynamic')addFlash(svg,x,y,col,r,0,layerDur*.4,tc);
      }
    }
  }

  // Demo output panel
  if(demoMode) drawClassPanel(svg,VEHICLES[demoVehicleIdx],pos,NODE_R,H,tc);

  updateStats(layers,acts);
  if(entranceAnim)requestAnimationFrame(runEntranceAnimation);
}

// ═══ Init ═════════════════════════════════════════════════════
particleSys=new ParticleNetwork();
buildNetwork();
initCounters();
// Architecture counters are driven by stepCounter() — only speed slider remains
['sl-speed'].forEach(id=>document.getElementById(id).addEventListener('input',()=>buildNetwork(false)));
document.getElementById('sl-speed').addEventListener('input',()=>buildNetwork(true));
document.getElementById('btn-randomize').addEventListener('click',()=>buildNetwork(false));
