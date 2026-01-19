/**
 * Main application logic
 */

import {
  loadAllData,
  buildCompanyIndex,
  getCompanyHistory,
  calculateGrowth,
  formatMarketCap,
  formatPercent,
  getAllSectors,
  getUniqueRegions,
  sectorColors,
  exportToCSV,
  availableYears
} from './data.js';

import {
  renderChart,
  renderComparison,
  highlightCompany,
  highlightSector,
  clearHighlights,
  selectCompany,
  clearSelection,
  updateChartVisibility,
  stopSimulation
} from './chart.js';

import {
  initFilters,
  applyFilters,
  resetFilters,
  getFilterState
} from './filters.js';

// Application state
const state = {
  data: {},
  companyIndex: {},
  currentYear: 2024,
  compareYear: null,
  viewType: 'chart',
  selectedCompany: null,
  filters: {
    search: '',
    sectors: [],
    regions: []
  }
};

// DOM elements
let tooltip;
let companyDetailOffcanvas;

/**
 * Initialize the application
 */
async function init() {
  try {
    // Show loading state
    document.getElementById('chart-single').innerHTML = '<div class="loading"></div>';

    // Load data
    state.data = await loadAllData();
    state.companyIndex = buildCompanyIndex(state.data);

    // Get unique sectors and regions
    const sectors = getAllSectors(state.data);
    const regions = getUniqueRegions(state.data);

    // Initialize filters
    initFilters(sectors, regions, handleFilterChange);

    // Initialize UI components
    initYearSelector();
    initCompareSelector();
    initViewToggle();
    initLegend();
    initTooltip();
    initTableSort();
    initExportButton();
    initCompanyDetail();

    // Render initial view
    renderCurrentView();

  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('chart-single').innerHTML =
      '<div class="alert alert-danger m-4">Failed to load data. Please refresh the page.</div>';
  }
}

/**
 * Initialize year selector buttons
 */
function initYearSelector() {
  document.querySelectorAll('.year-selector .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const year = parseInt(e.target.dataset.year);
      selectYear(year);
    });
  });
}

/**
 * Initialize compare selector dropdown
 */
function initCompareSelector() {
  const select = document.getElementById('compare-select');
  select.addEventListener('change', (e) => {
    const compareYear = e.target.value ? parseInt(e.target.value) : null;
    setCompareYear(compareYear);
  });
}

/**
 * Initialize view toggle buttons
 */
function initViewToggle() {
  document.querySelectorAll('.view-toggle .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.closest('.btn').dataset.view;
      setViewType(view);
    });
  });
}

/**
 * Initialize legend
 */
function initLegend() {
  const legend = document.getElementById('legend');
  const sectors = Object.keys(sectorColors);

  legend.innerHTML = sectors.map(sector => `
    <div class="legend-item" data-sector="${sector}">
      <span class="legend-color" style="background-color: ${sectorColors[sector]}"></span>
      <span class="legend-label">${sector}</span>
    </div>
  `).join('');

  // Add hover interactions
  legend.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const sector = item.dataset.sector;
      highlightSector(sector);
      // Dim other legend items
      legend.querySelectorAll('.legend-item').forEach(i => {
        i.classList.toggle('dimmed', i.dataset.sector !== sector);
      });
    });

    item.addEventListener('mouseleave', () => {
      clearHighlights();
      legend.querySelectorAll('.legend-item').forEach(i => {
        i.classList.remove('dimmed');
      });
    });
  });
}

/**
 * Initialize tooltip
 */
function initTooltip() {
  tooltip = document.getElementById('tooltip');
}

/**
 * Initialize table sorting
 */
function initTableSort() {
  document.querySelectorAll('#companies-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.dataset.sort;
      sortTable(sortKey, th);
    });
  });
}

/**
 * Initialize export button
 */
function initExportButton() {
  document.getElementById('export-csv').addEventListener('click', () => {
    const filteredCompanies = getFilteredCompanies(state.currentYear);
    exportToCSV(filteredCompanies, state.currentYear);
  });
}

/**
 * Initialize company detail panel
 */
function initCompanyDetail() {
  companyDetailOffcanvas = new bootstrap.Offcanvas(document.getElementById('company-detail'));
}

/**
 * Select a year
 */
function selectYear(year) {
  state.currentYear = year;

  // Update button states
  document.querySelectorAll('.year-selector .btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.year) === year);
  });

  // Update compare selector options
  updateCompareOptions();

  renderCurrentView();
}

/**
 * Set compare year
 */
function setCompareYear(year) {
  state.compareYear = year;

  // Toggle comparison view
  const singleChart = document.getElementById('chart-single');
  const compareChart = document.getElementById('chart-compare');

  if (year) {
    singleChart.classList.add('d-none');
    compareChart.classList.remove('d-none');
  } else {
    singleChart.classList.remove('d-none');
    compareChart.classList.add('d-none');
  }

  renderCurrentView();
}

/**
 * Update compare dropdown options
 */
function updateCompareOptions() {
  const select = document.getElementById('compare-select');
  const options = select.querySelectorAll('option');

  options.forEach(opt => {
    if (opt.value) {
      const optYear = parseInt(opt.value);
      opt.disabled = optYear === state.currentYear;
      if (optYear === state.currentYear && state.compareYear === optYear) {
        select.value = '';
        state.compareYear = null;
      }
    }
  });
}

/**
 * Set view type (chart or table)
 */
function setViewType(type) {
  state.viewType = type;

  // Update button states
  document.querySelectorAll('.view-toggle .btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === type);
  });

  // Toggle containers
  document.getElementById('chart-container').classList.toggle('d-none', type !== 'chart');
  document.getElementById('table-container').classList.toggle('d-none', type !== 'table');

  if (type === 'table') {
    renderTable();
  }
}

/**
 * Handle filter changes
 */
function handleFilterChange(filters) {
  state.filters = filters;
  renderCurrentView();
}

/**
 * Get filtered companies for a year
 */
function getFilteredCompanies(year) {
  const companies = state.data[year] || [];
  return applyFilters(companies, state.filters);
}

/**
 * Render the current view based on state
 */
function renderCurrentView() {
  const filteredCompanies = getFilteredCompanies(state.currentYear);

  // Update count
  document.getElementById('filtered-count').textContent =
    `${filteredCompanies.length} companies`;

  if (state.viewType === 'chart') {
    if (state.compareYear) {
      renderComparisonView();
    } else {
      renderSingleChart(filteredCompanies);
    }
  } else {
    renderTable();
  }
}

/**
 * Render single chart view
 */
function renderSingleChart(companies) {
  stopSimulation();

  renderChart('chart-single', companies, {
    onHover: handleBubbleHover,
    onClick: handleBubbleClick
  });
}

/**
 * Render comparison view
 */
function renderComparisonView() {
  stopSimulation();

  const leftCompanies = getFilteredCompanies(state.currentYear);
  const rightCompanies = getFilteredCompanies(state.compareYear);

  // Update labels
  document.getElementById('chart-left-label').textContent = state.currentYear;
  document.getElementById('chart-right-label').textContent = state.compareYear;

  renderComparison(
    'chart-left',
    'chart-right',
    leftCompanies,
    rightCompanies,
    state.currentYear,
    state.compareYear,
    {
      onHover: handleBubbleHover,
      onClick: handleBubbleClick
    }
  );
}

/**
 * Render table view
 */
function renderTable() {
  const companies = getFilteredCompanies(state.currentYear);
  const tbody = document.getElementById('table-body');

  tbody.innerHTML = companies.map(company => `
    <tr data-symbol="${company.symbol}" class="${state.selectedCompany === company.symbol ? 'selected' : ''}">
      <td>${company.rank}</td>
      <td>
        <span class="sector-badge" style="background-color: ${sectorColors[company.sector] || sectorColors['Other']}"></span>
        ${company.name}
      </td>
      <td><code>${company.symbol}</code></td>
      <td>${company.sector}</td>
      <td>${company.country}</td>
      <td class="text-end">${formatMarketCap(company.marketcap)}</td>
    </tr>
  `).join('');

  // Add click handlers
  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const symbol = row.dataset.symbol;
      showCompanyDetail(symbol);
    });
  });
}

/**
 * Sort table by column
 */
let currentSortKey = 'rank';
let currentSortDir = 'asc';

function sortTable(key, thElement) {
  // Toggle direction if same column
  if (currentSortKey === key) {
    currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortKey = key;
    currentSortDir = 'asc';
  }

  // Update header styles
  document.querySelectorAll('#companies-table th').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
  });
  thElement.classList.add(`sorted-${currentSortDir}`);

  // Sort and re-render
  const companies = getFilteredCompanies(state.currentYear);
  companies.sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return currentSortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentSortDir === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
}

/**
 * Handle bubble hover
 */
function handleBubbleHover(company, event) {
  if (!company) {
    hideTooltip();
    clearHighlights();
    return;
  }

  highlightCompany(company.symbol);
  showTooltip(company, event);
}

/**
 * Handle bubble click
 */
function handleBubbleClick(company) {
  state.selectedCompany = company.symbol;
  selectCompany(company.symbol);
  showCompanyDetail(company.symbol);
}

/**
 * Show tooltip
 */
function showTooltip(company, event) {
  tooltip.innerHTML = `
    <div class="tooltip-title">${company.name}</div>
    <div class="tooltip-symbol">${company.symbol}</div>
    <div class="tooltip-row">
      <span class="tooltip-label">Rank:</span>
      <span class="tooltip-value tooltip-rank">#${company.rank}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Market Cap:</span>
      <span class="tooltip-value">${formatMarketCap(company.marketcap)}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Sector:</span>
      <span class="tooltip-value">${company.sector}</span>
    </div>
    <div class="tooltip-row">
      <span class="tooltip-label">Country:</span>
      <span class="tooltip-value">${company.country}</span>
    </div>
  `;

  // Position tooltip
  const x = event.pageX + 15;
  const y = event.pageY - 10;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.classList.add('visible');
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  tooltip.classList.remove('visible');
}

/**
 * Show company detail panel
 */
function showCompanyDetail(symbol) {
  const company = state.companyIndex[symbol];
  if (!company) return;

  const content = document.getElementById('company-detail-content');

  // Build year cards
  const yearCards = availableYears.map(year => {
    const yearData = company.years[year];
    if (yearData) {
      return `
        <div class="year-card year-${year}">
          <div class="d-flex justify-content-between align-items-center">
            <span class="year-label">${year}</span>
            <span class="rank-badge badge bg-secondary">#${yearData.rank}</span>
          </div>
          <div class="marketcap-value mt-2">${formatMarketCap(yearData.marketcap)}</div>
        </div>
      `;
    } else {
      return `
        <div class="year-card not-ranked">
          <div class="d-flex justify-content-between align-items-center">
            <span class="year-label">${year}</span>
            <span class="rank-badge badge bg-light text-muted">Not in top 100</span>
          </div>
        </div>
      `;
    }
  }).join('');

  // Calculate growth if possible
  let growthHtml = '';
  if (company.years[2024] && company.years[2025]) {
    const growth = calculateGrowth(state.companyIndex, symbol, 2024, 2025);
    if (growth) {
      const isPositive = growth.percent >= 0;
      growthHtml = `
        <div class="growth-indicator ${isPositive ? 'positive' : 'negative'}">
          <div class="small text-muted">2024 → 2025 Growth</div>
          <div class="growth-value">${formatPercent(growth.percent)}</div>
          <div class="small">Rank change: ${growth.rankChange > 0 ? '↑' : growth.rankChange < 0 ? '↓' : '−'} ${Math.abs(growth.rankChange)} positions</div>
        </div>
      `;
    }
  }

  content.innerHTML = `
    <div class="company-header">
      <div class="company-name">${company.name}</div>
      <div class="company-symbol">${company.symbol}</div>
      <div class="company-sector">
        <span class="badge" style="background-color: ${sectorColors[company.sector] || sectorColors['Other']}; color: #000;">
          ${company.sector}
        </span>
      </div>
      <div class="company-location mt-2">
        <i class="bi bi-geo-alt"></i> ${company.country} • ${company.region}
      </div>
    </div>

    <div class="year-data">
      <h6>Market Cap by Year</h6>
      ${yearCards}
      ${growthHtml}
    </div>
  `;

  companyDetailOffcanvas.show();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
