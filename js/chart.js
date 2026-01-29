/**
 * D3 Bubble Chart visualization module
 */

import { sectorColors, regionPositions, formatMarketCapShort } from './data.js';

let simulation = null;
let currentNodes = [];

/**
 * Initialize and render a bubble chart
 */
export function renderChart(containerId, companies, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  const width = options.width || container.clientWidth || 1200;
  const height = options.height || 700;

  // Create SVG
  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  // Add region labels
  renderRegionLabels(svg, width, height);

  // Calculate scales
  const marketcaps = companies.map(c => c.marketcap);
  const radiusScale = d3.scaleSqrt()
    .domain([d3.min(marketcaps), d3.max(marketcaps)])
    .range([15, options.maxRadius || 90]);

  // Create nodes with positions
  const nodes = companies.map(company => ({
    ...company,
    r: radiusScale(company.marketcap),
    x: regionPositions[company.region]?.x * width || width / 2,
    y: regionPositions[company.region]?.y * height || height / 2
  }));

  currentNodes = nodes;

  // Create bubble groups
  const bubbleGroups = svg.selectAll('.bubble-group')
    .data(nodes, d => d.symbol)
    .enter()
    .append('g')
    .attr('class', 'bubble-group')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  // Add circles
  bubbleGroups.append('circle')
    .attr('class', 'bubble')
    .attr('r', d => d.r)
    .attr('fill', d => sectorColors[d.sector] || sectorColors['Other'])
    .on('mouseenter', (event, d) => options.onHover?.(d, event))
    .on('mouseleave', () => options.onHover?.(null))
    .on('click', (event, d) => options.onClick?.(d, event));

  // Add company name labels (only for larger bubbles)
  bubbleGroups.append('text')
    .attr('class', 'bubble-label')
    .attr('dy', '0.1em')
    .style('font-size', d => `${Math.max(d.r / 4, 8)}px`)
    .style('display', d => d.r > 25 ? 'block' : 'none')
    .text(d => d.name.length > 12 && d.r < 50 ? d.name.substring(0, 10) + '...' : d.name);

  // Add market cap labels (only for larger bubbles)
  bubbleGroups.append('text')
    .attr('class', 'bubble-marketcap')
    .attr('dy', d => `${d.r * 0.4}px`)
    .style('font-size', d => `${Math.max(d.r / 5, 7)}px`)
    .style('display', d => d.r > 35 ? 'block' : 'none')
    .text(d => formatMarketCapShort(d.marketcap));

  // Calculate regional diversity - fewer regions need stronger clustering
  const regionCounts = {};
  nodes.forEach(n => {
    regionCounts[n.region] = (regionCounts[n.region] || 0) + 1;
  });
  const maxRegionCount = Math.max(...Object.values(regionCounts));
  const regionDominance = maxRegionCount / nodes.length;

  // Increase force strength significantly when one region dominates (e.g., 2004 has 68% North America)
  // Also reduce collision strength to prevent bubbles from pushing each other across the view
  const baseStrength = 0.4;
  const forceStrength = regionDominance > 0.5
    ? baseStrength + (regionDominance - 0.5) * 1.5  // Up to 0.7 for 2004
    : baseStrength;
  const collideStrength = regionDominance > 0.5 ? 0.5 : 0.8;

  // Create force simulation
  simulation = d3.forceSimulation(nodes)
    .force('x', d3.forceX(d => {
      const region = regionPositions[d.region] || { x: 0.5 };
      return region.x * width;
    }).strength(forceStrength))
    .force('y', d3.forceY(d => {
      const region = regionPositions[d.region] || { y: 0.5 };
      return region.y * height;
    }).strength(forceStrength))
    .force('collide', d3.forceCollide(d => d.r + 2).strength(collideStrength))
    .alphaDecay(0.02)
    .on('tick', () => {
      bubbleGroups.attr('transform', d => {
        // Keep bubbles within bounds
        d.x = Math.max(d.r, Math.min(width - d.r, d.x));
        d.y = Math.max(d.r, Math.min(height - d.r, d.y));
        return `translate(${d.x}, ${d.y})`;
      });
    });

  return { svg, nodes, simulation };
}

/**
 * Render region labels in the background
 */
function renderRegionLabels(svg, width, height) {
  const regions = Object.entries(regionPositions);

  // Custom y-offsets per region to avoid label overlap
  // Oceania needs smaller offset since it's at the bottom edge
  const labelYOffsets = {
    "North America": -100,
    "Europe": -100,
    "Asia": -100,
    "Oceania": -30
  };

  svg.selectAll('.region-label')
    .data(regions)
    .enter()
    .append('text')
    .attr('class', 'region-label')
    .attr('x', d => d[1].x * width)
    .attr('y', d => d[1].y * height + (labelYOffsets[d[0]] || -100))
    .text(d => d[0]);
}

/**
 * Render comparison view with two charts side by side
 */
export function renderComparison(leftContainerId, rightContainerId, leftCompanies, rightCompanies, leftYear, rightYear, options = {}) {
  const leftContainer = document.getElementById(leftContainerId);
  const rightContainer = document.getElementById(rightContainerId);

  if (!leftContainer || !rightContainer) return;

  const width = leftContainer.clientWidth || 600;
  const height = options.height || 650;

  // Render both charts with smaller max radius
  const leftChart = renderChart(leftContainerId, leftCompanies, {
    ...options,
    width,
    height,
    maxRadius: 60
  });

  const rightChart = renderChart(rightContainerId, rightCompanies, {
    ...options,
    width,
    height,
    maxRadius: 60
  });

  return { leftChart, rightChart };
}

/**
 * Highlight a company by symbol
 */
export function highlightCompany(symbol) {
  d3.selectAll('.bubble')
    .classed('dimmed', d => d.symbol !== symbol)
    .classed('highlighted', d => d.symbol === symbol);
}

/**
 * Highlight companies by sector
 */
export function highlightSector(sector) {
  d3.selectAll('.bubble')
    .classed('dimmed', d => d.sector !== sector)
    .classed('highlighted', d => d.sector === sector);
}

/**
 * Clear all highlights
 */
export function clearHighlights() {
  d3.selectAll('.bubble')
    .classed('dimmed', false)
    .classed('highlighted', false);
}

/**
 * Select a company (persistent highlight)
 */
export function selectCompany(symbol) {
  d3.selectAll('.bubble')
    .classed('selected', d => d.symbol === symbol);
}

/**
 * Clear selection
 */
export function clearSelection() {
  d3.selectAll('.bubble')
    .classed('selected', false);
}

/**
 * Update chart with filtered data
 */
export function updateChartVisibility(visibleSymbols) {
  d3.selectAll('.bubble-group')
    .style('opacity', d => visibleSymbols.has(d.symbol) ? 1 : 0.1)
    .style('pointer-events', d => visibleSymbols.has(d.symbol) ? 'all' : 'none');
}

/**
 * Stop any running simulation
 */
export function stopSimulation() {
  if (simulation) {
    simulation.stop();
  }
}

/**
 * Get current nodes
 */
export function getNodes() {
  return currentNodes;
}
