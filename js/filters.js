/**
 * Search and filter functionality module
 */

import { sectorColors } from './data.js';

let filterState = {
  search: '',
  sectors: [],
  regions: []
};

let onFilterChange = null;

/**
 * Initialize filters UI
 */
export function initFilters(sectors, regions, callback) {
  onFilterChange = callback;

  // Render sector checkboxes
  renderSectorFilters(sectors);

  // Render region checkboxes
  renderRegionFilters(regions);

  // Set up search input
  setupSearchInput();

  // Set up reset button
  setupResetButton();
}

/**
 * Render sector filter checkboxes
 */
function renderSectorFilters(sectors) {
  const container = document.getElementById('sector-filters');
  if (!container) return;

  container.innerHTML = sectors.map(sector => `
    <div class="form-check">
      <input class="form-check-input sector-checkbox" type="checkbox"
             value="${sector}" id="sector-${sector.replace(/\s+/g, '-')}">
      <label class="form-check-label" for="sector-${sector.replace(/\s+/g, '-')}">
        <span class="sector-color" style="background-color: ${sectorColors[sector] || sectorColors['Other']}"></span>
        ${sector}
      </label>
    </div>
  `).join('');

  // Add event listeners
  container.querySelectorAll('.sector-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleSectorChange);
  });
}

/**
 * Render region filter checkboxes
 */
function renderRegionFilters(regions) {
  const container = document.getElementById('region-filters');
  if (!container) return;

  container.innerHTML = regions.map(region => `
    <div class="form-check">
      <input class="form-check-input region-checkbox" type="checkbox"
             value="${region}" id="region-${region.replace(/\s+/g, '-')}">
      <label class="form-check-label" for="region-${region.replace(/\s+/g, '-')}">
        ${region}
      </label>
    </div>
  `).join('');

  // Add event listeners
  container.querySelectorAll('.region-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleRegionChange);
  });
}

/**
 * Set up search input with debounce
 */
function setupSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterState.search = e.target.value.toLowerCase().trim();
      triggerFilterChange();
    }, 300);
  });
}

/**
 * Set up reset button
 */
function setupResetButton() {
  const resetBtn = document.getElementById('reset-filters');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', resetFilters);
}

/**
 * Handle sector checkbox change
 */
function handleSectorChange(e) {
  const sector = e.target.value;
  if (e.target.checked) {
    filterState.sectors.push(sector);
  } else {
    filterState.sectors = filterState.sectors.filter(s => s !== sector);
  }
  triggerFilterChange();
}

/**
 * Handle region checkbox change
 */
function handleRegionChange(e) {
  const region = e.target.value;
  if (e.target.checked) {
    filterState.regions.push(region);
  } else {
    filterState.regions = filterState.regions.filter(r => r !== region);
  }
  triggerFilterChange();
}

/**
 * Trigger filter change callback
 */
function triggerFilterChange() {
  if (onFilterChange) {
    onFilterChange({ ...filterState });
  }
}

/**
 * Reset all filters
 */
export function resetFilters() {
  filterState = {
    search: '',
    sectors: [],
    regions: []
  };

  // Clear search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  // Uncheck all checkboxes
  document.querySelectorAll('.sector-checkbox, .region-checkbox').forEach(cb => {
    cb.checked = false;
  });

  triggerFilterChange();
}

/**
 * Apply filters to company list
 */
export function applyFilters(companies, filters) {
  return companies.filter(company => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        company.name.toLowerCase().includes(searchTerm) ||
        company.symbol.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      if (!filters.sectors.includes(company.sector)) return false;
    }

    // Region filter
    if (filters.regions.length > 0) {
      if (!filters.regions.includes(company.region)) return false;
    }

    return true;
  });
}

/**
 * Get current filter state
 */
export function getFilterState() {
  return { ...filterState };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters() {
  return filterState.search !== '' ||
         filterState.sectors.length > 0 ||
         filterState.regions.length > 0;
}
