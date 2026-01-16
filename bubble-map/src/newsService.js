/**
 * Mock News Service
 * Returns fake news headlines for yesterday's date.
 */

// Helper to get formatted date string for "Yesterday"
export function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Mock Database of news
// Keys are ISO 3166-1 alpha-3 codes (which D3 World map usually uses via id)
// or country names if that's what we match on. GeoJSON usually uses IDs like '840' for USA, but we can map names.
// For simplicity in this demo, let's assume we map by Alpha-3 code or Country Name.
const NEWS_DB = {
    'USA': 'Tech giant unveils quantum efficient processor.',
    'CHN': 'High-speed rail network expansion completed ahead of schedule.',
    'DEU': 'Renewable energy output hits record high in Bavaria.',
    'BRA': 'Amazon rainforest preservation initiative shows positive results.',
    'IND': 'Space agency confirms successful satellite launch.',
    'AUS': 'Coral reef recovery rates exceed expectations.',
    'ZAF': 'International jazz festival kicks off in Cape Town.',
    'FRA': 'Louvre announces rare midnight exhibition.',
    'JPN': 'cherry blossom season attracts record tourists.',
    'GBR': 'Historic clock tower renovation finalized.',
    'CAN': 'Northern lights visibility peak expected tonight.',
    'ITA': 'Ancient Roman villa discovered during subway excavation.',
    'KOR': 'New webtoon adaptation sweeps global streaming charts.',
    'MEX': 'Culinary festival celebrates ancient Aztec recipes.',
    'RUS': 'Arctic research station reports unusual weather patterns.'
};

/**
 * Returns news for a given set of country codes.
 * In a real app, this would fetch from an API.
 */
export async function getNewsForCountries() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return Object.entries(NEWS_DB).map(([code, headline]) => ({
        countryCode: code,
        headline: headline
    }));
}
