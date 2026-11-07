'use strict';
// ---------- time ----------
let t=Y0,playing=false,spd=1,last=performance.now(),started=false;
const hy=parseInt(location.hash.slice(1));
const SPEEDS=[0.5,1,2,4],YPS=15;
const playBtn=document.getElementById('play'),icon=document.getElementById('playicon');
function setPlaying(v){playing=v;if(!v&&typeof siteRun!=='undefined')siteRun=null;icon.setAttribute('d',v?'M3 1.5h3v11H3zM8 1.5h3v11H8z':'M3 1.5v11l9-5.5z');if(typeof I18N!=='undefined'){playBtn.setAttribute('aria-label',tr(v?'aPause':'aPlay'));playBtn.title=tr(v?'aPause':'aPlay');}if(!v)lastAnnY=null;}
playBtn.onclick=()=>{if(t>=Y1)t=Y0;setPlaying(!playing);};
document.getElementById('speed').onclick=e=>{spd=SPEEDS[(SPEEDS.indexOf(spd)+1)%SPEEDS.length];e.currentTarget.textContent=spd+'×';};
addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeAbout();flightId++;if(siteRun)setPlaying(false);if(pinned){pinned=false;pinI=-1;tip.classList.remove('pin');tip.style.display='none';}if(lens.on)setLens(false);return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;const el=e.target,tg=el.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
  const onMap=el===cv,onChart=el===chart,onCtl=(tg==='BUTTON'||tg==='A')&&!onMap&&!onChart;
  if(e.code==='Space'){if(onCtl)return;e.preventDefault();if(!started)begin();else playBtn.click();return;}
  touchInput();const big=e.shiftKey;
  if(onChart){ // timeline as a slider
    let ny=null;if(e.key==='ArrowRight'||e.key==='ArrowUp')ny=Math.floor(t)+(big?10:1);else if(e.key==='ArrowLeft'||e.key==='ArrowDown')ny=Math.ceil(t)-(big?10:1);
    else if(e.key==='PageUp')ny=Math.floor(t)+10;else if(e.key==='PageDown')ny=Math.ceil(t)-10;else if(e.key==='Home')ny=Y0;else if(e.key==='End')ny=Y1;
    if(ny!=null){e.preventDefault();setPlaying(false);t=Math.max(Y0,Math.min(Y1,ny));return;}}
  if(onMap){ // pan with arrows, N = next mill
    const st=big?240:60;let dx=0,dy=0;if(e.key==='ArrowLeft')dx=st;else if(e.key==='ArrowRight')dx=-st;else if(e.key==='ArrowUp')dy=st;else if(e.key==='ArrowDown')dy=-st;
    if(dx||dy){e.preventDefault();view.x+=dx;view.y+=dy;userMoved=true;clampView();return;}
    if(e.key==='n'||e.key==='N'||e.key==='Enter'){e.preventDefault();nextMill(e.key==='N'&&big?-1:1);return;}}
  if(!onCtl&&!onMap&&!onChart){if(e.key==='ArrowRight'){t=Math.min(Y1,t+5);return;}if(e.key==='ArrowLeft'){t=Math.max(Y0,t-5);return;}}
  if(e.key==='+'||e.key==='=')animZoom(2);else if(e.key==='-')animZoom(0.5);else if(e.key==='0'){fitView();userMoved=false;}
  else if(e.key==='m'||e.key==='M')lensBtn.click();});
const rate=y=>(y>1540&&y<1680)||(y>1840&&y<1970)?0.55:(y<1450?1.6:1);

// intro
const intro=document.getElementById('intro');
function begin(){if(started)return;started=true;intro.classList.add('gone');setTimeout(()=>intro.style.display='none',RM?0:1300);if(!(hy>=Y0&&hy<=Y1)){t=Y0;setPlaying(!RM);}cv.focus({preventScroll:true});}
document.getElementById('go').onclick=begin;
if(hy>=Y0&&hy<=Y1){t=hy;started=true;intro.style.display='none';}

// about
const about=document.getElementById('about');
function closeAbout(){about.classList.remove('show');}
document.getElementById('about-btn').onclick=()=>{document.getElementById('about-body').innerHTML=tr('aboutHtml');about.classList.add('show');};
about.addEventListener('click',e=>{if(e.target===about||e.target.classList.contains('x'))closeAbout();});
document.getElementById('filter-btn').onclick=()=>document.getElementById('panel').classList.toggle('open');
