'use strict';
// ---------- floods and depoldering (curated; year, place, short text) ----------
const EV=[
 {yr:1404,lon:3.43,lat:51.43,k:'f',nl:'Wulpen: eiland verdwijnt',en:'Wulpen: island vanishes',tn:'Al eeuwen afgekalfd; de stormvloed van 1404 geeft het eiland de genadeslag. Het jaar is niet zeker.',te:'Eaten away for a century; the storm surge of 1404 deals the final blow. The year is uncertain.'},
 {yr:1421,lon:4.80,lat:51.74,k:'f',nl:'Sint-Elisabethsvloed',en:"St Elisabeth's flood",tn:'De Grote of Zuid-Hollandse Waard loopt onder; hier ontstaat de Biesbosch.',te:'The Grote Waard floods; the Biesbosch forms here.'},
 {yr:1509,lon:7.15,lat:53.27,k:'f',nl:'Dollard: op zijn grootst',en:'Dollard: at its largest',tn:'Na de Cosmas- en Damianusvloed reikt de zee tot bij Winschoten. Ruim 25 dorpen verdrinken.',te:'After the Cosmas and Damian flood the sea reaches almost to Winschoten. Over 25 villages drown.'},
 {yr:1530,lon:4.15,lat:51.44,k:'f',nl:'Sint-Felixvloed',en:"St Felix's flood",tn:'Het oosten van Zuid-Beveland verdrinkt; de stad Reimerswaal raakt later verlaten.',te:'Eastern Zuid-Beveland drowns; the town of Reimerswaal is later abandoned.'},
 {yr:1584,lon:4.17,lat:51.35,k:'f',nl:'Saeftinghe: verdronken land',en:'Saeftinghe: drowned land',lbl:'1570–84',tn:'Overstroomd bij de Allerheiligenvloed van 1570, in 1584 voorgoed onder water gezet in de Tachtigjarige Oorlog. Sindsdien schor en slik.',te:"Flooded by the All Saints' flood of 1570, then inundated for good in 1584 during the Eighty Years' War. Salt marsh ever since."},
 {yr:1629,lon:5.12,lat:52.30,k:'d',nl:'Naardermeer: weer onder water',en:'Naardermeer: flooded again',tn:'Net drooggemaakt, maar weer onder water gezet voor de verdediging van Naarden. In 1883–86 nog eens drooggemalen, en weer opgegeven.',te:'Just drained, then flooded again to defend Naarden. Pumped dry once more in 1883–86, and given up again.'},
 {yr:1682,lon:3.985,lat:51.725,k:'f',nl:'Bommenede: verdronken',en:'Bommenede: drowned',tn:'Stadje en polder op Schouwen gaan op 26 januari 1682 onder; in 1684 verlaten.',te:'Town and polder on Schouwen go under on 26 January 1682; abandoned in 1684.'},
 {yr:1682,lon:4.09,lat:51.40,k:'f',nl:'Valkenisse: verdronken',en:'Valkenisse: drowned',tn:'Dorp ten zuidoosten van Waarde, verloren aan de Westerschelde.',te:'A village south-east of Waarde, lost to the Western Scheldt.'},
 {yr:1715,lon:4.15,lat:51.32,k:'f',nl:'Namen: verdronken',en:'Namen: drowned',lbl:'1715–17',tn:'Dorp en polders bij Hulst verdwijnen in 1715–1717. Het huidige Nieuw-Namen is naar het verdronken dorp genoemd.',te:'Village and polders near Hulst vanish in 1715–1717. Today\'s Nieuw-Namen is named after it.'},
 {yr:1802,lon:3.4385,lat:51.3857,k:'f',nl:'Zwarte Polder: verdronken',en:'Zwarte Polder: drowned',tn:'Bedijkt in 1623, bij een februaristorm in 1802 door de zee teruggenomen. Nu slik, schor en duin.',te:'Embanked in 1623, taken back by the sea in a February storm in 1802. Now mudflat, marsh and dune.'},
 {yr:1894,lon:3.70,lat:51.605,k:'f',nl:'Sophiapolder: vergaan',en:'Sophiapolder: lost',tn:'Polder op Noord-Beveland sinds 1775, overstroomd op 22/23 december 1894 en nooit herdijkt. Nu de Sophiahaven.',te:'A polder on Noord-Beveland since 1775, flooded on 22/23 December 1894 and never re-diked. Now the Sophiahaven.'},
 {yr:1925,lon:4.76,lat:52.045,k:'f',nl:'Broekvelden en Vettenbroek: ringdijk breekt',en:'Broekvelden and Vettenbroek: ring dike breaks',tn:'Drooggelegd in 1892, op oudejaarsdag 1925 breekt de ringdijk door. Later vergraven tot zandwinplas.',te:'Drained in 1892; on New Year\'s Eve 1925 the ring dike breaks. Later dug out for sand.'},
 {yr:1944,lon:3.58,lat:51.52,k:'f',nl:'Walcheren: geïnundeerd',en:'Walcheren: inundated',lbl:'1944–46',tn:'Geallieerden bombarderen vanaf 3 oktober 1944 de dijken. Het laatste gat gaat pas in februari 1946 dicht.',te:'Allied bombing breaches the dikes from 3 October 1944. The last gap is only closed in February 1946.'},
 {yr:1945,lon:5.02,lat:52.85,k:'f',nl:'Wieringermeer: onder water',en:'Wieringermeer: flooded',tn:'Op 17 april 1945 opgeblazen door de bezetter; op 11 december 1945 weer droog.',te:'Blown up by the occupier on 17 April 1945; dry again on 11 December 1945.'},
 {yr:1953,lon:3.95,lat:51.68,k:'f',nl:'Watersnoodramp',en:'North Sea flood',tn:'Grote delen van Zeeland en Zuid-Holland overstromen.',te:'Large parts of Zeeland and South Holland flood.'},
 {yr:1969,lon:4.44,lat:52.10,k:'d',nl:'Riet- en Spekpolder: afgegraven',en:'Riet- and Spekpolder: dug out',tn:'Rietpolder, Spekpolder en buren worden afgegraven voor zand. Er komt een recreatieplas.',te:'The Rietpolder, Spekpolder and neighbours are dug out for sand. A lake takes their place.'},
 {yr:1973,lon:4.79,lat:51.765,k:'d',nl:'Biesbosch: polders worden spaarbekkens',en:'Biesbosch: polders become reservoirs',lbl:'1973–78',tn:'Drinkwaterbekkens op vooral voormalige landbouwpolders: Petrusplaat en Honderd en Dertig (1973), De Gijster (1978).',te:'Drinking-water reservoirs, mostly on former farm polders: Petrusplaat and Honderd en Dertig (1973), De Gijster (1978).'},
 {yr:1990,lon:4.205,lat:51.365,k:'f',nl:'Selenapolder: dijk breekt',en:'Selenapolder: dike breaks',tn:'De zomerdijk breekt op 26 februari 1990 en wordt niet hersteld. De polder wordt het Sieperdaschor.',te:'The summer dike breaks on 26 February 1990 and is left open. The polder becomes the Sieperdaschor.'},
 {yr:2001,lon:7.0785,lat:53.292,k:'d',nl:'Polder Breebaart: getij terug',en:'Polder Breebaart: tide returns',tn:'Bedijkt in 1979; sinds 2001 stroomt het Dollardwater weer naar binnen.',te:'Diked in 1979; since 2001 the Dollard flows back in.'},
 {yr:2007,lon:4.33,lat:51.735,k:'d',nl:'Tiengemeten: terug aan de natuur',en:'Tiengemeten: returned to nature',tn:'Landbouweiland in het Haringvliet wordt natuur; een gat in de zuiddijk laat het water binnen.',te:'A farming island in the Haringvliet becomes nature; a gap in the south dike lets the water in.'},
 {yr:2015,lon:4.85,lat:51.80,k:'d',nl:'Noordwaard: ontpolderd',en:'Noordwaard: depoldered',tn:'Ruimte voor de Rivier: de polder loopt bij hoogwater bewust onder.',te:'Room for the River: the polder now floods on purpose at high water.'},
 {yr:2015,lon:4.017,lat:51.40,k:'d',nl:'Perkpolder: ontpolderd',en:'Perkpolder: depoldered',tn:'Op 25 juni 2015 gaat de dijk open; het getij van de Westerschelde keert terug.',te:'The dike is opened on 25 June 2015; the Western Scheldt tide returns.'},
 {yr:2016,lon:4.19,lat:51.615,k:'d',nl:'Rammegors: getij terug',en:'Rammegors: tide returns',tn:'In 1972 afgedamd, sinds december 2016 weer getij. Geen boerenpolder, wel teruggegeven aan de zee.',te:'Dammed off in 1972, tidal again since December 2016. Not a farm polder, but given back to the sea.'},
 {yr:2017,lon:4.62,lat:51.848,k:'d',nl:'Crezéepolder: ontpolderd',en:'Crezéepolder: depoldered',tn:'Polder aan de Noord, teruggegeven aan het zoete getij.',te:'A polder on the Noord, returned to the freshwater tide.'},
 {yr:2019,lon:3.52,lat:51.395,k:'d',nl:'Waterdunen: getij terug',en:'Waterdunen: tide returns',tn:'Landbouwpolder bij Breskens krijgt via een getijduiker weer zout water.',te:'Farm polder near Breskens takes in salt water again through a tidal culvert.'},
 {yr:2020,lon:4.43,lat:52.06,k:'d',nl:'Nieuwe Driemanspolder: onder water gezet',en:'Nieuwe Driemanspolder: flooded for water storage',tn:'Weilanden afgegraven en onder water gezet als piekberging en natuur.',te:'Meadows dug out and flooded for peak water storage and nature.'},
 {yr:2022,lon:4.237,lat:51.355,k:'d',nl:'Hedwigepolder: ontpolderd',en:'Hedwigepolder: depoldered',tn:'Polder sinds 1907, teruggegeven aan het getij van de Westerschelde.',te:'A polder since 1907, returned to the tides of the Western Scheldt.'}];
EV.forEach(e=>{const [x,y]=toXY(e.lon,e.lat);e.px=x;e.py=y;});
let hovEv=null;
function drawEvents(c,V){
  c.save();c.font='500 12px "Inter Tight",sans-serif';c.textAlign='center';c.textBaseline='middle';
  const placed=[],near=V.s/fitS>=4;
  // part of the Polder story only, and not tied to the timeline: every event shows, whatever the year
  for(const e of EV){e.lbox=null;e.hx=null;if(!polderOn)continue;const sx=V.x+e.px*V.s,sy=V.y+e.py*V.s;if(sx<-200||sy<-60||sx>cw+200||sy>ch+60)continue;
    const col=e.k==='d'?'140,205,150':'120,172,235',hot=hovEv===e;e.hx=sx;e.hy=sy;
    // marker: drop for land lost to the water, diamond for land given back on purpose
    const a=hot?1:0.85;c.globalAlpha=a;c.fillStyle=`rgb(${col})`;c.strokeStyle='rgba(6,9,15,.9)';c.lineWidth=1.5;c.beginPath();
    if(e.k==='d'){c.moveTo(sx,sy-5);c.lineTo(sx+5,sy);c.lineTo(sx,sy+5);c.lineTo(sx-5,sy);c.closePath();}
    else{c.moveTo(sx,sy-6);c.bezierCurveTo(sx+2,sy-3,sx+4.5,sy-0.5,sx+4.5,sy+1.5);c.arc(sx,sy+1.5,4.5,0,Math.PI);c.bezierCurveTo(sx-4.5,sy-0.5,sx-2,sy-3,sx,sy-6);}
    c.stroke();c.fill();c.globalAlpha=1;
    if(near||hot){const s=`${e.lbl||e.yr} · ${lang==='nl'?e.nl:e.en}`,w=c.measureText(s).width+14;let ly=sy-22;
      for(let k=0;k<8;k++){if(!placed.some(p=>Math.abs(p[0]-sx)<(p[2]+w)/2+4&&Math.abs(p[1]-ly)<21))break;ly-=21;}placed.push([sx,ly,w]);
      c.globalAlpha=1;
      if(ly<sy-22){c.strokeStyle=`rgba(${col},.5)`;c.lineWidth=1;c.beginPath();c.moveTo(sx,sy-7);c.lineTo(sx,ly+9);c.stroke();}
      c.fillStyle='rgba(8,12,19,.86)';c.beginPath();c.roundRect(sx-w/2,ly-9.5,w,19,9.5);c.fill();c.strokeStyle=`rgba(${col},.35)`;c.lineWidth=1;c.stroke();
      c.fillStyle=`rgb(${col})`;c.fillText(s,sx,ly+0.5);c.globalAlpha=1;e.lbox=[sx-w/2,ly-9.5,sx+w/2,ly+9.5];}}
  c.restore();}
// an event is hit directly on its marker or its label (these win over mills underneath)
function eventAt(mx,my){for(const e of EV){if(e.hx==null)continue;if((e.hx-mx)**2+(e.hy-my)**2<10*10)return e;const b=e.lbox;if(b&&mx>=b[0]&&mx<=b[2]&&my>=b[1]&&my<=b[3])return e;}return null;}
function nearestEvent(mx,my){let best=null,bd=18*18;for(const e of EV){if(e.hx==null)continue;const d=(e.hx-mx)**2+(e.hy-my)**2;if(d<bd){bd=d;best=e;}}return best;}
const evHTML=ev=>`<div class="t">${esc(lang==='nl'?ev.nl:ev.en)}</div><div class="w">${ev.lbl||ev.yr}</div><div class="k" style="margin-top:6px">${esc(lang==='nl'?ev.tn:ev.te)}</div>`;
// drained-lake labels in polder mode: name + year when the lake falls dry
function drawDrainLabels(c,V){
  if(!polderOn)return;c.save();c.textAlign='center';
  for(const d of DM){if(d[2]||d[5]<6)continue;const age=t-d[1];if(age<0||age>10)continue;const sx=V.x+d[3]*V.s,sy=V.y+d[4]*V.s;if(sx<-100||sy<-40||sx>cw+100||sy>ch+40)continue;
    const a=Math.min(1,(10-age)/4);c.globalAlpha=a;c.font='500 12px "Inter Tight",sans-serif';c.lineWidth=3;c.strokeStyle='rgba(6,9,15,.85)';c.strokeText(d[0],sx,sy-4);c.fillStyle='#bfe9ec';c.fillText(d[0],sx,sy-4);
    c.font='400 11px "Inter Tight",sans-serif';c.strokeText(`${tr('drained')} ${d[1]}`,sx,sy+10);c.fillStyle='#6fc8d0';c.fillText(`${tr('drained')} ${d[1]}`,sx,sy+10);}
  c.restore();}
