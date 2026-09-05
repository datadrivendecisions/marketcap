# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Market Cap Explorer is an interactive web application for visualizing and comparing the world's 100 largest companies by market capitalization for every year from 2001 to 2026 (26 annual snapshots). It uses D3.js for bubble chart visualization with geographic clustering by region.

## Development Commands

**Run locally:**
```bash
python3 -m http.server 8080
# Then open http://localhost:8080/explorer.html
```

**Validate JSON data files:**
```bash
python3 -c "import json; [json.load(open(f'data/{y}.json')) for y in range(2001, 2027)]"
```

No build tools, bundlers, or package managers are required. The app runs directly from static files.

## Architecture

### Module Structure

The application uses ES6 modules with the following dependency flow:

```
explorer.html
    └── js/app.js (main orchestrator, state management)
            ├── js/data.js (data loading, formatting, export)
            ├── js/chart.js (D3 bubble visualization)
            └── js/filters.js (search and filter UI)
```

### Application State

State is managed in `js/app.js` with this structure:
- `data`: Raw company arrays keyed by year (2001 … 2026); the list is generated in `availableYears` in `js/data.js`
- `companyIndex`: Symbol-based lookup for cross-year company matching
- `currentYear`: Selected primary year (defaults to 2026)
- `compareYear`: Optional second year for side-by-side comparison
- `viewType`: 'chart' or 'table'
- `sidebarCollapsed`: Whether the filter sidebar is collapsed (persisted to localStorage)
- `filters`: Search term, selected sectors, selected regions

### Data Schema

All data files in `data/` follow this normalized schema:
```json
{
  "year": 2024,
  "companies": [{
    "rank": 1,
    "name": "Company Name",
    "symbol": "TICKER",
    "marketcap": 3439016804352,
    "country": "United States",
    "region": "North America",
    "sector": "Technology"
  }]
}
```

Market caps are stored in actual USD (not millions). The 2004 data was converted from millions and the 2001 data from billions during normalization.

Provenance, snapshot dates, ticker aliases and caveats for every year are documented in `DATA_SOURCES.md`; raw source copies live in `data/sources/`. Years 2002–2023 are year-end (31 December) snapshots assembled from companiesmarketcap.com year-end histories plus hand-researched values; 2024–2026 are in-year snapshots. When adding a year: add `data/{year}.json`, extend `availableYears` in `js/data.js`, and document the source in `DATA_SOURCES.md`. The year dropdown, step buttons, compare options and the detail-panel history table are all generated from `availableYears`.

### Visualization

D3 force simulation clusters bubbles by region (South America and Africa clusters exist too, and region labels are drawn only for regions present in the selected year):
- North America (x: 0.22, y: 0.5)
- Europe (x: 0.72, y: 0.25)
- Asia (x: 0.78, y: 0.72)
- Oceania (x: 0.92, y: 0.92)
- South America (x: 0.28, y: 0.9)
- Africa (x: 0.55, y: 0.92)

Bubble radius scales with market cap (15-90px range for single view, 15-60px for comparison).

**Adaptive Force Strength:** The simulation dynamically adjusts force strength based on regional diversity. When one region dominates (e.g., 68% North America in 2004, 60% in 2001), force strength increases from 0.4 to ~0.67 and collision strength decreases from 0.8 to 0.5 to keep bubbles clustered rather than spreading across the view.

### Sector Colors

15 sectors with defined colors in `js/data.js`:
- Technology: #FFD700 (Gold)
- Semiconductors: #87CEFA (Light Sky Blue)
- Financial Services: #9ACD32 (Yellow Green)
- Health Care: #BB7AFA (Medium Purple)
- Retail: #FF6347 (Tomato)
- Oil & Gas Operations: #7CFC00 (Lawn Green)
- Plus 9 additional sectors defined in `sectorColors` object

### UI Features

**Year Navigation:** A year dropdown with previous/next buttons (and left/right arrow keys) steps through 2001–2026; the compare dropdown offers every other year. The company detail panel shows a scrollable year-by-year rank and market cap table plus growth for the latest step and the full span.

**Collapsible Sidebar:** The filter sidebar can be collapsed via the chevron button in the "Filters" header. When collapsed, charts expand to full width. State is persisted to localStorage (`marketcap-sidebar-collapsed`). A floating expand button appears at the left edge when collapsed.

**PNG Export:** The "Export PNG" button exports the current chart view as a high-resolution PNG image (2x scale for retina displays):
- Single view: `marketcap_{year}.png`
- Comparison view: `marketcap_{year}_vs_{compareYear}.png` with both charts side-by-side and year labels

The export uses native Canvas API with SVG serialization. Computed styles are extracted from the original DOM elements and inlined into the cloned SVG before serialization.

## Key Files

- `explorer.html` - Main application entry point
- `js/app.js` - State management, UI event handlers, sidebar toggle, initialization
- `js/chart.js` - D3 bubble chart rendering and interactions
- `js/data.js` - Data utilities, formatting, sector colors, CSV/PNG export
- `js/filters.js` - Search/filter state and UI
- `css/explorer.css` - Styles including collapsible sidebar transitions
- `data/*.json` - Normalized company data per year
- `data/sources/` - Raw source copies for the 2001 and 2026 datasets
- `DATA_SOURCES.md` - Sources, snapshot dates and normalization notes per year
- `PRD.md` - Product requirements document
- `TECHNICAL_REQUIREMENTS.md` - Detailed technical specifications

## Legacy Files

The repository contains older single-year visualizations that are not part of the main application:
- `index.html` - Original 2024-only visualization
- `world2004.html` - Original 2004-only visualization
- `top_100_companies*.json` - Original unnormalized data files

## Hosting

The application is hosted on GitHub Pages:
- **Live URL**: https://datadrivendecisions.github.io/marketcap/explorer.html
