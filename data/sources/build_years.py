import json,re,os,glob,unicodedata,sys
from collections import defaultdict
ROOT='/Users/witoldtenhove/Documents/Projects/marketcap'
from parse_cmc import parse_page
YEARS=list(range(2002,2024))
# ---------- load cmc pages ----------
universe={u['slug']:u for u in json.load(open('cmc_universe.json'))}
EXCLUDE_SLUGS={'fortis','time-warner','suez','abn-amro','enka','latam-airlines','coca-cola-femsa','shanghai-electric-group','fomento-economico-mexicano','takeda','canon'}
DROP_YEARS={'nornickel':[2010],'compagnie-financiere-richemont':[2014],'ambev':[2010,2011,2012],'roche':[2012],'bnp-paribas':[2010],'ubs':[2002,2003,2004,2005],'tencent':[2011],'shell':list(range(2005,2022)),'unilever':[2003,2004,2005,2006],'bhp-group':[2009],'nestle':[2002],'chevron':[2002]}
pages={}
for f in glob.glob('cmc/pages/*.html')+glob.glob('cmc/extra/*.html'):
    slug=os.path.basename(f)[:-5]
    if slug in EXCLUDE_SLUGS or slug in pages: continue
    pages[slug]=parse_page(f)
COUNTRY_FIX={'USA':'United States','UK':'United Kingdom','S. Korea':'South Korea','S. Arabia':'Saudi Arabia','UAE':'United Arab Emirates'}
REGION={'United States':'North America','Canada':'North America','Mexico':'North America','Bermuda':'North America','Puerto Rico':'North America','Panama':'North America',
 'United Kingdom':'Europe','France':'Europe','Germany':'Europe','Switzerland':'Europe','Netherlands':'Europe','Spain':'Europe','Italy':'Europe','Sweden':'Europe','Finland':'Europe','Denmark':'Europe','Ireland':'Europe','Russia':'Europe','Belgium':'Europe','Norway':'Europe','Luxembourg':'Europe','Austria':'Europe','Poland':'Europe','Portugal':'Europe','Greece':'Europe','Czech Republic':'Europe','Hungary':'Europe','Turkey':'Europe','Jersey':'Europe','Guernsey':'Europe','Isle of Man':'Europe','Monaco':'Europe','Cyprus':'Europe','Malta':'Europe','Liechtenstein':'Europe',
 'Japan':'Asia','China':'Asia','Taiwan':'Asia','South Korea':'Asia','India':'Asia','Saudi Arabia':'Asia','United Arab Emirates':'Asia','Singapore':'Asia','Hong Kong':'Asia','Israel':'Asia','Qatar':'Asia','Kuwait':'Asia','Indonesia':'Asia','Thailand':'Asia','Malaysia':'Asia','Philippines':'Asia','Vietnam':'Asia','Kazakhstan':'Asia','Macau':'Asia','Bahrain':'Asia','Oman':'Asia','Pakistan':'Asia','Bangladesh':'Asia','Sri Lanka':'Asia','Cayman Islands':'Asia',
 'Australia':'Oceania','New Zealand':'Oceania',
 'Brazil':'South America','Argentina':'South America','Chile':'South America','Colombia':'South America','Peru':'South America','Uruguay':'South America',
 'South Africa':'Africa','Nigeria':'Africa','Egypt':'Africa','Morocco':'Africa','Kenya':'Africa'}
def norm(n):
    n=unicodedata.normalize('NFKD',n or '').encode('ascii','ignore').decode()
    n=re.sub(r'\(.*?\)','',n); n=re.sub(r'\b(inc|corp|corporation|co|ltd|plc|sa|nv|ag|se|group|holdings?|company|the|limited|ads|adr)\b','',n.lower())
    return re.sub(r'[^a-z0-9]','',n)
# ---------- existing data (symbols, names, sectors) ----------
existing={}   # symbol -> meta (latest year wins)
existing_by_name={}
for y in [2001,2004,2024,2025,2026]:
    for c in json.load(open(f'{ROOT}/data/{y}.json'))['companies']:
        existing[c['symbol']]={'name':c['name'],'country':c['country'],'region':c['region'],'sector':c['sector']}
        existing_by_name.setdefault(norm(c['name']),c['symbol'])
# ---------- symbol canonicalisation ----------
TICKER_ALIAS={'RO.SW':'ROG.SW','SIE.DE':'SIEGY','0857.HK':'601857.SS','ITX.MC':'IDEXY','ALV.DE':'ALIZY','9437.T':'DCM','9432.T':'NTT','7751.T':'CAJ',
 'TEF.MC':'TEF','ORA.PA':'FTE','EOAN.DE':'EONGY','ENEL.MI':'ENEL','MBG.DE':'DCX','DAI.DE':'DCX','NWG':'RBS','NWG.L':'RBS','MSI':'MOT','JAVA':'SUNW','UTX':'RTX',
 'MDLZ':'KFT','VIAC':'VIAB','PARA':'VIAB','FNMA':'FNM','FMCC':'FRE','DTE.DE':'DT','TIT.MI':'TI','GAZP.ME':'OGZPY','TAK':'4502.T','4502.T':'4502.T','AIR.PA':'EADSY',
 '601628.SS':'2628.HK','601318.SS':'2318.HK','CCL':'CUK','BUD':'ABI.BR','NTR':'POT','WBA':'WAG','RTN':'RTN','2222.SR':'2222.SR','BRK-A':'BRK-B','HBC':'HSBC','RD':'SHEL','RDS-B':'SHEL','RDS-A':'SHEL','TOT':'TTE','CHL':'0941.HK','MTU':'MUFG','MTF':'MUFG','STD':'SAN','BBV':'BBVA','BBL':'BHP','RHHBY.PK':'ROG.SW','RHHBY':'ROG.SW','SBC':'T','SI':'SIEGY','EON':'EONGY','EN':'ENEL','SNP':'600028.SS','UN':'UL','AXA':'CS.PA','CSR':'CS','AZ':'ALIZY','ERICY':'ERIC','RTP':'RIO','PTR':'601857.SS','SZE':'SZE','NWS-A':'NWS','NWSA':'NWS','VIA-B':'VIAB','CAJ':'CAJ','NSANY':'7201.T','TLS':'TLS.AX','S':'S','ABN':'ABN','FTE':'FTE','AVE':'AVE','G':'G','WAG':'WAG','HWP':'HPQ','DCM':'DCM','MER':'MER','ONE':'ONE','FBF':'FBF','TYC':'TYC','TWX':'TWX','AOL':'TWX','MOT':'MOT','SUNW':'SUNW','KFT':'KFT','CUK':'CUK','LUKOY':'LKOH.ME','OGZPY':'OGZPY','SBRCY':'SBER.ME','GOOGL':'GOOG','SNE':'SONY','TSCDY.PK':'TSCO.L','TSCDY':'TSCO.L','SC':'SHEL'}
def canon(ticker,name):
    t=(ticker or '').upper().strip()
    if t in TICKER_ALIAS: return TICKER_ALIAS[t]
    if t in existing: return t
    n=norm(name)
    if n in existing_by_name: return existing_by_name[n]
    return t
# ---------- sector mapping from badges ----------
def sector_from_badges(badges):
    b=set(badges)
    def has(*ks): return any(k in b for k in ks)
    if has('Semiconductors'): return 'Semiconductors'
    if has('Electricity','Utility companies','Renewable energy','Hydrogen fuel cell','Water utilities'): return 'Other'
    if has('Oil&Gas','Oil & Gas Equipment & Services','Energy'): return 'Oil & Gas Operations'
    if has('Automakers','Electric Vehicles','Motorcycle Manufacturers','Automotive Suppliers'): return 'Automotive'
    if has('Pharmaceuticals','Biotech','Healthcare','Medical devices','Medical equipment','Diagnostics and Testing','Medical Care Facilities','medical-instruments & supplies','Genomics','Telehealth'): return 'Health Care'
    if has('Conglomerate'): return 'Conglomerate'
    if has('Banks','Insurance','Financial services','Investment','Asset Management','Stock exchanges','Stock/Crypto exchanges','Fintech'): return 'Financial Services'
    if has('Luxury goods','Cosmetics and Beauty'): return 'Luxury Goods'
    if has('Telecommunication'): return 'Telecommunications Services'
    if has('Media/Press','Entertainment','Video Game','Video games','Esports'): return 'Media'
    if has('Aerospace','Defense contractors','Aircraft manufacturers'): return 'Aerospace & Defense'
    if has('Food','Beverages','Alcoholic beverages','Dairy companies','Food Delivery','Restaurant chains','Supermarket Chains'): return 'Food & Drink' if not has('Supermarket Chains','Restaurant chains') or has('Food','Beverages','Alcoholic beverages') else 'Retail'
    if has('Tobacco'): return 'Other'
    if has('Retail','E-Commerce','Clothing','Footwear','Car retail','Drugstore','Sports goods','Furniture','Home & Kitchen Appliances'): return 'Retail'
    if has('Consumer goods','Personal care','Household products'): return 'Household & Personal Products'
    if has('Software','Internet','Tech','Tech Hardware','Electronics','IT services','Networking hardware','Telecommunications equipment','AI','IT security','Robotics','Scientific & Technical Instruments','Cloud'): return 'Technology'
    return 'Other'
# ---------- candidates ----------
fb=json.load(open('fb_all.json'))
manual=json.load(open('manual_years.json')) if os.path.exists('manual_years.json') else {}
cands=defaultdict(dict)   # year -> symbol -> record
def add(year,sym,rec):
    cur=cands[year].get(sym)
    if cur is None or rec['marketcap']>cur['marketcap']: cands[year][sym]=rec
for slug,p in pages.items():
    country=p['country'] or COUNTRY_FIX.get(universe.get(slug,{}).get('country') or '', universe.get(slug,{}).get('country'))
    country=COUNTRY_FIX.get(country,country)
    sym=canon(p['ticker'],p['name'])
    for y,v in p['hist'].items():
        if y in DROP_YEARS.get(slug,[]): continue
        if y in YEARS and v>0:
            add(y,sym,{'symbol':sym,'name':p['name'],'country':country,'badges':p['badges'],'marketcap':v,'src':f'cmc:{slug}'})
cmc_syms_all={canon(p['ticker'],p['name']) for p in pages.values()}
for d,rows in fb.items():
    y=int(d[:4])
    for r,n,t,mc in rows:
        sym=canon(t,n)
        if sym in cands[y]: continue          # cmc has it
        if sym in cmc_syms_all: continue      # cmc tracks the company but has no value that year -> trust cmc gap (or manual)
        add(y,sym,{'symbol':sym,'name':n,'country':None,'badges':[],'marketcap':int(float(mc)*1e9),'src':f'fortboise:{d}'})
for y,entries in manual.items():
    for e in entries:
        add(int(y),e['symbol'],{'symbol':e['symbol'],'name':e['name'],'country':e['country'],'badges':[],'marketcap':int(e['marketcap']),'sector':e.get('sector'),'src':'manual:'+e.get('source','')})
# ---------- overrides for names/countries/sectors of non-cmc entries ----------
OVERRIDE=json.load(open('overrides.json')) if os.path.exists('overrides.json') else {}
NAME_BY_ERA={
 'DCX':[(2007,'DaimlerChrysler'),(2021,'Daimler'),(9999,'Mercedes-Benz Group')],
 'T':[(2004,'SBC Communications'),(9999,'AT&T')],
 'KFT':[(2011,'Kraft Foods'),(9999,'Mondelez')],
 'RTX':[(2019,'United Technologies'),(2022,'Raytheon Technologies'),(9999,'RTX')],
 'FTE':[(2012,'France Telecom'),(9999,'Orange')],
 'VIAB':[(2018,'Viacom'),(2021,'ViacomCBS'),(9999,'Paramount')],
 'RBS':[(2019,'Royal Bank of Scotland'),(9999,'NatWest Group')],
 'MOT':[(2010,'Motorola'),(9999,'Motorola Solutions')],
 'TTE':[(2002,'TotalFinaElf'),(2020,'Total'),(9999,'TotalEnergies')],
 'SHEL':[(2004,'Royal Dutch/Shell'),(2021,'Royal Dutch Shell'),(9999,'Shell')],
 'GOOG':[(2014,'Google'),(9999,'Alphabet')],
 'META':[(2020,'Facebook'),(9999,'Meta')],
 'ABI.BR':[(2007,'InBev'),(9999,'Anheuser-Busch InBev')],
 'POT':[(2017,'PotashCorp'),(9999,'Nutrien')],
 'DD':[(2016,'DuPont'),(2018,'DowDuPont'),(9999,'DuPont')],
 'BHP':[(2017,'BHP Billiton'),(9999,'BHP')],
 'WMT':[(2017,'Wal-Mart Stores'),(9999,'Walmart')],
 'PM':[(9999,'Philip Morris International')],
 'MO':[(2002,'Philip Morris Companies'),(9999,'Altria')],
 'UL':[(9999,'Unilever')],
 'MUFG':[(2005,'Mitsubishi Tokyo Financial'),(9999,'Mitsubishi UFJ Financial')],
 'NTT':[(9999,'NTT')],
 'SUNW':[(9999,'Sun Microsystems')],
 'BAC':[(9999,'Bank of America')],
 'ALIZY':[(9999,'Allianz')],
 'AIG':[(9999,'American International Group')],
 'GSK':[(2021,'GlaxoSmithKline'),(9999,'GSK')],
 'RIO':[(9999,'Rio Tinto')],
 'NWS':[(2012,'News Corporation'),(9999,'News Corp')],
 'LYG':[(2008,'Lloyds TSB'),(9999,'Lloyds Banking Group')],
 'ITUB':[(2008,'Banco Itaú'),(9999,'Itaú Unibanco')],
 'S':[(2004,'Sprint'),(2012,'Sprint Nextel'),(9999,'Sprint')],
}
def era_name(sym,year,default):
    for upto,nm in NAME_BY_ERA.get(sym,[]):
        if year<=upto: return nm
    return default
def clean_name(n):
    n=re.sub(r'\s*-\s*Market capitalization.*$','',n); n=re.sub(r'\s*\(.*?\)','',n); n=re.sub(r'\s+',' ',n).strip()
    n=re.sub(r',?\s+(Inc\.?|Corp\.?|Corporation|Co\.?|Ltd\.?|PLC|plc|N\.V\.|S\.A\.|AG|SE|Holdings?|Group)$','',n).strip() if len(n.split())>1 else n
    return n
# ---------- build ----------
report={}
unknown=set(); nocountry=set()
for y in YEARS:
    rows=sorted(cands[y].values(), key=lambda r:-r['marketcap'])[:100]
    out=[]
    for i,r in enumerate(rows,1):
        sym=r['symbol']; ex=existing.get(sym,{}); ov=OVERRIDE.get(sym,{})
        src_name=clean_name(r['name'])
        exn=ex.get('name')
        name = exn if (exn and (norm(exn)==norm(src_name) or norm(exn) in norm(src_name) or norm(src_name) in norm(exn))) else src_name
        name=era_name(sym,y,ov.get('name') or name)
        country=ov.get('country') or ex.get('country') or r['country']
        if not country: nocountry.add((sym,r['name'])); country='Unknown'
        sector=ov.get('sector') or r.get('sector') or ex.get('sector') or (sector_from_badges(r['badges']) if r['badges'] else None)
        if not sector: unknown.add((sym,r['name'])); sector='Other'
        region=REGION.get(country)
        if not region: nocountry.add((sym,country)); region='Other'
        out.append({'rank':i,'name':name,'symbol':sym,'marketcap':r['marketcap'],'country':country,'region':region,'sector':sector,'_src':r['src']})
    report[y]={'cutoff':out[-1]['marketcap'] if out else 0,'n':len(out),'sources':{}}
    for o in out: report[y]['sources'][o['_src'].split(':')[0]]=report[y]['sources'].get(o['_src'].split(':')[0],0)+1
    json.dump({'year':y,'companies':out},open(f'build/{y}.json','w'),ensure_ascii=False,indent=1)
os.makedirs('build',exist_ok=True)
for y in YEARS: print(y, report[y]['cutoff']/1e9, report[y]['sources'])
print('UNKNOWN SECTOR:',sorted(unknown)); print('NO COUNTRY/REGION:',sorted(nocountry))
