# Data Sources

All datasets in `data/` use the same normalized schema (see `CLAUDE.md`). Market caps are in USD. Raw copies of the
source material for the years added in September 2026 are kept in `data/sources/`.

## 2026 — `data/2026.json`

- **Source:** [CompaniesMarketCap.com — Global ranking by market capitalization](https://companiesmarketcap.com/) (page 1, ranks 1–100).
- **Snapshot date:** 4 September 2026 (live values on the day the page was fetched; the site updates continuously).
- **Raw copy:** `data/sources/2026_companiesmarketcap_2026-09-04.csv`.
- **Normalization:**
  - Ticker aliases were mapped onto the symbols already used in `data/2024.json` / `data/2025.json` so cross-year
    lookups keep working: `RO.SW → ROG.SW` (Roche), `SIE.DE → SIEGY` (Siemens), `0857.HK → 601857.SS` (PetroChina),
    `ITX.MC → IDEXY` (Inditex), `ALV.DE → ALIZY` (Allianz).
  - Company name, country and sector were taken from the existing 2024/2025 entries when the symbol already existed.
  - Companies new to the dataset (SpaceX, CXMT, Intel, Dell, Palo Alto Networks, Arm, Arista, BHP, Sandisk, KLA,
    MediaTek, CrowdStrike, Banco Santander, SoftBank Group, Amphenol, Toronto-Dominion Bank) were assigned a sector
    from the existing 15-sector list by hand.

## 2001 — `data/2001.json`

- **Source:** Tom von Alten, *Top 100 Companies by Market Capitalization, 30 Dec 2001*, fortboise.org —
  [https://fortboise.org/top100/top100-20011230.html](https://fortboise.org/top100/top100-20011230.html)
  (index of all weekly snapshots: [https://fortboise.org/top100/](https://fortboise.org/top100/);
  background page: [https://fortboise.org/top100mktcap.html](https://fortboise.org/top100mktcap.html)).
  The table is embedded as a JavaScript array; it was read from the
  [Wayback Machine copy](https://web.archive.org/web/2005id_/http://fortboise.org/top100/top100-20011230.html).
- **As-of date:** 29/30 December 2001 (last trading week of 2001).
- **Raw copies:** `data/sources/2001_fortboise_top100_2001-12-30.html` (original page) and
  `data/sources/2001_fortboise_top100_2001-12-30.csv` (extracted table).
- **Units:** the page lists market caps in billions of USD, rounded to whole billions; they were multiplied by 1e9.
- **Method and caveats:** the author generated the list weekly from a Yahoo Finance stock screen
  (`generator: yahoo.pl`), and notes the data "is not guaranteed, but it should be close". Because the screen covers
  US-listed shares and ADRs, companies without a US listing at the time were absent. Ten such companies were
  evaluated by hand (see below); nine qualified and were added, which pushed the ten smallest screen entries out of
  the top 100. Rounded values mean several companies share the same market cap; the source's rank order was kept
  for ties, and a hand-computed value beats a rounded screen value only when it is strictly larger.
- **Manual additions (price × shares outstanding, converted at the Federal Reserve H.10 noon buying rate for the
  price date):** inputs and results are in `data/sources/2001_manual_additions.csv`. Exchange rates used:
  28 Dec 2001 — ¥131.30, CHF 1.6790 and €0.8822 per $1; 31 Dec 2001 — $1.4543 per £1 and HK$7.7980 per $1
  ([H.10 week ending 28 Dec 2001](https://www.federalreserve.gov/releases/h10/20011231/h10.txt) and
  [H.10 week ending 4 Jan 2002](https://www.federalreserve.gov/releases/h10/20020107/h10.txt); raw copies in
  `data/sources/`). Where a company's own annual report states a year-end market capitalisation that reconciles
  with shares × price, that figure was used.

  | Company (2001 rank) | Local market cap | USD | Price basis | Shares | Sources |
  |---|---|---|---|---|---|
  | NTT DoCoMo (#22) | ¥15,455.4bn | $117.7bn | ¥1,540,000 TSE close 28 Dec 2001 | 10,036,000 (pre-split) | Nikkei quote pages archived 2 Jan 2002: [result.cfm](https://web.archive.org/web/20020102143039/http://marketsearch.nikkei.co.jp/stock/result.cfm?scode=9437&ba=1&form=stock1), [mprice.cfm](https://web.archive.org/web/20020102115315/http://marketsearch.nikkei.co.jp/cdb/mprice.cfm?scode=9437&ba=01) (copy in `data/sources/`); [Form 20-F FY2001](https://www.sec.gov/Archives/edgar/data/0001166141/000102140802009329/d20f.htm); [registration 20-F, Feb 2002](https://www.docomo.ne.jp/english/corporate/ir/binary/pdf/library/sec/backnumber/fy2000_e.pdf) |
  | Nestlé (#38) | CHF 137,230m (company-stated, net of treasury shares) | $81.7bn | CHF 354.00 SWX close 28 Dec 2001 | 387,655,546 net (403,520,000 issued) | [Management Report 2001](https://www.nestle.com/sites/default/files/asset-library/documents/library/documents/annual_reports/2001-management-report-en.pdf) |
  | Royal Bank of Scotland (#49) | £47.81bn (company-stated) | $69.5bn | 1,672p LSE close 31 Dec 2001 | 2,859,520,445 | [Form 20-F 2001](https://www.sec.gov/Archives/edgar/data/844150/000095010302000379/apr0802_20f.txt); [results 6-K, 28 Feb 2002](https://www.sec.gov/Archives/edgar/data/844150/000095010302000213/feb2802_6k.txt) |
  | Roche (#60) | CHF 102,209m (company-stated) | $60.9bn | bearer CHF 136.00, Genussschein CHF 118.50, 28 Dec 2001 | 160,000,000 shares + 702,562,700 Genussscheine, net of own securities | [Annual Report 2001](https://web.archive.org/web/20031018212342/http://www.roche.com/pages/downloads/investor/pdf/reports/gb01/gb01e.pdf); [Finance Report 2005 five-year table](https://assets.cwp.roche.com/f/126832/4ff92c8f51/fb05e.pdf) |
  | Sanofi-Synthélabo (#68) | €61,342m (company-stated) | $54.1bn | €83.80 Paris close 28 Dec 2001 | 732,005,084 | [Document de référence 2001](https://www.bnains.org/archives/communiques/Sanofi-Aventis/20020827_Document_de_reference_2001_Sanofi-Synthelabo.pdf); [SEC 20-F registration, June 2002](https://www.sec.gov/Archives/edgar/data/1121404/000102123102000143/0001021231-02-000143.txt) |
  | L'Oréal (#78) | €54,693m (company-stated €54.7bn) | $48.3bn | €80.90 Paris close 28 Dec 2001 | 676,062,160 | [Document de référence 2001](https://www.bnains.org/archives/communiques/L_Oreal/20020506_Document_de_reference_2001_L_Oreal.pdf) |
  | Munich Re (#79) | €53,961m (company-stated) | $47.6bn | €304.95 Xetra close 28 Dec 2001 | 176,949,993 | [Geschäftsbericht 2001](https://www.munichre.com/content/dam/munichre/contentlounge/website-pieces/documents/302-03166_de.pdf/_jcr_content/renditions/original.media_file.download_attachment.file/302-03166_de.pdf) |
  | HBOS (#93) | £28.39bn (computed) | $41.3bn | 796p at 31 Dec 2001 | 3,566,567,091 | [Annual Report & Accounts 2001](https://ddd.uab.cat/pub/infanu/28505/iaHBOSa2001ieng.pdf) |
  | Hutchison Whampoa (#94) | HK$320,818.65m (exchange-stated) | $41.1bn | HK$75.25 HKEX close 31 Dec 2001 | 4,263,370,780 | [HKEX Fact Book 2001](https://www.hkex.com.hk/-/media/HKEX-Market/Market-Data/Statistics/Consolidated-Reports/HKEX-Fact-Book/HKEx-Fact-Book-2001/FB_2001.pdf); [Annual Report 2001](https://doc.irasia.com/listco/hk/hutchison/annual/2001/ar2001.pdf) |
  | Takeda (#97) | ¥5,273.4bn (computed) | $40.2bn | ¥5,930 TSE close 28 Dec 2001 | 889,272,395 | [Takeda Databook FY2001](https://web.archive.org/web/20051025032234id_/http://www.takeda.co.jp:80/english/financial/databook2002/pdf/00.pdf); Yahoo Finance daily close for 4502.T, cross-checked against the [archived Nikkei quote of 21 Dec 2001](http://web.archive.org/web/20011221161625id_/http://marketsearch.nikkei.co.jp/stock/result.cfm?scode=4502) |
  | BNP Paribas (not included) | €44,520m (company-stated) | $39.3bn | €100.5 Paris close 28 Dec 2001 | 442,985,696 | [Document de référence 2001](https://invest.bnpparibas/document/document-de-reference-2001) — below the $40bn cutoff |

  Other non-US-listed companies were considered and judged clearly below the cutoff on public year-end figures
  (for example Samsung Electronics at roughly $31bn of common stock, Generali, Carrefour and Swiss Re), so they were
  not researched further.
- **Displaced from the screen list (ranks 91–100 of the source) by the additions:** Anheuser-Busch ($40bn, tie
  broken by the additions' unrounded values), Sony, QUALCOMM, Diageo, Banco Bilbao Vizcaya Argentaria, Honda,
  FleetBoston Financial, Aegon, Philips and Banco Santander (all $37–39bn). The full source list remains in
  `data/sources/2001_fortboise_top100_2001-12-30.csv`.
- **Symbols for the additions:** existing symbols were reused where the company appears in other years
  (`NESN.SW`, `ROG.SW`, `OR.PA`, `SNY`, `DCM`); the others use `RBS`, `HBOS`, `MUV2.DE`, `0013.HK`, `4502.T`.
  L'Oréal keeps the `Luxury Goods` sector used in the 2024–2026 files.

## 2002–2003 and 2005–2023 — `data/2002.json` … `data/2023.json` (year-end snapshots)

These 21 files were assembled in September 2026 and represent the top 100 by market capitalisation as of the
**last trading day of each calendar year**, in USD. They were built by the script `data/sources/build_years.py`
from three layers, in this order of precedence:

1. **companiesmarketcap.com year-end histories.** Every company page on
   [companiesmarketcap.com](https://companiesmarketcap.com/) carries an "End of year Market Cap" table (USD, all
   share classes, converted by the site at year-end rates). The tables for the site's current top 2,000 companies plus
   about 130 additional pages for delisted or renamed companies (Wachovia, Genentech, Wyeth, BellSouth, Sun
   Microsystems, Yahoo, Nortel, Alcatel-Lucent, BG Group, Allergan, NTT DoCoMo, Credit Suisse, Daimler, United
   Technologies, …) were fetched on 4 September 2026 and saved compactly in
   `data/sources/companiesmarketcap_yearend_history_2026-09-04.json` (2,035 companies, with the site's category
   badges and country). Companies still listed today therefore have a consistent single-source series.
2. **fortboise.org weekly top-100 lists (2002–2006).** Tom von Alten's Yahoo-screen lists exist for every year-end
   through January 2007 (`data/sources/fortboise_top100_YYYY-MM-DD.csv`, from the 29 Dec 2002, 28 Dec 2003,
   26 Dec 2004, 25 Dec 2005 and 31 Dec 2006 pages). They were used only for companies that companiesmarketcap.com
   does not track at all (for example Merrill Lynch, Bank One, Aventis, FleetBoston, Tyco, ABN AMRO, Viacom's old
   entity, Fannie Mae and Freddie Mac in their pre-2008 form, Telecom Italia, Shell Transport).
3. **Hand-researched values** (`data/sources/manual_yearend_values.json`, 154 company-year records, each with its
   source). These fill (a) companies whose online history starts late because only a later listing is tracked —
   Google before 2014, Allianz before 2007, Roche before 2006, Samsung before 2007, the Chinese state banks and
   insurers before their A-share listings, PetroChina 2002–2003, Mizuho 2004–2005, Nintendo 2007–2008, Gazprom,
   Rosneft, Sberbank and Lukoil before 2010–2012, SABIC before 2012, Takeda before 2008, IHC before 2023 —
   (b) companies with no online history at all — Royal Bank of Scotland 2002–2006, HBOS 2002–2007, Fortis, Suez,
   Xstrata, SABMiller, Kraft Foods 2007–2011, Time Warner, Merrill Lynch, Dell, EMC, Celgene, Reynolds American,
   Twenty-First Century Fox — and (c) corrupted values in the site's histories that were detected by comparing each
   value with its neighbouring years and with known figures: Shell 2005–2021 (site counted A shares only),
   Unilever 2003–2006 (NV only), UBS 2002–2005, Roche 2012, BNP Paribas 2010, Ambev 2010–2012, Nestlé 2002,
   Chevron 2002, Canon 2002–2003, BHP 2009 and Volkswagen 2008. Values researched in local currency were converted
   at the Federal Reserve H.10 noon buying rate of the last trading day of the year
   (`data/sources/fed_h10_yearend_rates.csv`, from the H.10 historical series). Where the company's own annual
   report states a year-end market capitalisation, that figure was used.

Site histories with implausible spikes were excluded outright (ENKA, LATAM Airlines, Coca-Cola FEMSA,
Shanghai Electric, FEMSA, Norilsk Nickel 2010, Richemont 2014). Chinese state-owned companies are valued the way the
site (and the FT/Bloomberg convention) does: all shares at the A-share price once an A-share exists, otherwise at the
H-share price, which is why PetroChina shows about $0.7 trillion at end-2007.

**Sectors and countries.** Companies already present in the 2001, 2004 or 2024–2026 files keep their symbol, sector
and country. New companies take the country from companiesmarketcap.com and a sector mapped from the site's category
badges onto the app's 15 sectors (Semiconductors › utilities→Other › Oil & Gas › Automotive › Health Care ›
Conglomerate › Financial Services › Luxury Goods › Telecommunications › Media › Aerospace & Defense › Food & Drink ›
Retail › Household & Personal Products › Technology › Other). A few hand overrides cover companies without badges.
Names are era-appropriate where a company was renamed (SBC Communications → AT&T, Kraft Foods → Mondelez, United
Technologies → Raytheon Technologies → RTX, Google → Alphabet, Facebook → Meta, DaimlerChrysler → Daimler →
Mercedes-Benz Group, Royal Dutch/Shell → Royal Dutch Shell → Shell, Total → TotalEnergies, and so on) while the symbol
stays constant so the company links across years. Symbol aliases used: RO.SW→ROG.SW, SIE.DE→SIEGY, 0857.HK→601857.SS,
ITX.MC→IDEXY, ALV.DE→ALIZY, 9437.T→DCM, 9432.T→NTT, 7751.T→CAJ, TEF.MC→TEF, ORA.PA→FTE, EOAN.DE→EONGY, ENEL.MI→ENEL,
MBG.DE/DAI.DE→DCX, NWG→RBS, MSI→MOT, JAVA→SUNW, UTX→RTX, MDLZ→KFT, VIAC→VIAB, FNMA→FNM, FMCC→FRE, DTE.DE→DT, TIT.MI→TI,
GAZP.ME→OGZPY, TAK→4502.T, AIR.PA→EADSY, 601628.SS→2628.HK, 601318.SS→2318.HK, BRK-A→BRK-B, SC/RD/RDS-A/RDS-B→SHEL,
TOT→TTE, CHL→0941.HK, MTU/MTF→MUFG, STD→SAN, BBV→BBVA, BBL→BHP, SNE→SONY. The AB InBev lineage uses `ABI.BR` so it
does not collide with the pre-2008 Anheuser-Busch (`BUD`).

**Known limitations.** The site's year-end values are its own conversions and occasionally disagree with company
reports by a few percent; only glaring errors were replaced. Some hand-researched figures are approximate (SABMiller
2012–2015 derived from Altria's stake valuation; Suez 2007 from the December price range; Enel 2003 on the December
average price; Fortis 2006–2007 rounded company statements). Companies that had no listing tracked anywhere and were
not researched could still be missing in a given year; the per-year cutoff (the 100th company's value) is listed in
`data/sources/yearend_build_report.md` so borderline omissions can be judged, and the source layer used for every
company-year is in `data/sources/yearend_build_sources.json`. The build script (`build_years.py`, `parse_cmc.py`,
`build_overrides.json`) is kept alongside so the lists can be regenerated.

## 2004, 2024, 2025 — `data/2004.json`, `data/2024.json`, `data/2025.json` (in-year snapshots)

- Pre-existing datasets, left unchanged. Note that these are snapshots taken during the year, not at year end (the 2004 file, of unknown exact date, shows early-2004 values; a year-end 2004 rebuild is kept as `data/sources/2004_yearend_rebuild_not_used.json` in case a consistent year-end series is preferred). Normalized from the original files kept in the repository root
  (`top1002004.csv` / `top1002004.json`, `top_100_companies_with_symbols.json`,
  `top_100_companies_2025_with_symbols.json`). The 2024 and 2025 lists come from
  [CompaniesMarketCap.com](https://companiesmarketcap.com/).

## Other sources consulted for 2001 (not used for the dataset)

These were checked while looking for a complete 2001 top-100 list, and for sanity-checking the top of the ranking:

- BusinessWeek Global 1000 (2001), market values as of 31 May 2001 — GE $486.7B and Microsoft $369.1B at the top:
  [Bloomberg scoreboard listing](https://www.bloomberg.com/news/articles/2001-07-08/scoreboard-the-businessweek-global-1000-dot-pdf)
  (subscriber-only) and the
  [PetroChina press note](https://www.petrochina.com.cn/ptr/xwxx/201404/2461d916baa34a2488e0e4d7f9356065.shtml).
- [Financial Times Global 500 (Wikipedia)](https://en.wikipedia.org/wiki/Financial_Times_Global_500) — no archived
  2001 table online.
- [Benzinga: Top 10 companies by market cap in 2001 vs. now](https://www.benzinga.com/general/education/21/10/23509013/top-10-companies-by-market-cap-then-2001-and-now-has-only-microsoft-in-common-heres-elon-musks-)
  — top-10 order consistent with the fortboise list.
- [Motley Fool: The world's most valuable companies 2000 to 2022](https://www.fool.com/investing/2022/04/21/the-worlds-most-valuable-companies-2000-to-2022).
