import AlertSingleton from './alertSingleton.js'
import { DOMUtils , GooglePicker} from '../node_modules/igv-utils/src/index.js'

class FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton }) {

        localFileInput.addEventListener('change', async () => {

            if (true === FileLoad.isValidLocalFileInput(localFileInput)) {

                try {
                    await this.loadPaths( Array.from(localFileInput.files) );
                } catch (e) {
                    console.error(e);
                    AlertSingleton.present(e)
                }
                localFileInput.value = '';
            }

        });

        dropboxButton.addEventListener('click', () => {

            const config =
                {
                    success: async dbFiles => {
                        try {
                            await this.loadPaths( dbFiles.map(dbFile => dbFile.link) )
                        } catch (e) {
                            console.error(e);
                            AlertSingleton.present(e)
                        }
                    },
                    cancel: () => {},
                    linkType: 'preview',
                    multiselect: true,
                    folderselect: false,
                };

            Dropbox.choose( config );

        });


        if (false === googleEnabled) {
            DOMUtils.hide(googleDriveButton.parentElement);
        }

        if (true === googleEnabled && googleDriveButton) {

            googleDriveButton.addEventListener('click', () => {
                GooglePicker.createDropdownButtonPicker(true, async responses => {

                    try {
                        await this.loadPaths(responses.map(({ url }) => url))
                    } catch (e) {
                        console.error(e);
                        AlertSingleton.present(e)
                    }
                })
            });

        }

    }

    async loadPaths(paths) {
        //console.log('FileLoad: loadPaths(...)');
    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0);
    }

}

export default FileLoad;
