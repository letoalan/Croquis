/* js/modules/mapping/events/EventManager.js */
export class EventManager {
    constructor(map, eventHandlers) {
        this.map = map;
        this.eventHandlers = eventHandlers;
    }

    /**
     * Initialise les gestionnaires d'événements pour la carte.
     */
    initEvents() {
        // Événement de création de géométries
        this.map.on('pm:create', (e) => this.eventHandlers.handleGeometryCreation(e));

        // Événement de suppression de couches
        this.map.on('pm:removelayer', (e) => this.eventHandlers.handleLayerRemoval(e));

        // Événement d'édition de couches
        this.map.on('pm:edit', (e) => this.eventHandlers.handleLayerEdit(e));

        // Événement d'ajout de vertex aux couches
        this.map.on('pm:vertexadded', (e) => this.eventHandlers.handleVertexAdded(e));
    }
}