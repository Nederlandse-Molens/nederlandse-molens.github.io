'use strict';
// ---------- pan / zoom ----------
let drag=null;const pts=new Map();let pinch=null;
const MAXZ=300;
cv.addEventListener('wheel',e=>{flightId++;e.preventDefault();touchInput();const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?ch:1);zoomAt(e.clientX,e.clientY,Math.exp(-dy*(e.ctrlKey?0.01:0.0016)));},{passive:false});
function zoomAt(mx,my,f){const mz=BM.ok===false||!BM.on?40:MAXZ;const ns=Math.max(fitS*0.7,Math.min(view.s*f,Math.max(fitS*mz,f<1?view.s:0)));const k=ns/view.s;view.x=mx-(mx-view.x)*k;view.y=my-(my-view.y)*k;view.s=ns;userMoved=true;clampView();}
cv.addEventListener('dblclick',e=>zoomAt(e.clientX,e.clientY,2.2));
function animZoom(f){const cx=cw<900?cw/2:400+(cw-760)/2,cy=ch*0.45;let n=0;const st=Math.pow(f,1/12);(function step(){touchInput();zoomAt(cx,cy,st);if(++n<12)requestAnimationFrame(step);})();}
document.getElementById('zin').onclick=()=>animZoom(2);document.getElementById('zout').onclick=()=>animZoom(0.5);document.getElementById('zfit').onclick=()=>{fitView();userMoved=false;};
cv.addEventListener('pointerdown',e=>{flightId++;touchInput();pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};drag=null;}
  else drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y,moved:false,lens:lens.on&&e.pointerType!=='mouse'};if(lens.on){lens.x=e.clientX;lens.y=e.clientY;lens.shown=true;}cv.classList.add('drag');});
addEventListener('pointermove',e=>{
  if(pts.has(e.pointerId))pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pts.size===2){touchInput();const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt((a.x+b.x)/2,(a.y+b.y)/2,d/pinch.d);pinch.d=d;return;}
  if(lens.on&&e.target===cv&&(!drag||drag.lens)){lens.x=e.clientX;lens.y=e.clientY;lens.shown=true;touchInput();}
  if(drag&&!drag.lens){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;if(drag.moved){touchInput();view.x=drag.vx+dx;view.y=drag.vy+dy;userMoved=true;clampView();if(lens.on){lens.x=e.clientX;lens.y=e.clientY;}}}
  else if(e.pointerType==='mouse'||lens.on)hover(e);});
function endPointer(e,cancel){pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!cancel&&drag&&!drag.moved&&e.target===cv)click(e);drag=null;cv.classList.remove('drag');}
addEventListener('pointerup',e=>endPointer(e,false));addEventListener('pointercancel',e=>endPointer(e,true));

// ---------- hover ----------
const G=8,GW=Math.ceil(W/G),GH=Math.ceil(H/G),grid=Array.from({length:GW*GH},()=>[]);
for(let i=0;i<N;i++){const gx=Math.floor(X[i]/G),gy=Math.floor(Yc[i]/G);if(gx>=0&&gy>=0&&gx<GW&&gy<GH)grid[gy*GW+gx].push(i);}
const tip=document.getElementById('tip');let pinned=false;
function nearest(mx,my){
  let bx=(mx-view.x)/view.s,by=(my-view.y)/view.s,rad=9/view.s,S=view.s,z=Math.sqrt(view.s/fitS);
  if(lens.on&&lens.shown&&Math.hypot(mx-lens.x,my-lens.y)<LR){const lbx=(lens.x-view.x)/view.s,lby=(lens.y-view.y)/view.s;bx=lbx+(mx-lens.x)/(view.s*LM);by=lby+(my-lens.y)/(view.s*LM);rad=12/(view.s*LM);S=view.s*LM;z*=1.5;}
  // when zoomed in, a windmill is drawn as a pictogram standing on its point: the hit area covers the whole mill, sails included
  const r=Math.max(1.7,Math.min(16,2.7*z)),detail=r>=5,sail=Math.max(rad,1.2*r/S),reach=detail?(1.8*r)/S+sail:rad;
  let best=-1,bd=Infinity;
  for(let gy=Math.floor((by-reach)/G);gy<=Math.floor((by+reach)/G);gy++)for(let gx=Math.floor((bx-reach)/G);gx<=Math.floor((bx+reach)/G);gx++){
    if(gx<0||gy<0||gx>=GW||gy>=GH)continue;
    for(const i of grid[gy*GW+gx]){if(!VIS[i])continue;if(pres(i,t)<0.15&&!isGhost(i,t))continue;
      const k=KD[i],wind=(k<2||k===4)&&!(FL[i]&2),lb=wind&&detail&&CT[i]<9&&pres(i,t)>=0.15?BASE[CT[i]]*r/S:0;
      // distance to the segment from foot to hub
      const dy=Math.max(Yc[i]-lb,Math.min(Yc[i],by)),d=(X[i]-bx)**2+(dy-by)**2,lim=lb?sail:rad;
      if(d<lim*lim){const score=d/(lim*lim);if(score<bd){bd=score;best=i;}}}
  }
  return best;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const V=j=>(lang==='nl'?VNL:VEN)[j]||'';
function tipHTML(i){
  const o=i*5,ti=ME[o],fi=ME[o+1],by=ME[o+2],ey=ME[o+3],st=ME[o+4],k=KD[i];
  const name=cleanName(NAMES[i])||tr('unnamed');let kind,when;
  if(k>=5){kind=`${tr('pump')}${V(ti)?' · '+esc(V(ti).toLowerCase()):''}${V(fi)?'<br>'+esc(V(fi)):''}`;when=`${by?tr('founded')+' '+by:tr('byu')} · ${tr('pst')[st]||''}`;}
  else{const a=V(ti),b=V(fi);kind=esc([a,b].filter((s,j,arr)=>s&&arr.indexOf(s)===j).join(' · ')||tr('K')[k])+(FL[i]&32?` · <b>${tr('windwater')}</b>`:'');
    const bpart=by===1832&&st<2?tr('already'):by?`${tr('built')} ${by}`:tr('byu');
    if(st===10)when=`${bpart} · ${tr('replaced').replace('{y}',ey)}`;
    else if(st===0)when=`${bpart} · ${ey?tr('gone')+' '+ey:tr('goneu')}`;
    else if(st===1)when=`${bpart} · ${tr('moved')} ${ey}`;
    else if(st===4)when=`${tr('rebuiltIn')} ${by} · ${tr('still')}`;
    else when=`${bpart} · ${st===3?tr('remains'):tr('still')}`;}
  const tb=TBS[i];
  const am=tb&&k<5?` · <a target="_blank" rel="noopener" href="https://zoeken.allemolens.nl/tenbruggencatenummer/${encodeURIComponent(tb.trim())}">allemolens.nl ↗</a>`:tb&&k>=5?` · <a target="_blank" rel="noopener" href="https://gemalen.nl/gemaal_detail.asp?gem_id=${encodeURIComponent(tb.trim())}">gemalen.nl ↗</a>`:'';
  const link=`<div class="l">${pinned?'':tr('pin')+' · '}<a target="_blank" rel="noopener" href="${osmPt(i)}">OpenStreetMap ↗</a>${am}</div>`;
  let hist='';const si=SITE[i];
  if(si>=0){const rows=SITES[si].map(j=>{const o2=j*5,b=ME[o2+2],e=ME[o2+3],s2=ME[o2+4],nm=cleanName(NAMES[j])||tr('unnamed');
      const up=FL[j]&1,yrs=up?(s2===4?`${tr('rebuiltShort')} ${b}`:`${b||'?'}–`):s2===1?`${b||'?'}–${e} (${tr('movedShort')})`:`${b||'?'}–${e||'?'}`;
      return `<div class="h${j===i?' me':''}"><span>${esc(nm)}</span><span>${yrs}</span></div>`;}).join('');
    const W2=232,x=y=>4+(y-Y0)/(Y1-Y0)*(W2-8),mem=SITES[si],rh=6,Hh=mem.length*rh+16;
    let svg=`<svg width="${W2}" height="${Hh}" viewBox="0 0 ${W2} ${Hh}" aria-hidden="true">`;
    for(const yy of [1400,1600,1800,2000])svg+=`<line x1="${x(yy)}" y1="0" x2="${x(yy)}" y2="${Hh-12}" stroke="rgba(236,228,210,.08)"/><text x="${x(yy)}" y="${Hh-2}" font-size="8" fill="#6a6b6c" text-anchor="middle">${yy}</text>`;
    mem.forEach((j,r2)=>{const o2=j*5,b=ME[o2+2]||B1[j],s2=ME[o2+4],up=FL[j]&1,e=up?Y1:(ME[o2+3]||E1[j]),unk=!up&&!ME[o2+3];
      svg+=`<rect x="${x(Math.max(Y0,b))}" y="${r2*rh+2}" width="${Math.max(2,x(Math.min(Y1,e))-x(Math.max(Y0,b)))}" height="3.5" rx="1.5" fill="${COL[KD[j]]}" opacity="${j===i?1:.55}"${unk?' stroke-dasharray="2 2"':''}/>`;});
    svg+=`<line x1="${x(t)}" y1="0" x2="${x(t)}" y2="${Hh-12}" stroke="rgba(236,228,210,.6)"/></svg>`;
    hist=`<div class="hs"><div class="hh">${tr('onSite')}${SPLACE[si]?' · '+esc(SPLACE[si]):''}</div>${svg}${rows}</div>`;}
  return `<div class="t">${esc(name)}</div><div class="k">${kind}</div><div class="w">${esc(when)}</div>${hist}${link}`;
}
function placeTip(x,y){if(lens.on){x+=LR*0.72;y-=LR*0.72;}const floor=ch-(cw<900?150:180),tx=Math.min(x+16,cw-tip.offsetWidth-10),ty=Math.min(y+16,floor-tip.offsetHeight);tip.style.left=Math.max(8,tx)+'px';tip.style.top=Math.max(8,ty)+'px';}
function hover(e){
  if(pinned)return;
  if(e.target!==cv){tip.style.display='none';return;}
  const evd=eventAt(e.clientX,e.clientY),i=evd?-1:nearest(e.clientX,e.clientY),ev=evd||(i<0?nearestEvent(e.clientX,e.clientY):null);
  if(ev!==hovEv){hovEv=ev;dirty=true;}
  if(ev){if(hovI!==-2||tip.dataset.ev!==ev.nl){hovI=-2;tip.dataset.ev=ev.nl;tip.innerHTML=evHTML(ev);tip.style.display='block';}placeTip(e.clientX,e.clientY);cv.style.cursor='pointer';return;}
  if(i<0){tip.style.display='none';cv.style.cursor='';return;}
  if(i!==hovI||tip.style.display!=='block'||t!==hovT){hovI=i;hovT=t;tip.innerHTML=tipHTML(i);tip.style.display='block';}placeTip(e.clientX,e.clientY);cv.style.cursor='pointer';
}
let hovI=-1,hovT=null;
let pinI=-1,nmList=[],nmPos=-1,nmKey='';
function nextMill(dir){
  const key=[Math.floor(t),viewVer,chartVer].join('|');
  if(key!==nmKey){nmKey=key;nmPos=dir<0?0:-1;const cx=cw/2,cy=ch/2;
    nmList=gridList(view,[0,0,cw,ch],i=>VIS[i]&&pres(i,t)>0.15).map(i=>[i,(view.x+X[i]*view.s-cx)**2+(view.y+Yc[i]*view.s-cy)**2]).sort((a,b)=>a[1]-b[1]).slice(0,400).map(a=>a[0]);}
  if(!nmList.length){announce(lang==='nl'?'Geen molens in beeld.':'No mills in view.');return;}
  nmPos=(nmPos+dir+nmList.length)%nmList.length;const i=nmList[nmPos];
  pinned=true;pinI=i;tip.innerHTML=tipHTML(i);tip.classList.add('pin');tip.style.display='block';
  placeTip(view.x+X[i]*view.s,view.y+Yc[i]*view.s);announce([...tip.querySelectorAll('.t,.k,.w')].map(n=>n.innerText.replace(/\s+/g,' ').trim()).join('. '));}
function click(e){
  if(pinned){pinned=false;pinI=-1;tip.classList.remove('pin');tip.style.display='none';return;}
  const ev=eventAt(e.clientX,e.clientY);
  if(ev){pinned=true;pinI=-1;hovEv=ev;tip.innerHTML=evHTML(ev);tip.classList.add('pin');tip.style.display='block';placeTip(e.clientX,e.clientY);return;}
  const i=nearest(e.clientX,e.clientY);if(i<0)return;
  pinned=true;pinI=i;tip.innerHTML=tipHTML(i);tip.classList.add('pin');tip.style.display='block';placeTip(e.clientX,e.clientY);
}
