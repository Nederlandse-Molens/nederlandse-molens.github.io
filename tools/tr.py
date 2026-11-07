# Dutch -> English for mill/pump vocabulary (token level, mill-historian terms)
import re
T={
"poldermolen":"drainage mill","poldermolens":"drainage mills","korenmolen":"corn mill","korenmolen-":"corn mill","onbekend":"unknown","stellingmolen":"stage mill",
"grondzeiler":"ground-sailer","poldergemaal":"polder pumping station","standerdmolen":"post mill","spinnenkop":"spider mill","rosmolen":"horse mill",
"wipmolen":"hollow post mill","zaagmolen":"sawmill","weidemolen":"pasture mill","molen":"mill","oliemolen":"oil mill","oliemolen-":"oil mill","oliemolen?":"oil mill?",
"kleine":"small","pelmolen":"hulling mill","grutmolen":"groats mill","8-kante":"octagonal","6-kante":"hexagonal","12-kante":"twelve-sided","16-kante":"sixteen-sided",
"watermolen":"watermill","beltmolen":"mound mill","paltrokmolen":"paltrok mill","paltrok":"paltrok","stenen":"brick","ronde":"round","muonts":"monk mill",
"monniksmolen":"monk mill","papiermolen":"paper mill","papiermolen-":"paper mill","papiermolen.":"paper mill.","later":"later","karnmolen":"churn mill","runmolen":"tan-bark mill","runmolen?":"tan-bark mill?",
"volmolen":"fulling mill","volmolen?":"fulling mill?","watergedreven":"water-driven","tjasker":"tjasker","moutmolen":"malt mill","karnmolenhuisje":"churn-mill house",
"snuifmolen":"snuff mill","houten":"wooden","met":"with","windmotor":"wind engine","verfmolen":"paint mill","trasmolen":"trass mill","middelgrote":"medium-sized",
"koren-":"corn-","mosterdmolen":"mustard mill","boezemgemaal":"storage-basin pumping station","meekrapmolen":"madder mill","roggemolen":"rye mill","rogmolen":"rye mill",
"boezemmolen":"storage-basin mill","hennepklopper":"hemp beater","binnenkruier":"inside-winder","inlaatgemaal":"inlet pumping station","ook":"also","en":"and",
"getijdenmolen":"tide mill","getijdemolen":"tide mill","kruitmolen":"gunpowder mill","onderslagrad":"undershot wheel","bovenslagrad":"overshot wheel","middenslagrad":"breastshot wheel",
"speelmolen":"toy mill","wasserij":"laundry","slijpmolen":"grinding mill","gesloten":"closed","open":"open","tabakstamper":"tobacco stamper","tabaksstamper":"tobacco stamper",
"of":"or","gemechaniseerde":"mechanised","kadekraan":"quay crane","dorsmolen":"threshing mill","kraanmolen":"crane mill","geen":"none","cacaomolen":"cocoa mill",
"houtzaagmolen":"timber sawmill","zeemleermolen":"chamois-leather mill","loodwitmolen":"white-lead mill","cichoreimolen":"chicory mill","paaltjasker":"post tjasker",
"boktjasker":"trestle tjasker","kalander-":"calender-","kalandermolen":"calender mill","lakenrolmolen":"cloth-rolling mill","torenmolen":"tower mill","doppenmolen":"shelling mill",
"functie":"function","functies":"functions","peilbeheer":"water-level control","grote":"large","schelpzandmolen":"shell-sand mill","kleimolen":"clay mill","pompmolen":"pumping mill",
"specerijenmolen":"spice mill","specerijmolen":"spice mill","vuilwatermolen":"sewage-water mill","turbine":"turbine","blauwselmolen":"blueing mill","biksteenmolen":"brick-grit mill",
"biksteen-":"brick-grit-","kopermolen":"copper mill","tredmolen":"treadmill","aandrijving":"drive","aandrijver":"driver","boekweitmolen":"buckwheat mill","petmolen":"pet mill",
"machines":"machinery","electriciteitsopwekking":"electricity generation","elektriciteitsopwekking":"electricity generation","elektriciteitsopwekker":"generator",
"windmotortje":"small wind engine","van":"of","schipmolen":"ship mill","bosmanmolen":"Bosman mill","na":"after","ijzergieterij":"iron foundry","inmaler":"inlet mill",
"sierobject":"ornament","stelling":"stage","watervluchtmolen":"watervlucht mill","verfhoutmolen":"dyewood mill","diversen":"various","diverse":"various","poedermolen":"powder mill",
"cementmolen":"cement mill","half":"half","schorsmolen":"bark mill","dan":"then","diamantslijperij":"diamond-polishing works","snijmolen":"cutting mill","krijtmolen":"chalk mill",
"boezem-":"storage-basin-","doorspoeling":"flushing","potloodmolen":"pencil-lead mill","eekmolen":"tan-bark mill","waterververser":"water refresher","leermolen":"leather mill",
"vanaf":"from","dorsmachine":"threshing machine","glazuurmolen":"glaze mill","lijnmeelmolen":"linseed-meal mill","rijstpelmolen":"rice-hulling mill","ijzermolen":"iron mill",
"olie-":"oil-","tijdelijk":"temporarily","ten":"","slotte":"finally","tenslotte":"finally","lijnbaanmolen":"ropewalk mill","gecombinrd":"combined","potasmolen":"potash mill",
"spil":"spindle","voor":"for","spinnerij":"spinning mill","steenzaagmolen":"stone sawmill","baggermolen":"dredging mill","beendermeelmolen":"bone-meal mill","boormolen":"boring mill",
"dors-":"threshing-","grutterij":"groats mill","koekenbreker":"oil-cake breaker","koffiemolen":"coffee mill","pel-":"hulling-","witmolen":"whiting mill","andere":"other",
"gortmolen":"pearl-barley mill","gortmolen.":"pearl-barley mill.","wolspinnerij":"wool-spinning mill","verf-":"paint-","pletmolen":"crushing mill","sluisdeur":"sluice gate",
"chocolademolen":"chocolate mill","leien":"slate","gedekt":"roofed","zaagraam":"saw frame","aardappelmeelfabriek":"potato-starch factory","stijfselmolen":"starch mill",
"mogelijk":"possibly","carrouselmolen":"carousel mill","karn-":"churn-","fonteinmolen":"fountain mill","garenspinnerij":"yarn-spinning mill","grut-":"groats-",
"hakselmolen":"chaff-cutting mill","hijsmechanisme":"hoisting gear","ijsbaanmolen":"skating-rink mill","ijzeren":"iron","slijperij":"grinding works","kartonfabriek":"cardboard factory",
"generator":"generator","knopenmolen":"button mill","kolenmolen":"coal mill","waarschijnlijk":"probably","ca.":"c.","fabriek":"factory","houtwaren":"woodware",
"kalamijnmolen":"calamine mill","run-":"tan-bark-","misschien":"perhaps","stoomolieslagerij":"steam oil mill","v":"formerly","h":"","vh.":"formerly","verfstoffenmolen":"dyestuff mill",
"weverij":"weaving mill","lakenfabriek":"cloth factory","papierfabriek":"paper factory","lijnzaadmolen":"linseed mill","medicijnmolen":"medicine mill","mosterd-":"mustard-",
"pepermolen":"pepper mill","pompen":"pumping","brouwerij":"brewery","buskruitmolen":"gunpowder mill","houtzagerij":"sawmill","smidse":"smithy","weer":"again","sinds":"since",
"oppompen":"pumping","drinkwater":"drinking water","opwekken":"generating","elektriciteit?":"electricity?","overhaal":"boat lift","overtoom":"boat lift",
"cichoreifabriekje":"small chicory factory","eind":"end of","18e":"18th","eeuw":"century","i":"I","blekerij":"bleachery","eerder":"earlier","tabaksmolen":"tobacco mill",
"alleen":"only","scheermolen":"shearing mill","schuimvlokkenmolen":"foam-flake mill","showmolen":"show mill","polijstmolen":"polishing mill","katoenwaserij":"cotton laundry",
"stopverfmolen":"putty mill","zalmzegen":"salmon seine","stoommolen":"steam mill","suikerfabriek":"sugar factory","stroopfabriek":"syrup factory","veevoedermolen":"cattle-feed mill",
"foeragemolen":"fodder mill","als":"as","laatst":"last","verticale":"vertical","hennepmolen":"hemp mill","katoenfabriek":"cotton factory","steenpletmolen":"stone-crushing mill",
"velbloterij":"hide-dehairing works","zoethoutmolen":"liquorice mill","water-":"water-","watervoorziening":"water supply","windturbine":"wind turbine","glasmolen":"glass mill",
"wollen-dekenfabriek":"woollen-blanket factory","zaag-":"saw-","zijderederij":"silk works","geupel":"geupel","kleine molen":"small mill","weidemolens":"pasture mills",
# pumps
"gemechaniseerde poldermolen":"mechanised drainage mill","elektro":"electric","stoom":"steam","diesel":"diesel","hybride":"hybrid","zuiggas":"suction gas","dual":"dual",
"fuel":"fuel","aardgas":"natural gas","in":"in","bedrijf":"operation","gesloopt":"demolished","niet":"not","werkend":"working","werkende":"working","staat":"order",
"windmolen":"windmill","gemaal":"pumping station","---":"—","?":"?","porseleinmolen":"porcelain mill",
}
SEP=re.compile(r"([ ,/;()]+)")
WHOLE={'werkende staat':'In working order','geen functie peilbeheer':'No water-level function','gemechaniseerde poldermolen':'Mechanised drainage mill','dual fuel':'Dual fuel','kleine molen':'small mill'}
def en(s, miss=None):
    if not s: return s
    if s.strip().lower() in WHOLE: return WHOLE[s.strip().lower()]
    s2=re.sub(r'v/h|v\.h\.|vh\.','vh.',s)
    out=[]
    for tok in SEP.split(s2):
        if not tok or SEP.fullmatch(tok) or re.fullmatch(r"[\d.\-]+",tok): out.append(tok); continue
        k=tok.lower()
        if k in T: out.append(T[k])
        else:
            out.append(tok)
            if miss is not None: miss.add(k)
    r=re.sub(r"\s+"," ","".join(out)).strip()
    r=r.replace("in operation","in operation")
    if s[:1].isupper() and r: r=r[0].upper()+r[1:]
    return r
