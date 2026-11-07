'use strict';
// ---------- counts (precomputed once per kind × standing) ----------
const NY=Y1-Y0+1,cntM=new Float32Array(NY),cntPol=new Float32Array(NY),cntP=new Float32Array(NY),cntW=new Float32Array(NY),cntO=new Float32Array(NY);let cmax=1,chartVer=0;
const TBL=Array.from({length:14*12},()=>new Float32Array(NY));
for(let i=0;i<N;i++){if(FL[i]&2)continue;const tb=TBL[(KD[i]*2+(FL[i]&1))*12+CT[i]];const y0=Math.max(Y0,B0[i]),y1=Math.min(Y1,E1[i]);
  for(let y=y0;y<=y1;y++){const a=pres(i,y);if(a)tb[y-Y0]+=a;}}
function computeCounts(){
  for(const a of [cntM,cntPol,cntP,cntW,cntO])a.fill(0);
  for(let k=0;k<7;k++){if(!kindOn[k])continue;for(let st=0;st<2;st++){if(mode===1&&!st||mode===2&&st)continue;for(let c=0;c<12;c++){if(!ctOn[c])continue;const tb=TBL[(k*2+st)*12+c];
    const dst=k>=5?cntP:(k===2||k===3)?cntO:cntW;for(let y=0;y<NY;y++){const v=tb[y];if(!v)continue;dst[y]+=v;if(k<5)cntM[y]+=v;if(k===0)cntPol[y]+=v;}}}}
  let mx=10;for(let y=0;y<NY;y++){if(cntM[y]>mx)mx=cntM[y];if(cntP[y]>mx)mx=cntP[y];}cmax=mx*1.08;chartVer++;
}
const at=(arr,tt)=>{const f=tt-Y0,i=Math.max(0,Math.min(NY-1,Math.floor(f))),j=Math.min(NY-1,i+1),u=Math.max(0,Math.min(1,f-i));return arr[i]*(1-u)+arr[j]*u;};

// ---------- chart (static curves cached; only cursor/readout per change) ----------
const chart=document.getElementById('chart'),cctx=chart.getContext('2d');let hoverYear=null;
const CB=document.createElement('canvas'),cbx=CB.getContext('2d');let cbKey='',chW=chart.clientWidth,chH=chart.clientHeight,chKey='';
let chL=0;new ResizeObserver(()=>{chW=chart.clientWidth;chH=chart.clientHeight;chL=chart.offsetLeft;chKey='';lastRo='';}).observe(chart);
// chart keeps full sharpness (cdpr) even if the map lowers its resolution (dpr)
const roEl=document.getElementById('readout');let lastRo='',roW=0,roX=-1;
function drawChart(){
  const w=chW,h=chH;if(!w||!h)return;
  const key=[Math.round(t*4),hoverYear,chartVer,lang,w,h].join('|');if(key===chKey)return;chKey=key;
  if(chart.width!==Math.round(w*cdpr)||chart.height!==Math.round(h*cdpr)){chart.width=Math.round(w*cdpr);chart.height=Math.round(h*cdpr);}
  const top=10,bot=h-22;const xs=y=>(y-Y0)/(Y1-Y0)*w,ys=v=>bot-(v/cmax)*(bot-top);
  const bk=[chartVer,w,h,lang,cdpr].join('|');
  if(bk!==cbKey){cbKey=bk;CB.width=chart.width;CB.height=chart.height;const c=cbx;c.setTransform(cdpr,0,0,cdpr,0,0);c.clearRect(0,0,w,h);
    c.fillStyle='rgba(236,228,210,.08)';c.fillRect(0,bot,w,1);
    c.font='400 10px "Inter Tight",sans-serif';c.fillStyle='#5d5e60';
    for(let y=1200;y<=2000;y+=(w<560?200:100)){c.fillRect(Math.round(xs(y)),bot,1,4);c.textAlign=y===1200?'left':'center';c.fillText(y,Math.round(xs(y)),h-5);}
    const area=(arr,g,stroke)=>{c.beginPath();c.moveTo(0,bot);for(let y=0;y<NY;y++)c.lineTo(xs(Y0+y),ys(arr[y]));c.lineTo(w,bot);c.closePath();c.fillStyle=g;c.fill();
      c.beginPath();for(let y=0;y<NY;y++)c.lineTo(xs(Y0+y),ys(arr[y]));c.strokeStyle=stroke;c.lineWidth=1.1;c.stroke();};
    const gO=c.createLinearGradient(0,top,0,bot);gO.addColorStop(0,'rgba(240,223,184,.26)');gO.addColorStop(1,'rgba(240,223,184,.03)');area(cntM,gO,'rgba(240,223,184,.8)');
    const gP=c.createLinearGradient(0,top,0,bot);gP.addColorStop(0,'rgba(111,200,208,.55)');gP.addColorStop(1,'rgba(111,200,208,.10)');area(cntPol,gP,'rgba(111,200,208,.95)');
    c.beginPath();for(let y=0;y<NY;y++)c.lineTo(xs(Y0+y),ys(cntP[y]));c.strokeStyle='rgba(232,150,74,.35)';c.lineWidth=4;c.stroke();c.strokeStyle='#e8964a';c.lineWidth=1.6;c.stroke();
    // before ~1600 the records are thin: hatch that stretch and say so
    const x6=xs(1600);c.save();c.beginPath();c.rect(0,top,x6,bot-top);c.clip();c.strokeStyle='rgba(236,228,210,.06)';c.lineWidth=1;
    for(let q=-h;q<x6+h;q+=6){c.beginPath();c.moveTo(q,bot);c.lineTo(q+(bot-top),top);c.stroke();}c.restore();
    c.fillStyle='rgba(236,228,210,.08)';c.fillRect(x6,top,1,bot-top);
    c.font='400 10px "Inter Tight",sans-serif';c.fillStyle='rgba(185,178,163,.75)';c.textAlign='center';c.fillText(tr('sparse'),xs(1400),top+16);}
  const c=cctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,chart.width,chart.height);c.drawImage(CB,0,0);c.setTransform(cdpr,0,0,cdpr,0,0);
  const cx=xs(t);c.fillStyle='rgba(5,7,12,.45)';c.fillRect(cx,0,w-cx,bot);
  const px=Math.round(cx*cdpr)/cdpr;c.fillStyle='rgba(236,228,210,.9)';c.fillRect(px-0.5,top,1,bot-top);
  c.beginPath();c.arc(cx,ys(at(cntM,t)),3.2,0,7);c.fill();
  c.fillStyle='#e8964a';c.beginPath();c.arc(cx,ys(at(cntP,t)),2.6,0,7);c.fill();
  // readout as real HTML text: crisp at any resolution, sits above the chart
  const ry=hoverYear!=null?hoverYear:Math.round(t),ri=Math.max(0,Math.min(NY-1,ry-Y0)),rx=xs(ry);
  const sh=cw<560,roHtml=`<b>${ry}</b><i> · </i><span class="p">${fmt(cntPol[ri])} ${tr(sh?'rPolS':'rPol')}</span><i> · </i><span class="o">${fmt(cntM[ri]-cntPol[ri])} ${tr(sh?'rOthS':'rOth')}</span>${cntP[ri]>=0.5?`<i> · </i><span class="g">${fmt(cntP[ri])} ${tr((sh?'pumpsS':'pumps')+(Math.round(cntP[ri])===1?'1':''))}</span>`:''}`;
  if(roHtml!==lastRo){lastRo=roHtml;roEl.innerHTML=roHtml;roW=roEl.offsetWidth;}
  const rw=roW;const tx=Math.round(Math.max(8-chL,Math.min(cw-8-rw-chL,Math.max(0,Math.min(w-rw,rx-rw/2))))+chL);if(tx!==roX){roX=tx;roEl.style.transform=`translateX(${tx}px)`;}
}
let scrub=false;
const yearAt=e=>{const r=chart.getBoundingClientRect();return Math.max(Y0,Math.min(Y1,Y0+(e.clientX-r.left)/r.width*(Y1-Y0)));};
chart.addEventListener('pointerdown',e=>{flightId++;if(!started)begin();scrub=true;chart.setPointerCapture(e.pointerId);t=yearAt(e);touchInput();});
chart.addEventListener('pointermove',e=>{if(scrub)t=yearAt(e);hoverYear=Math.round(yearAt(e));touchInput();});
chart.addEventListener('pointerup',()=>scrub=false);chart.addEventListener('pointercancel',()=>scrub=false);
chart.addEventListener('pointerleave',()=>hoverYear=null);
