import AlertSingleton from './alertSingleton.js'
import {FileUtils, igvxhr} from "../node_modules/igv-utils/src/index.js"
import FileLoad from "./fileLoad.js"

const singleSet = new Set([ 'json' ])
const indexSet = new Set(['fai']);

const isGZip = path => FileUtils.getFilename(path).endsWith('.gz')

class GenomeFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        if (paths.some(isGZip)) {
            AlertSingleton.present(new Error('Genome did not load - gzip file is not allowed'))
        } else {

            // If one of the paths is .json, unpack and send to loader
            const single = paths.filter(path => singleSet.has( FileUtils.getExtension(path) ))

            if (single.length >= 1) {
                const json = await igvxhr.loadJson(single[ 0 ])
                this.loadHandler(json)
            } else if (2 === paths.length) {

                const [ _0, _1 ] = paths.map(path => FileUtils.getExtension(path))

                if (indexSet.has(_0)) {
                    await this.loadHandler({ fastaURL: paths[ 1 ], indexURL: paths[ 0 ] })
                } else if (indexSet.has(_1)) {
                    await this.loadHandler({ fastaURL: paths[ 0 ], indexURL: paths[ 1 ] })
                } else {
                    AlertSingleton.present(new Error('Genome did not load - invalid data and/or index file'))
                }

            } else {
                AlertSingleton.present(new Error('Genome did not load - invalid file'))
            }

        }


    };

}

export default GenomeFileLoad;
