import FileLoad from "./fileLoad.js";
import igvxhr from "./igvjs/igvxhr.js";
import * as FileUtils from './igvjs/util/fileUtils.js';

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        const path = list[ 0 ];
        if ('json' === FileUtils.getExtension(path)) {
            const json = await igvxhr.loadJson((path.google_url || path));
            this.loadHandler(json);
        } else if ('xml' === FileUtils.getExtension(path)) {

            const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.loadHandler(o);
        }

    };

}

export default SessionFileLoad;
