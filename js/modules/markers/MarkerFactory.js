/* js/modules/markers/MarkerFactory.js */
export class MarkerFactory {
    constructor(stateManager, geometryHandler) {
        if (!stateManager) {
            throw new Error('StateManager is required for MarkerFactory initialization.');
        }
        if (!geometryHandler) {
            throw new Error('GeometryHandler is required for MarkerFactory initialization.');
        }
        this.stateManager = stateManager;
        this.geometryHandler = geometryHandler;
    }

    createMarker(type, latlng, options = {}) {
        const defaultStyle = this._getDefaultStyle(options);
        let marker = this._createMarkerByType(type, latlng, defaultStyle);

        if (!marker) {
            console.warn(`[MarkerFactory] Unknown marker type: ${type}. Defaulting to circle.`);
            marker = this._createMarkerByType('circle', latlng, defaultStyle);
        }

        this._addCustomProperties(marker, type, defaultStyle);
        this._setupMarkerEvents(marker);

        return marker;
    }

    _getDefaultStyle(options) {
        return {
            color: options.color || '#007bff',
            opacity: options.opacity || 1,
            lineColor: options.lineColor || '#000000',
            lineWeight: options.lineWeight || 2,
            lineDash: options.lineDash || 'solid',
            markerSize: options.markerSize || 24
        };
    }

    _createMarkerByType(type, latlng, style) {
        const creators = {
            circle: () => this._createCircleMarker(latlng, style),
            square: () => this._createSquareMarker(latlng, style),
            triangle: () => this._createTriangleMarker(latlng, style),
            hexagon: () => this._createHexagonMarker(latlng, style)
        };

        return creators[type] ? creators[type]() : null;
    }

    _addCustomProperties(marker, type, style) {
        marker.options.customProperties = {
            color: style.color,
            lineColor: style.lineColor,
            opacity: style.opacity,
            lineWeight: style.lineWeight,
            lineDash: style.lineDash,
            markerSize: style.markerSize,
            markerType: type
        };
    }

    _setupMarkerEvents(marker) {
        if (marker.pm) {
            marker.pm.enable({ allowEditing: true });

            marker.on('pm:edit', () => {
                const geometryIndex = this.stateManager.geometries.findIndex(
                    geometry => geometry.layer === marker
                );

                if (geometryIndex !== -1) {
                    const updatedGeometry = this.geometryHandler.createGeometryObject(marker);
                    if (updatedGeometry) {
                        // Préserver les styles personnalisés
                        const customProps = marker.options.customProperties;
                        updatedGeometry.color = customProps.color;
                        updatedGeometry.lineColor = customProps.lineColor;
                        updatedGeometry.opacity = customProps.opacity;
                        updatedGeometry.lineWeight = customProps.lineWeight;
                        updatedGeometry.lineDash = customProps.lineDash;
                        updatedGeometry.markerSize = customProps.markerSize;
                        updatedGeometry.markerType = customProps.markerType;

                        this.stateManager.geometries[geometryIndex] = updatedGeometry;
                        this.stateManager.updateUI();
                    }
                }
            });

            marker.on('pm:dragend', () => {
                // Restaurer les styles après le déplacement
                const customProps = marker.options.customProperties;
                marker.setStyle({
                    color: customProps.lineColor,
                    fillColor: customProps.color,
                    fillOpacity: customProps.opacity,
                    weight: customProps.lineWeight,
                    dashArray: this._getDashArray(customProps.lineDash)
                });
            });
        }
    }

    _createCircleMarker(latlng, style) {
        return L.circleMarker(latlng, {
            radius: style.markerSize / 2,
            color: style.lineColor,
            fillColor: style.color,
            fillOpacity: style.opacity,
            weight: style.lineWeight,
            dashArray: this._getDashArray(style.lineDash)
        });
    }

    _createSquareMarker(latlng, style) {
        const size = style.markerSize / 10;
        const halfSize = size / 2;
        const coords = this._getSquareCoords(latlng, halfSize);

        return L.polygon(coords, {
            color: style.lineColor,
            fillColor: style.color,
            fillOpacity: style.opacity,
            weight: style.lineWeight,
            dashArray: this._getDashArray(style.lineDash)
        });
    }

    _createTriangleMarker(latlng, style) {
        const size = style.markerSize / 10;
        const halfSize = size / 2;
        const coords = this._getTriangleCoords(latlng, halfSize);

        return L.polygon(coords, {
            color: style.lineColor,
            fillColor: style.color,
            fillOpacity: style.opacity,
            weight: style.lineWeight,
            dashArray: this._getDashArray(style.lineDash)
        });
    }

    _createHexagonMarker(latlng, style) {
        const size = style.markerSize / 10;
        const halfSize = size / 2;
        const coords = this._getHexagonCoords(latlng, halfSize);

        return L.polygon(coords, {
            color: style.lineColor,
            fillColor: style.color,
            fillOpacity: style.opacity,
            weight: style.lineWeight,
            dashArray: this._getDashArray(style.lineDash)
        });
    }

    _getSquareCoords(latlng, halfSize) {
        return [
            [latlng.lat - halfSize, latlng.lng - halfSize],
            [latlng.lat - halfSize, latlng.lng + halfSize],
            [latlng.lat + halfSize, latlng.lng + halfSize],
            [latlng.lat + halfSize, latlng.lng - halfSize]
        ];
    }

    _getTriangleCoords(latlng, halfSize) {
        return [
            [latlng.lat + halfSize, latlng.lng],
            [latlng.lat - halfSize, latlng.lng + halfSize],
            [latlng.lat - halfSize, latlng.lng - halfSize]
        ];
    }

    _getHexagonCoords(latlng, halfSize) {
        return [
            [latlng.lat - halfSize, latlng.lng],
            [latlng.lat - halfSize / 2, latlng.lng + halfSize],
            [latlng.lat + halfSize / 2, latlng.lng + halfSize],
            [latlng.lat + halfSize, latlng.lng],
            [latlng.lat + halfSize / 2, latlng.lng - halfSize],
            [latlng.lat - halfSize / 2, latlng.lng - halfSize]
        ];
    }

    _getDashArray(lineDash) {
        const dashArrays = {
            solid: '',
            dashed: '10,10',
            dotted: '2,6'
        };
        return dashArrays[lineDash] || '';
    }
}