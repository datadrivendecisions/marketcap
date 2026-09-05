import re,html,json,os,glob
def parse_page(path):
    s=open(path,encoding='utf-8',errors='ignore').read()
    title=re.search(r'<title>([^<]*)</title>',s); title=html.unescape(title.group(1)) if title else ''
    m=re.match(r'(.*?) \(([^)]+)\) - Market capitalization',title)
    name,ticker=(m.group(1),m.group(2)) if m else (title,None)
    badges=[re.sub(r'^[^A-Za-z0-9]+','',html.unescape(b)).strip() for b in re.findall(r'category-badge"[^>]*>([^<]*)<',s)]
    hist={}
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>',s,flags=re.S):
        cells=[html.unescape(re.sub(r'<[^>]+>','',c)).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>',tr,flags=re.S)]
        if len(cells)>=2 and re.match(r'^(19|20)\d\d$',cells[0]):
            mm=re.match(r'\$([\d.]+)\s*([TBM])',cells[1].replace(',',''))
            if mm:
                v=float(mm.group(1))*{'T':1e12,'B':1e9,'M':1e6}[mm.group(2)]
                hist[int(cells[0])]=int(round(v))
    # country: look for flag+country in the header area "Country: ..." or from the ranking universe (fallback)
    co=re.search(r'largest-companies-in-[^"]*"[^>]*>[^<]*<span class="responsive-hidden">([^<]*)</span></a></div><div class="line2">Country',s)
    return {'name':name,'ticker':ticker,'badges':badges,'hist':hist,'country':html.unescape(co.group(1)).strip() if co else None}
if __name__=='__main__':
    files=sorted(glob.glob('cmc/pages/*.html'))
    out={}
    for f in files:
        slug=os.path.basename(f)[:-5]; out[slug]=parse_page(f)
    json.dump(out,open('cmc_parsed.json','w'),ensure_ascii=False)
    print(len(out))
    from collections import Counter
    c=Counter(b for v in out.values() for b in v['badges'])
    print(c.most_common(60))
    print({k:v for k,v in list(out.items())[:2]})
    print('no hist:',[k for k,v in out.items() if not v['hist']][:10], 'no country:', sum(1 for v in out.values() if not v['country']))
