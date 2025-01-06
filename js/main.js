/* js/main.js */
import { GeometryManager } from './modules/GeometryManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const geometryManager = new GeometryManager();
    geometryManager.init();
});