/* js/modules/mapping/geometry/GeometryHandler.js */
export class GeometryHandler {
    constructor(map, layerGroupManager) {
        this.map = map;
        this.layerGroupManager = layerGroupManager;
    }

    /**
     * Crée un objet géométrique à partir d'une couche Leaflet.
     * @param {L.Layer} layer - La couche Leaflet à convertir en objet géométrique.
     * @returns {Object|null} - L'objet géométrique créé, ou null si la couche n'est pas reconnue.
     */
    // Dans GeometryHandler.js, méthode createGeometryObject()

    createGeometryObject(layer) {
        if (!layer) {
            throw new Error('Layer is undefined in createGeometryObject.');
        }

        const color = layer.options.color || "#007bff";
        const opacity = layer.options.opacity || 1;

        if (layer instanceof L.Circle) {
            return {
                type: 'Circle',
                center: layer.getLatLng(),
                radius: layer.getRadius(),
                color: color,
                opacity: opacity,
                layer: layer
            };
        } else if (layer instanceof L.Polygon) {
            return {
                type: 'Polygon',
                coordinates: layer.getLatLngs()[0] || layer.getLatLngs(),
                color: color,
                opacity: opacity,
                layer: layer
            };
        } else if (layer instanceof L.Polyline) {
            return {
                type: 'Polyline',
                coordinates: layer.getLatLngs(),
                color: color,
                opacity: opacity,
                layer: layer
            };
        } else if (layer instanceof L.Marker) {
            // Gestion des marqueurs personnalisés
            return {
                type: 'CustomMarker',
                coordinates: layer.getLatLng(),
                color: color,
                opacity: opacity,
                layer: layer
            };
        }

        throw new Error('Layer type not recognized.');
    }
}