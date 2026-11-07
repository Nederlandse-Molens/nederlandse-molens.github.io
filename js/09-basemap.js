// ---------- basemap tiles: PDOK BRT-Achtergrondkaart ----------
const [GLON0,GLON1,GLAT0,GLAT1,GK]=DATA.geo;
const toLL=(x,y)=>[GLON0+x*(GLAT1-GLAT0)/(GK*H),GLAT1-y*(GLAT1-GLAT0)/H];
const toXY=(lon,lat)=>[(lon-GLON0)*GK/(GLAT1-GLAT0)*H,(GLAT1-lat)/(GLAT1-GLAT0)*H];
const BM={ok:null,on:true,cache:new Map(),fails:0,p:0};
const PROV=[
 {id:'pdok',maxZ:19,url:(z,x,y)=>`https://service.pdok.nl/kadaster/brt-achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/${z}/${x}/${y}.png`,dark:true}];
const TILE_MAX=300,RETRY_MS=15000;
function darken(im){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');
  // grey first (the 'grijs' map still has tinted sand, water and labels, which would invert to blue and orange)
  g.fillStyle='#808080';g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='luminosity';g.drawImage(im,0,0);
  g.globalCompositeOperation='difference';g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='multiply';g.fillStyle='rgb(150,160,180)';g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='destination-in';g.drawImage(im,0,0);
  // water back in blue: an SVG filter turns 'bluer than red' into alpha (works on cross-origin tiles, no pixel reads)
  if(WMASK){const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const h=m.getContext('2d');
    h.filter='url(#wmask)';h.drawImage(im,0,0);h.filter='none';h.globalCompositeOperation='source-in';h.fillStyle='rgb(20,38,62)';h.fillRect(0,0,m.width,m.height);
    g.globalCompositeOperation='source-over';g.drawImage(m,0,0);}
  return c;}
const WMASK=(()=>{try{if(!('filter' in CanvasRenderingContext2D.prototype))return false;
  const ns='http://www.w3.org/2000/svg',sv=document.createElementNS(ns,'svg');sv.setAttribute('width','0');sv.setAttribute('height','0');sv.style.position='absolute';
  sv.innerHTML='<filter id="wmask" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -14 0 14 0 -0.15"/></filter>';
  document.body.appendChild(sv);return true;}catch(e){return false;}})();
function getTile(z,x,y){
  const pv=PROV[BM.p];if(!pv||BM.ok===false)return null;const k=BM.p+'/'+z+'/'+x+'/'+y;let e=BM.cache.get(k);
  if(e){ if(e.failed&&performance.now()-e.failed>RETRY_MS){BM.cache.delete(k);e=null;} else {BM.cache.delete(k);BM.cache.set(k,e);return e;} } // LRU touch
  const im=new Image(),pI=BM.p;e={im,ok:false,failed:0};
  im.onload=()=>{if(pI!==BM.p)return;e.im=pv.dark?darken(im):im;e.ok=true;dirtyTiles=true;tileLoads++;if(BM.ok!==true){BM.ok=true;updBM();}};
  im.onerror=()=>{if(pI!==BM.p)return;e.failed=performance.now();
    if(BM.ok!==true&&++BM.fails>=3){BM.fails=0;BM.p++;BM.cache.clear();if(BM.p>=PROV.length){BM.ok=false;if(view.s>fitS*40)animZoom(fitS*40/view.s);}updBM();}};
  im.src=pv.url(z,x,y);BM.cache.set(k,e);
  while(BM.cache.size>TILE_MAX){BM.cache.delete(BM.cache.keys().next().value);}
  return e;}
let dirtyTiles=false,tileLoads=0;const TL=document.createElement('canvas'),tlx=TL.getContext('2d');let tlKey='',tlCov=0;
const lat2ty=(lat,n)=>{const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n;};
const ty2lat=(ty,n)=>Math.atan(Math.sinh(Math.PI*(1-2*ty/n)))*180/Math.PI;
function bmWant(s){return BM.on&&BM.ok!==false?Math.max(0,Math.min(1,(s/fitS-3.5)/3)):0;}
// draws the tiles covering screen rect b; returns the fraction of that rect actually covered by loaded imagery
function drawTiles(c,V,alpha,b){
  if(alpha<=0.01||!PROV[BM.p])return 0;
  const pv=PROV[BM.p],pxPerLon=GK/(GLAT1-GLAT0)*H*V.s;
  let Z=Math.max(6,Math.min(pv.maxZ,Math.round(Math.log2(360*pxPerLon/256))));
  const [lonA,latA]=toLL((b[0]-V.x)/V.s,(b[1]-V.y)/V.s),[lonB,latB]=toLL((b[2]-V.x)/V.s,(b[3]-V.y)/V.s);
  let n,tx0,tx1,ty0,ty1;
  for(;;){n=2**Z;tx0=Math.floor((lonA+180)/360*n);tx1=Math.floor((lonB+180)/360*n);ty0=Math.floor(lat2ty(latA,n));ty1=Math.floor(lat2ty(latB,n));
    if((tx1-tx0+1)*(ty1-ty0+1)<=400||Z<=6)break;Z--;}
  const pk=BM.p,miss=c===tlx?(BM.miss=[]):[];let tot=0,cov=0;
  c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=true;
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
    const [ax,ay]=toXY(tx/n*360-180,ty2lat(ty,n)),[bx,by]=toXY((tx+1)/n*360-180,ty2lat(ty+1,n));
    // integer edges so neighbouring tiles abut exactly (no seams, no overlap)
    const x0=Math.round(V.x+ax*V.s),y0=Math.round(V.y+ay*V.s),x1=Math.round(V.x+bx*V.s),y1=Math.round(V.y+by*V.s);
    tot++;const e=getTile(Z,tx,ty);
    if(e&&e.ok){c.drawImage(e.im,x0,y0,x1-x0,y1-y0);cov++;continue;}
    // stand-ins while this tile loads (or after it failed): a coarser parent, else the four finer children
    let done=false;
    for(let up=1;up<=6&&!done;up++){const f=2**up,px=Math.floor(tx/f),py=Math.floor(ty/f),pe=BM.cache.get(pk+'/'+(Z-up)+'/'+px+'/'+py);
      if(pe&&pe.ok){const sz=(pe.im.naturalWidth||pe.im.width)/f;c.drawImage(pe.im,(tx-px*f)*sz,(ty-py*f)*sz,sz,sz,x0,y0,x1-x0,y1-y0);cov++;done=true;}}
    if(!done&&Z<pv.maxZ){const ch4=[];for(let q=0;q<4;q++){const ce=BM.cache.get(pk+'/'+(Z+1)+'/'+(tx*2+(q&1))+'/'+(ty*2+(q>>1)));if(ce&&ce.ok)ch4.push(ce);else break;}
      if(ch4.length===4){const mx=(x0+x1)/2,my=(y0+y1)/2;ch4.forEach((ce,q)=>{const ax0=q&1?mx:x0,ay0=q>>1?my:y0;c.drawImage(ce.im,ax0,ay0,(q&1?x1:mx)-ax0,(q>>1?y1:my)-ay0);});cov++;done=true;}}
    // nothing to show yet: ask for a much coarser tile (one request covers 16 of these) and let the landscape fill the gap
    if(!done){if(Z-2>=6)getTile(Z-2,tx>>2,ty>>2);miss.push(x0,y0,x1-x0,y1-y0);}
  }
  c.restore();return tot?cov/tot:0;
}
const bmBtn=document.getElementById('bm-btn'),osmA=document.getElementById('osm-area'),attrEl=document.getElementById('attr');
function updBM(){bmBtn.style.display=BM.ok===false?'none':'grid';bmBtn.classList.toggle('on',BM.on);attrEl.innerHTML=tr('attrPDOK');}
bmBtn.onclick=()=>{BM.on=!BM.on;updBM();if(!BM.on&&view.s>fitS*40)animZoom(fitS*40/view.s);};
let osmVer=-1;
function updOSMLink(){if(osmVer===viewVer)return;osmVer=viewVer;const lz=Math.max(6,Math.min(19,Math.round(Math.log2(360*GK/(GLAT1-GLAT0)*H*view.s/256))));
  const [lon,lat]=toLL((cw/2-view.x)/view.s,(ch*0.45-view.y)/view.s);osmA.href=`https://www.openstreetmap.org/#map=${lz}/${lat.toFixed(5)}/${lon.toFixed(5)}`;}
const osmPt=i=>{const [lon,lat]=toLL(X[i],Yc[i]);return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lon.toFixed(5)}#map=18/${lat.toFixed(5)}/${lon.toFixed(5)}`;};

// ---------- landscape drawing: only the visible part of the raster ----------
function landPair(){let a=KEYS[0],b=KEYS[0],f=0;if(t>=KEYS[3]){a=b=KEYS[3];}else if(t>KEYS[0]){for(let k=0;k<3;k++)if(t>=KEYS[k]&&t<KEYS[k+1]){a=KEYS[k];b=KEYS[k+1];f=(t-a)/(b-a);}}return [a,b,f];}
function drawLand(c,V,al,b){
  if(landReady<4||al<=0.01)return;const [a,bb,f]=landPair();
  const sx0=Math.max(0,Math.floor((b[0]-V.x)/V.s)-1),sy0=Math.max(0,Math.floor((b[1]-V.y)/V.s)-1),sx1=Math.min(W,Math.ceil((b[2]-V.x)/V.s)+1),sy1=Math.min(H,Math.ceil((b[3]-V.y)/V.s)+1);
  if(sx1<=sx0||sy1<=sy0)return;
  const dx=V.x+sx0*V.s,dy=V.y+sy0*V.s,dw=(sx1-sx0)*V.s,dh=(sy1-sy0)*V.s;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality=V.s/fitS>4?'low':'medium';
  c.globalAlpha=al;c.drawImage(LAND[a],sx0,sy0,sx1-sx0,sy1-sy0,dx,dy,dw,dh);
  if(f>0){c.globalAlpha=f*al;c.drawImage(LAND[bb],sx0,sy0,sx1-sx0,sy1-sy0,dx,dy,dw,dh);}
  if(dmReady){c.globalAlpha=Math.max(al,polderOn?0.85:0);if(c.globalAlpha>0.01)c.drawImage(DMC,sx0,sy0,sx1-sx0,sy1-sy0,dx,dy,dw,dh);}
  c.restore();
}
const LC=document.createElement('canvas'),lcx=LC.getContext('2d');let lkey='';
function drawLandCached(al){
  if(landReady<4||al<=0.01)return;const [a,b,f]=landPair();
  const key=[a,b,Math.round(f*30),viewVer,dpr,polderOn,dmVer].join('|');
  if(key!==lkey){lkey=key;if(LC.width!==cv.width||LC.height!==cv.height){LC.width=cv.width;LC.height=cv.height;}
    lcx.setTransform(dpr,0,0,dpr,0,0);lcx.clearRect(0,0,cw,ch);drawLand(lcx,view,1,[0,0,cw,ch]);}
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=al;ctx.drawImage(LC,0,0);ctx.globalAlpha=1;ctx.setTransform(dpr,0,0,dpr,0,0);
}
