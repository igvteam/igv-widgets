import FileLoadWidget from "../../src/fileLoadWidget.js";
import FileLoadManager from "../../src/fileLoadManager.js";
import MultipleTrackFileLoad from "../../src/multipleTrackFileLoad.js";

let fileLoadWidget = undefined
let multipleTrackFileLoad = undefined
document.addEventListener("DOMContentLoaded", () => {

    const multipleTrackFileLoadConfig =
        {
            $localFileInput: $('#local-file-load-button'),
            $dropboxButton: $('#dropbox-load-button'),
            $googleDriveButton: undefined,
            fileLoadHandler: configurations => console.log(configurations),
            multipleFileSelection: true
        };

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

    const config =
        {
            widgetParent: document.querySelector('.card-body'),
            dataTitle: 'Track',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: undefined,
            doURL: undefined
        };

    fileLoadWidget = new FileLoadWidget(config);

    $('#url-load-button').on('click', async () => {
        const paths = fileLoadWidget.retrievePaths();

        // let str = '';
        // for (let path of paths) {
        //     str = `${ str } ${ path }`;
        // }
        //
        // alert(`${ str }`);

        await multipleTrackFileLoad.loadPaths(paths);
        return true;

    });

});
