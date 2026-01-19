# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Market Cap Explorer is an interactive web application for visualizing and comparing the world's 100 largest companies by market capitalization across 2004, 2024, and 2025. It uses D3.js for bubble chart visualization with geographic clustering by region.

## Development Commands

**Run locally:**
```bash
python3 -m http.server 8080
# Then open http://localhost:8080/explorer.html
```

**Validate JSON data files:**
```bash
python3 -c "import json; [json.load(open(f'data/{y}.json')) for y in [2004, 2024, 2025]]"
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
- `data`: Raw company arrays keyed by year (2004, 2024, 2025)
- `companyIndex`: Symbol-based lookup for cross-year company matching
- `currentYear`: Selected primary year
- `compareYear`: Optional second year for side-by-side comparison
- `viewType`: 'chart' or 'table'
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

Market caps are stored in actual USD (not millions). The 2004 data was converted from millions during normalization.

### Visualization

D3 force simulation clusters bubbles by region:
- North America (x: 0.25, y: 0.5)
- Europe (x: 0.65, y: 0.3)
- Asia (x: 0.75, y: 0.65)
- Oceania (x: 0.85, y: 0.85)

Bubble radius scales with market cap (15-90px range for single view, 15-60px for comparison).

### Sector Colors

15 sectors with defined colors in `js/data.js`:
- Technology: #FFD700 (Gold)
- Semiconductors: #87CEFA (Light Sky Blue)
- Financial Services: #9ACD32 (Yellow Green)
- Health Care: #BB7AFA (Medium Purple)
- Retail: #FF6347 (Tomato)
- Oil & Gas Operations: #7CFC00 (Lawn Green)
- Plus 9 additional sectors defined in `sectorColors` object

## Key Files

- `explorer.html` - Main application entry point
- `js/app.js` - State management, UI event handlers, initialization
- `js/chart.js` - D3 bubble chart rendering and interactions
- `js/data.js` - Data utilities, formatting, sector colors
- `js/filters.js` - Search/filter state and UI
- `data/*.json` - Normalized company data per year
- `PRD.md` - Product requirements document
- `TECHNICAL_REQUIREMENTS.md` - Detailed technical specifications

## Legacy Files

The repository contains older single-year visualizations that are not part of the main application:
- `index.html` - Original 2024-only visualization
- `world2004.html` - Original 2004-only visualization
- `top_100_companies*.json` - Original unnormalized data files
