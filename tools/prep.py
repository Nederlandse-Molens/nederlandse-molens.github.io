"""Build data/data.js from the RCE downloads.

Usage:  python3 tools/prep.py [raw-folder] [output]
        defaults: raw/  and  data/data.js
Needs Pillow (pip install pillow). See README for the input files.
"""
import json,sys,math,base64,io,re,os
from PIL import Image,ImageDraw
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); from tr import en
D=sys.argv[1] if len(sys.argv)>1 else "raw"; OUT=sys.argv[2] if len(sys.argv)>2 else "data/data.js"
LON0,LON1,LAT0,LAT1=3.25,7.30,50.72,53.62
K=math.cos(math.radians(52.2))
H=2400; W=round(H*(LON1-LON0)*K/(LAT1-LAT0))
def P(lon,lat): return ((lon-LON0)*K/((LAT1-LAT0))*H, (LAT1-lat)/(LAT1-LAT0)*H)
CLS={'buitenwater':1,'getijdenzone':1,'geul':1,'binnenwater':9,
 'kwelder':2,'kwelderrug':2,'veen':3,'droogmakerij':4,
 'ingedijkt':5,'kwelderrug-binnendijks':5,'riviervlakte':5,'beekdal':5,'donk':5,
 'stadcontour':6,'stad':6,'duin':7,'laag duin':7,'hoog duin':7,'strandwal':7,'stuifzand':7,
 'dekzand_pl':8,'dekzand_hol':8,'glaciaal':8,'loss':8,'ouder':8,'laag holoceen':8,'buitenland':0}
imgs={}
for y in (1250,1500,1850,2000):
    fs=json.load(open(f"{D}/paleogeografie{y}nc.geojson"))["features"]
    S=2; im=Image.new("L",(W*S,H*S),0); d=ImageDraw.Draw(im); polys=[]
    for f in fs:
        c=CLS.get(f["properties"]["legenda"])
        if c is None: continue
        g=f["geometry"]; parts=g["coordinates"] if g["type"]=="MultiPolygon" else [g["coordinates"]]
        for poly in parts:
            ring=[P(*pt[:2]) for pt in poly[0]]
            xs=[p[0] for p in ring]; ys=[p[1] for p in ring]
            polys.append(((max(xs)-min(xs))*(max(ys)-min(ys)),c,ring))
    polys.sort(key=lambda t:-t[0])
    for _,c,ring in polys:
        if len(ring)>2: d.polygon([(x*S,y_*S) for x,y_ in ring],fill=c)
    im=im.resize((W,H),Image.NEAREST)
    b=io.BytesIO(); im.save(b,"PNG",optimize=True); imgs[y]="data:image/png;base64,"+base64.b64encode(b.getvalue()).decode()
def yr(v):
    try: v=int(str(v)[:4]); return v if v>0 else 0
    except: return 0
VOC={}; VNL=[]; VEN=[]
def vi(s):
    s=(s or "").strip()
    if s.lower() in ("onbekend","null","none","?",""): s=""
    if s not in VOC: VOC[s]=len(VNL); VNL.append(s); VEN.append(en(s) if s else "")
    return VOC[s]
vi("")
# status codes: 0 gone,1 moved,2 standing,3 remains,4 rebuilt,5 pump in operation,6 demolished,7 not working,8 in working order,9 unknown
PST={"In bedrijf":5,"Gesloopt":6,"Niet werkend":7,"Werkende staat":8,"Onbekend":9}
recs=[];meta=[];names=[];tbs=[];LL=[]
def add(lon,lat,b0,b1,e0,e1,kind,fl,name,ti,fi,by,ey,st,tb):
    x,y=P(lon,lat)
    if not(0<=x<W and 0<=y<H): return
    recs.extend([round(x,2),round(y,2),b0,b1,e0,e1,kind,fl]); meta.extend([ti,fi,by,ey,st]); LL.append((lon,lat))
    nm=re.sub(r"<[^>]+>|\bvoorganger\b","",name or "").strip(" /")
    if re.fullmatch(r"\(.*\)",nm) or nm.lower() in("(naamloos)","naamloos"): nm=""
    names.append(nm); tbs.append(tb or "")
# moves the source data doesn't mark: lost mill (Ten Bruggencate nr) → standing mill it became, and the year it was set up again there
# (None: keep the build year the target already has). All checked against the history pages on molendatabase.nl, Nov 2026.
MOVED_TO={
 "00066":("12750",2013),          # Meerburgermolen: taken down near Zoeterwoude-Rijndijk in 2007, re-erected in Leiderdorp in 2013
 "00852":("10690",1963),          # De Gekroonde Poelenburg: to the Zaanse Schans, 1963
 "01777":("11754",1968),          # De Zoeker: to the Zaanse Schans, night of 2-3 August 1968
 "04911":("04911 bis bis",1955),  # De Huisman: taken down 1955, rebuilt on warehouse De Haan at the Zaanse Schans
 "06651":("10256",1965),          # De Windhond: to the Zaanse Schans, 1965
 "00213":("17091",None),          # De Grauwe Beer: moved to a higher spot in Beesel
 "01652":("10203",1989),          # De Hoed: Kruiningen to Waarde, 1 April 1989
 "00949":("10166",None),          # Dekkermolen: to molenmakerij Van Beek, Rijnsaterwoude, c. 1975 ...
 "10166":("12384",2009),          # ... and from there to Hoogmade, 2009
 "01772":("12230",1977),          # De Eersteling: moved in one piece, Hoofddorp, 1977
 "06414":("10225",1977),          # Aeolus: moved within Farmsum and largely rebuilt, 1977 (in use 1978)
 "10677":("10678",2003),          # Molen Hoogland: moved to the Zwette, Goutum, 2003
}
REERECTED={v[0]:v[1] for v in MOVED_TO.values()}
MV=re.compile(r"verplaats|1e plek|2e plek|3e plek|positie|voor de verplaatsing",re.I)
LOST=json.load(open(D+"/verdwenen_molens.geojson"))["features"]
EXIST=json.load(open(D+"/molens.geojson"))["features"]+json.load(open(D+"/weidemolens.geojson"))["features"]
tbn=lambda p:(p.get("TBGCNUMMER") or p.get("ten_brugge") or "").strip()
basegrp={}
for g in LOST+EXIST: basegrp.setdefault(tbn(g["properties"])[:5],[]).append(g)
def kmd(a,b):
    (x1,y1),(x2,y2)=a["geometry"]["coordinates"][:2],b["geometry"]["coordinates"][:2]
    return math.hypot((x1-x2)*68,(y1-y2)*111)
moves=[];drop=0;UNDATED=[]
for f in LOST:
    p=f["properties"]; lon,lat=f["geometry"]["coordinates"][:2]
    b=yr(p["bouwjaar_1"]); e=yr(p["verdwenen1"]); fl=0
    if e and b and e<b: b,e=e,b
    dr=(p["aandrijvin"] or "").lower()
    kind=2 if dr.startswith(("ros","tred","hond")) else 3 if dr.startswith("water") else 0 if p["hoofdcat"]=="poldermolen" else 1
    if p["type"] in("weidemolen","tjasker","paaltjasker","boktjasker"): kind=4 if p["type"]=="weidemolen" else kind
    if dr=="wind- en watermolen": fl|=32   # driven by wind and water (watervluchtmolen): drawn as a windmill
    if not b and not e:   # no dates at all: kept apart, shown only with "show undated", outside the timeline
        drop+=1; UNDATED.append((lon,lat,kind,fl|64,p["molen_naam"] or "",vi(p["type"]),vi(p["functie"]),0,p["ten_brugge"])); continue
    if b==1832: b0,b1=1750,1832; fl|=4
    elif not b: b0,b1=e-150,e-30; fl|=4
    else: b0=b1=b
    if not e: e0,e1=max(b1+20,1850),1960; fl|=8
    elif e in (1850,1929,1930): e0,e1=e-15,e+10; fl|=8
    else: e0=e1=e
    e0=max(e0,b1+1); e1=max(e1,e0)
    nm=p["molen_naam"] or ""; st=0
    if (MV.search(re.sub(r"<[^>]+>","",nm)+" "+str(p["verdwenen2"] or "")) or tbn(p) in MOVED_TO) and e:
        fl|=16; st=1
        nm=re.sub(r"\s*(<i>)?\(?verplaatst\)?(</i>)?|\s*\((1e|2e|3e) plek\)|\s*\(voor de verplaatsing\)","",nm,flags=re.I)
        best=None
        cand=[g for g in EXIST+LOST if tbn(g["properties"])==MOVED_TO[tbn(p)][0]] if tbn(p) in MOVED_TO else basegrp.get(tbn(p)[:5],[])
        for g in cand:
            if g is f: continue
            q=g["properties"]; d=kmd(f,g)
            if d<0.05 or d>40: continue
            if "bouwjaar_1" in q and not (e-3<=yr(q["bouwjaar_1"])<=e+5): continue
            if best is None or d<best[0]: best=(d,g)
        if best:
            x2,y2=P(*best[1]["geometry"]["coordinates"][:2]); x1,y1=P(lon,lat)
            moves+=[round(x1,1),round(y1,1),round(x2,1),round(y2,1),e]
    add(lon,lat,b0,b1,e0,e1,kind,fl,nm,vi(p["type"]),vi(p["functie"]),b,e,st,p["ten_brugge"])
for f in json.load(open(D+"/molens.geojson"))["features"]:
    p=f["properties"]; lon,lat=f["geometry"]["coordinates"][:2]
    if p["STAAT"]=="in aanbouw": continue
    b=yr(p["BOUWJAAR"]); fl=1; cat=p["CATEGORIE"]
    kind=0 if p["HFDFUNCTIE"]=="poldermolen" else 1
    if cat=="watervluchtmolen": fl|=32   # watervluchtmolen (wind- and watermill in one): drawn as a windmill
    elif cat.startswith("ros") or cat in("tredmolen","hondenkarn","koemolen"): kind=2
    elif cat.startswith("water") or cat=="getijdemolen": kind=3
    st={"bestaand":2,"restant":3,"herbouwd":4}[p["STAAT"]]
    if st==3: fl|=2
    if p["TBGCNUMMER"].strip() in REERECTED: b=REERECTED[p["TBGCNUMMER"].strip()] or b; st=4   # moved here: standing at this spot since then
    if not b: b0,b1=1600,1850; fl|=4
    else: b0=b1=b
    add(lon,lat,b0,b1,9999,9999,kind,fl,p["NAAM"],vi(p["TYPE"]),vi(p["FUNCTIE"]),b,0,st,p["TBGCNUMMER"])
for f in json.load(open(D+"/weidemolens.geojson"))["features"]:
    p=f["properties"]; lon,lat=f["geometry"]["coordinates"][:2]
    if p["status"]=="verdwenen": continue
    b=yr(p["bouwjaar"]); rest="restant" in p["status"]; fl=1|(2 if rest else 0)
    if not b: b0,b1=1880,1950; fl|=4
    else: b0=b1=b
    add(lon,lat,b0,b1,9999,9999,4,fl,p["naam"],vi(p["omschrijvi"]),vi(p["hoofdcateg"]),b,0,3 if rest else 2,p["TBGCNUMMER"])
for f in json.load(open(D+"/gemalen.geojson"))["features"]:
    p=f["properties"]; lon,lat=f["geometry"]["coordinates"][:2]
    b=yr(p["stichtingsjaar"])
    kind=5 if p["aandrijving_oorspronkelijk"]=="Stoom" else 6
    st=PST.get(p["status"],9); fl=0
    if not b: UNDATED.append((lon,lat,kind,64|(0 if st==6 else 1),p["naam_gemaal"],vi(p["aandrijving_oorspronkelijk"]),vi(p["functie"]),st,str(p.get("id") or ""))); continue
    if st==6: e0,e1=b+25,2000; fl|=8
    else: e0=e1=9999; fl|=1
    add(lon,lat,b,b,e0,e1,kind,fl,p["naam_gemaal"],vi(p["aandrijving_oorspronkelijk"]),vi(p["functie"]),b,0,st,str(p.get("id") or ""))   # tb holds the gemalen.nl id for pumping stations

# ---------- sites: records within ~25 m are one place with a history ----------
import collections
NR=len(names); par=list(range(NR))
def fd(a):
    while par[a]!=a: par[a]=par[par[a]]; a=par[a]
    return a
cell=collections.defaultdict(list)
for i,(lon,lat) in enumerate(LL): cell[(int(lon/0.0005),int(lat/0.0005))].append(i)
for (cx,cy),ids in cell.items():
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            for j in cell.get((cx+dx,cy+dy),[]):
                for i in ids:
                    if i<j and recs[i*8+6]<5 and recs[j*8+6]<5:
                        (a1,b1_),(a2,b2_)=LL[i],LL[j]
                        if math.hypot((a1-a2)*68000,(b1_-b2_)*111000)<=25: par[fd(i)]=fd(j)
# second pass: the same distinctive name up to ~150 m apart is the same place too
# (sources sometimes place the predecessors of a mill a little off, e.g. Kilsdonkse Molen, 55 m)
normn0=lambda s:re.sub(r"\s+"," ",re.sub(r"\(.*?\)|[^a-z0-9 ]","",(s or "").lower())).split(" of ")[0].split("/")[0].strip()   # digits kept: "nr. 5" and "nr. 6" are different mills
PLAIN={"","polder","molen","korenmolen","poldermolen","oliemolen","zaagmolen","watermolen","rosmolen","de molen","onbekend","naamloos","molen van","grondzeiler","wipmolen","standerdmolen"}
cell2=collections.defaultdict(list)
for i,(lon,lat) in enumerate(LL):
    if recs[i*8+6]<5: cell2[(int(lon/0.003),int(lat/0.003))].append(i)
nname=0;JOINED=[]
for (cx,cy),ids in cell2.items():
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            for j in cell2.get((cx+dx,cy+dy),[]):
                for i in ids:
                    if i<j and fd(i)!=fd(j):
                        ni,nj=normn0(names[i]),normn0(names[j])
                        oi,oj=i*8,j*8
                        succ=recs[oi+5]<=recs[oj+2]+5 or recs[oj+5]<=recs[oi+2]+5   # one after the other, never two at once
                        if ni==nj and ni not in PLAIN and len(ni)>=6 and succ:
                            (a1,b1_),(a2,b2_)=LL[i],LL[j]
                            if math.hypot((a1-a2)*68000,(b1_-b2_)*111000)<=150: par[fd(i)]=fd(j); nname+=1; JOINED.append((names[i],names[j],round(math.hypot((a1-a2)*68000,(b1_-b2_)*111000))))
print("joined by name within 150 m:",nname); import random; random.seed(1); [print("   ",x) for x in random.sample(JOINED,min(15,len(JOINED)))]
groups=collections.defaultdict(list)
for i in range(NR):
    if recs[i*8+6]<5: groups[fd(i)].append(i)
SITE=[-1]*NR; NEXT=[9999]*NR; sites=[]; SIZE_FULL=[]; nreb=0; ntrim=0; nrep=0
normn=lambda s:re.sub(r"\(.*?\)|[^a-z ]","",(s or "").lower()).split(" of ")[0].split("/")[0].strip()
for g in groups.values():
    if len(g)<2: continue
    g.sort(key=lambda i:(recs[i*8+3],recs[i*8+4]))
    sid=len(sites); sites.append(g[:14] if len(g)<=14 else g[:7]+g[-7:]); SIZE_FULL.append(len(g))
    for pos,i in enumerate(g):
        SITE[i]=sid
        o=i*8; e0=recs[o+4]
        later=[recs[j*8+2] for j in g if j!=i and recs[j*8+3]>=recs[o+3] and recs[j*8+2]>=e0-5]
        if later: NEXT[i]=min(later)
    # succession on one spot
    GENERIC={"molen","polder","ondermolen","bovenmolen","middenmolen","korenmolen","poldermolen","oliemolen","zaagmolen","watermolen","rosmolen","molens","van","het","de","den","der","en","nieuwe","oude","walmolen","voorganger","eerste","tweede"}
    def toks(n): return {w for w in re.findall(r"[a-z]{4,}",(n or "").lower()) if w not in GENERIC}
    for i in g:
        o=i*8
        # lost mill followed on the same spot within 10 years → it was replaced, not simply lost
        if not recs[o+7]&1 and meta[i*5+4]==0 and recs[o+4]<9999:
            if NEXT[i]<9999 and 0<=NEXT[i]-recs[o+4]<=10: meta[i*5+4]=10; nrep+=1
        if not recs[o+7]&1: continue
        preds=[j for j in g if not recs[j*8+7]&1 and recs[j*8+4]<=max(recs[o+3],recs[o+4]-1) and recs[j*8+4]<9999]
        if not preds: continue
        pend=max(recs[j*8+4] for j in preds)
        if recs[o+7]&4 and pend<9999:
            recs[o+2]=recs[o+3]=pend; recs[o+7]&=~4; ntrim+=1
        b=meta[i*5+2]
        # same mill name (sharing a distinctive word) on the same spot → rebuilt, whatever the gap
        if b and b>=pend-5 and meta[i*5+4]==2 and any(toks(names[j])&toks(names[i]) for j in preds):
            meta[i*5+4]=4; nreb+=1
print("sites",len(sites),"rebuilt",nreb,"replaced",nrep,"trimmed fuzzy starts",ntrim)
# ---------- place names for sites (lost mills have none: borrow the nearest known place, ≤5 km) ----------
PLACES=[]
for f in json.load(open(D+"/molens.geojson"))["features"]:
    q=f["properties"];pl=(q.get("PLAATS") or "").split("/")[0].split("(")[0].strip()
    if pl: PLACES.append((f["geometry"]["coordinates"][0],f["geometry"]["coordinates"][1],pl))
for f in json.load(open(D+"/gemalen.geojson"))["features"]:
    q=f["properties"];pl=(q.get("plaats") or "").strip()
    if pl: PLACES.append((f["geometry"]["coordinates"][0],f["geometry"]["coordinates"][1],pl))
pc=collections.defaultdict(list)
for lon,lat,pl in PLACES: pc[(int(lon/0.05),int(lat/0.05))].append((lon,lat,pl))
def place_of(lon,lat):
    best=(9e9,"")
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            for a,b,pl in pc.get((int(lon/0.05)+dx,int(lat/0.05)+dy),[]):
                d=math.hypot((a-lon)*68,(b-lat)*111)
                if d<best[0]: best=(d,pl)
    return best[1] if best[0]<=5 else ""
SPLACE=[place_of(*LL[g[0]]) for g in sites]
print("sites with a place name",sum(1 for x in SPLACE if x),"of",len(sites))
# ---------- undated records: appended after the sites, so they never join a site's history ----------
for lon,lat,kind,fl,nm,ti,fi,st,tb in UNDATED:
    n0=len(names); add(lon,lat,0,0,9999,9999,kind,fl,nm,ti,fi,0,0,st,tb)
    if len(names)>n0: SITE.append(-1); NEXT.append(9999)
print("undated",len(UNDATED),"(lost mills",sum(1 for u in UNDATED if u[2]<5),", pumping stations",sum(1 for u in UNDATED if u[2]>=5),")")



# ---------- droogmakerijen (drained lakes) with drainage year: id raster + table ----------
DMF=json.load(open(D+"/droogmakerijen.geojson"))["features"]
dmp=[]
for f in DMF:
    q=f["properties"];g=f["geometry"];parts=g["coordinates"] if g["type"]=="MultiPolygon" else [g["coordinates"]]
    rings=[[P(*pt[:2]) for pt in poly[0]] for poly in parts]
    holes=[[P(*pt[:2]) for pt in h] for poly in parts for h in poly[1:]]
    area=float(q.get("shape_area") or 0)
    dmp.append((area,q,rings,holes))
dmp.sort(key=lambda t:-t[0])
dim=Image.new("L",(W,H),0);dd=ImageDraw.Draw(dim);DMT=[]
for idx,(area,q,rings,holes) in enumerate(dmp,1):
    for ring in rings:
        if len(ring)>2: dd.polygon(ring,fill=idx)
    for hole in holes:
        if len(hole)>2: dd.polygon(hole,fill=0)
    xs=[x for r in rings for x,_ in r];ys=[y for r in rings for _,y in r]
    yr=int(q["datum_droo"]);unc=1 if yr==1549 else 0
    DMT.append([q["poldernaam"],yr,unc,round(sum(xs)/len(xs),1),round(sum(ys)/len(ys),1),round(area/1e6,2),q.get("polderpeil") or ""])
bb=io.BytesIO();dim.save(bb,"PNG",optimize=True);DMIMG="data:image/png;base64,"+base64.b64encode(bb.getvalue()).decode()
print("drained lakes",len(DMT),"raster",len(bb.getvalue())//1024,"KB")
# ---------- which mills and pumping stations drained which lake (RCE layer drgmk_molens_gemalen, optional) ----------
# Each point is matched to a record we already have (Ten Bruggencate nr, gemalen.nl id, else the nearest of the
# same sort within 150 m / 300 m). Mills with no match are drawn on old maps only: added as undated polder mills.
DRL=[];DRS=[];nadd=0
if os.path.exists(D+"/drgmk_molens_gemalen.geojson"):
    idmap={q["id"]:k for k,(a,q,r,h) in enumerate(dmp,1)}
    bytb={};cells={}
    for i,t in enumerate(tbs):
        if t: bytb.setdefault((recs[i*8+6]>=5,t.strip()),i)
        lon,lat=LL[i]; cells.setdefault((round(lon*50),round(lat*80)),[]).append(i)
    def km(a,b): return math.hypot((a[0]-b[0])*68,(a[1]-b[1])*111)
    # a mill that could have drained a polder: a polder mill, or one whose function is unknown or about water (boezemmolen)
    def drainer(j):
        k0=recs[j*8+6]; fn=VNL[meta[j*5+1]].lower() if meta[j*5+1] is not None and meta[j*5+1]<len(VNL) else ""
        return k0==0 or (k0==1 and (not fn or re.search(r"polder|boezem|bemal|water",fn)))
    used=set(); dr_un=0
    for f in json.load(open(D+"/drgmk_molens_gemalen.geojson"))["features"]:
        q=f["properties"]; lon,lat=f["geometry"]["coordinates"][:2]; pump="gemaal" in q["type"]
        k=idmap.get((q["polderID"] or "").split(" ")[0])
        if not k: continue
        i=bytb.get((pump,(q["ID_gemalen"] if pump else q["tenBruggec"]) or ""))
        if i is None:
            best=None;lim=0.3 if pump else 0.15
            for dx in(-1,0,1):
                for dy in(-1,0,1):
                    for j in cells.get((round(lon*50)+dx,round(lat*80)+dy),[]):
                        if (recs[j*8+6]>=5 if pump else not drainer(j)) or j in used: continue
                        d=km((lon,lat),LL[j])
                        if d<lim and (best is None or d<best[0]): best=(d,j)
            i=best[1] if best else None
        src=(q["bron_geo"] or "").strip()
        if src not in DRS: DRS.append(src)
        if i is None:
            if pump: continue
            n0=len(names); add(lon,lat,0,0,9999,9999,0,64,q["naam"] or "",vi(q["type"]),vi("poldermolen"),0,0,0,"")
            if len(names)==n0: continue
            SITE.append(-1); NEXT.append(9999); i=n0; nadd+=1
        if i in used: continue
        used.add(i); DRL+=[i,k,DRS.index(src)]
print("drainage links",len(DRL)//3,"of which mills only on old maps (added, undated)",nadd)

print("records",len(names),"dropped",drop,"moves",len(moves)//5,"vocab",len(VNL))
_buf=io.StringIO()
json.dump({"W":W,"H":H,"geo":[LON0,LON1,LAT0,LAT1,K],"img":imgs,"r":recs,"m":meta,"n":names,"tb":tbs,"vnl":VNL,"ven":VEN,"mv":moves,"site":SITE,"sites":sites,"next":NEXT,"splace":SPLACE,"ssize":SIZE_FULL,"dmimg":DMIMG,"dm":DMT,"drl":DRL,"drs":DRS},_buf,separators=(",",":"),ensure_ascii=False)

_js=_buf.getvalue()
with open(OUT,"w") as f:
    if OUT.endswith(".js"): f.write("// generated by tools/prep.py, do not edit\nconst DATA="+_js+";\n")
    else: f.write(_js)
print("wrote",OUT,len(_js)//1024,"KB")
