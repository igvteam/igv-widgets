import {FileUtils, igvxhr} from "../node_modules/igv-utils/src/index.js"
import FileLoad from "./fileLoad.js"
import MultipleTrackFileLoad from './multipleTrackFileLoad.js'

const singleSet = new Set([ 'json' ])
const indexSet = new Set(['fai']);

class GenomeFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        const status = await GenomeFileLoad.isGZip(paths)

        if (true === status) {
            throw new Error('Genome did not load - gzip file is not allowed')
        } else {

            // If one of the paths is .json, unpack and send to loader
            const single = paths.filter(path => singleSet.has( FileUtils.getExtension(path) ))

            let configuration = undefined

            if (single.length >= 1) {
                configuration = await igvxhr.loadJson(single[ 0 ])
            } else if (2 === paths.length) {
                const [ _0, _1 ] = await GenomeFileLoad.getExtension(paths)
                if (indexSet.has(_0)) {
                    configuration = { fastaURL: paths[ 1 ], indexURL: paths[ 0 ] }
                } else if (indexSet.has(_1)) {
                    configuration = { fastaURL: paths[ 0 ], indexURL: paths[ 1 ] }
                }
            }

            if (undefined === configuration) {
                throw new Error('Genome did not load - invalid data and/or index file(s)')
            } else {
                this.loadHandler(configuration)
            }


        }

    }

    static async isGZip(paths) {

        for (let path of paths) {
            const filename = await MultipleTrackFileLoad.getFilename(path)
            if (true === filename.endsWith('.gz')) {
                return true
            }
        }

        return false
    }

    static async getExtension(paths) {

        const a = await MultipleTrackFileLoad.getFilename(paths[ 0 ])
        const b = await MultipleTrackFileLoad.getFilename(paths[ 1 ])

        return [a, b].map(name => FileUtils.getExtension(name))

    }


}

export default GenomeFileLoad;
