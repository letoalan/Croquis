/* js/modules/markers/MarkerUtils.js */
import { MarkerStyles } from './CustomMarkerStyles.js';

export const MarkerUtils = {
    // Crée la configuration d'icône pour un type de marqueur
    createIconConfig: (type, color, opacity) => {
        const style = MarkerStyles[type];
        if (!style) {
            console.error(`Invalid marker type: ${type}`);
            return null;
        }

        return {
            html: `<div style="${style.styleTemplate(color, opacity)}"></div>`,
            className: `custom-marker ${style.className}`,
            iconSize: style.iconSize
        };
    },

    // Vérifie si un type de marqueur est valide
    isValidMarkerType: (type) => {
        return Object.keys(MarkerStyles).includes(type);
    },

    // Obtient les dimensions pour un type de marqueur
    getMarkerDimensions: (type) => {
        const style = MarkerStyles[type];
        return style ? style.iconSize : [12, 12]; // Dimensions par défaut
    }
}