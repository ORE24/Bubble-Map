/**
 * Main Entry Point
 */
import { MapRenderer } from './mapRenderer.js';
import { BubbleManager } from './bubbleComponent.js';
import { getNewsForCountries, getYesterdayDate } from './newsService.js';

async function initApp() {
    // 1. Set Date
    document.getElementById('current-date').textContent = getYesterdayDate();

    // 2. Initialize Map
    const map = new MapRenderer('map-container');
    await map.init();

    // 3. Initialize Bubble Manager
    const bubbleManager = new BubbleManager(map);

    // 4. Fetch News & Render
    // In a real app, we might specific country codes or fetch all available.
    const news = await getNewsForCountries();
    bubbleManager.renderBubbles(news);

    console.log('Bubble Map Initialized with mock data');
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);
