'use strict';
// ---------- magnifier ----------
let lens={on:false,x:0,y:0,shown:false};const LR=150,LM=5;
const lensBtn=document.getElementById('lens-btn');
function setLens(v){lens.on=v;lensBtn.classList.toggle('on',v);cv.classList.toggle('lensing',v);if(!v){lens.shown=false;}else{tip.style.display='none';pinned=false;pinI=-1;tip.classList.remove('pin');}}
lensBtn.onclick=()=>{setLens(!lens.on);if(lens.on&&!lens.shown){lens.x=view.x+W*view.s*0.42;lens.y=view.y+H*view.s*0.42;lens.shown=true;}};
let lensCov=0;const LNC=document.createElement('canvas'),lnx=LNC.getContext('2d');let lnKey='',lnT=0;
function drawLens(now){
  if(!lens.on||!lens.shown)return;
  const k3=[Math.round(lens.x),Math.round(lens.y),viewVer,Math.floor(t),dpr,tileLoads].join('|');
  if(k3!==lnKey||now-lnT>33){lnKey=k3;lnT=now;if(LNC.width!==cv.width||LNC.height!==cv.height){LNC.width=cv.width;LNC.height=cv.height;}
    lnx.setTransform(1,0,0,1,0,0);lnx.clearRect(0,0,LNC.width,LNC.height);renderLens(lnx,now);}
  const pad=LR+30,sx=Math.max(0,Math.floor((lens.x-pad)*dpr)),sy=Math.max(0,Math.floor((lens.y-pad)*dpr)),sw=Math.min(LNC.width-sx,Math.ceil(pad*2*dpr)),sh=Math.min(LNC.height-sy,Math.ceil(pad*2*dpr));
  if(sw>0&&sh>0){ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(LNC,sx,sy,sw,sh,sx,sy,sw,sh);ctx.setTransform(dpr,0,0,dpr,0,0);}
}
function renderLens(ctx,now){
  const V2={s:view.s*LM,x:lens.x-(lens.x-view.x)*LM,y:lens.y-(lens.y-view.y)*LM},b=[lens.x-LR,lens.y-LR,lens.x+LR,lens.y+LR];
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.beginPath();ctx.arc(lens.x,lens.y,LR+10,0,6.2832);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fill();
  ctx.beginPath();ctx.arc(lens.x,lens.y,LR,0,6.2832);ctx.fillStyle='#0a1019';ctx.fill();ctx.clip();
  const want=bmWant(V2.s),cov=drawTiles(ctx,V2,want,b);lensCov+=(cov-lensCov)*0.25;
  drawLand(ctx,V2,1-0.9*want*lensCov,b);
  drawMills(ctx,dpr,'blur',V2,gridList(V2,b),Math.sqrt(V2.s/fitS)*1.5,now,[b[0]-20,b[1]-20,b[2]+20,b[3]+20],0);
  const rg=ctx.createRadialGradient(lens.x,lens.y,LR*0.75,lens.x,lens.y,LR);rg.addColorStop(0,'rgba(5,8,13,0)');rg.addColorStop(1,'rgba(5,8,13,.55)');ctx.fillStyle=rg;ctx.fillRect(b[0],b[1],LR*2,LR*2);
  ctx.restore();ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.beginPath();ctx.arc(lens.x,lens.y,LR,0,6.2832);ctx.strokeStyle='rgba(236,228,210,.55)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.beginPath();ctx.arc(lens.x,lens.y,LR+5,0,6.2832);ctx.strokeStyle='rgba(236,228,210,.12)';ctx.lineWidth=1;ctx.stroke();
  ctx.font='400 10px "Inter Tight",sans-serif';ctx.fillStyle='rgba(236,228,210,.6)';ctx.textAlign='center';ctx.fillText('×'+Math.round(LM*view.s/fitS),lens.x,lens.y+LR+20);
}
// ---------- screen reader announcements ----------
const liveEl=document.getElementById('live');let lastAnnY=null,lastAnnT=0,annTimer=0;
function announce(txt){clearTimeout(annTimer);annTimer=setTimeout(()=>{liveEl.textContent=txt;},120);}
function yearSummary(y){const f=n=>fmt(at(n,y));return `${y}: ${f(cntW)} ${tr('cw')}, ${f(cntO)} ${tr('co')}, ${f(cntP)} ${tr('cp')}.`;}
