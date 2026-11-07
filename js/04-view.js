// ---------- canvas & view ----------
const cv=document.getElementById('map'),ctx=cv.getContext('2d');
const FZS=1/3;                      // uncertain layer is drawn at 1/3 resolution and upscaled: a cheap, soft blur
const fz=document.createElement('canvas'),fctx=fz.getContext('2d');
const SC=document.createElement('canvas'),sctx=SC.getContext('2d');   // cached static layer
let baseDpr=Math.min(window.devicePixelRatio||1,2),dpr=baseDpr,cdpr=baseDpr,cw=0,ch=0,view={s:1,x:0,y:0},fitS=1,dirty=true,viewVer=0;
let lastInput=0;const touchInput=()=>{lastInput=performance.now();};
function sizeCanvases(){
  for(const c of [cv,SC]){c.width=Math.round(cw*dpr);c.height=Math.round(ch*dpr);}
  fz.width=Math.ceil(cw*FZS);fz.height=Math.ceil(ch*FZS);
  cv.style.width=cw+'px';cv.style.height=ch+'px';viewVer++;
}
function fitParams(){const narrow=cw<900,short=ch<560;
  const top=narrow?(short?10:Math.min(320,Math.round(ch*0.36))):22,bottom=narrow?(short?120:150):176;
  const availW=Math.max(120,narrow?cw-20:cw-760),availH=Math.max(100,ch-top-bottom);
  const s=Math.max(0.01,Math.min(availW/W,availH/H));return {s,x:narrow?(cw-W*s)/2:400+(cw-760-W*s)/2,y:top};}
function fitView(){view=fitParams();viewVer++;}
function onResize(){
  const oldS=fitS,ocw=cw,och=ch;
  // keep what the user is looking at: centre point and relative zoom survive a resize
  const cx=ocw?(ocw/2-view.x)/view.s:0,cy=och?(och/2-view.y)/view.s:0,rel=oldS?view.s/oldS:1;
  const bd=Math.min(window.devicePixelRatio||1,2);if(bd!==baseDpr){baseDpr=bd;cdpr=bd;if(typeof chKey!=='undefined'){chKey='';cbKey='';}}dpr=baseDpr;
  cw=innerWidth;ch=innerHeight;sizeCanvases();
  const f=fitParams();fitS=f.s;
  if(!ocw||Math.abs(rel-1)<1e-3&&!userMoved){view=f;}else{view.s=fitS*rel;view.x=cw/2-cx*view.s;view.y=ch/2-cy*view.s;}
  viewVer++;
}
let userMoved=false;
function clampView(){
  const m=80,mw=W*view.s,mh=H*view.s;
  view.x=Math.min(cw-m,Math.max(m-mw,view.x));view.y=Math.min(ch-m,Math.max(m-mh,view.y));viewVer++;
}
addEventListener('resize',onResize);onResize();
