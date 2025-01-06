/* js/modules/markers/CustomMarkerStyles.js */
export const MarkerStyles = {
    circle: {
        className: 'marker-circle',
        iconSize: [24, 24],
        styleTemplate: (color, opacity) => `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="#000" stroke-width="2" />
            </svg>
        `
    },
    square: {
        className: 'marker-square',
        iconSize: [24, 24],
        styleTemplate: (color, opacity) => `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" fill="${color}" stroke="#000" stroke-width="2" />
            </svg>
        `
    },
    triangle: {
        className: 'marker-triangle',
        iconSize: [24, 24],
        styleTemplate: (color, opacity) => `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 22,20 2,20" fill="${color}" stroke="#000" stroke-width="2" />
            </svg>
        `
    },
    hexagon: {
        className: 'marker-hexagon',
        iconSize: [24, 24],
        styleTemplate: (color, opacity) => `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 20,6 20,18 12,22 4,18 4,6" fill="${color}" stroke="#000" stroke-width="2" />
            </svg>
        `
    }
}