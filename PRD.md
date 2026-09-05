# PRD: Interactive Market Cap Explorer

## Product Requirements Document

### Overview

Create an interactive web application that allows users to explore and compare the world's largest companies by market capitalization across every year from 2001 to 2026 (extended September 2026; sources in `DATA_SOURCES.md`).

---

### Problem Statement

The current implementation consists of separate static HTML pages for each year (index.html for 2024, world2004.html for 2004). Users cannot:
- Easily compare companies across years
- Track how individual companies have grown or declined
- See which companies entered or exited the top 100
- Interact dynamically with the data

---

### Goals

1. **Unified Experience**: Single application to explore all years
2. **Year Comparison**: Side-by-side comparison between any two years
3. **Company Tracking**: Follow individual companies across time periods
4. **Rich Interactivity**: Filtering, searching, sorting, and detailed views
5. **Insights Discovery**: Surface interesting trends and changes automatically

---

### Target Users

- Investors researching market trends
- Business analysts studying industry shifts
- Educators teaching about global economics
- General public curious about corporate giants

---

### Features

#### Core Features (MVP)

**1. Year Selector**
- Toggle between 2004, 2024, and 2025
- Option to view single year or compare two years
- Smooth animated transitions when switching years

**2. Interactive Bubble Chart**
- Geographic clustering (North America, Europe, Asia, Oceania) with adaptive force strength
- Bubble size = market cap
- Color coding by sector
- Click bubble to see company details
- Hover for quick info tooltip
- Adaptive clustering: force strength increases when one region dominates (e.g., 2004 with 68% North America) to maintain clear regional separation

**3. Company Search & Filter**
- Search by company name or ticker symbol
- Filter by:
  - Sector (multi-select)
  - Country/Region
  - Market cap range
- Highlight matching companies in visualization

**4. Company Detail Panel**
- Company name, symbol, sector, country
- Market cap for each available year
- Growth/decline percentage between years
- Rank change indicator (↑↓)
- Link to external info (optional)

**5. Comparison View**
- Side-by-side bubble charts for two selected years
- Visual indicators for company growth/decline
- Synchronized hover highlighting across both charts

**6. Rankings Table**
- Sortable table view as alternative to bubble chart
- Columns: Rank, Company, Symbol, Sector, Country, Market Cap (per year)
- Export to CSV

#### Enhanced Features (Post-MVP)

**7. Insights Panel**
- Auto-generated insights:
  - "Top 5 fastest growing companies"
  - "Companies that dropped out of top 100"
  - "New entrants to top 100"
  - "Sector share changes"

**8. Share & Embed**
- Shareable URL with current view state
- Embed code for specific visualizations

---

### Data Requirements

**Normalize Data Across Years:**

| Field | 2004 | 2024 | 2025 | Action |
|-------|------|------|------|--------|
| rank | Present | Implicit | Implicit | Add explicit rank |
| name | Present | Present | Present | Normalize naming |
| symbol | Present | Present | Present | Use as unique ID for matching |
| marketcap | Millions | Dollars | Dollars | Convert 2004 to dollars |
| country | Present | Present | Present | OK |
| region | Present | Missing | Missing | Derive from country |
| sector | Present | Present | Present | Normalize categories |

**Company Matching Logic:**
- Primary: Match by stock symbol
- Secondary: Match by normalized company name
- Flag: "Same company" vs "renamed" vs "new/exited"

---

### Technical Architecture

**Frontend Stack:**
- **Framework**: Vanilla JS + D3.js v7 (upgrade from v6)
- **Styling**: Bootstrap 5 + custom CSS
- **State Management**: Simple state object
- **Build**: No build step required
- **Responsive**: Desktop-first design (mobile viewing supported but not optimized)

**Data Loading:**
- Load all three JSON files on app init
- Build unified company index with cross-year references
- Cache processed data in memory

**Key Components:**
```
/marketcap/
├── explorer.html        # Main application entry point
├── css/
│   └── explorer.css     # Application styles
├── js/
│   ├── app.js           # Main application logic & state
│   ├── data.js          # Data loading & normalization
│   ├── chart.js         # D3 bubble visualization
│   └── filters.js       # Search & filter logic
├── data/
│   ├── 2004.json        # Normalized 2004 data
│   ├── 2024.json        # Normalized 2024 data
│   └── 2025.json        # Normalized 2025 data
└── (existing files remain unchanged)
```

---

### UI Wireframe (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│  Market Cap Explorer                    [2004] [2024] [2025]    │
│  100 Largest Companies                  [Compare: ▼ None]       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌────────────────────────────────────────────┐ │
│ │ FILTERS     │  │                                            │ │
│ │             │  │                                            │ │
│ │ 🔍 Search   │  │            BUBBLE CHART                    │ │
│ │ ─────────── │  │                                            │ │
│ │             │  │     North America    Europe                │ │
│ │ Sector      │  │        ◯ ◯ ◯         ◯ ◯                  │ │
│ │ ☑ Tech      │  │      ◯     ◯           ◯                  │ │
│ │ ☑ Finance   │  │                                            │ │
│ │ ☑ Health    │  │        Asia          Oceania               │ │
│ │ ☐ Retail    │  │         ◯ ◯            ◯                  │ │
│ │ ...         │  │           ◯                                │ │
│ │             │  │                                            │ │
│ │ Region      │  │                                            │ │
│ │ ☑ Americas  │  └────────────────────────────────────────────┤ │
│ │ ☑ Europe    │  │ [Chart View] [Table View]                  │ │
│ │ ☑ Asia      │  ├────────────────────────────────────────────┤ │
│ │             │  │ LEGEND: ● Tech ● Finance ● Health ● Oil... │ │
│ └─────────────┘  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COMPANY DETAIL (appears on click)                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Apple (AAPL)                                    Technology  │ │
│ │ United States                                               │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ 2004: N/A          2024: $3.44T (#1)    2025: $4.03T (#2)   │ │
│ │                              Growth 2024→2025: +17.3% ↑      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Side-by-Side Comparison Mode:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Market Cap Explorer          [2004] [2024] [2025]  Compare: ON │
├────────────────────────────────┬────────────────────────────────┤
│          2024                  │           2025                 │
│                                │                                │
│     North America              │      North America             │
│        ◯ ◯ ◯                   │         ◯ ◯ ◯                  │
│      ◯     ◯                   │       ◯     ◯                  │
│                                │                                │
│        Europe                  │         Europe                 │
│          ◯ ◯                   │           ◯ ◯                  │
│                                │                                │
│        Asia                    │         Asia                   │
│         ◯ ◯                    │          ◯ ◯                   │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
│ Hover a company to highlight it in both charts                  │
│ ● Green border = grew  ● Red border = declined  ● Gray = new    │
└─────────────────────────────────────────────────────────────────┘
```

---

### Success Metrics

1. **Engagement**: Time spent exploring (target: >2 min average)
2. **Interaction**: Filters used, companies clicked
3. **Comparison Usage**: % of sessions using year comparison
4. **Completeness**: All 100 companies viewable for each year

---

### Hosting

The application is hosted on GitHub Pages:
- **Live URL**: https://datadrivendecisions.github.io/marketcap/explorer.html

### Open Questions

1. **Naming**: Should the app have a specific brand name?
2. **Additional Years**: Plan to add more historical years (2014, 2019)?
3. **Data Updates**: Will this be updated annually?

---

### Implementation Plan

**Phase 1: Data Normalization**
- Normalize all three data files to consistent format (marketcap in dollars, add region field)
- Build company matching index using stock symbols
- Create normalized JSON files in `/data/` folder

**Phase 2: Project Setup & Core Structure**
- Create `explorer.html` with basic layout
- Set up modular JS files (`app.js`, `data.js`, `chart.js`, `filters.js`)
- Create `explorer.css` with styling
- Implement data loading and state management

**Phase 3: Single Year Visualization**
- Bubble chart with geographic clustering
- Year selector (2004, 2024, 2025 buttons)
- Legend with sector colors
- Click/hover interactions on bubbles

**Phase 4: Side-by-Side Comparison**
- Split view showing two years simultaneously
- Visual indicators for company growth/decline
- Synchronized hover highlighting across both charts

**Phase 5: Search, Filter & Detail Panel**
- Company search by name/symbol
- Sector and region filter checkboxes
- Company detail panel showing data across all years

**Phase 6: Polish & Testing**
- Smooth transitions between views
- Performance optimization
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

### Files to Create

| File | Purpose |
|------|---------|
| `explorer.html` | Main application entry point |
| `css/explorer.css` | Application styles |
| `js/app.js` | Main app logic, state management, UI coordination |
| `js/data.js` | Data loading, normalization, company matching |
| `js/chart.js` | D3 bubble chart visualization |
| `js/filters.js` | Search and filter functionality |
| `data/2004.json` | Normalized 2004 data |
| `data/2024.json` | Normalized 2024 data |
| `data/2025.json` | Normalized 2025 data |

**Note:** Existing files (`index.html`, `world2004.html`, original JSON files) remain unchanged.

---

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance with 200 bubbles (comparison) | Use canvas rendering or limit visible bubbles |
| Company name mismatches across years | Manual review of symbol-based matches |
| Mobile usability | Desktop-first approach, simplified mobile view |
| Browser compatibility | Test on Chrome, Firefox, Safari, Edge |
