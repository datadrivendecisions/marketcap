# Technical Requirements Document
## Market Cap Explorer

---

## 1. Overview

This document defines the technical specifications for building the Market Cap Explorer, an interactive web application for comparing company market capitalizations across 2004, 2024, and 2025.

---

## 2. Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Visualization | D3.js | v7.x | Bubble charts, force simulations, transitions |
| UI Framework | Bootstrap | 5.3.x | Layout, components, responsive grid |
| Language | Vanilla JavaScript | ES6+ | Application logic |
| Styling | CSS3 | - | Custom styles, animations |
| Data Format | JSON | - | Normalized company data |

**No build tools required** - all files served directly.

---

## 3. Data Architecture

### 3.1 Normalized Data Schema

All year files must conform to this schema:

```json
{
  "year": 2024,
  "companies": [
    {
      "rank": 1,
      "name": "Apple",
      "symbol": "AAPL",
      "marketcap": 3439016804352,
      "country": "United States",
      "region": "North America",
      "sector": "Technology"
    }
  ]
}
```

### 3.2 Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rank` | integer | Yes | Position in top 100 (1-100) |
| `name` | string | Yes | Company display name |
| `symbol` | string | Yes | Stock ticker (primary matching key) |
| `marketcap` | integer | Yes | Market cap in USD (not millions) |
| `country` | string | Yes | Country of headquarters |
| `region` | string | Yes | Geographic region for clustering |
| `sector` | string | Yes | Industry sector for color coding |

### 3.3 Data Normalization Rules

**Market Cap Conversion (2004 data):**
```javascript
// 2004 data is in millions, convert to dollars
normalizedMarketcap = originalMarketcap * 1_000_000;
```

**Region Derivation:**
```javascript
const countryToRegion = {
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  "China": "Asia",
  "Japan": "Asia",
  "Taiwan": "Asia",
  "South Korea": "Asia",
  "India": "Asia",
  "Saudi Arabia": "Asia",
  "United Arab Emirates": "Asia",
  "United Kingdom": "Europe",
  "France": "Europe",
  "Germany": "Europe",
  "Switzerland": "Europe",
  "Netherlands": "Europe",
  "Spain": "Europe",
  "Denmark": "Europe",
  "Ireland": "Europe",
  "Australia": "Oceania"
};
```

**Sector Normalization:**

Map source sectors to standardized categories:

| Standard Sector | Aliases |
|-----------------|---------|
| Technology | Tech, Software, Internet |
| Semiconductors | Semiconductor Equipment |
| Financial Services | Banks, Investment, Insurance |
| Health Care | Pharmaceuticals, Healthcare |
| Retail | E-Commerce, Restaurants |
| Oil & Gas Operations | Oil & Gas, Energy |
| Automotive | Automakers |
| Food & Drink | Beverages, Food |
| Luxury Goods | Clothing |
| Telecommunications Services | Telecom |
| Aerospace & Defense | Aerospace |
| Conglomerate | Investment (if diversified) |
| Other | Chemicals, Industrial, Tobacco, Batteries |

---

## 4. Application State

### 4.1 State Object Structure

```javascript
const appState = {
  // Data
  data: {
    2004: null,  // Loaded company array
    2024: null,
    2025: null
  },
  companyIndex: {},  // symbol -> {2004: data, 2024: data, 2025: data}

  // View state
  view: {
    mode: 'single',        // 'single' | 'compare'
    primaryYear: 2024,     // Currently selected year
    compareYear: null,     // Second year for comparison (or null)
    viewType: 'chart'      // 'chart' | 'table'
  },

  // Filters
  filters: {
    search: '',            // Search query string
    sectors: [],           // Selected sectors (empty = all)
    regions: []            // Selected regions (empty = all)
  },

  // UI state
  ui: {
    selectedCompany: null, // Symbol of selected company
    hoveredCompany: null   // Symbol of hovered company
  }
};
```

### 4.2 State Management Functions

```javascript
// Update state and trigger re-render
function setState(path, value) { ... }

// Subscribe to state changes
function onStateChange(callback) { ... }

// Get filtered companies for current view
function getFilteredCompanies(year) { ... }
```

---

## 5. Component Specifications

### 5.1 File Structure

```
/marketcap/
├── explorer.html
├── css/
│   └── explorer.css
├── js/
│   ├── app.js          # Entry point, state management, event coordination
│   ├── data.js         # Data loading, normalization, company matching
│   ├── chart.js        # D3 bubble chart rendering
│   └── filters.js      # Search and filter UI logic
└── data/
    ├── 2004.json
    ├── 2024.json
    └── 2025.json
```

### 5.2 Module Interfaces

**data.js**
```javascript
// Load and normalize all data files
async function loadAllData() -> Promise<{2004: [], 2024: [], 2025: []}>

// Build cross-year company index
function buildCompanyIndex(data) -> {symbol: {2004: obj, 2024: obj, 2025: obj}}

// Get company data across all years
function getCompanyHistory(symbol) -> {2004: obj|null, 2024: obj|null, 2025: obj|null}

// Calculate growth between years
function calculateGrowth(symbol, fromYear, toYear) -> {absolute: number, percent: number}
```

**chart.js**
```javascript
// Initialize chart in container
function initChart(containerId, width, height) -> void

// Render bubble chart for year
function renderChart(year, companies, options) -> void

// Update chart with new data (animated)
function updateChart(year, companies, options) -> void

// Highlight specific company
function highlightCompany(symbol) -> void

// Clear all highlights
function clearHighlights() -> void

// Render comparison view (two charts)
function renderComparison(year1, year2, companies1, companies2) -> void
```

**filters.js**
```javascript
// Initialize filter UI
function initFilters(containerID) -> void

// Get current filter state
function getFilters() -> {search: string, sectors: [], regions: []}

// Apply filters to company list
function applyFilters(companies, filters) -> []

// Update filter UI (e.g., after data load)
function updateFilterOptions(sectors, regions) -> void
```

**app.js**
```javascript
// Initialize application
async function init() -> void

// Handle year selection
function selectYear(year) -> void

// Handle comparison toggle
function toggleComparison(year) -> void

// Handle company selection
function selectCompany(symbol) -> void

// Handle view type change
function setViewType(type) -> void

// Export current view as CSV
function exportCSV() -> void
```

---

## 6. Visualization Specifications

### 6.1 Bubble Chart Layout

**Dimensions:**
- Single view: 1400 x 900 px
- Comparison view: 700 x 800 px per chart

**Geographic Clustering:**
```javascript
const regionPositions = {
  "North America": { x: 350, y: 450, radius: 400 },
  "Europe":        { x: 900, y: 300, radius: 320 },
  "Asia":          { x: 1100, y: 600, radius: 350 },
  "Oceania":       { x: 1200, y: 850, radius: 150 }
};
```

**Force Simulation Parameters:**
```javascript
const simulation = d3.forceSimulation(nodes)
  .force("x", d3.forceX(d => regionPositions[d.region].x).strength(0.3))
  .force("y", d3.forceY(d => regionPositions[d.region].y).strength(0.3))
  .force("collide", d3.forceCollide(d => radiusScale(d.marketcap) + 2).strength(1))
  .alphaDecay(0.02);
```

**Radius Scale:**
```javascript
const radiusScale = d3.scaleSqrt()
  .domain([minMarketCap, maxMarketCap])
  .range([15, 120]);  // Min/max bubble radius in pixels
```

### 6.2 Sector Color Palette

```javascript
const sectorColors = {
  "Technology":                   "#FFD700",  // Gold
  "Semiconductors":               "#87CEFA",  // Light Sky Blue
  "Financial Services":           "#9ACD32",  // Yellow Green
  "Health Care":                  "#BB7AFA",  // Medium Purple
  "Retail":                       "#FF6347",  // Tomato
  "Oil & Gas Operations":         "#7CFC00",  // Lawn Green
  "Automotive":                   "#FF69B4",  // Hot Pink
  "Food & Drink":                 "#FFB6C1",  // Light Pink
  "Luxury Goods":                 "#FFA07A",  // Light Salmon
  "Telecommunications Services":  "#AFEEEE",  // Pale Turquoise
  "Conglomerate":                 "#FF82AB",  // Light Hot Pink
  "Media":                        "#FFDAB9",  // Peach Puff
  "Aerospace & Defense":          "#DDA0DD",  // Plum
  "Household & Personal Products":"#C0FF3E",  // Yellow Green Light
  "Other":                        "#C0C0C0"   // Silver
};
```

### 6.3 Interaction Behaviors

**Hover:**
- Show tooltip with: Company name, symbol, market cap, rank
- Increase bubble opacity to 1.0
- Dim other bubbles to 0.3 opacity
- In comparison mode: highlight same company in both charts

**Click:**
- Open company detail panel
- Add selection ring around bubble
- Persist until another company clicked or panel closed

**Legend Hover:**
- Highlight all companies in that sector
- Dim other sectors

---

## 7. UI Components

### 7.1 Layout Structure

```html
<div class="container-fluid">
  <!-- Header -->
  <header class="d-flex justify-content-between align-items-center">
    <div>
      <h1>Market Cap Explorer</h1>
      <p class="subtitle">100 Largest Companies by Market Capitalization</p>
    </div>
    <div class="year-selector">
      <button data-year="2004">2004</button>
      <button data-year="2024" class="active">2024</button>
      <button data-year="2025">2025</button>
      <select id="compare-select">
        <option value="">Compare...</option>
        <option value="2004">vs 2004</option>
        <option value="2025">vs 2025</option>
      </select>
    </div>
  </header>

  <!-- Main Content -->
  <div class="row">
    <!-- Sidebar Filters -->
    <aside class="col-md-2" id="filters-panel">
      <!-- Search, sector checkboxes, region checkboxes -->
    </aside>

    <!-- Chart Area -->
    <main class="col-md-10">
      <div id="chart-container"></div>
      <div class="view-toggle">
        <button data-view="chart" class="active">Chart</button>
        <button data-view="table">Table</button>
      </div>
      <div id="legend"></div>
    </main>
  </div>

  <!-- Company Detail Panel (hidden by default) -->
  <div id="company-detail" class="offcanvas offcanvas-end">
    <!-- Company info, cross-year comparison -->
  </div>
</div>
```

### 7.2 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| ≥1400px | Full layout, large charts |
| 1200-1399px | Slightly smaller charts |
| 992-1199px | Sidebar collapses to top |
| <992px | Basic viewing, no comparison |

### 7.3 Company Detail Panel

```html
<div id="company-detail">
  <header>
    <h2 class="company-name">Apple</h2>
    <span class="company-symbol">AAPL</span>
    <span class="company-sector badge">Technology</span>
  </header>

  <div class="company-location">
    <span class="country">United States</span>
    <span class="region">North America</span>
  </div>

  <table class="year-comparison">
    <thead>
      <tr><th>Year</th><th>Rank</th><th>Market Cap</th><th>Change</th></tr>
    </thead>
    <tbody>
      <tr><td>2004</td><td>-</td><td>N/A</td><td>-</td></tr>
      <tr><td>2024</td><td>#1</td><td>$3.44T</td><td>-</td></tr>
      <tr><td>2025</td><td>#2</td><td>$4.03T</td><td class="positive">+17.3%</td></tr>
    </tbody>
  </table>
</div>
```

---

## 8. Performance Requirements

| Metric | Target |
|--------|--------|
| Initial load time | < 2 seconds |
| Year switch animation | < 500ms |
| Filter response | < 100ms |
| Smooth animation | 60 FPS |

**Optimization Strategies:**
1. Load data files in parallel
2. Debounce search input (300ms)
3. Use `requestAnimationFrame` for animations
4. Limit force simulation iterations
5. Use CSS transforms for bubble positioning

---

## 9. Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Required Features:**
- ES6 modules (or bundled)
- CSS Grid & Flexbox
- SVG 1.1
- Fetch API
- CSS Custom Properties

---

## 10. Testing Checklist

### 10.1 Data Integrity
- [ ] All 100 companies load for each year
- [ ] Market caps display correctly (T/B formatting)
- [ ] Company matching by symbol works across years
- [ ] Region derivation is correct for all countries

### 10.2 Visualization
- [ ] Bubbles sized proportionally to market cap
- [ ] Geographic clustering groups companies correctly
- [ ] Sector colors match legend
- [ ] No bubble overlaps after simulation settles

### 10.3 Interactions
- [ ] Year buttons switch data correctly
- [ ] Comparison mode shows two charts
- [ ] Search filters companies in real-time
- [ ] Sector/region filters work correctly
- [ ] Hover highlights work in both single and comparison modes
- [ ] Company detail panel shows correct cross-year data

### 10.4 Responsiveness
- [ ] Layout adapts at each breakpoint
- [ ] Charts resize appropriately
- [ ] Touch interactions work on tablet

---

## 11. API Reference (Internal)

### 11.1 Events

Custom events dispatched on `document`:

| Event | Detail | Description |
|-------|--------|-------------|
| `yearChanged` | `{year: number}` | Primary year selection changed |
| `comparisonChanged` | `{year: number\|null}` | Comparison year toggled |
| `filtersChanged` | `{filters: object}` | Any filter updated |
| `companySelected` | `{symbol: string}` | Company clicked |
| `companyHovered` | `{symbol: string\|null}` | Company hover state changed |

### 11.2 CSS Custom Properties

```css
:root {
  --chart-bg: #ffffff;
  --bubble-stroke: #ffffff;
  --bubble-stroke-width: 1.5px;
  --highlight-stroke: #000000;
  --highlight-stroke-width: 3px;
  --dim-opacity: 0.3;
  --transition-duration: 300ms;
}
```

---

## 12. Deliverables

1. **Normalized Data Files** (`data/2004.json`, `data/2024.json`, `data/2025.json`)
2. **Application Entry Point** (`explorer.html`)
3. **JavaScript Modules** (`js/app.js`, `js/data.js`, `js/chart.js`, `js/filters.js`)
4. **Stylesheet** (`css/explorer.css`)
5. **Documentation** (this document + inline code comments)
