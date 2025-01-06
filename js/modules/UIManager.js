/* js/modules/UIManager.js */
export class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    initUI() {
        // Gestionnaire pour le sélecteur de fond de carte
        const tileSelector = document.getElementById('tileSelector');
        if (tileSelector) {
            tileSelector.addEventListener('change', (e) => {
                const selectedTile = e.target.value;
                this.stateManager.mapManager.setTileLayer(selectedTile);
            });
        }

        // Gestionnaire pour le bouton "Enregistrer" du titre de la carte
        const saveMapTitleBtn = document.getElementById('saveMapTitleBtn');
        if (saveMapTitleBtn) {
            saveMapTitleBtn.addEventListener('click', () => {
                const mapTitleInput = document.getElementById('mapTitleInput');
                if (mapTitleInput) {
                    const newTitle = mapTitleInput.value;
                    this.stateManager.setMapTitle(newTitle); // Mettre à jour le titre dans le StateManager
                    const mapTitleDisplay = document.getElementById('mapTitleDisplay');
                    if (mapTitleDisplay) {
                        mapTitleDisplay.textContent = newTitle; // Afficher le nouveau titre
                    }
                }
            });
        }

        // Gestionnaire pour le bouton "Appliquer" du menu contextuel
        const contextApplyBtn = document.getElementById('contextApplyBtn');
        if (contextApplyBtn) {
            contextApplyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = document.getElementById('contextColorPicker').value;
                const lineColor = document.getElementById('contextLineColorPicker').value;
                const opacity = parseFloat(document.getElementById('contextOpacitySlider').value);
                const lineDash = document.getElementById('contextLineDash').value;
                const lineWeight = parseInt(document.getElementById('contextLineWeight').value);
                const markerSize = parseInt(document.getElementById('contextMarkerSize').value); // Récupérer la taille du marqueur
                const shape = document.getElementById('contextShapeSelector').value; // Récupérer la nouvelle forme
                this.stateManager.applyStyle(color, lineColor, opacity, lineDash, lineWeight, markerSize, shape); // Passer la nouvelle forme
                document.getElementById('contextMenu').style.display = 'none';
            });
        }

        // Gestionnaire pour le bouton "Annuler" du menu contextuel
        const contextCancelBtn = document.getElementById('contextCancelBtn');
        if (contextCancelBtn) {
            contextCancelBtn.addEventListener('click', () => {
                document.getElementById('contextMenu').style.display = 'none';
            });
        }

        // Fermer le menu contextuel en cliquant à l'extérieur
        document.addEventListener('click', (event) => {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.style.display = 'none';
            }
        });

        // Gestionnaire pour l'icône de retrait/développement du titre
        const toggleTitleIcon = document.getElementById('toggleTitleIcon');
        if (toggleTitleIcon) {
            toggleTitleIcon.addEventListener('click', () => {
                const mapTitleContainer = document.getElementById('map-title-container');
                if (mapTitleContainer) {
                    mapTitleContainer.classList.toggle('collapsed');
                    mapTitleContainer.classList.toggle('expanded');
                    toggleTitleIcon.classList.toggle('bi-chevron-up');
                    toggleTitleIcon.classList.toggle('bi-chevron-down');
                }
            });
        }
    }
}