import { MarkerFactory } from './markers/MarkerFactory.js';

export class StateManager {
    constructor() {
        this.geometries = [];
        this.selectedIndex = null;
        this.mapManager = null;
        this.mapTitle = ''; // Titre de la carte
        this.isTitlePanelCollapsed = false;

        // Ne pas instancier MarkerFactory ici (il sera instancié après que mapManager soit défini)
        this.markerFactory = null;

        // Lie les méthodes au contexte de l'instance
        this.bindMethods();
    }

    /**
     * Lie les méthodes au contexte de l'instance.
     */
    bindMethods() {
        this.openContextMenu = this.openContextMenu.bind(this);
        this.applyStyle = this.applyStyle.bind(this);
        this.deleteGeometry = this.deleteGeometry.bind(this);
        this.updateUI = this.updateUI.bind(this);
        this.updateList = this.updateList.bind(this);
        this.setMapTitle = this.setMapTitle.bind(this);
    }

    /**
     * Définit le titre de la carte.
     * @param {string} title - Le nouveau titre de la carte.
     */
    setMapTitle(title) {
        console.log('[StateManager] Setting map title:', title); // Log pour vérifier le titre
        this.mapTitle = title;
        this.updateUI(); // Mettre à jour l'interface utilisateur
    }

    /**
     * Définit le MapManager.
     * @param {MapManager} mapManager - L'instance de MapManager.
     */
    setMapManager(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required for StateManager initialization.');
        }
        this.mapManager = mapManager;

        // Initialiser MarkerFactory après avoir défini mapManager
        this.initializeMarkerFactory();
    }

    /**
     * Initialise MarkerFactory après que GeometryHandler soit disponible.
     */
    initializeMarkerFactory() {
        if (!this.mapManager || !this.mapManager.geometryHandler) {
            throw new Error('MapManager and GeometryHandler must be initialized before creating MarkerFactory.');
        }

        // Instancier MarkerFactory avec StateManager et GeometryHandler
        this.markerFactory = new MarkerFactory(this, this.mapManager.geometryHandler);

        console.log('[StateManager] MarkerFactory initialized:', this.markerFactory);
    }

    /**
     * Ajoute une géométrie à la liste.
     * @param {Object} geometry - La géométrie à ajouter.
     */
    addGeometry(geometry) {
        if (!geometry) {
            console.error('[StateManager] Geometry is undefined in addGeometry.');
            return;
        }

        const typeCount = this.geometries.filter(g => g.type === geometry.type).length + 1;
        geometry.name = `${geometry.type} ${typeCount}`;

        // Assurez-vous que lineDash, lineWeight et lineColor sont correctement stockés
        geometry.lineDash = geometry.lineDash || 'solid'; // Valeur par défaut si non définie
        geometry.lineWeight = geometry.lineWeight || 2; // Valeur par défaut si non définie
        geometry.lineColor = geometry.lineColor || '#000000'; // Valeur par défaut si non définie
        geometry.markerSize = geometry.markerSize || 24; // Taille par défaut du marqueur

        console.log('[StateManager] Adding geometry with:', {
            type: geometry.type,
            color: geometry.color,
            lineColor: geometry.lineColor,
            opacity: geometry.opacity,
            lineDash: geometry.lineDash,
            lineWeight: geometry.lineWeight,
            markerSize: geometry.markerSize
        });

        this.geometries.push(geometry);
        this.updateUI();
    }

    /**
     * Ouvre le menu contextuel pour une géométrie spécifique.
     * @param {number} index - L'index de la géométrie.
     * @param {Event} event - L'événement de clic.
     */
    openContextMenu(index, event) {
        console.log('[StateManager] Opening context menu for geometry at index:', index); // Log pour vérifier l'index
        if (index < 0 || index >= this.geometries.length) {
            console.error('[StateManager] Invalid index in openContextMenu:', index);
            return;
        }

        this.selectedIndex = index;
        const geometry = this.geometries[index];

        const colorPicker = document.getElementById('contextColorPicker');
        const lineColorPicker = document.getElementById('contextLineColorPicker');
        const opacitySlider = document.getElementById('contextOpacitySlider');
        const lineDashSelect = document.getElementById('contextLineDash');
        const lineWeightSlider = document.getElementById('contextLineWeight');
        const markerSizeSlider = document.getElementById('contextMarkerSize');
        const shapeSelector = document.getElementById('contextShapeSelector'); // Sélecteur de forme

        if (!colorPicker || !lineColorPicker || !opacitySlider || !lineDashSelect || !lineWeightSlider || !markerSizeSlider || !shapeSelector) {
            console.error('[StateManager] Context menu elements not found in the DOM.');
            return;
        }

        // Remplir les champs avec les valeurs actuelles de la géométrie
        colorPicker.value = geometry.color || "#007bff";
        lineColorPicker.value = geometry.lineColor || "#000000";
        opacitySlider.value = geometry.opacity || 1;
        lineDashSelect.value = geometry.lineDash || "solid";
        lineWeightSlider.value = geometry.lineWeight || 2;
        markerSizeSlider.value = geometry.markerSize || 24;
        shapeSelector.value = geometry.markerType || "circle"; // Définir la forme actuelle

        // Désactiver la couleur globale pour les polylignes
        if (geometry.type === 'Polyline') {
            colorPicker.disabled = true; // Désactiver la couleur globale
            lineColorPicker.disabled = false; // Activer la couleur de la ligne
        } else {
            colorPicker.disabled = false; // Activer la couleur globale
            lineColorPicker.disabled = false; // Activer la couleur de la ligne
        }

        // Afficher le menu contextuel
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.top = `${event.clientY}px`;
        } else {
            console.error('[StateManager] Context menu not found in the DOM.');
        }
    }

    /**
     * Applique un style à la géométrie sélectionnée.
     * @param {string} color - La couleur de remplissage.
     * @param {string} lineColor - La couleur de la ligne.
     * @param {number} opacity - L'opacité.
     * @param {string} lineDash - Le style de ligne (solid, dashed, dotted).
     * @param {number} lineWeight - L'épaisseur de la ligne.
     * @param {number} markerSize - La taille du marqueur.
     * @param {string} shape - La nouvelle forme du marqueur.
     */
    applyStyle(color, lineColor, opacity, lineDash, lineWeight, markerSize, shape) {
        console.log('[StateManager] applyStyle called with:', { color, lineColor, opacity, lineDash, lineWeight, markerSize, shape });

        if (this.selectedIndex === null) {
            console.error('[StateManager] No geometry selected in applyStyle.');
            return;
        }

        const geometry = this.geometries[this.selectedIndex];
        if (!geometry) {
            console.error('[StateManager] Selected geometry is undefined in applyStyle.');
            return;
        }

        // Mettre à jour la forme si elle est définie
        if (shape && geometry.type === 'CustomMarker') {
            geometry.markerType = shape; // Mettre à jour le type de marqueur
        }

        // Mettre à jour la taille du marqueur si elle est définie
        if (markerSize && geometry.type === 'CustomMarker') {
            geometry.markerSize = markerSize; // Mettre à jour la taille du marqueur
            this.mapManager.resizeMarker(geometry.layer, markerSize); // Appeler resizeMarker
        }

        // Ne pas mettre à jour la couleur globale pour les polylignes
        if (geometry.type !== 'Polyline') {
            geometry.color = color;
        }
        geometry.lineColor = lineColor;
        geometry.opacity = opacity;
        geometry.lineDash = lineDash;
        geometry.lineWeight = lineWeight;

        // Mettre à jour les propriétés personnalisées de la couche
        if (geometry.layer && geometry.layer.options.customProperties) {
            geometry.layer.options.customProperties = {
                ...geometry.layer.options.customProperties,
                color: geometry.color,
                opacity: geometry.opacity,
                lineColor: geometry.lineColor,
                lineWeight: geometry.lineWeight,
                lineDash: geometry.lineDash,
                markerSize: geometry.markerSize,
                markerType: geometry.markerType,
            };
        }

        console.log('[StateManager] Geometry updated with:', {
            color: geometry.color,
            lineColor: geometry.lineColor,
            opacity: geometry.opacity,
            lineDash: geometry.lineDash,
            lineWeight: geometry.lineWeight,
            markerSize: geometry.markerSize,
            markerType: geometry.markerType
        });

        if (geometry.layer) {
            if (geometry.type === 'CustomMarker') {
                const options = {
                    color: geometry.color,
                    opacity: geometry.opacity,
                    lineColor: geometry.lineColor,
                    lineWeight: geometry.lineWeight,
                    lineDash: geometry.lineDash,
                    markerSize: geometry.markerSize, // Ajout de la taille du marqueur
                    markerType: geometry.markerType // Ajout du type de marqueur
                };
                console.log('[StateManager] Options passed to MarkerFactory.createMarker:', options);

                // Supprimer l'ancien marqueur
                this.mapManager.map.removeLayer(geometry.layer);

                // Créer un nouveau marqueur avec les nouvelles options
                const newMarker = this.markerFactory.createMarker(
                    geometry.markerType,
                    geometry.coordinates,
                    options
                );
                newMarker.addTo(this.mapManager.layerGroupManager.layerGroup);
                geometry.layer = newMarker;
            } else if (typeof geometry.layer.setStyle === 'function') {
                const style = {
                    color: geometry.lineColor, // Utiliser lineColor pour les contours
                    fillColor: geometry.color,
                    fillOpacity: geometry.opacity,
                    weight: geometry.lineWeight,
                    dashArray: geometry.lineDash === 'solid' ? '' : geometry.lineDash === 'dashed' ? '10,10' : '2,6'
                };
                console.log('[StateManager] Style applied to layer:', style);
                geometry.layer.setStyle(style);
            } else {
                console.error('[StateManager] geometry.layer is not a valid Leaflet layer or does not have setStyle method:', geometry.layer);
            }
        } else {
            console.error('[StateManager] geometry.layer is undefined:', geometry);
        }

        // Mettre à jour la légende après avoir appliqué les styles
        if (this.mapManager.legendManager) {
            this.mapManager.legendManager.updateLegend();
        }

        this.updateUI();
    }
    /**
     * Supprime une géométrie de la liste.
     * @param {number} index - L'index de la géométrie à supprimer.
     */
    deleteGeometry(index) {
        console.log('[StateManager] Deleting geometry at index:', index); // Log pour vérifier l'index
        if (index < 0 || index >= this.geometries.length) {
            console.error('[StateManager] Invalid index in deleteGeometry:', index);
            return;
        }

        const geometry = this.geometries[index];
        if (geometry && geometry.layer) {
            this.mapManager.map.removeLayer(geometry.layer);
        }

        this.geometries.splice(index, 1);

        if (this.selectedIndex === index) {
            this.selectedIndex = null;
        } else if (this.selectedIndex > index) {
            this.selectedIndex--;
        }

        this.updateUI();
    }

    /**
     * Met à jour l'interface utilisateur.
     */
    updateUI() {
        console.log('[StateManager] Updating UI'); // Log pour indiquer que l'UI est en cours de mise à jour

        if (!this.mapManager) {
            console.error('[StateManager] MapManager is not set in StateManager.');
            return;
        }

        // Mettre à jour l'affichage du titre de la carte
        const mapTitleDisplay = document.getElementById('mapTitleDisplay');
        if (mapTitleDisplay) {
            mapTitleDisplay.textContent = this.mapTitle;
        }

        this.updateList();
        this.mapManager.updateMap();
        console.log('[StateManager] UI update complete'); // Log pour indiquer que la mise à jour de l'UI est terminée
    }

    /**
     * Met à jour la liste des géométries dans l'interface utilisateur.
     */
    updateList() {
        console.log('[StateManager] Updating geometry list'); // Log pour vérifier la mise à jour de la liste
        const container = document.getElementById('geometryList');
        if (!container) {
            console.error('[StateManager] Geometry list container not found in the DOM.');
            return;
        }

        container.innerHTML = '';

        this.geometries.forEach((geometry, index) => {
            const item = document.createElement('div');
            item.className = `list-item ${this.selectedIndex === index ? 'selected' : ''}`;

            const nameContainer = document.createElement('div');
            nameContainer.className = 'd-flex align-items-center flex-grow-1';

            // Ajouter un champ d'édition de texte pour le nom
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'form-control me-2';
            nameInput.value = geometry.name;
            nameInput.addEventListener('change', (e) => {
                geometry.name = e.target.value;
                this.updateUI(); // Mettre à jour l'interface utilisateur
                if (this.mapManager.legendManager) {
                    this.mapManager.legendManager.updateLegend(); // Mettre à jour la légende
                }
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning btn-sm me-2';
            editBtn.textContent = 'Éditer';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.openContextMenu(index, e);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.onclick = () => this.deleteGeometry(index);

            nameContainer.appendChild(nameInput);
            item.appendChild(nameContainer);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);
            container.appendChild(item);
        });
    }
    updateGeometryCoordinates(index, newCoordinates) {
        if (index < 0 || index >= this.geometries.length) {
            console.error('[StateManager] Invalid index in updateGeometryCoordinates:', index);
            return;
        }

        const geometry = this.geometries[index];
        if (geometry) {
            geometry.coordinates = newCoordinates;
            this.updateUI();
        }
    }
}
