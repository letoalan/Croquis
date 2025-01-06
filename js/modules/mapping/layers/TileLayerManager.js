/* js/modules/mapping/layers/TileLayerManager */
export class TileLayerManager {
    constructor(map, tileSources) {
        this.map = map;
        this.tileSources = tileSources;
        this.tileLayer = null;
    }

    setTileLayer(tileType) {
        if (!this.tileSources[tileType]) {
            throw new Error(`Tile type "${tileType}" is not defined.`);
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
}