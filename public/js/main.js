import { initMap } from './mapRenderer.js';
import { fetchNews } from './newsService.js';
import { addBubbles, removeBubbles, addConnectionLines, removeConnectionLines } from './bubbleComponent.js';

const container = document.getElementById('map-container');
if (!container) throw new Error('map-container not found');

const { map, layerGroup } = initMap(container);

/** @type {Array<{ layer: L.CircleMarker, region: Object }>} */
let bubbleRefs = [];
/** @type {Array} */
let connectionLineRefs = [];
/** @type {Array<Object>} */
let currentArticles = [];
/** @type {Array<Object>} */
let allArticles = [];

const summaryContainer = document.getElementById('summary-news-list');
const headlineEl = document.getElementById('summary-headline');
const tooltipEl = document.getElementById('bubble-tooltip');
const loadingOverlay = document.getElementById('loading-overlay');
const errorOverlay = document.getElementById('error-overlay');
const retryBtn = document.getElementById('retry-btn');

function showLoading() {
  if (errorOverlay) {
    errorOverlay.classList.remove('visible');
    errorOverlay.hidden = true;
  }
  if (loadingOverlay) {
    loadingOverlay.classList.add('visible');
    loadingOverlay.hidden = false;
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('visible');
    loadingOverlay.hidden = true;
  }
}

function showError() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('visible');
    loadingOverlay.hidden = true;
  }
  if (errorOverlay) {
    errorOverlay.classList.add('visible');
    errorOverlay.hidden = false;
  }
}

function hideError() {
  if (errorOverlay) {
    errorOverlay.classList.remove('visible');
    errorOverlay.hidden = true;
  }
}

const COUNTRY_NAMES = {
  us: 'United States', gb: 'United Kingdom', ca: 'Canada', au: 'Australia',
  de: 'Germany', fr: 'France', it: 'Italy', es: 'Spain', jp: 'Japan',
  cn: 'China', in: 'India', br: 'Brazil', ru: 'Russia', kr: 'South Korea',
  mx: 'Mexico', ar: 'Argentina', za: 'South Africa', ng: 'Nigeria',
  eg: 'Egypt', pl: 'Poland', nl: 'Netherlands', be: 'Belgium', ch: 'Switzerland',
  default: 'Global',
};

function articlesToRegions(articles) {
  const byCountry = new Map();
  for (const a of articles) {
    const c = (a.country || 'default').toLowerCase();
    if (!byCountry.has(c)) byCountry.set(c, []);
    byCountry.get(c).push(a);
  }
  const regions = [];
  for (const [country, arts] of byCountry) {
    const sorted = [...arts].sort((x, y) => (y.importance || 0) - (x.importance || 0));
    const top = sorted[0];
    regions.push({
      country,
      lat: top.lat,
      lng: top.lng,
      importance: top.importance ?? 0.6,
      category: top.category || 'general',
      articles: sorted,
    });
  }
  return regions;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateSummaryPanel(region) {
  if (!region) return;
  const top3 = (region.articles || []).slice(0, 3);
  const countryName = COUNTRY_NAMES[region.country] || region.country?.toUpperCase() || 'Region';

  if (summaryContainer) {
    summaryContainer.innerHTML = top3.length
      ? top3.map((a, i) => {
          const title = escapeHtml(a.title || 'Untitled');
          const summary = escapeHtml((a.summary || '').slice(0, 120)) + ((a.summary || '').length > 120 ? '…' : '');
          const url = (a.url || '#').replace(/"/g, '&quot;');
          return `
          <article class="summary-news-item">
            <h4 class="summary-news-headline">${i + 1}. ${title}</h4>
            <p class="summary-news-text">${summary}</p>
            <a class="summary-link" href="${url}" target="_blank" rel="noopener">Read more</a>
          </article>
        `;
        }).join('')
      : '<p class="summary-placeholder">No news for this region.</p>';
    summaryContainer.dataset.region = countryName;
  }

  if (headlineEl) headlineEl.textContent = `${countryName} — Top ${top3.length} News`;
}

function refreshBubbles(regions) {
  removeConnectionLines(layerGroup, connectionLineRefs);
  removeBubbles(layerGroup, bubbleRefs);
  bubbleRefs = addBubbles(layerGroup, map, regions);
  connectionLineRefs = addConnectionLines(layerGroup, bubbleRefs);

  bubbleRefs.forEach(({ layer, region }) => {
    layer.on('click', () => updateSummaryPanel(region));
    layer.on('mouseover', (e) => {
      const countryName = COUNTRY_NAMES[region.country] || region.country?.toUpperCase();
      tooltipEl.textContent = countryName ? `${countryName} — Click for top news` : '';
      tooltipEl.classList.add('visible');
      container.classList.add('pointer');
      L.DomEvent.on(document, 'mousemove', updateTooltipPos);
    });
    layer.on('mouseout', () => {
      tooltipEl.classList.remove('visible');
      container.classList.remove('pointer');
      L.DomEvent.off(document, 'mousemove', updateTooltipPos);
    });
  });
}

function updateTooltipPos(e) {
  if (tooltipEl) {
    tooltipEl.style.left = `${e.clientX + 12}px`;
    tooltipEl.style.top = `${e.clientY + 12}px`;
  }
}

const timelineEl = document.getElementById('timeline');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function filterArticlesByTimeline(articles, valuePercent) {
  if (!articles.length) return articles;
  const now = Date.now();
  const windowMs = SEVEN_DAYS_MS * (valuePercent / 100);
  const fromMs = now - windowMs;
  return articles.filter((a) => {
    const t = new Date(a.publishedAt).getTime();
    return t >= fromMs && t <= now;
  });
}

function applyTimelineFilter() {
  const value = timelineEl ? Number(timelineEl.value) : 100;
  const filtered = filterArticlesByTimeline(allArticles, value);
  currentArticles = filtered;
  const regions = articlesToRegions(filtered);
  refreshBubbles(regions);
  if (regions.length) {
    const topRegion = regions.reduce((a, b) => (b.importance > a.importance ? b : a));
    updateSummaryPanel(topRegion);
  } else if (summaryContainer) {
    summaryContainer.innerHTML = '<p class="summary-placeholder">No news in this time range.</p>';
    if (headlineEl) headlineEl.textContent = '말풍선을 클릭하여 지역별 핵심 뉴스를 확인하세요';
  }
}

if (timelineEl) {
  timelineEl.addEventListener('input', applyTimelineFilter);
}

async function loadAndShowNews(params = {}) {
  showLoading();
  try {
    const articles = await fetchNews(params);
    hideLoading();
    allArticles = articles;
    const value = timelineEl ? Number(timelineEl.value) : 100;
    const filtered = filterArticlesByTimeline(articles, value);
    currentArticles = filtered;
    const regions = articlesToRegions(filtered);
    refreshBubbles(regions);
    if (regions.length) {
      const topRegion = regions.reduce((a, b) => (b.importance > a.importance ? b : a));
      updateSummaryPanel(topRegion);
    } else if (summaryContainer) {
      summaryContainer.innerHTML = '<p class="summary-placeholder">No news available.</p>';
      if (headlineEl) headlineEl.textContent = '말풍선을 클릭하여 지역별 핵심 뉴스를 확인하세요';
    }
    return articles;
  } catch (err) {
    console.error('Failed to load news:', err);
    showError();
    throw err;
  }
}

if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    hideError();
    loadAndShowNews().catch(() => {});
  });
}

loadAndShowNews().catch(() => {});

window.bubbleMap = {
  getBubbleRefs: () => bubbleRefs,
  getMap: () => map,
  getLayerGroup: () => layerGroup,
  loadNews: loadAndShowNews,
  updateSummaryPanel,
};
