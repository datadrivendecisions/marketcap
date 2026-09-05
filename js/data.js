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
  "Oceania": { x: 0.92, y: 0.92 },
  "South America": { x: 0.28, y: 0.9 },
  "Africa": { x: 0.55, y: 0.92 }
};

// Available years
export const availableYears = Array.from({ length: 26 }, (_, i) => 2001 + i); // 2001 … 2026

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

/**
 * Prepare SVG for export by inlining computed styles
 * Note: getComputedStyle only works on elements in the DOM,
 * so we get styles from originals and apply to clones
 */
function prepareSVGForExport(svgElement) {
  const clone = svgElement.cloneNode(true);

  // Inline styles for bubbles
  const originalBubbles = svgElement.querySelectorAll('.bubble');
  const clonedBubbles = clone.querySelectorAll('.bubble');
  originalBubbles.forEach((original, i) => {
    const computed = getComputedStyle(original);
    clonedBubbles[i].setAttribute('fill', computed.fill);
    clonedBubbles[i].setAttribute('stroke', computed.stroke);
    clonedBubbles[i].setAttribute('stroke-width', computed.strokeWidth);
    clonedBubbles[i].setAttribute('opacity', computed.opacity);
  });

  // Inline styles for text labels
  const originalLabels = svgElement.querySelectorAll('.bubble-label');
  const clonedLabels = clone.querySelectorAll('.bubble-label');
  originalLabels.forEach((original, i) => {
    const computed = getComputedStyle(original);
    clonedLabels[i].setAttribute('fill', computed.fill);
    clonedLabels[i].setAttribute('font-family', 'sans-serif');
    clonedLabels[i].setAttribute('font-size', computed.fontSize);
    clonedLabels[i].setAttribute('font-weight', computed.fontWeight);
  });

  // Inline styles for market cap labels
  const originalMarketcaps = svgElement.querySelectorAll('.bubble-marketcap');
  const clonedMarketcaps = clone.querySelectorAll('.bubble-marketcap');
  originalMarketcaps.forEach((original, i) => {
    const computed = getComputedStyle(original);
    clonedMarketcaps[i].setAttribute('fill', computed.fill);
    clonedMarketcaps[i].setAttribute('font-family', 'sans-serif');
    clonedMarketcaps[i].setAttribute('font-size', computed.fontSize);
    clonedMarketcaps[i].setAttribute('font-weight', computed.fontWeight);
  });

  // Inline styles for region labels
  const originalRegions = svgElement.querySelectorAll('.region-label');
  const clonedRegions = clone.querySelectorAll('.region-label');
  originalRegions.forEach((original, i) => {
    const computed = getComputedStyle(original);
    clonedRegions[i].setAttribute('fill', computed.fill);
    clonedRegions[i].setAttribute('font-family', 'sans-serif');
    clonedRegions[i].setAttribute('font-size', computed.fontSize);
    clonedRegions[i].setAttribute('font-weight', computed.fontWeight);
    clonedRegions[i].setAttribute('opacity', computed.opacity);
  });

  return clone;
}

/**
 * Convert SVG element to canvas
 */
async function svgToCanvas(svgElement, scale = 2) {
  const width = parseInt(svgElement.getAttribute('width')) || svgElement.viewBox.baseVal.width;
  const height = parseInt(svgElement.getAttribute('height')) || svgElement.viewBox.baseVal.height;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  // Create blob and load as image
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };
    img.src = url;
  });
}

/**
 * Download canvas as PNG
 */
function downloadCanvas(canvas, filename) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Export chart to PNG
 */
export async function exportToPNG(isComparison, currentYear, compareYear) {
  if (isComparison) {
    // Comparison view - combine both charts
    const leftSvg = document.querySelector('#chart-left svg');
    const rightSvg = document.querySelector('#chart-right svg');

    if (!leftSvg || !rightSvg) {
      throw new Error('Chart SVG elements not found');
    }

    const scale = 2;
    const leftPrepared = prepareSVGForExport(leftSvg);
    const rightPrepared = prepareSVGForExport(rightSvg);

    const leftCanvas = await svgToCanvas(leftPrepared, scale);
    const rightCanvas = await svgToCanvas(rightPrepared, scale);

    // Create combined canvas with year labels
    const labelHeight = 50 * scale;
    const gap = 20 * scale;
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = leftCanvas.width + rightCanvas.width + gap;
    combinedCanvas.height = Math.max(leftCanvas.height, rightCanvas.height) + labelHeight;

    const ctx = combinedCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    // Draw year labels
    ctx.fillStyle = '#495057';
    ctx.font = `bold ${28 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(currentYear.toString(), leftCanvas.width / 2, 35 * scale);
    ctx.fillText(compareYear.toString(), leftCanvas.width + gap + rightCanvas.width / 2, 35 * scale);

    // Draw charts
    ctx.drawImage(leftCanvas, 0, labelHeight);
    ctx.drawImage(rightCanvas, leftCanvas.width + gap, labelHeight);

    // Add divider line
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(leftCanvas.width + gap / 2, labelHeight);
    ctx.lineTo(leftCanvas.width + gap / 2, combinedCanvas.height);
    ctx.stroke();

    const filename = `marketcap_${currentYear}_vs_${compareYear}.png`;
    downloadCanvas(combinedCanvas, filename);
  } else {
    // Single view
    const svg = document.querySelector('#chart-single svg');

    if (!svg) {
      throw new Error('Chart SVG element not found');
    }

    const prepared = prepareSVGForExport(svg);
    const canvas = await svgToCanvas(prepared, 2);

    const filename = `marketcap_${currentYear}.png`;
    downloadCanvas(canvas, filename);
  }
}
