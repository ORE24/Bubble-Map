/**
 * 2D map using Leaflet + OpenStreetMap.
 * @param {HTMLDivElement} container
 * @returns {{ map: L.Map, layerGroup: L.LayerGroup }}
 */
export function initMap(container) {
  const map = L.map(container, {
    center: [20, 0],
    zoom: 2,
    zoomControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Custom position for zoom control
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const layerGroup = L.layerGroup().addTo(map);

  function onResize() {
    map.invalidateSize();
  }
  window.addEventListener('resize', onResize);

  // Ensure map sizes correctly after flex layout
  requestAnimationFrame(() => map.invalidateSize());

  return { map, layerGroup };
}
