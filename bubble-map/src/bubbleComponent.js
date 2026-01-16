/**
 * Bubble Component
 * Renders news bubbles on top of the map.
 */

export class BubbleManager {
    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
        this.bubbles = [];

        // Listen for map resize to update positions
        window.addEventListener('map-resized', () => this.updatePositions());
    }

    renderBubbles(newsItems) {
        // Clear existing
        this.mapRenderer.bubbleLayer.selectAll('*').remove();
        this.bubbles = [];

        newsItems.forEach(item => {
            const centroid = this.mapRenderer.getCentroid(item.countryCode);
            if (centroid) {
                this.createBubble(item, centroid);
            }
        });
    }

    createBubble(item, [x, y]) {
        // We use a foreignObject to embed HTML inside SVG
        // This allows us to use CSS flexbox/grids and easy text wrapping
        const bubbleGroup = this.mapRenderer.bubbleLayer.append('g')
            .attr('class', 'news-bubble-group')
            .attr('transform', `translate(${x}, ${y})`); // Position at centroid

        // Adjust these dimensions as needed.
        // It's tricky with foreignObject (need fixed size often), 
        // but we can make it large enough and let HTML center itself.
        const width = 200;
        const height = 100;

        const fo = bubbleGroup.append('foreignObject')
            .attr('class', 'bubble-fo')
            .attr('x', -width / 2) // Center horizontally
            .attr('y', -height - 10) // Position above the point (plus a little gap)
            .attr('width', width)
            .attr('height', height);

        const div = fo.append('xhtml:div')
            .attr('class', 'bubble-content');

        div.append('div')
            .attr('class', 'bubble-country')
            .text(item.countryCode); // Or full name if available

        div.append('div')
            .attr('class', 'bubble-headline')
            .text(item.headline);

        this.bubbles.push({ group: bubbleGroup, countryCode: item.countryCode });
    }

    updatePositions() {
        this.bubbles.forEach(bubble => {
            const centroid = this.mapRenderer.getCentroid(bubble.countryCode);
            if (centroid) {
                bubble.group.attr('transform', `translate(${centroid[0]}, ${centroid[1]})`);
            }
        });
    }
}
