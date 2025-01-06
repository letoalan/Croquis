/* js/modules/mapping/markers/MarkerControlManager.js */
export class MarkerControlManager {
    constructor(map, markerTypes) {
        this.map = map;
        this.markerTypes = markerTypes;
        this.activeMarkerType = null; // Initialiser à null
    }

    addCustomMarkerControls() {
        const markerControl = L.Control.extend({
            options: {
                position: 'topleft'
            },

            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');

                this.markerTypes.forEach(type => {
                    const button = L.DomUtil.create('a', 'leaflet-control-custom', container);
                    button.href = '#';
                    button.title = `Draw ${type} marker`;

                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    svg.setAttribute('viewBox', '0 0 24 24');

                    let path;
                    switch (type) {
                        case 'circle':
                            path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            path.setAttribute('cx', '12');
                            path.setAttribute('cy', '12');
                            path.setAttribute('r', '10');
                            break;
                        case 'square':
                            path = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            path.setAttribute('x', '2');
                            path.setAttribute('y', '2');
                            path.setAttribute('width', '20');
                            path.setAttribute('height', '20');
                            break;
                        case 'triangle':
                            path = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                            path.setAttribute('points', '12,2 22,20 2,20');
                            break;
                        case 'hexagon':
                            path = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                            path.setAttribute('points', '12,2 20,6 20,18 12,22 4,18 4,6');
                            break;
                    }

                    path.setAttribute('fill', 'transparent');
                    path.setAttribute('stroke', '#000');
                    path.setAttribute('stroke-width', '2');
                    svg.appendChild(path);
                    button.appendChild(svg);

                    L.DomEvent.on(button, 'click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        this.activeMarkerType = type; // Définir le type de marqueur actif
                        console.log(`Active marker type set to: ${this.activeMarkerType}`); // Log le type de marqueur actif

                        // Activer le mode de dessin pour le marqueur
                        this.map.pm.enableDraw('Marker', {
                            snappable: true,
                            snapDistance: 20,
                            cursorMarker: false,
                            markerStyle: {
                                icon: L.divIcon({
                                    html: `
                                        <div class="cursor-marker">
                                            <div class="cross"></div>
                                        </div>
                                    `,
                                    className: 'cursor-marker',
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 12]
                                })
                            }
                        });
                    });
                });

                return container;
            }
        });

        this.map.addControl(new markerControl());
    }
}