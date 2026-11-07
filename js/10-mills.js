// ---------- mills ----------
const cEl={w:document.getElementById('cW'),o:document.getElementById('cO'),p:document.getElementById('cP'),y:document.getElementById('year')};
const WIND=[];for(let i=0;i<N;i++){const k=KD[i];if((k<2||k===4)&&!(FL[i]&2))WIND.push(i);}
function gridList(V,b,filter){ // indices in grid cells under screen rect b
  const bx0=(b[0]-V.x)/V.s,by0=(b[1]-V.y)/V.s,bx1=(b[2]-V.x)/V.s,by1=(b[3]-V.y)/V.s,out=[];
  for(let gy=Math.max(0,Math.floor(by0/G));gy<=Math.min(GH-1,Math.floor(by1/G));gy++)for(let gx=Math.max(0,Math.floor(bx0/G));gx<=Math.min(GW-1,Math.floor(bx1/G));gx++){
    const cell=grid[gy*GW+gx];for(let j=0;j<cell.length;j++){const i=cell[j];if(!filter||filter(i))out.push(i);}}
  return out;}
const isWind=i=>{const k=KD[i];return (k<2||k===4)&&!(FL[i]&2);};
function mk(){return Array.from({length:7},()=>[null,new Path2D(),new Path2D(),new Path2D(),new Path2D()]);}
function mkA(){return Array.from({length:7},()=>[null,[],[],[],[]]);}
// part: 0 everything, 1 static items only (ghosts, stumps, rings, pumps, halos), 2 rotating windmills only
// c: main context (scale sc), fc: low-res context for uncertain items (or null)
function drawMills(c,sc,fc,V,list,z,now,bounds,part){
  const A=[mk(),mk()],D=[mkA(),mkA()],ghosts=new Path2D(),stumps=[new Path2D(),new Path2D()],halos=[];
  const r=Math.max(1.7,Math.min(16,2.7*z)),ring=z>2.2,gs=ring?Math.min(4.5,1+z*0.22):Math.max(1.1,1.1*z),detail=r>=5;
  const glow=Math.max(0,Math.min(1,(t-1900)/70)),hr=Math.max(5.5,Math.min(28,7*z)),rot=RM?0:now/1000*0.85;
  const [bx0,by0,bx1,by1]=bounds;let nF=0;const blurMode=fc==='blur';
  const bodies=[];
  const ghost=(x,y)=>{if(ring){ghosts.moveTo(x+gs,y);ghosts.arc(x,y,gs,0,6.2832);}else ghosts.rect(x-gs/2,y-gs/2,gs,gs);};
  const n=list?list.length:N;
  for(let j=0;j<n;j++){
    const i=list?list[j]:j;
    if(!VIS[i])continue;
    const x=V.x+X[i]*V.s,y=V.y+Yc[i]*V.s;
    if(x<bx0||y<by0||x>bx1||y>by1)continue;
    const k=KD[i],wind=(k<2||k===4)&&!(FL[i]&2);
    const lift=wind&&detail&&CT[i]<9?BASE[CT[i]]*r:0;
    if(part!==2&&lift){const a0=pres(i,t);if(a0>0.02)bodies.push(x,y-lift,i,a0,fuzzy(i,t)?1:0);}
    if(part===1&&wind){const a=pres(i,t);if(a<=0.02&&!(FL[i]&17)&&t>=E1[i]&&t>B1[i]&&t<NX[i])ghost(x,y);else if(a>0.02&&(FL[i]&1)&&glow>0&&!fuzzy(i,t))halos.push(x,y);continue;}
    if(part===2&&!wind)continue;
    const a=pres(i,t);
    if(a<=0.02){if(part!==2&&k<5&&!(FL[i]&17)&&t>=E1[i]&&t>B1[i]&&t<NX[i])ghost(x,y);continue;}
    const L=fuzzy(i,t)?1:0,q=Math.max(1,Math.round(a*4));nF+=L;
    if(part!==2&&(FL[i]&1)&&glow>0&&k<5&&!L)halos.push(x,y);
    if(k>=5){const s=(k===5?2.6:2.1)*Math.min(3,z);A[L][k][q].rect(x-s/2,y-s/2,s,s);continue;}
    if(FL[i]&2){const s=Math.max(2.2,r*0.45);stumps[L].moveTo(x+s/2,y);stumps[L].arc(x,y,s/2,0,6.2832);continue;}
    if(k===2||k===3){const rr=r*0.62;A[L][k][q].moveTo(x+rr,y);A[L][k][q].arc(x,y,rr,0,6.2832);continue;}
    const an=rot*SP[i]*(k===4?2.4:1)+PH[i];
    if(detail){D[L][k][q].push(x,y-lift,an);continue;}
    const ca=Math.cos(an),sa=Math.sin(an),p=A[L][k][q],dx=ca*r,dy=sa*r;
    p.moveTo(x-dx,y-dy);p.lineTo(x+dx,y+dy);p.moveTo(x+dy,y-dx);p.lineTo(x-dy,y+dx);
  }
  if(part!==2){if(ring){c.strokeStyle='rgba(150,162,178,.45)';c.lineWidth=1;c.stroke(ghosts);}else{c.fillStyle='rgba(125,138,155,.30)';c.fill(ghosts);}}
  if(bodies.length){const Rb=rBucket(r*sc);c.save();c.setTransform(1,0,0,1,0,0);
    for(let h=0;h<bodies.length;h+=5){const i=bodies[h+2],img=bodySprite(CT[i],KD[i],Rb);c.globalAlpha=bodies[h+3]*(bodies[h+4]?0.35:0.85);
      c.drawImage(img,Math.round(bodies[h]*sc-img.width/2),Math.round(bodies[h+1]*sc-img.anchorY));}
    c.restore();}
  if(halos.length){c.globalCompositeOperation='lighter';c.globalAlpha=0.2*glow;for(let h=0;h<halos.length;h+=2)c.drawImage(SPR,halos[h]-hr,halos[h+1]-hr,hr*2,hr*2);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  for(let L=0;L<2;L++){
    const lowres=L&&fc&&!blurMode,d=lowres?fc:c,dsc=lowres?FZS:sc,fade=L?(lowres?0.55:blurMode?0.6:0.35):0.82;
    d.setTransform(dsc,0,0,dsc,0,0);d.globalCompositeOperation=z<2?'source-over':'lighter';if(L&&blurMode)d.filter='blur(1.6px)';
    d.fillStyle='#c9bda6';d.globalAlpha=0.6*(L&&!lowres?0.5:1);d.fill(stumps[L]);
    for(let k=0;k<7;k++)for(let q=1;q<=4;q++){
      const p=A[L][k][q],al=q/4*fade;d.globalAlpha=al;
      if(k>=5){d.fillStyle=COL[k];d.fill(p);}
      else{d.strokeStyle=COL[k];d.lineWidth=(k===4?0.8:1.05)*Math.min(1.8,Math.max(1,z*0.7))*(lowres?1.5:1);d.stroke(p);
        const arr=D[L][k][q];if(arr.length){const useB=L&&blurMode,atl=useB?sailAtlasB(k,rBucket(r*dsc)):sailAtlas(k,rBucket(r*dsc)),S=atl.height,hw=S/2;d.globalAlpha=Math.min(1,al*1.15);d.setTransform(1,0,0,1,0,0);if(useB)d.filter='none';
          for(let h=0;h<arr.length;h+=3){const an=((arr[h+2]%QTR)+QTR)%QTR,ai=Math.round(an/QTR*NA)%NA;
            d.drawImage(atl,ai*S,0,S,S,Math.round(arr[h]*dsc-hw),Math.round(arr[h+1]*dsc-hw),S,S);}
          if(useB)d.filter='blur(1.6px)';
          d.setTransform(dsc,0,0,dsc,0,0);}}
    }
    d.globalAlpha=1;d.globalCompositeOperation='source-over';d.filter='none';
  }
  c.setTransform(sc,0,0,sc,0,0);
  return nF;
}
function drawMoves(c,V,b){
  if(mode===1||!kindOn.slice(0,5).some(v=>v))return;
  for(let m=0;m<MV.length;m+=5){const yv=MV[m+4];if(t<yv)continue;const age=t-yv;
    const x1=V.x+MV[m]*V.s,y1=V.y+MV[m+1]*V.s,x2=V.x+MV[m+2]*V.s,y2=V.y+MV[m+3]*V.s;
    if(Math.max(x1,x2)<b[0]||Math.min(x1,x2)>b[2]||Math.max(y1,y2)<b[1]||Math.min(y1,y2)>b[3])continue;
    const qx=(x1+x2)/2-(y2-y1)*0.3,qy=(y1+y2)/2+(x2-x1)*0.3;
    const al=age<14?0.9-age/14*0.62:0.28;c.strokeStyle=`rgba(240,223,184,${al})`;c.lineWidth=1;c.setLineDash([1.5,3]);
    c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo(qx,qy,x2,y2);c.stroke();c.setLineDash([]);
    if(age<14){const f=Math.min(1,age/3.5),px=(1-f)*(1-f)*x1+2*(1-f)*f*qx+f*f*x2,py=(1-f)*(1-f)*y1+2*(1-f)*f*qy+f*f*y2;
      c.globalCompositeOperation='lighter';c.globalAlpha=1-age/14;c.drawImage(SPR,px-9,py-9,18,18);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  }
}
