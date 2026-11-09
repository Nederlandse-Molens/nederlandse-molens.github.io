'use strict';
// ---------- data ----------
const W=DATA.W,H=DATA.H,R=DATA.r,ME=DATA.m,NAMES=DATA.n,TBS=DATA.tb,VNL=DATA.vnl,VEN=DATA.ven,MV=DATA.mv,N=NAMES.length,SITE=DATA.site,SITES=DATA.sites,NX=Int16Array.from(DATA.next);
const X=new Float32Array(N),Yc=new Float32Array(N),B0=new Int16Array(N),B1=new Int16Array(N),E0=new Int16Array(N),E1=new Int16Array(N),KD=new Uint8Array(N),FL=new Uint8Array(N),PH=new Float32Array(N),SP=new Float32Array(N);
for(let i=0;i<N;i++){const o=i*8;X[i]=R[o];Yc[i]=R[o+1];B0[i]=R[o+2];B1[i]=R[o+3];E0[i]=Math.min(R[o+4],9999);E1[i]=Math.min(R[o+5],9999);KD[i]=R[o+6];FL[i]=R[o+7];PH[i]=(i*2.39996)%6.2832;SP[i]=0.75+((i*0.618)%1)*0.5;}
const CTN=11;const CT=new Uint8Array(N);
{const pats=[/stelling/,/grondzeiler/,/belt/,/standerd/,/wipmolen|^wip/,/spinnenkop/,/paltrok/,/tjasker/,/weidemolen|windmotor|bosman|windturbine/];
 for(let i=0;i<N;i++){const k=KD[i];if(!(k<2||k===4)){CT[i]=11;continue;}const tt=(VNL[ME[i*5]]||'').toLowerCase();let c=tt?9:10;
   for(let q=0;q<pats.length;q++)if(pats[q].test(tt)){c=q;break;}if(k===4&&c>=9)c=8;CT[i]=c;}}
const ctTot=new Array(CTN).fill(0);for(let i=0;i<N;i++)if(CT[i]<CTN&&!(FL[i]&64))ctTot[CT[i]]++;
const SPLACE=DATA.splace||[],SSIZE=DATA.ssize||[];
const COL=['#6fc8d0','#f0dfb8','#b59d7e','#6b98d8','#9fd36b','#e8964a','#8e9aa8'];
const GLYPH=['✕','✕','○','○','✕','■','■'];
const Y0=1200,Y1=2026;
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// which drained lake a mill or pumping station helped drain (RCE): record → lake index (1-based, as DM), source map
const DRL=DATA.drl||[],DRS=DATA.drs||[],RPOL=new Int16Array(N),RSRC=new Int16Array(N).fill(-1),POLREC={};
for(let q=0;q<DRL.length;q+=3){const i=DRL[q],k=DRL[q+1];RPOL[i]=k;RSRC[i]=DRL[q+2];(POLREC[k]=POLREC[k]||[]).push(i);}
// moves as record pairs: new site → the record it came from (for "moved here in …")
const MVL=DATA.mvl||[],MVFROM=new Map();for(let q=0;q<MVL.length;q+=2)MVFROM.set(MVL[q+1],MVL[q]);
let undOn=0;   // undated records (FL 64): outside the timeline, shown at every year when switched on
function pres(i,t){
  if(FL[i]&64)return undOn;
  if(t<B0[i])return 0;
  let a=B1[i]>B0[i]?Math.min(1,(t-B0[i])/(B1[i]-B0[i])):1;
  if(t>=E0[i]){a=E1[i]>E0[i]?a*Math.max(0,1-(t-E0[i])/(E1[i]-E0[i])):0;}
  return a;
}
const isGhost=(i,t)=>KD[i]<5&&!(FL[i]&17)&&t>=E1[i]&&t>B1[i]&&t<NX[i];
const fuzzy=(i,t)=>((FL[i]&4)&&t<B1[i])||((FL[i]&8)&&t>=E0[i]);

// ---------- filters ----------
const kindOn=[1,1,1,1,1,1,1];let mode=0;const VIS=new Uint8Array(N);
const ctOn=new Array(12).fill(1);
function applyFilter(){for(let i=0;i<N;i++){const st=FL[i]&1;VIS[i]=kindOn[KD[i]]&&ctOn[CT[i]]&&(mode===0||(mode===1&&st)||(mode===2&&!st))?1:0;}computeCounts();dirty=true;}
const kindTot=[0,0,0,0,0,0,0];let undTot=0;for(let i=0;i<N;i++){if(FL[i]&64)undTot++;else kindTot[KD[i]]++;}
