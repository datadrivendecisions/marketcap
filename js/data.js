/**
 * Data loading and normalization module
 */

// Sector color palette
export const sectorColors = {
  "Technology": "#FFD700",
  "Semiconductors": "#87CEFA",
  "Financial Services": "#9ACD32",
  "Health Care": "#BB7AFA",
  "Retail": "#FF6347",
  "Oil & Gas Operations": "#7CFC00",
  "Automotive": "#FF69B4",
  "Food & Drink": "#FFB6C1",
  "Luxury Goods": "#FFA07A",
  "Telecommunications Services": "#AFEEEE",
  "Conglomerate": "#FF82AB",
  "Media": "#FFDAB9",
  "Aerospace & Defense": "#DDA0DD",
  "Household & Personal Products": "#C0FF3E",
  "Other": "#C0C0C0"
};

// Region positions for geographic clustering
// Positions spread further apart to ensure clear visual separation
export const regionPositions = {
  "North America": { x: 0.22, y: 0.5 },
  "Europe": { x: 0.72, y: 0.25 },
  "Asia": { x: 0.78, y: 0.72 },
  "Oceania": { x: 0.92, y: 0.92 }
};

// Available years
export const availableYears = [2004, 2024, 2025];

/**
 * Load data for all years
 */
export async function loadAllData() {
  const promises = availableYears.map(year =>
    fetch(`data/${year}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${year} data`);
        return res.json();
      })
  );

  const results = await Promise.all(promises);

  const data = {};
  results.forEach((result, index) => {
    data[availableYears[index]] = result.companies;
  });

  return data;
}

/**
 * Build a company index for cross-year lookup by symbol
 */
export function buildCompanyIndex(data) {
  const index = {};

  for (const year of availableYears) {
    const companies = data[year] || [];
    for (const company of companies) {
      const symbol = company.symbol;
      if (!index[symbol]) {
        index[symbol] = {
          name: company.name,
          symbol: symbol,
          country: company.country,
          region: company.region,
          sector: company.sector,
          years: {}
        };
      }
      index[symbol].years[year] = {
        rank: company.rank,
        marketcap: company.marketcap
      };
      // Update name if we have a more recent version
      if (!index[symbol].latestYear || year > index[symbol].latestYear) {
        index[symbol].name = company.name;
        index[symbol].country = company.country;
        index[symbol].region = company.region;
        index[symbol].sector = company.sector;
        index[symbol].latestYear = year;
      }
    }
  }

  return index;
}

/**
 * Get company history across all years
 */
export function getCompanyHistory(companyIndex, symbol) {
  return companyIndex[symbol] || null;
}

/**
 * Calculate growth between two years for a company
 */
export function calculateGrowth(companyIndex, symbol, fromYear, toYear) {
  const company = companyIndex[symbol];
  if (!company) return null;

  const fromData = company.years[fromYear];
  const toData = company.years[toYear];

  if (!fromData || !toData) return null;

  const absolute = toData.marketcap - fromData.marketcap;
  const percent = ((toData.marketcap - fromData.marketcap) / fromData.marketcap) * 100;

  return {
    absolute,
    percent,
    rankChange: fromData.rank - toData.rank // Positive = improved rank
  };
}

/**
 * Format market cap for display
 */
export function formatMarketCap(value) {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(0)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(0)}M`;
  }
  return `$${value}`;
}

/**
 * Format market cap short (for bubble labels)
 */
export function formatMarketCapShort(value) {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(0)}B`;
  }
  return `$${(value / 1e6).toFixed(0)}M`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get all unique sectors from data
 */
export function getAllSectors(data) {
  const sectors = new Set();
  for (const year of availableYears) {
    const companies = data[year] || [];
    companies.forEach(c => sectors.add(c.sector));
  }
  return Array.from(sectors).sort();
}

/**
 * Get all unique regions from data
 */
export function getAllRegions(data) {
  const regions = new Set();
  for (const year of availableYears) {
    const companies = data[year] || [];
    companies.forEach(c => sectors.add(c.region));
  }
  return Array.from(regions).sort();
}

/**
 * Get unique regions from all data
 */
export function getUniqueRegions(data) {
  const regions = new Set();
  for (const year of availableYears) {
    const companies = data[year] || [];
    companies.forEach(c => regions.add(c.region));
  }
  return Array.from(regions).sort();
}

/**
 * Export data to CSV format
 */
export function exportToCSV(companies, year) {
  const headers = ['Rank', 'Company', 'Symbol', 'Sector', 'Country', 'Region', 'Market Cap'];
  const rows = companies.map(c => [
    c.rank,
    `"${c.name}"`,
    c.symbol,
    `"${c.sector}"`,
    `"${c.country}"`,
    `"${c.region}"`,
    c.marketcap
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  // Create download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top_100_companies_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
