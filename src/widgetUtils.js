import $ from './igvjs/vendor/jquery-1.12.4.js';
import { DomUtils } from '../node_modules/igv-ui/dist/igv-ui.js';


/**
 * Translate the mouse coordinates for the event to the coordinates for the given target element
 * @param e
 * @param target
 * @returns {{x: number, y: number}}
 */
function translateMouseCoordinates(e, target) {

    var $target = $(target),
        posx,
        posy;

    if (undefined === $target.offset()) {
        console.log('translateMouseCoordinates - $target.offset() is undefined.');
    }

    const coords = DomUtils.pageCoordinates(e);

    posx = coords.x - $target.offset().left;
    posy = coords.y - $target.offset().top;

    return {x: posx, y: posy}
}

export { translateMouseCoordinates }

