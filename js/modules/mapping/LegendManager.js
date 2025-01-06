/* js/modules/mapping/LegendManager.js */
export class LegendManager {
    constructor(map, stateManager) {
        this.map = map;
        this.stateManager = stateManager;
        this.legendControl = null;
        this.initLegend();
    }

    /**
     * Initialise la légende de la carte.
     */
    initLegend() {
        const LegendControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },

            onAdd: () => {
                const container = L.DomUtil.create('div', 'legend-control');
                container.style.backgroundColor = 'white';
                container.style.padding = '10px';
                container.style.borderRadius = '4px';
                container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
                container.style.maxHeight = '300px';
                container.style.overflowY = 'auto';
                container.style.minWidth = '200px';
                return container;
            }
        });

        this.legendControl = new LegendControl();
        this.map.addControl(this.legendControl);
    }

    /**
     * Met à jour la légende avec les géométries actuelles.
     */
    // Dans le fichier LegendManager.js

    updateLegend() {
        console.log('[LegendManager] Updating legend'); // Log pour indiquer que la légende est en cours de mise à jour

        const container = this.legendControl.getContainer();
        container.innerHTML = '<h6 class="mb-2">Légende</h6>';

        if (this.stateManager.geometries.length === 0) {
            container.innerHTML += '<p class="text-muted small mb-0">Aucun élément sur la carte</p>';
            console.log('[LegendManager] No geometries found, legend updated with empty state'); // Log pour indiquer que la légende est vide
            return;
        }

        this.stateManager.geometries.forEach(geometry => {
            console.log('[LegendManager] Adding geometry to legend:', geometry); // Log pour afficher chaque géométrie ajoutée à la légende

            const item = document.createElement('div');
            item.className = 'legend-item d-flex align-items-center mb-2';

            // Créer le symbole
            const symbol = document.createElement('div');
            symbol.className = 'legend-symbol me-2';
            symbol.style.display = 'inline-block';

            // Définir le style du symbole en fonction du type de géométrie
            if (geometry.type === 'CustomMarker') {
                const size = geometry.markerSize || 24; // Utiliser la taille du marqueur ou une valeur par défaut
                symbol.style.width = `${size}px`;
                symbol.style.height = `${size}px`;
                symbol.style.backgroundColor = geometry.color;
                symbol.style.border = `${geometry.lineWeight || 2}px solid ${geometry.lineColor || '#000000'}`;
                // Appliquer la forme du marqueur
                switch (geometry.markerType) {
                    case 'circle':
                        symbol.style.borderRadius = '50%';
                        break;
                    case 'square':
                        symbol.style.borderRadius = '0%';
                        break;
                    case 'triangle':
                        symbol.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                        break;
                    case 'hexagon':
                        symbol.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
                        break;
                    default:
                        symbol.style.borderRadius = '0%';
                }
            } else if (geometry.type === 'Polyline') {
                // Appliquer les styles de ligne pour les polylignes
                symbol.style.borderTop = `${geometry.lineWeight || 2}px solid ${geometry.lineColor || '#000000'}`;
                symbol.style.opacity = geometry.opacity || 1;
                symbol.style.marginTop = '8px';
                symbol.style.borderTopStyle = this._getLineStyle(geometry.lineDash);
            } else if (geometry.type === 'Polygon') {
                // Appliquer les styles de contour pour les polygones
                symbol.style.backgroundColor = geometry.color;
                symbol.style.opacity = geometry.opacity;
                symbol.style.border = `${geometry.lineWeight || 2}px solid ${geometry.lineColor || '#000000'}`;
                symbol.style.borderStyle = this._getLineStyle(geometry.lineDash);
            } else {
                symbol.style.backgroundColor = geometry.color;
                symbol.style.opacity = geometry.opacity;
                if (geometry.type === 'Circle') {
                    symbol.style.borderRadius = '50%';
                }
            }

            // Ajouter le nom
            const name = document.createElement('span');
            name.className = 'small';
            name.textContent = geometry.name;

            item.appendChild(symbol);
            item.appendChild(name);
            container.appendChild(item);
        });

        console.log('[LegendManager] Legend updated with current geometries'); // Log pour indiquer que la légende a été mise à jour
    }

    /**
     * Retourne le style de ligne en fonction du style de ligne (solid, dashed, dotted).
     * @param {string} lineDash - Le style de ligne (solid, dashed, dotted).
     * @returns {string} - Le style de ligne CSS.
     */
    _getLineStyle(lineDash) {
        switch (lineDash) {
            case 'solid':
                return 'solid';
            case 'dashed':
                return 'dashed';
            case 'dotted':
                return 'dotted';
            default:
                return 'solid';
        }
    }
}