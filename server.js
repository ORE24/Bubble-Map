require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Country code (ISO 3166-1 alpha-2) -> [lat, lng] centroid for bubble placement
const COUNTRY_COORDS = {
  us: [39.8283, -98.5795],
  gb: [55.3781, -3.436],
  ca: [56.1304, -106.3468],
  au: [-25.2744, 133.7751],
  de: [51.1657, 10.4515],
  fr: [46.2276, 2.2137],
  it: [41.8719, 12.5674],
  es: [40.4637, -3.7492],
  jp: [36.2048, 138.2529],
  cn: [35.8617, 104.1954],
  in: [20.5937, 78.9629],
  br: [-14.235, -51.9253],
  ru: [61.524, 105.3188],
  kr: [35.9078, 127.7669],
  mx: [23.6345, -102.5528],
  ar: [-38.4161, -63.6167],
  za: [-30.5595, 22.9375],
  ng: [9.082, 8.6753],
  eg: [26.8206, 30.8025],
  pl: [51.9194, 19.1451],
  nl: [52.1326, 5.2913],
  be: [50.5039, 4.4699],
  ch: [46.8182, 8.2275],
  at: [47.5162, 14.5501],
  se: [60.1282, 18.6435],
  no: [60.472, 8.4689],
  fi: [61.9241, 25.7482],
  ie: [53.1424, -7.6921],
  pt: [39.3999, -8.2245],
  gr: [39.0742, 21.8243],
  tr: [38.9637, 35.2433],
  il: [31.0461, 34.8516],
  sa: [23.8859, 45.0792],
  ae: [23.4241, 53.8478],
  id: [-0.7893, 113.9213],
  th: [15.87, 100.9925],
  vn: [14.0583, 108.2772],
  ph: [12.8797, 121.774],
  my: [4.2105, 101.9758],
  sg: [1.3521, 103.8198],
  nz: [-40.9006, 174.886],
  default: [20, 0],
};

// Category -> color hint (frontend maps to blue/red/green)
const CATEGORY_IMPORTANCE = {
  business: { category: 'economy', importance: 0.8 },
  entertainment: { category: 'general', importance: 0.5 },
  general: { category: 'general', importance: 0.6 },
  health: { category: 'health', importance: 0.7 },
  science: { category: 'climate', importance: 0.8 },
  sports: { category: 'general', importance: 0.4 },
  technology: { category: 'economy', importance: 0.7 },
};

// In-memory cache: { key: string, data: array, ts: number }
let newsCache = null;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

function getCoordsForCountry(countryCode) {
  const key = (countryCode || '').toLowerCase();
  return COUNTRY_COORDS[key] || COUNTRY_COORDS.default;
}

function normalizeArticle(article, countryCode) {
  const [lat, lng] = getCoordsForCountry(countryCode);
  const categoryKey = (article.category || 'general').toLowerCase();
  const meta = CATEGORY_IMPORTANCE[categoryKey] || { category: 'general', importance: 0.6 };
  return {
    id: article.url || `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: article.title || 'Untitled',
    summary: article.description || article.content || '',
    source: article.source?.name || 'Unknown',
    url: article.url || '#',
    publishedAt: article.publishedAt || new Date().toISOString(),
    lat,
    lng,
    country: countryCode || 'default',
    category: meta.category,
    importance: meta.importance,
  };
}

async function fetchNewsAPI(countryCode) {
  const apiKey = process.env.NEWS_API_KEY;
  const base = 'https://newsapi.org/v2/top-headlines';
  const url = `${base}?country=${countryCode}&pageSize=15&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  const json = await res.json();
  return (json.articles || []).map((a) => normalizeArticle(a, countryCode));
}

function getMockArticles() {
  const countries = [
    ['us', 39.8283, -98.5795],
    ['gb', 55.3781, -3.436],
    ['de', 51.1657, 10.4515],
    ['jp', 36.2048, 138.2529],
    ['br', -14.235, -51.9253],
    ['ru', 61.524, 105.3188],
    ['cn', 35.8617, 104.1954],
    ['in', 20.5937, 78.9629],
    ['au', -25.2744, 133.7751],
    ['fr', 46.2276, 2.2137],
  ];
  const categories = ['politics', 'climate', 'economy', 'general'];
  const titles = [
    'US-Greenland: New Talks on Strategic Cooperation',
    'European Central Bank Holds Rates Steady',
    'Climate Summit Reaches New Agreement',
    'Tech Giants Report Strong Quarterly Earnings',
    'Regional Tensions Ease After Diplomatic Talks',
    'Arctic Geopolitics: Resource and Shipping Debate',
    'Markets React to Policy Announcements',
    'Healthcare Reform Bill Advances',
  ];
  return countries.flatMap(([country, lat, lng], i) =>
    Array.from({ length: 2 }, (_, j) => ({
      id: `mock-${country}-${i}-${j}`,
      title: titles[(i + j) % titles.length],
      summary: 'Summary of the story. Details and context for the headline.',
      source: `Source ${country.toUpperCase()}`,
      url: '#',
      publishedAt: new Date(Date.now() - (i + j) * 3600000).toISOString(),
      lat,
      lng,
      country,
      category: categories[(i + j) % categories.length],
      importance: 0.5 + Math.random() * 0.5,
    }))
  );
}

async function loadNews(fromDate, toDate) {
  const cacheKey = [fromDate, toDate].filter(Boolean).join('|') || 'default';
  if (newsCache && newsCache.key === cacheKey && Date.now() - newsCache.ts < CACHE_MS) {
    return { articles: newsCache.data, source: newsCache.source };
  }
  let articles = [];
  let source = 'mock';
  if (process.env.NEWS_API_KEY) {
    try {
      const countries = ['us', 'gb', 'de', 'jp', 'fr', 'in', 'br', 'au'];
      const results = await Promise.all(countries.map((c) => fetchNewsAPI(c)));
      articles = results.flat();
      source = 'newsapi';
      console.log(`[News] Fetched ${articles.length} articles from NewsAPI`);
    } catch (err) {
      console.warn('NewsAPI failed, using mock data:', err.message);
      articles = getMockArticles();
    }
  } else {
    console.log('[News] NEWS_API_KEY not set — serving mock data');
    articles = getMockArticles();
  }
  if (fromDate || toDate) {
    const from = fromDate ? new Date(fromDate).getTime() : 0;
    const to = toDate ? new Date(toDate).getTime() : Number.MAX_SAFE_INTEGER;
    articles = articles.filter((a) => {
      const t = new Date(a.publishedAt).getTime();
      return t >= from && t <= to;
    });
  }
  newsCache = { key: cacheKey, data: articles, source, ts: Date.now() };
  return { articles, source };
}

app.get('/api/news', async (req, res) => {
  try {
    const { from: fromDate, to: toDate } = req.query;
    const { articles, source } = await loadNews(fromDate, toDate);
    res.set('X-News-Source', source); // 'newsapi' | 'mock'
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load news' });
  }
});

app.listen(PORT, () => {
  console.log(`BubbleMap server at http://localhost:${PORT}`);
  if (process.env.NEWS_API_KEY) {
    console.log('NewsAPI: enabled (real headlines)');
  } else {
    console.log('NewsAPI: disabled — set NEWS_API_KEY in .env for real data (https://newsapi.org/register)');
  }
});
