import FileLoadWidget from "../../src/fileLoadWidget.js";
import FileLoadManager from "../../src/fileLoadManager.js";
import MultipleTrackFileLoad from "../../src/multipleTrackFileLoad.js";

let fileLoadWidget = undefined
let multipleTrackFileLoad = undefined

document.addEventListener("DOMContentLoaded", () => {

    const multipleTrackFileLoadConfig =
        {
            $localFileInput: $('#igv-widgets-local-button'),
            $dropboxButton: $('#igv-widgets-dropbox-button'),
            $googleDriveButton: undefined,
            fileLoadHandler: configurations => console.log(configurations),
            multipleFileSelection: true
        };

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

    const fileLoadWidgetConfig =
        {
            widgetParent: document.querySelector('#igv-widgets-file-load-widget'),
            dataTitle: 'Track',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: undefined,
            doURL: undefined
        };

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig);

    $('#igv-widgets-file-load-button').on('click', async () => {
        const paths = fileLoadWidget.retrievePaths()
        await multipleTrackFileLoad.loadPaths(paths)
        return true
    });

});
