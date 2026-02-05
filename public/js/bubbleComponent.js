const BUBBLE_RADIUS_MIN = 8;
const BUBBLE_RADIUS_MAX = 28;

const CATEGORY_COLORS = {
  politics: '#ff4466',
  climate: '#44dd88',
  economy: '#4488ff',
  health: '#88ccff',
  general: '#00aacc',
};

/**
 * Create a circle marker (bubble) for a region on 2D map.
 * @param {Object} region - { country, lat, lng, importance, category, articles }
 * @param {L.Map} map
 * @returns {{ layer: L.CircleMarker, region: Object }}
 */
export function createBubble(region, map) {
  const radius = BUBBLE_RADIUS_MIN + (region.importance || 0.5) * (BUBBLE_RADIUS_MAX - BUBBLE_RADIUS_MIN);
  const color = CATEGORY_COLORS[region.category] || CATEGORY_COLORS.general;

  const layer = L.circleMarker([region.lat, region.lng], {
    radius: Math.round(radius),
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.75,
  });

  layer.region = region;
  return { layer, region };
}

/**
 * Add region bubbles to the map layer group.
 * @param {L.LayerGroup} layerGroup
 * @param {L.Map} map
 * @param {Array} regions - [{ country, lat, lng, importance, category, articles }]
 * @returns {Array<{ layer: L.CircleMarker, region: Object }>}
 */
export function addBubbles(layerGroup, map, regions) {
  const result = [];
  for (const region of regions) {
    const { layer, region: r } = createBubble(region, map);
    layerGroup.addLayer(layer);
    result.push({ layer, region: r });
  }
  return result;
}

/**
 * Remove all bubble layers from the layer group.
 * @param {L.LayerGroup} layerGroup
 * @param {Array<{ layer: L.Layer }>} bubbleRefs
 */
export function removeBubbles(layerGroup, bubbleRefs) {
  for (const { layer } of bubbleRefs) {
    layerGroup.removeLayer(layer);
  }
}

/**
 * No connection lines in 2D for simplicity. Kept for API compatibility.
 */
export function addConnectionLines(layerGroup, bubbleRefs) {
  return [];
}

/**
 * No-op for API compatibility.
 */
export function removeConnectionLines(layerGroup, lineRefs) {}
