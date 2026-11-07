'use strict';
// ---------- frame loop ----------
let skey='',sF=0,mainCov=0,lastTxt={},odd=false,ftAcc=0,ftN=0,lastDprDrop=0;
const setTxt=(el,v)=>{if(lastTxt[el.id]!==v){lastTxt[el.id]=v;el.textContent=v;}};
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.1,(now-last)/1000);
  // idle: nothing moving but the sails, so 30 fps is plenty
  const active=playing||scrub||now-lastInput<400;
  if(!active){odd=!odd;if(odd)return;}
  last=now;
  // adaptive resolution: if the device can't keep up at high DPI, step down once in a while
  if(active&&dt>0&&dt<0.1&&!document.hidden){ftAcc+=dt;ftN++;if(ftN>=45){const avg=ftAcc/ftN;ftAcc=0;ftN=0;if(avg>0.038&&dpr>1&&now-lastDprDrop>4000&&now>5000){dpr=Math.max(1,dpr-0.5);lastDprDrop=now;sizeCanvases();}else if(avg<0.019&&dpr<baseDpr&&now-lastDprDrop>15000){dpr=Math.min(baseDpr,dpr+0.5);lastDprDrop=now;sizeCanvases();}}}
  if(scrub&&siteRun)setPlaying(false);
  if(playing&&!scrub){if(siteRun){const sr=siteRun;t+=dt*sr.v;if(t>=sr.y1){t=sr.y1;setPlaying(false);}
      if(pinned&&SITE[pinI]===sr.si&&Math.floor(t)!==siteTipY){siteTipY=Math.floor(t);const j=siteLive(sr.si);if(j>=0)pinI=j;tip.innerHTML=tipHTML(pinI);}}
    else{t+=dt*YPS*spd*rate(t);if(t>=Y1){t=Y1;setPlaying(false);}}}
  if(dmReady)updateDM(false);
  const ty=Math.floor(t),zv=Math.sqrt(view.s/fitS),full=[0,0,cw,ch],cull=[-20,-20,cw+20,ch+20];
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,ch);
  // basemap + landscape (landscape only fades once tiles really cover the screen)
  const want=bmWant(view.s);let cov=0;
  if(want>0.01){const k2=[viewVer,dpr,tileLoads,BM.p,BM.on].join('|');
    if(k2!==tlKey){tlKey=k2;if(TL.width!==cv.width||TL.height!==cv.height){TL.width=cv.width;TL.height=cv.height;}
      tlx.setTransform(dpr,0,0,dpr,0,0);tlx.clearRect(0,0,cw,ch);tlCov=drawTiles(tlx,view,1,full);}
    cov=tlCov;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=want;ctx.drawImage(TL,0,0);ctx.globalAlpha=1;ctx.setTransform(dpr,0,0,dpr,0,0);}
  mainCov+=(cov-mainCov)*0.2;
  drawLandCached(1-0.9*want*mainCov);
  // where tiles are still missing, show the landscape at full strength instead of a dark hole
  if(want>0.01&&BM.miss&&BM.miss.length&&landReady>=4&&mainCov>0.05){ctx.setTransform(1,0,0,1,0,0);const m=BM.miss;
    for(let q=0;q<m.length;q+=4){const sx=Math.max(0,Math.round(m[q]*dpr)),sy=Math.max(0,Math.round(m[q+1]*dpr)),ex=Math.min(LC.width,Math.round((m[q]+m[q+2])*dpr)),ey=Math.min(LC.height,Math.round((m[q+1]+m[q+3])*dpr));
      if(ex>sx&&ey>sy){ctx.globalAlpha=want;ctx.fillStyle='rgb(20,38,62)';ctx.fillRect(sx,sy,ex-sx,ey-sy);ctx.globalAlpha=1;ctx.drawImage(LC,sx,sy,ex-sx,ey-sy,sx,sy,ex-sx,ey-sy);}}
    ctx.setTransform(dpr,0,0,dpr,0,0);}
  const attrOn=want*mainCov>0.05;if(lastTxt.attr!==attrOn){lastTxt.attr=attrOn;attrEl.classList.toggle('on',attrOn);}
  updOSMLink();
  // static layer: ghosts, stumps, rings, pumps, halos — rebuilt only when year/view/filter change
  const zoomedIn=view.s/fitS>2.5;
  const key=[ty,viewVer,chartVer,dpr,cw,ch].join('|');
  if(key!==skey){skey=key;sctx.setTransform(dpr,0,0,dpr,0,0);sctx.clearRect(0,0,cw,ch);
    drawMills(sctx,dpr,null,view,zoomedIn?gridList(view,cull):null,zv,now,cull,1);}
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(SC,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  drawMoves(ctx,view,cull);
  // rotating windmills: every frame, only those on screen
  if(sF){fctx.setTransform(1,0,0,1,0,0);fctx.clearRect(0,0,fz.width,fz.height);}
  const useFz=view.s/fitS<6;
  sF=drawMills(ctx,dpr,useFz?fctx:'blur',view,zoomedIn?gridList(view,cull,isWind):WIND,zv,now,cull,2);
  if(sF&&useFz){ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.42;ctx.drawImage(fz,0,0,cv.width,cv.height);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.setTransform(dpr,0,0,dpr,0,0);}
  if(pinI>=0&&!(siteRun&&SITE[pinI]===siteRun.si)&&(!VIS[pinI]||(pres(pinI,t)<0.02&&!isGhost(pinI,t)))){pinned=false;pinI=-1;tip.classList.remove('pin');tip.style.display='none';}
  if(pinI>=0){const px=view.x+X[pinI]*view.s,py=view.y+Yc[pinI]*view.s,pr=RM?11:10+2*Math.sin(now/300);ctx.beginPath();ctx.arc(px,py,pr,0,6.2832);ctx.strokeStyle='rgba(236,228,210,.85)';ctx.lineWidth=1.2;ctx.stroke();}
  drawEvents(ctx,view);drawDrainLabels(ctx,view);
  drawLens(now);
  // text: national counts (not just what's on screen), written only when they change
  setTxt(cEl.y,String(ty));setTxt(cEl.w,fmt(at(cntW,t)));setTxt(cEl.o,fmt(at(cntO,t)));setTxt(cEl.p,fmt(at(cntP,t)));
  if(ty!==lastTxt.noteY){lastTxt.noteY=ty;setNote(ty);chart.setAttribute('aria-valuenow',ty);chart.setAttribute('aria-valuetext',yearSummary(ty));}
  if(!playing&&!scrub&&ty!==lastAnnY&&now-lastAnnT>900){lastAnnY=ty;lastAnnT=now;if(started)announce(yearSummary(ty)+' '+(curNote||''));}
  drawChart();
}
renderUI();applyFilter();setPlaying(false);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{cbKey='';chKey='';lastRo='';});
startLakes();startLandscape();
requestAnimationFrame(frame);
window.__stilte={set:(y,m,ks,l)=>{setPlaying(false);t=y;if(m!=null)mode=m;if(ks)ks.forEach((v,j)=>kindOn[j]=v);if(l)lang=l;renderUI();applyFilter();},zoom:(x,y,f)=>{touchInput();zoomAt(x,y,f);},focus:(lon,lat,f)=>{const [x,y]=toXY(lon,lat);view.s=fitS*f;view.x=cw/2-x*view.s;view.y=ch/2-y*view.s;viewVer++;userMoved=true;},state:()=>({bm:BM.ok,on:BM.on,n:BM.cache.size,p:BM.p,dpr,cov:mainCov,rel:view.s/fitS})};
