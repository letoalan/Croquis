import { StateManager } from './StateManager.js';
import { MapManager } from './MapManager.js';
import { UIManager } from './UIManager.js';

export class GeometryManager {
    constructor() {
        // Créer StateManager en premier
        this.stateManager = new StateManager();

        // Passer stateManager à MapManager
        this.mapManager = new MapManager(this.stateManager);

        // Initialiser la carte (cela initialise GeometryHandler)
        this.mapManager.initMap();

        // Donner la référence de MapManager à StateManager
        this.stateManager.setMapManager(this.mapManager);

        // Initialiser UIManager avec StateManager
        this.uiManager = new UIManager(this.stateManager);
    }

    /**
     * Initialise l'application.
     */
    init() {
        // Initialiser l'interface utilisateur
        this.uiManager.initUI();
    }
}