/**
 * Fetch news from backend API.
 * @param {{ from?: string, to?: string }} params - optional date range (ISO strings)
 * @returns {Promise<Array<{ id: string, title: string, summary: string, source: string, url: string, publishedAt: string, lat: number, lng: number, category: string, importance: number }>>}
 */
export async function fetchNews(params = {}) {
  const url = new URL('/api/news', window.location.origin);
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`News API error: ${res.status}`);
  return res.json();
}
