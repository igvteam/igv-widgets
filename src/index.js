import EventBus from "./eventBus.js";
import { QRCode } from './qrcode.js';
import AlertSingleton from './alertSingleton.js'
import FileLoadManager from './fileLoadManager.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoad from "./fileLoad.js";
import GenomeFileLoad from "./genomeFileLoad.js";
import SessionFileLoad from "./sessionFileLoad.js";
import SessionController from "./sessionController.js";
import MultipleTrackFileLoad from "./multipleTrackFileLoad.js";
import * as Utils from './utils.js';
import { createSessionWidgets } from "./sessionWidgets.js";
import { createTrackWidgetsWithTrackRegistry, updateTrackMenus } from './trackWidgets.js'
import { encodeTrackDatasourceConfigurator, supportsGenome } from './encodeTrackDatasourceConfigurator.js'
import { createURLModal } from "./urlModal.js";
import { dropboxButtonImageBase64, googleDriveButtonImageBase64, dropboxDropdownItem, googleDriveDropdownItem } from './markupFactory.js'
import { createGenericSelectModal } from './genericSelectModal.js'
import { createTrackURLModal } from './trackURLModal.js'
import embedCSS from "./embedCSS.js"

if(typeof document !== 'undefined') {
    if (!stylesheetExists("igv-widgets.css")) {
        //console.log('igv-widgets. will call embedCSS(igv-widgets.css) ...');
        embedCSS();
        //console.log('... done.');
    }
    function stylesheetExists(stylesheetName) {
        for (let ss of document.styleSheets) {
            ss = ss.href ? ss.href.replace(/^.*[\\\/]/, '') : '';
            if (ss === stylesheetName) {
                return true;
            }
        }
        return false;
    }
}

export {
    EventBus,
    QRCode,
    AlertSingleton,
    Utils,
    FileLoadManager,
    FileLoadWidget,
    FileLoad,
    GenomeFileLoad,
    SessionFileLoad,
    SessionController,
    MultipleTrackFileLoad,
    createSessionWidgets,
    createTrackWidgetsWithTrackRegistry,
    encodeTrackDatasourceConfigurator,
    supportsGenome,
    updateTrackMenus,
    createURLModal,
    dropboxButtonImageBase64,
    googleDriveButtonImageBase64,
    dropboxDropdownItem,
    googleDriveDropdownItem,
    createGenericSelectModal,
    createTrackURLModal
}
