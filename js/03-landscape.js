'use strict';
// ---------- landscape ----------
// 0 outside,1 sea,2 salt marsh,3 peat,4 reclaimed,5 clay/river,6 town,7 dunes,8 sand,9 inland water
const PAL=[null,null,[26,31,36],[40,35,27],[46,54,38],[31,34,35],[58,50,43],[56,51,38],[28,30,33],[13,25,40]];
const KEYS=[1250,1500,1850,2000],LAND={},MASK={};let polderOn=false;let landReady=0;
const DM=DATA.dm||[],DMC=document.createElement('canvas');DMC.width=W;DMC.height=H;const dmx=DMC.getContext('2d');
let dmReady=false,dmVer=0,dmData=null,dmPix=null,dmBox=null,dmState=new Int8Array(DM.length+1).fill(-1);
// state: 0 no override (before 1500, or 'before 1550' with unknown year), 1 lake, 2 drained
const dmWant=(j,tt)=>{const d=DM[j-1];if(tt<1500)return 0;if(d[2])return tt<1550?0:2;return tt<d[1]?1:2;};
// lakes that were open sea before they were drained (Zuiderzee polders) get no 'lake' patch: the sea shows through
const CLS={},seaLake=new Uint8Array(DM.length+1);let seaDone=false;
function markSeaLakes(){if(seaDone||!dmReady||!CLS[1850])return;const c=CLS[1850];
  for(let k=1;k<=DM.length;k++){const l=dmPix[k];let n=0;for(let q=0;q<l.length;q++){const v=c[l[q]];if(v===1||v===0)n++;}if(l.length&&n/l.length>0.3)seaLake[k]=1;}
  seaDone=true;updateDM(true);dirty=true;}
const DMCOL={lake:[13,25,40],land:[40,47,34],landP:[52,112,118],lakeP:[16,36,58]};
function startLakes(){ // started from 13-main.js once every script is loaded
{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);
  const px=x.getImageData(0,0,W,H).data,cnt=new Int32Array(DM.length+1);for(let j=0;j<W*H;j++){const v=px[j*4];if(v)cnt[v]++;}
  dmPix=[];dmBox=[];for(let k=0;k<=DM.length;k++){dmPix.push(new Int32Array(cnt[k]));dmBox.push([W,H,0,0]);}
  const fill=new Int32Array(DM.length+1);
  for(let j=0;j<W*H;j++){const v=px[j*4];if(!v)continue;dmPix[v][fill[v]++]=j;const bx=dmBox[v],xx=j%W,yy=(j/W)|0;if(xx<bx[0])bx[0]=xx;if(yy<bx[1])bx[1]=yy;if(xx>bx[2])bx[2]=xx;if(yy>bx[3])bx[3]=yy;}
  dmData=dmx.createImageData(W,H);dmReady=true;updateDM(true);markSeaLakes();};im.src=DATA.dmimg;}
}
function updateDM(all){
  if(!dmReady)return;const d=dmData.data;let changed=false,x0=W,y0=H,x1=0,y1=0;
  for(let k=1;k<=DM.length;k++){const w=dmWant(k,t);if(!all&&w===dmState[k])continue;dmState[k]=w;changed=true;
    const col=w===0||(w===1&&seaLake[k])?null:w===1?(polderOn?DMCOL.lakeP:DMCOL.lake):(polderOn?DMCOL.landP:DMCOL.land),list=dmPix[k];
    for(let q=0;q<list.length;q++){const o=list[q]*4;if(col){d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;}else d[o+3]=0;}
    const bx=dmBox[k];if(bx[0]<x0)x0=bx[0];if(bx[1]<y0)y0=bx[1];if(bx[2]>x1)x1=bx[2];if(bx[3]>y1)y1=bx[3];}
  if(changed&&x1>=x0){dmx.putImageData(dmData,0,0,x0,y0,x1-x0+1,y1-y0+1);dmVer++;}
}
function startLandscape(){ // started from 13-main.js once every script is loaded
KEYS.forEach(k=>{const im=new Image();im.onload=()=>{
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);
  const d=x.getImageData(0,0,W,H),p=d.data,cls=new Uint8Array(W*H);for(let j=0;j<W*H;j++)cls[j]=p[j*4];CLS[k]=cls;if(k===1850)setTimeout(markSeaLakes,0);
  const isLand=v=>v>=2&&v!==9;

  // colourise in slices of rows so the page stays responsive while the four maps are prepared
  let y=0;(function slice(){const yEnd=Math.min(H,y+110);
    for(;y<yEnd;y++)for(let xx=0;xx<W;xx++){const j=y*W+xx,v=cls[j],o=j*4;const q=PAL[v];
      if(!q){p[o+3]=0;continue;}
      const edge=isLand(v)&&((xx+1<W&&cls[j+1]===1)||(xx>0&&cls[j-1]===1)||(y+1<H&&cls[j+W]===1)||(y>0&&cls[j-W]===1));
      if(edge){p[o]=150;p[o+1]=146;p[o+2]=128;p[o+3]=255;}else{p[o]=q[0];p[o+1]=q[1];p[o+2]=q[2];p[o+3]=255;}}
    if(y<H){setTimeout(slice,0);return;}
    x.putImageData(d,0,0);const c2=document.createElement('canvas');c2.width=W;c2.height=H;const x2=c2.getContext('2d');x2.filter='blur(0.7px)';x2.drawImage(c,0,0);LAND[k]=c2;landReady++;dirty=true;})();};im.src=DATA.img[k];});
}

// glow sprite
const SPR=document.createElement('canvas');SPR.width=SPR.height=64;{const g=SPR.getContext('2d'),rg=g.createRadialGradient(32,32,0,32,32,32);rg.addColorStop(0,'rgba(255,226,170,.9)');rg.addColorStop(.25,'rgba(255,214,150,.35)');rg.addColorStop(1,'rgba(255,200,130,0)');g.fillStyle=rg;g.fillRect(0,0,64,64);}

// lattice-sail sprites per mill kind (drawn once, rotated per mill)
const SPK=[];const SPH=48,SPR_R=44;
function makeSail(col){const c=document.createElement('canvas');c.width=c.height=SPH*2;const g=c.getContext('2d');g.translate(SPH,SPH);g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';
  for(let m=0;m<4;m++){g.save();g.rotate(m*Math.PI/2);
    g.lineWidth=2.4;g.beginPath();g.moveTo(0,0);g.lineTo(SPR_R,0);g.stroke();
    const a=11,b=SPR_R,w=10;g.globalAlpha=0.16;g.fillRect(a,0,b-a,w);g.globalAlpha=1;
    g.lineWidth=1.1;g.strokeRect(a,0,b-a,w);
    g.lineWidth=0.8;for(let k=1;k<7;k++){const xx=a+(b-a)*k/7;g.beginPath();g.moveTo(xx,0);g.lineTo(xx,w);g.stroke();}
    g.beginPath();g.moveTo(a,w/2);g.lineTo(b,w/2);g.stroke();g.restore();}
  g.beginPath();g.arc(0,0,3,0,6.2832);g.fill();return c;}
[0,1,2,3,4].forEach(k=>SPK[k]=makeSail(COL[k]));
const NA=48,QTR=Math.PI/2,RB=[4,5,6,7,8,9,10,12,14,16,18,21,24,28,32,36];
const rBucket=R=>{let best=RB[0];for(const v of RB)if(Math.abs(v-R)<Math.abs(best-R))best=v;return best;};
const ATL=new Map();
function sailAtlas(k,Rd){const key=k*100+Rd;let c=ATL.get(key);
  if(c){ATL.delete(key);ATL.set(key,c);return c;}
  const S=Math.ceil(Rd*2+6);c=document.createElement('canvas');c.width=S*NA;c.height=S;const g=c.getContext('2d');
  g.strokeStyle=COL[k];g.fillStyle=COL[k];g.lineCap='round';
  const a=Rd*0.26,w=Rd*0.23,lat=Rd>=15?Math.max(3,Math.round(Rd/6)):0;
  for(let ai=0;ai<NA;ai++){g.save();g.translate(ai*S+S/2,S/2);g.rotate(ai/NA*QTR);
    for(let m=0;m<4;m++){g.save();g.rotate(m*QTR);
      g.lineWidth=Math.max(1,Rd*0.06);g.beginPath();g.moveTo(0,0);g.lineTo(Rd,0);g.stroke();
      g.globalAlpha=0.2;g.fillRect(a,0,Rd-a,w);g.globalAlpha=1;
      g.lineWidth=Math.max(0.7,Rd*0.028);g.strokeRect(a,0,Rd-a,w);
      if(lat){g.lineWidth=0.6;for(let q=1;q<lat;q++){const xx=a+(Rd-a)*q/lat;g.beginPath();g.moveTo(xx,0);g.lineTo(xx,w);g.stroke();}}
      g.restore();}
    g.beginPath();g.arc(0,0,Math.max(1.2,Rd*0.07),0,6.2832);g.fill();g.restore();}
  ATL.set(key,c);while(ATL.size>48)ATL.delete(ATL.keys().next().value);return c;}
// pre-blurred copy for mills with an uncertain date (blurring once instead of per draw)
// simple elevation pictograms of the mill body under the sails, one per construction type
const BODY=new Map();const BASE=[1.72,1.25,1.48,1.42,1.32,0.98,1.16,1.25,1.42];
function bodySprite(ct,k,Rd){const key=(ct*10+k)*100+Rd;let c=BODY.get(key);if(c)return c;
  const Wd=Math.ceil(Rd*2.4)+6,top=Math.ceil(Rd*0.45)+3,Hd=top+Math.ceil(Rd*1.75)+4;c=document.createElement('canvas');c.width=Wd;c.height=Hd;
  const g=c.getContext('2d'),R=Rd,col=COL[k];g.translate(Wd/2,top);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(1,R*0.045);g.lineJoin='round';
  const shape=(pts)=>{g.beginPath();pts.forEach(([x,y],j)=>j?g.lineTo(x*R,y*R):g.moveTo(x*R,y*R));g.closePath();g.globalAlpha=0.16;g.fill();g.globalAlpha=0.8;g.stroke();};
  const line=(x1,y1,x2,y2)=>{g.globalAlpha=0.8;g.beginPath();g.moveTo(x1*R,y1*R);g.lineTo(x2*R,y2*R);g.stroke();};
  const cap=()=>{g.globalAlpha=0.8;g.beginPath();g.ellipse(0,0.12*R,0.21*R,0.16*R,0,Math.PI,0);g.stroke();};
  if(ct===0){shape([[-.18,.14],[.18,.14],[.4,1.72],[-.4,1.72]]);line(-.72,1.0,.72,1.0);for(const q of [-.6,-.3,.3,.6])line(q,1.0,q,1.08);cap();}
  else if(ct===1){shape([[-.18,.14],[.18,.14],[.39,1.25],[-.39,1.25]]);cap();}
  else if(ct===2){shape([[-.17,.14],[.17,.14],[.35,1.18],[-.35,1.18]]);g.globalAlpha=0.16;g.beginPath();g.ellipse(0,1.48*R,1.0*R,0.32*R,0,Math.PI,0);g.fill();g.globalAlpha=0.8;g.stroke();cap();}
  else if(ct===3){shape([[-.3,-.12],[.3,-.12],[.3,.72],[-.3,.72]]);line(0,.72,0,1.3);line(-.35,1.42,0,1.18);line(.35,1.42,0,1.18);line(-.42,1.42,.42,1.42);}
  else if(ct===4){shape([[-.22,-.08],[.22,-.08],[.22,.48],[-.22,.48]]);shape([[-.09,.48],[.09,.48],[.38,1.32],[-.38,1.32]]);}
  else if(ct===5){shape([[-.17,-.06],[.17,-.06],[.17,.34],[-.17,.34]]);shape([[-.07,.34],[.07,.34],[.28,.98],[-.28,.98]]);}
  else if(ct===6){g.beginPath();g.moveTo(-.5*R,1.1*R);g.lineTo(-.5*R,.1*R);g.quadraticCurveTo(0,-.32*R,.5*R,.1*R);g.lineTo(.5*R,1.1*R);g.closePath();g.globalAlpha=0.16;g.fill();g.globalAlpha=0.8;g.stroke();line(-.62,1.16,.62,1.16);}
  else if(ct===7){line(0,0,.95,1.25);line(.35,.75,.6,.5);line(.55,1.25,.55,.85);}
  else if(ct===8){line(0,0,-.24,1.42);line(0,0,.24,1.42);line(-.12,.7,.12,.7);line(-.18,1.05,.18,1.05);line(-.12,.7,.18,1.05);}
  c.anchorY=top;BODY.set(key,c);if(BODY.size>400)BODY.delete(BODY.keys().next().value);return c;}
function sailAtlasB(k,Rd){const key=50000+k*100+Rd;let c=ATL.get(key);if(c){ATL.delete(key);ATL.set(key,c);return c;}
  const src=sailAtlas(k,Rd);c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.filter='blur(1.5px)';g.drawImage(src,0,0);
  ATL.set(key,c);while(ATL.size>48)ATL.delete(ATL.keys().next().value);return c;}

// ---------- a drained lake and the mills/pumping stations that drained it (hovered or pinned record) ----------
let lgK=0,lgC=null;
function drawLakeGroup(c,V,k){
  if(dmReady&&k!==lgK){lgK=k;const bx=dmBox[k],w=bx[2]-bx[0]+1,h=bx[3]-bx[1]+1;lgC=null;
    if(w>0&&h>0){lgC=document.createElement('canvas');lgC.width=w;lgC.height=h;const g=lgC.getContext('2d'),im=g.createImageData(w,h),d=im.data,l=dmPix[k];
      for(let q=0;q<l.length;q++){const x=l[q]%W-bx[0],y=((l[q]/W)|0)-bx[1],o=(y*w+x)*4;d[o]=236;d[o+1]=228;d[o+2]=210;d[o+3]=70;}
      g.putImageData(im,0,0);}}
  // the lake comes from a coarse raster (one pixel is about 120 m): fade it out once its pixels would show as blocks, the rings carry on
  const fa=Math.min(1,Math.max(0,(6-V.s)/4));
  if(lgC&&lgK===k&&fa>0.01){const bx=dmBox[k];c.save();c.globalAlpha=fa;c.imageSmoothingEnabled=true;c.drawImage(lgC,V.x+bx[0]*V.s,V.y+bx[1]*V.s,lgC.width*V.s,lgC.height*V.s);c.restore();}
  const mem=POLREC[k];if(!mem)return;c.save();c.lineWidth=1.1;
  for(const j of mem){if(!VIS[j])continue;const on=pres(j,t)>0.02,px=V.x+X[j]*V.s,py=V.y+Yc[j]*V.s;
    if(px<-10||py<-10||px>cw+10||py>ch+10)continue;
    c.globalAlpha=on?0.95:0.4;c.strokeStyle='rgb(236,228,210)';c.beginPath();c.arc(px,py,KD[j]>=5?8:7,0,6.2832);c.stroke();}
  c.restore();}
