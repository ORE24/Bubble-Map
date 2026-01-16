/**
 * Map Renderer
 * Handles D3.js map drawing and interaction.
 */

export class MapRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        // State
        this.svg = null;
        this.g = null; // Group for map features
        this.projection = null;
        this.path = null;
        this.countries = [];
    }

    async init() {
        this.createSVG();
        await this.loadMapData();
        this.drawMap();
        this.handleResize();
    }

    createSVG() {
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Add a group for the map features so we can pan/zoom if we wanted later
        // or just keep it separate from UI elements (bubbles)
        this.g = this.svg.append('g').attr('class', 'map-layer');
        this.bubbleLayer = this.svg.append('g').attr('class', 'bubble-layer');
    }

    async loadMapData() {
        // Fetch World Atlas TopoJSON (Standard 110m resolution)
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const data = await response.json();

        // Convert TopoJSON to GeoJSON
        this.countries = topojson.feature(data, data.objects.countries).features;
    }

    drawMap() {
        // Natural Earth Projection is good for global views
        this.projection = d3.geoNaturalEarth1()
            .scale(this.width / 5.5) // Adjust scale based on width
            .translate([this.width / 2, this.height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // Draw Countries
        this.g.selectAll('path')
            .data(this.countries)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', this.path)
            .attr('id', d => `country-${d.id}`); // d.id in world-atlas is usually ISO numeric
    }

    // Helper to get centroid of a country by ID or name
    getCentroid(countryIdOrName) {
        // This is tricky because world-atlas uses ISO Numeric codes (e.g. "840" for USA)
        // detailed mapping is needed. For this demo, let's try to find by ID if we can,
        // or we might need a mapping lookup. 
        // For simplicity, we will calculate centroids for ALL countries and map them to ISO Alpha-3.
        // But since we lack a full lookup table in this small file, 
        // we'll do a simple match if we can, or rely on a hardcoded mapping for the demo specific countries.

        // For the demo, let's use a very basic lookup for the countries in our mock DB.
        // ISO Numeric -> ISO Alpha-3 mapping (Partial)
        const numericToAlpha3 = {
            '840': 'USA', '156': 'CHN', '276': 'DEU', '076': 'BRA', '356': 'IND',
            '036': 'AUS', '710': 'ZAF', '250': 'FRA', '392': 'JPN', '826': 'GBR',
            '124': 'CAN', '380': 'ITA', '410': 'KOR', '484': 'MEX', '643': 'RUS'
        };

        const feature = this.countries.find(c => numericToAlpha3[c.id] === countryIdOrName);
        if (feature) {
            return this.path.centroid(feature);
        }
        return null;
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;

            // Update projection
            this.projection
                .scale(this.width / 5.5)
                .translate([this.width / 2, this.height / 2]);

            // Update paths
            this.g.selectAll('path').attr('d', this.path);

            // Trigger an event so bubbles can re-position
            window.dispatchEvent(new CustomEvent('map-resized'));
        });
    }
}
