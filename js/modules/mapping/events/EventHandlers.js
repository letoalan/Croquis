/* js/modules/mapping/events/EventHandlers.js */
export class EventHandlers {
    constructor(mapManager) {
        this.mapManager = mapManager;
    }

    /**
     * Gère la création de géométries (marqueurs, polygones, etc.).
     * @param {Object} e - L'événement de création.
     */
    handleGeometryCreation(e) {
        this.mapManager.handleGeometryCreation(e);
    }

    /**
     * Gère la suppression de couches (géométries).
     * @param {Object} e - L'événement de suppression.
     */
    handleLayerRemoval(e) {
        this.mapManager.handleLayerRemoval(e);
    }

    /**
     * Gère l'édition de couches (géométries).
     * @param {Object} e - L'événement d'édition.
     */
    handleLayerEdit(e) {
        this.mapManager.handleLayerEdit(e);
    }

    /**
     * Gère l'ajout de vertex aux couches (géométries).
     * @param {Object} e - L'événement d'ajout de vertex.
     */
    handleVertexAdded(e) {
        this.mapManager.handleVertexAdded(e);
    }
}