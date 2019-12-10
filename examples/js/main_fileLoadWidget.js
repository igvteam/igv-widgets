import FileLoadWidget from "../../src/fileLoadWidget.js";
import FileLoadManager from "../../src/fileLoadManager.js";

let fileLoadWidget = undefined;
document.addEventListener("DOMContentLoaded", () => {

    const config =
        {
            widgetParent: document.querySelector('.card-body'),
            dataTitle: 'Data',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: undefined,
            doURL: undefined
        };

    fileLoadWidget = new FileLoadWidget(config);

    $('#submit-button').on('click', () => {
        const paths = fileLoadWidget.retrievePaths();
        let str = '';
        for (let path of paths) {
            str = `${ str } ${ path }`;
        }

        alert(`${ str }`);
    });

});
