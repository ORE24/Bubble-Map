# BubbleMap: Global News Cortex

A 3D globe that shows global news as colored bubbles. News is fetched via APIs (no scraping). Click a bubble to see the summary; use the timeline slider to filter by time.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Optional: add a News API key so the app can load real headlines.
   - Copy `.env.example` to `.env`.
   - Get a free API key at [newsapi.org/register](https://newsapi.org/register).
   - Set `NEWS_API_KEY=your_key` in `.env`.
   - Without a key, the app uses mock data.

3. Start the server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use

- **Globe**: Drag to rotate; scroll to zoom.
- **Bubbles**: Each bubble is a news story. Size = importance; color = category (blue = economy/general, red = politics, green = climate).
- **Click a bubble**: The NEWS SUMMARY panel on the right shows headline, summary, and “Read more” link.
- **Hover a bubble**: Tooltip shows the headline.
- **Timeline slider**: Move left to show only older stories (within the last 7 days); right to show the most recent.

## Tech

- **Backend**: Node, Express, dotenv, cors. Serves static files and `GET /api/news` (optional `from`/`to` query for date range).
- **Frontend**: Vanilla JS, Three.js (3D globe, bubbles, connection lines). No build step; ES modules + import map for Three.js.

## Docs

- [NewsMap 프로젝트 분석 (초보 개발자용)](docs/NewsMap_분석.md) — 비슷한 컨셉의 [NewsMap](https://github.com/jvallyea/NewsMap) (2017) 프로젝트 구조와 데이터 흐름 정리.
