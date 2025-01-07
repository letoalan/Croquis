import { TileLayerManager } from './mapping/layers/TileLayerManager.js';
import { LayerGroupManager } from './mapping/layers/LayerGroupManager.js';
import { MarkerControlManager } from './mapping/markers/MarkerControlManager.js';
import { EventManager } from './mapping/events/EventManager.js';
import { EventHandlers } from './mapping/events/EventHandlers.js';
import { GeometryHandler } from './mapping/geometry/GeometryHandler.js';
import { MarkerFactory } from './markers/MarkerFactory.js'; // Import correct de MarkerFactory
import { LegendManager } from './mapping/LegendManager.js';

export class MapManager {
    constructor(stateManager) {
        if (!stateManager) {
            throw new Error('StateManager is required for MapManager initialization.');
        }

        this.stateManager = stateManager;
        this.map = null;
        this.tileLayerManager = null;
        this.layerGroupManager = null;
        this.geometryHandler = null;
        this.eventManager = null;
        this.legendManager = null;


        // Instanciation de MarkerControlManager
        this.markerControlManager = new MarkerControlManager(this.map, ['circle', 'square', 'triangle', 'hexagon']);

        // Configuration des sources de tuiles
        this.tileSources = {
            osm: {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; OpenStreetMap contributors'
            },
            cartodb: {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                attribution: '&copy; CartoDB'
            },
            dark: {
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                attribution: '&copy; CartoDB'
            },
            satellite: {
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; Esri'
            }
        };
    }

    /**
     * Initialise la carte Leaflet et les modules associés.
     */
    initMap() {
        this._initializeMapElement();
        this._initializeTileLayer();
        this._initializeLayerGroup();
        this._initializeGeometryHandler();
        this._initializeEventHandlers();
        this._initializeMarkerControls();
        this._initializeEditingControls();
        this._initializeLegend();
    }

    /**
     * Initialise l'élément de la carte dans le DOM.
     * @throws {Error} Si l'élément de la carte n'est pas trouvé.
     */
    _initializeMapElement() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            throw new Error('Map element not found in the DOM.');
        }
        this.map = L.map('map').setView([37.0902, -95.7129], 4); // Centre la carte sur les États-Unis

        // Mettre à jour la référence de la carte dans MarkerControlManager
        this.markerControlManager.map = this.map;
    }

    /**
     * Initialise la couche de tuiles par défaut (OpenStreetMap).
     */
    _initializeTileLayer() {
        this.tileLayerManager = new TileLayerManager(this.map, this.tileSources);
        this.tileLayerManager.setTileLayer('osm'); // Utilise OpenStreetMap par défaut
    }

    /**
     * Initialise le groupe de couches pour les marqueurs et les géométries.
     */
    _initializeLayerGroup() {
        this.layerGroupManager = new LayerGroupManager(this.map);
    }

    /**
     * Initialise le gestionnaire des géométries.
     */
    _initializeGeometryHandler() {
        this.geometryHandler = new GeometryHandler(this.map, this.layerGroupManager);
    }

    /**
     * Initialise les gestionnaires d'événements pour la carte.
     */
    _initializeEventHandlers() {
        const eventHandlers = new EventHandlers(this);
        this.eventManager = new EventManager(this.map, eventHandlers);
        this.eventManager.initEvents();

        this.map.on('pm:dragend', (e) => {
            const layer = e.layer;
            if (layer && layer.options.customProperties) {
                // Restaurer les propriétés personnalisées
                const properties = layer.options.customProperties;
                layer.setStyle({
                    color: properties.lineColor,
                    fillColor: properties.color,
                    fillOpacity: properties.opacity,
                    weight: properties.lineWeight,
                    dashArray: properties.lineDash === 'solid' ? '' : properties.lineDash === 'dashed' ? '10,10' : '2,6',
                });

                // Mettre à jour les coordonnées dans le StateManager
                const geometryIndex = this.stateManager.geometries.findIndex(
                    geometry => geometry.layer === layer
                );
                if (geometryIndex !== -1) {
                    this.stateManager.updateGeometryCoordinates(geometryIndex, layer.getLatLng());
                }

                // Mettre à jour la légende si nécessaire
                if (this.legendManager) {
                    this.legendManager.updateLegend();
                }
            }
        });
    }

    /**
     * Initialise les contrôles personnalisés pour les marqueurs.
     */
    _initializeMarkerControls() {
        this.markerControlManager.addCustomMarkerControls();
    }
    _initializeMarkerFactory() {
        if (!this.geometryHandler) {
            throw new Error('GeometryHandler must be initialized before creating MarkerFactory.');
        }
        this.markerFactory = new MarkerFactory(this.stateManager, this.geometryHandler);
    }

    /**
     * Initialise les contrôles d'édition de Leaflet.PM.
     */
    _initializeEditingControls() {
        if (!this.map.pm) {
            throw new Error('Leaflet.PM plugin is not loaded.');
        }

        // Ajouter les contrôles de dessin avec un libellé personnalisé
        this.map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircle: true,
            drawPolygon: true,
            drawPolyline: true,
            drawRectangle: true,
            drawCircleMarker: false,
            editMode: true,
            dragMode: true,
            cutPolygon: false,
            removalMode: false,
            // Personnalisation des libellés des boutons
            customControls: true,
            editControls: {
                edit: 'Editer la forme', // Renommer le bouton "Edit layer"
                cancel: 'Annuler',
                save: 'Enregistrer',
            },
        });

        // Activer les modes d'édition et de suppression globaux
        this.map.pm.enableGlobalEditMode({
            allowEditing: true,
            allowAddingIntersections: true,
            allowRemoval: true,
            editMode: true,
            dragMode: true,
        });

        this.map.pm.enableGlobalRemovalMode();

        // Désactiver l'édition directe des marqueurs
        this.map.pm.setPathOptions({
            allowEditing: false, // Désactiver l'édition directe des marqueurs
        });

        // Gérer l'édition des marqueurs via le bouton "Editer la forme"
        this.map.on('pm:globaleditmodetoggled', (e) => {
            if (e.enabled) {
                console.log('Mode édition activé');
                // Activer l'édition pour tous les marqueurs
                this.map.eachLayer(layer => {
                    if (layer.pm) {
                        layer.pm.enable(); // Activer l'édition pour cette couche
                        console.log('[MapManager] Editing enabled for layer:', layer);
                    }
                });
            } else {
                console.log('Mode édition désactivé');
                // Désactiver l'édition pour tous les marqueurs
                this.map.eachLayer(layer => {
                    if (layer.pm) {
                        layer.pm.disable(); // Désactiver l'édition pour cette couche
                        console.log('[MapManager] Editing disabled for layer:', layer);
                    }
                });

                // Mettre à jour la légende après la fin de l'édition
                if (this.stateManager) {
                    this.stateManager.updateUI();
                }
            }
        });

        // Gérer la modification de la forme
        this.map.on('pm:dragend', (e) => {
            const layer = e.layer;
            if (layer && layer.options.customProperties) {
                // Restaurer les propriétés personnalisées
                const properties = layer.options.customProperties;

                // Appliquer les styles en fonction du type de géométrie
                if (layer instanceof L.CircleMarker) {
                    layer.setStyle({
                        color: properties.lineColor,
                        fillColor: properties.color,
                        fillOpacity: properties.opacity,
                        weight: properties.lineWeight,
                        radius: properties.markerSize / 2
                    });
                } else if (layer instanceof L.Polygon) {
                    layer.setStyle({
                        color: properties.lineColor,
                        fillColor: properties.color,
                        fillOpacity: properties.opacity,
                        weight: properties.lineWeight,
                        dashArray: properties.lineDash === 'solid' ? '' : properties.lineDash === 'dashed' ? '10,10' : '2,6'
                    });
                }

                // Mettre à jour les coordonnées dans le StateManager
                const geometryIndex = this.stateManager.geometries.findIndex(
                    geometry => geometry.layer === layer
                );
                if (geometryIndex !== -1) {
                    this.stateManager.updateGeometryCoordinates(geometryIndex, layer.getLatLng());
                }

                // Mettre à jour la légende si nécessaire
                if (this.legendManager) {
                    this.legendManager.updateLegend();
                }
            }
        });
    }

    /**
     * Gère l'édition des marqueurs.
     * @param {L.Marker|L.CircleMarker} marker - Le marqueur à éditer.
     */
    handleMarkerEdit(marker) {
        // Ouvrir une boîte de dialogue ou un menu contextuel pour modifier la taille du marqueur
        const newSize = prompt('Entrez la nouvelle taille du marqueur (en pixels) :', 24); // Taille par défaut
        if (newSize && !isNaN(newSize)) {
            const size = parseInt(newSize, 10);
            if (size > 0) {
                this.resizeMarker(marker, size); // Redimensionner le marqueur
            } else {
                alert('La taille doit être un nombre positif.');
            }
        }
    }

    /**
     * Redimensionne un marqueur.
     * @param {L.Marker|L.CircleMarker} marker - Le marqueur à redimensionner.
     * @param {number} size - La nouvelle taille du marqueur.
     */
    resizeMarker(marker, size) {
        console.log('[MapManager] Resizing marker to size:', size);

        if (!marker) {
            console.error('[MapManager] Marker is undefined in resizeMarker.');
            return;
        }

        // Vérifier si MarkerFactory est initialisé
        if (!this.markerFactory) {
            console.error('[MapManager] MarkerFactory is not initialized.');
            return;
        }

        // Vérifier si le marqueur est un marqueur personnalisé
        if (marker.options.customProperties && marker.options.customProperties.markerType) {
            console.log('[MapManager] Resizing custom marker');
            this.markerFactory.resizeCustomMarker(marker, size); // Appeler resizeCustomMarker
        } else {
            console.log('[MapManager] Resizing non-custom marker');
            // Ancienne logique pour redimensionner les autres types de marqueurs
            if (marker instanceof L.CircleMarker) {
                // Redimensionner un cercle
                marker.setRadius(size / 2);
                console.log('[MapManager] Circle marker resized to:', size);
            } else if (marker instanceof L.Marker) {
                // Redimensionner un marqueur SVG (carré, triangle, hexagone)
                const icon = marker.getIcon();
                if (icon && icon.options && icon.options.html) {
                    const newIcon = L.divIcon({
                        html: icon.options.html.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`),
                        className: icon.options.className,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2]
                    });
                    marker.setIcon(newIcon);
                    console.log('[MapManager] SVG marker resized to:', size);
                }
            } else if (marker instanceof L.Polygon) {
                // Redimensionner un marqueur personnalisé (carré, triangle, hexagone)
                const bounds = marker.getBounds();
                const center = bounds.getCenter();
                const scaleFactor = size / (marker.options.markerSize || 24); // Facteur d'échelle

                const newLatLngs = marker.getLatLngs()[0].map(latlng => {
                    const latDiff = (latlng.lat - center.lat) * scaleFactor;
                    const lngDiff = (latlng.lng - center.lng) * scaleFactor;
                    return L.latLng(center.lat + latDiff, center.lng + lngDiff);
                });

                marker.setLatLngs([newLatLngs]);
                marker.options.markerSize = size; // Mettre à jour la taille du marqueur
                console.log('[MapManager] Polygon marker resized to:', size);
            } else {
                console.error('[MapManager] Unknown marker type:', marker);
            }
        }
    }

    /**
     * Initialise la légende de la carte.
     */
    _initializeLegend() {
        this.legendManager = new LegendManager(this.map, this.stateManager);
    }

    /**
     * Change la couche de tuiles affichée sur la carte.
     * @param {string} tileType - Le type de tuile à afficher (osm, cartodb, dark, satellite).
     */
    setTileLayer(tileType) {
        if (!this.tileSources[tileType]) {
            console.error(`Tile type "${tileType}" is not defined.`);
            return;
        }

        if (this.tileLayer) {
            this.map.removeLayer(this.tileLayer);
        }

        const tileConfig = this.tileSources[tileType];
        this.tileLayer = L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution
        });

        this.tileLayer.addTo(this.map);
    }

    /**
     * Gère la création de géométries (marqueurs, polygones, etc.).
     * @param {Object} e - L'événement de création.
     */
    handleGeometryCreation(e) {
        const layer = e.layer;
        if (!layer) {
            console.error('[MapManager] Layer is undefined in pm:create event.');
            return;
        }

        if (e.shape === 'Marker') {
            console.log(`[MapManager] Creating marker of type: ${this.markerControlManager.activeMarkerType}`);
            const markerFactory = new MarkerFactory(this.stateManager, this.geometryHandler); // Instancier MarkerFactory
            const newMarker = markerFactory.createMarker(
                this.markerControlManager.activeMarkerType,
                layer.getLatLng(),
                {
                    color: "#007bff",
                    opacity: 1,
                    lineColor: "#000000",
                    lineWeight: 2
                }
            );
            this.map.removeLayer(layer);
            newMarker.addTo(this.layerGroupManager.layerGroup);

            // Désactiver l'édition directe pour le nouveau marqueur
            newMarker.pm.disable();

            // Extraire les coordonnées du marqueur
            let coordinates;
            if (newMarker instanceof L.CircleMarker) {
                coordinates = newMarker.getLatLng();
            } else if (newMarker instanceof L.Polygon) {
                // Pour les marqueurs personnalisés (carré, triangle, hexagone), utiliser le centre du polygone
                const bounds = newMarker.getBounds();
                coordinates = bounds.getCenter();
            }

            const geometry = {
                type: 'CustomMarker',
                markerType: this.markerControlManager.activeMarkerType,
                coordinates: coordinates,
                color: "#007bff",
                opacity: 1,
                lineWeight: 2,
                layer: newMarker
            };
            this.stateManager.addGeometry(geometry);
        } else {
            let geometry;
            if (e.shape === 'Rectangle') {
                const bounds = layer.getBounds();
                const polygon = L.polygon([
                    bounds.getNorthWest(),
                    bounds.getNorthEast(),
                    bounds.getSouthEast(),
                    bounds.getSouthWest()
                ], {
                    color: "#007bff",
                    fillColor: "#007bff",
                    fillOpacity: 1,
                    weight: 2,
                    dashArray: null
                });
                this.map.removeLayer(layer);
                polygon.addTo(this.layerGroupManager.layerGroup);
                geometry = {
                    type: 'Polygon',
                    coordinates: polygon.getLatLngs()[0],
                    color: "#007bff",
                    opacity: 1,
                    lineWeight: 2,
                    lineDash: "solid",
                    layer: polygon
                };
            } else {
                geometry = this.geometryHandler.createGeometryObject(layer);
                if (geometry) {
                    geometry.layer.setStyle({
                        dashArray: null
                    });
                }
            }
            if (geometry) {
                this.stateManager.addGeometry(geometry);
            } else {
                console.error('[MapManager] Failed to create geometry object for layer:', layer);
            }
        }
    }

    /**
     * Gère la suppression de couches (géométries).
     * @param {Object} e - L'événement de suppression.
     */
    handleLayerRemoval(e) {
        const layerToRemove = e.layer;
        if (!layerToRemove) {
            console.error('[MapManager] Layer is undefined in pm:removelayer event.');
            return;
        }

        const geometryIndex = this.stateManager.geometries.findIndex(
            geometry => geometry.layer === layerToRemove
        );

        if (geometryIndex !== -1) {
            e.cancel();
            this.stateManager.deleteGeometry(geometryIndex);
        } else {
            console.error('[MapManager] Layer not found in geometries:', layerToRemove);
        }
    }

    /**
     * Gère l'édition de couches (géométries).
     * @param {Object} e - L'événement d'édition.
     */
    handleLayerEdit(e) {
        const layer = e.layer;
        if (!layer) {
            console.error('[MapManager] Layer is undefined in pm:edit event.');
            return;
        }

        const geometryIndex = this.stateManager.geometries.findIndex(
            geometry => geometry.layer === layer
        );

        if (geometryIndex !== -1) {
            const currentGeometry = this.stateManager.geometries[geometryIndex];
            const updatedGeometry = this.geometryHandler.createGeometryObject(layer);

            if (!updatedGeometry) {
                console.error('[MapManager] Failed to create updated geometry object for layer:', layer);
                return;
            }

            // Préserver les styles personnalisés
            updatedGeometry.color = currentGeometry.color;
            updatedGeometry.lineColor = currentGeometry.lineColor;
            updatedGeometry.opacity = currentGeometry.opacity;
            updatedGeometry.lineWeight = currentGeometry.lineWeight;
            updatedGeometry.lineDash = currentGeometry.lineDash;
            updatedGeometry.markerSize = currentGeometry.markerSize;
            updatedGeometry.markerType = currentGeometry.markerType;

            // Mettre à jour les propriétés personnalisées de la couche
            layer.options.customProperties = {
                color: updatedGeometry.color,
                lineColor: updatedGeometry.lineColor,
                opacity: updatedGeometry.opacity,
                lineWeight: updatedGeometry.lineWeight,
                lineDash: updatedGeometry.lineDash,
                markerSize: updatedGeometry.markerSize,
                markerType: updatedGeometry.markerType
            };

            this.stateManager.geometries[geometryIndex] = updatedGeometry;
            this.stateManager.updateUI();
        }
    }

    /**
     * Gère l'ajout de vertex aux couches (géométries).
     * @param {Object} e - L'événement d'ajout de vertex.
     */
    handleVertexAdded(e) {
        const layer = e.layer;
        if (!layer) {
            console.error('[MapManager] Layer is undefined in pm:vertexadded event.');
            return;
        }

        const geometryIndex = this.stateManager.geometries.findIndex(
            geometry => geometry.layer === layer
        );

        if (geometryIndex !== -1) {
            const updatedGeometry = this.geometryHandler.createGeometryObject(layer);
            if (!updatedGeometry) {
                console.error('[MapManager] Failed to create updated geometry object for layer:', layer);
                return;
            }

            updatedGeometry.color = this.stateManager.geometries[geometryIndex].color;
            updatedGeometry.opacity = this.stateManager.geometries[geometryIndex].opacity;
            this.stateManager.geometries[geometryIndex] = updatedGeometry;
            this.stateManager.updateUI();
        } else {
            console.error('[MapManager] Layer not found in geometries:', layer);
        }
    }

    /**
     * Met à jour la carte avec les géométries actuelles du StateManager.
     */
    updateMap() {
        console.log('[MapManager] Updating map with current geometries.');

        this.layerGroupManager.clearLayers();

        this.stateManager.geometries.forEach((geometry) => {
            if (geometry.layer) {
                if (geometry.type === 'CustomMarker') {
                    this._updateCustomMarker(geometry);
                } else if (geometry.type === 'Circle' || geometry.type === 'Polygon') {
                    this._updateGeometryLayer(geometry);
                } else if (geometry.type === 'Polyline') {
                    this._updatePolylineLayer(geometry);
                }
            }
        });

        // Mettre à jour la légende après avoir mis à jour la carte
        if (this.legendManager) {
            this.legendManager.updateLegend();
        }
    }

    /**
     * Met à jour un marqueur personnalisé sur la carte.
     * @param {Object} geometry - La géométrie du marqueur personnalisé.
     */
    _updateCustomMarker(geometry) {
        console.log('[MapManager] Updating custom marker:', geometry);

        this.map.removeLayer(geometry.layer);
        const markerFactory = new MarkerFactory(this.stateManager, this.geometryHandler); // Instancier MarkerFactory
        const newMarker = markerFactory.createMarker(
            geometry.markerType,
            geometry.coordinates,
            {
                color: geometry.color,
                opacity: geometry.opacity,
                lineColor: geometry.lineColor,
                lineWeight: geometry.lineWeight,
                lineDash: geometry.lineDash,
                markerSize: geometry.markerSize // Ajout de la taille du marqueur
            }
        );
        geometry.layer = newMarker;
        newMarker.addTo(this.layerGroupManager.layerGroup);

        // Désactiver l'édition directe pour le nouveau marqueur
        newMarker.pm.disable();
    }

    /**
     * Met à jour une géométrie (cercle ou polygone) sur la carte.
     * @param {Object} geometry - La géométrie à mettre à jour.
     */
    _updateGeometryLayer(geometry) {
        console.log('[MapManager] Updating geometry layer:', geometry);

        geometry.layer.setStyle({
            color: geometry.lineColor,
            fillColor: geometry.color,
            fillOpacity: geometry.opacity,
            weight: geometry.lineWeight || 2,
            dashArray: geometry.lineDash === 'solid' ? '' : geometry.lineDash === 'dashed' ? '10,10' : '2,6'
        });
        geometry.layer.addTo(this.layerGroupManager.layerGroup);
    }

    /**
     * Met à jour une polyligne sur la carte.
     * @param {Object} geometry - La polyligne à mettre à jour.
     */
    _updatePolylineLayer(geometry) {
        console.log('[MapManager] Updating polyline layer:', geometry);

        geometry.layer.setStyle({
            color: geometry.lineColor,
            opacity: geometry.opacity,
            weight: geometry.lineWeight || 2,
            dashArray: geometry.lineDash === 'solid' ? '' : geometry.lineDash === 'dashed' ? '10,10' : '2,6'
        });
        geometry.layer.addTo(this.layerGroupManager.layerGroup);
    }
}
