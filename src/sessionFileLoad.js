import {FileUtils, igvxhr } from '../node_modules/igv-utils/src/index.js';
import {GoogleUtils } from '../node_modules/igv-utils/src/index.js';
import FileLoad from "./fileLoad.js";

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton, loadHandler }) {
        super({ localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        const path = paths[ 0 ];

        if ('json' === FileUtils.getExtension(path)) {

            const json = await igvxhr.loadJson((path.google_url || path));
            this.loadHandler(json);
        } else if (true === GoogleUtils.isGoogleURL(path)) {

            this.loadHandler({ url: path })
        } else if ('xml' === FileUtils.getExtension(path)) {

            const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.loadHandler(o);
        } else {
            throw new Error('Session file did not load - invalid format')
        }

    };

}

export default SessionFileLoad;
