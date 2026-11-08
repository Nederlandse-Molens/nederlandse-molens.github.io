'use strict';
// ---------- UI text ----------
const chipsEl=document.getElementById('chips');
const ORDER=[0,1,4,2,3,5,6];
const NF={nl:new Intl.NumberFormat('nl-NL'),en:new Intl.NumberFormat('en-GB')};function fmt(n){return NF[lang==='nl'?'nl':'en'].format(Math.round(n));}
function renderUI(){
  applyText();if(typeof lastTxt!=='undefined')lastTxt.pOne=null;
  document.querySelectorAll('#lang button').forEach(b=>{b.classList.toggle('on',b.dataset.l===lang);b.setAttribute('aria-pressed',b.dataset.l===lang);});
  document.querySelectorAll('#mode button').forEach(b=>{b.classList.toggle('on',+b.dataset.m===mode);b.setAttribute('aria-pressed',+b.dataset.m===mode);});
  cv.setAttribute('aria-label',tr('aMap'));chart.setAttribute('aria-label',tr('aChart'));
  for(const [id,k] of [['zin','aZin'],['zout','aZout'],['zfit','aFit'],['bm-btn','aBm'],['lens-btn','aLens'],['speed','aSpeed'],['osm-area','aOsm']]){const el=document.getElementById(id);el.setAttribute('aria-label',tr(k));el.title=tr(k);}
  playBtn.setAttribute('aria-label',tr(playing?'aPause':'aPlay'));playBtn.title=tr(playing?'aPause':'aPlay');
  lastAnnY=null;
  chipsEl.innerHTML='';
  ORDER.forEach(k=>{const b=document.createElement('button');b.className='chip'+(kindOn[k]?'':' off');b.setAttribute('aria-pressed',!!kindOn[k]);
    b.innerHTML=`<span class="g" style="color:${COL[k]}">${GLYPH[k]}</span><span>${tr('K')[k]}</span><span class="n">${fmt(kindTot[k])}</span>`;
    b.onclick=()=>{kindOn[k]=kindOn[k]?0:1;if(!kindOn.some(v=>v)){kindOn[k]=1;}renderUI();applyFilter();};chipsEl.appendChild(b);});
  if(about.classList.contains('show'))document.getElementById('about-body').innerHTML=tr('aboutHtml');
  attrEl.innerHTML=tr('attrPDOK');osmA.title=tr('osmT');bmBtn.title=tr('bmT');
  const ctc=document.getElementById('ctchips');ctc.innerHTML='';
  [0,1,2,3,4,5,6,7,8,9,10].forEach(c=>{const b=document.createElement('button');b.className='chip'+(ctOn[c]?'':' off');b.setAttribute('aria-pressed',!!ctOn[c]);
    b.innerHTML=`<span class="g" style="color:var(--corn)">${c<9?'✕':'·'}</span><span>${tr('CT')[c]}</span><span class="n">${fmt(ctTot[c])}</span>`;
    b.onclick=()=>{ctOn[c]=ctOn[c]?0:1;if(!ctOn.slice(0,11).some(v=>v))ctOn[c]=1;renderUI();applyFilter();};ctc.appendChild(b);});
  const ub=document.getElementById('undated');ub.setAttribute('aria-pressed',!!undOn);document.getElementById('undN').textContent=fmt(undTot);document.getElementById('undated-note').classList.toggle('on',!!undOn);
  const pb=document.getElementById('polder');pb.setAttribute('aria-pressed',polderOn);document.getElementById('polder-note').classList.toggle('on',polderOn);
  const hl=document.getElementById('histlist');hl.innerHTML='';
  TOPSITES.forEach(si=>{const [b0,b1,up]=siteSpan(si),b=document.createElement('button');
    b.innerHTML=`<span class="p">${esc(SPLACE[si]||'?')}</span>${siteName(si)?`<span class="m">${esc(siteName(si))}</span>`:''}<span class="n">${tr('histN').replace('{n}',SSIZE[si])} · ${b0}–${up?tr('today'):b1}</span>`;
    b.onclick=()=>flyToSite(si);hl.appendChild(b);});
  curNote=null;if(typeof lastTxt!=='undefined')lastTxt.noteY=null;chKey='';
  if(pinned&&pinI>=0)tip.innerHTML=tipHTML(pinI);
}
document.querySelectorAll('#lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.l;try{localStorage.setItem('stilte-lang',lang);}catch(e){}renderUI();});
let savedKinds=null;
document.getElementById('undated').onclick=()=>{undOn=undOn?0:1;renderUI();applyFilter();};
document.getElementById('polder').onclick=()=>{polderOn=!polderOn;updateDM(true);if(!polderOn){hovEv=null;if(pinned&&pinI<0){pinned=false;tip.classList.remove('pin');tip.style.display='none';}}
  if(polderOn){savedKinds=kindOn.slice();[1,0,0,0,0,1,1].forEach((v,j)=>kindOn[j]=v);}else if(savedKinds){savedKinds.forEach((v,j)=>kindOn[j]=v||kindOn[j]);savedKinds=null;}
  lkey='';renderUI();applyFilter();};
const TOPSITES=SITES.map((m,si)=>si).filter(si=>SSIZE[si]>=4).sort((a,b)=>SSIZE[b]-SSIZE[a]||(Math.min(...SITES[a].map(j=>B1[j]))-Math.min(...SITES[b].map(j=>B1[j])))).slice(0,14);
function cleanName(n){return (n||'').replace(/\s*\(\s*\)/g,'').replace(/\s*\/\s*/g,' / ').trim();}
function siteSpan(si){const mem=SITES[si];let b0=9999,b1=0,up=false;for(const j of mem){b0=Math.min(b0,ME[j*5+2]||B1[j]);if(FL[j]&1)up=true;else b1=Math.max(b1,ME[j*5+3]||E1[j]);}return [b0,b1,up];}
let siteRun=null,siteTipY=null;
function siteLive(si){const mem=SITES[si],live=mem.filter(j=>pres(j,t)>0.15);return live.length?live[live.length-1]:-1;}
function siteName(si){const mem=SITES[si];for(let k=mem.length-1;k>=0;k--){const n=cleanName(NAMES[mem[k]]);if(n)return n;}return '';}
let flightId=0;
function flyToSite(si){const mem=SITES[si],fid=++flightId;if(siteRun)setPlaying(false);tip.style.display='none';pinned=false;pinI=-1;tip.classList.remove('pin');
  // make sure the mills of this site are not filtered out
  if(mem.some(j=>!VIS[j])){if(polderOn)document.getElementById('polder').click();mode=0;for(const j of mem){kindOn[KD[j]]=1;ctOn[CT[j]]=1;}renderUI();applyFilter();}let cx=0,cy=0;for(const j of mem){cx+=X[j];cy+=Yc[j];}cx/=mem.length;cy/=mem.length;
  const target=fitS*(BM.ok!==true||!BM.on?30:60),s0=view.s,x0=(cw/2-view.x)/view.s,y0=(ch/2-view.y)/view.s,T0=performance.now(),dur=RM?0:900;
  (function step(){if(fid!==flightId)return;const u=dur?Math.min(1,(performance.now()-T0)/dur):1,e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
    const s=s0*Math.pow(target/s0,e),bx=x0+(cx-x0)*e,by=y0+(cy-y0)*e;view.s=s;view.x=cw/2-bx*s;view.y=ch/2-by*s;viewVer++;userMoved=true;touchInput();
    if(u<1)requestAnimationFrame(step);else{
      const [b0,b1,up]=siteSpan(si),bl=Math.max(...mem.map(j=>ME[j*5+2]||B1[j])),y1=Math.min(Y1,up?bl+25:b1+3);
      if(RM){t=Math.max(Y0,Math.min(Y1,up?Y1:b1-1));siteRun=null;}
      else{t=Math.max(Y0,b0+0.5);setPlaying(true);siteRun={si,y1,v:Math.max(20,(y1-t)/10)};}
      let j=siteLive(si);if(j<0)j=mem[0];siteTipY=null;
      pinned=true;pinI=j;tip.innerHTML=tipHTML(j);tip.classList.add('pin');tip.style.display='block';placeTip(view.x+X[j]*view.s,view.y+Yc[j]*view.s);}})();
  if(cw<900)document.getElementById('panel').classList.remove('open');}
document.querySelectorAll('#mode button').forEach(b=>b.onclick=()=>{mode=+b.dataset.m;renderUI();applyFilter();});

const noteEl=document.getElementById('note');let curNote=null,noteTimer=0;
function setNote(y){const n=tr('notes').find(n=>y>=n[0]&&y<n[1]);const s=n?n[2]:'';if(s!==curNote){curNote=s;noteEl.style.opacity=0;clearTimeout(noteTimer);noteTimer=setTimeout(()=>{noteEl.textContent=s;noteEl.style.opacity=1;},450);}}
