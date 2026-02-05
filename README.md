# BubbleMap: Global News Cortex

**News is not just list but it's map.**

뉴스를 리스트가 아닌 **지도**로 만나보세요. BubbleMap은 전 세계 뉴스를 3D 지구본 위의 컬러 버블로 보여줍니다. API로 헤드라인을 가져오며(스크래핑 없음), 버블을 클릭하면 요약을 보고, 타임라인 슬라이더로 시간대별로 필터링할 수 있습니다.

*Experience news as a map: a 3D globe with colored bubbles for each story. Click a bubble for the summary; use the timeline to filter by time.*

## Screenshots

<!-- 스크린샷을 추가하려면 아래처럼 이미지를 넣을 수 있습니다. -->
<!-- ![BubbleMap 미리보기](docs/screenshot.png) -->

*실행 후 3D 지구본과 뉴스 버블 화면을 캡처해 위 자리에 넣어 주세요.*

## Features

- **3D 지구본**: 전 세계 뉴스를 한눈에 보는 인터랙티브 글로브
- **카테고리별 색상**: 경제/일반(파랑), 정치(빨강), 기후(초록) 등 구분
- **버블 크기**: 중요도에 따른 시각적 강조
- **타임라인 필터**: 지난 7일 구간에서 시간대별로 뉴스 필터링
- **요약 패널**: 버블 클릭 시 헤드라인·요약·원문 링크 표시
- **API 기반**: News API로 헤드라인 수집 (스크래핑 없음), API 키 없으면 mock 데이터 사용

## Environment / 요구 사항

- **Node.js**: 18 이상 권장
- **브라우저**: Chrome, Firefox, Safari, Edge (Three.js 지원 환경)
- **선택**: [News API](https://newsapi.org/register) 키 — 없어도 mock 데이터로 동작

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

## 개선 예정 / Roadmap

아래 항목은 [개선 및 보완 사항](docs/개선_및_보완_사항.md) 문서에 상세히 정리되어 있습니다. **높음 → 중간 → 낮음** 순으로 진행하는 것을 권장합니다.

| 우선순위 | 항목 |
|----------|------|
| **높음** | `.env.example`에 실제 API 키 제거, 로딩/에러 UX(스피너·에러 메시지·재시도 버튼) |
| **중간** | 문서·구현 정합성(README/Leaflet·Three.js 명시), 국가 메타데이터 통합, newsService 타임아웃·에러 처리, 단위/통합 테스트, 서버 보강(환경 검증·rate limit) |
| **낮음** | 타임라인 라벨 명확화, 헤더 버튼 역할 정리·비활성화, 접근성·반응형, 전역 객체 정리, XSS escapeHtml 보완, resize 리스너 해제, politics 카테고리 일치 |

→ 전체 목록·구현 가이드: [docs/개선_및_보완_사항.md](docs/개선_및_보완_사항.md)

## Docs

- [개선 및 보완 사항](docs/개선_및_보완_사항.md) — 수정/보완이 필요한 항목 정리 (우선순위별, 초보 개발자용 설명 포함).
- [NewsMap 프로젝트 분석 (초보 개발자용)](docs/NewsMap_분석.md) — 비슷한 컨셉의 [NewsMap](https://github.com/jvallyea/NewsMap) (2017) 프로젝트 구조와 데이터 흐름 정리.
