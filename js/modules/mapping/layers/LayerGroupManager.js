/* js/modules/mapping/layers/LayerGroupManager */
export class LayerGroupManager {
    constructor(map) {
        this.map = map;
        this.layerGroup = L.layerGroup().addTo(this.map);
    }

    addLayer(layer) {
        this.layerGroup.addLayer(layer);
    }

    removeLayer(layer) {
        this.layerGroup.removeLayer(layer);
    }

    clearLayers() {
        this.layerGroup.clearLayers();
    }
}