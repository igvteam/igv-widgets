import { Alert, EventBus, FileLoadManager, FileLoadWidget, MultipleTrackFileLoad, Utils } from './index.js';
import ModalTable from '../node_modules/data-modal/js/modalTable.js';
import EncodeTrackDatasource from "../node_modules/data-modal/js/encodeTrackDatasource.js"
import { encodeTrackDatasourceConfigurator } from '../node_modules/data-modal/js/encodeTrackDatasourceConfig.js'
import { encodeTrackDatasourceSignalConfigurator } from "../node_modules/data-modal/js/encodeTrackDatasourceSignalConfig.js"
import { encodeTrackDatasourceOtherConfigurator } from "../node_modules/data-modal/js/encodeTrackDatasourceOtherConfig.js"
import { createGenericSelectModal, createTrackURLModal } from '../node_modules/igv-ui/src/index.js'

let fileLoadWidget;
let multipleTrackFileLoad;
let encodeModalTables = [];
let genomeChangeListener
const createTrackWidgets = ($igvMain, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, igvxhr, google, trackLoadHandler) => {

    const $urlModal = $(createTrackURLModal(urlModalId))
    $igvMain.append($urlModal);

    let fileLoadWidgetConfig =
        {
            widgetParent: $urlModal.find('.modal-body').get(0),
            dataTitle: 'Track',
            indexTitle: 'Track Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        };

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths();
        await multipleTrackFileLoad.loadPaths( paths );
        return true;
    });

    if (!googleEnabled) {
        $googleDriveButton.parent().hide();
    }

    const multipleTrackFileLoadConfig =
        {
            $localFileInput,
            $dropboxButton,
            $googleDriveButton: googleEnabled ? $googleDriveButton : undefined,
            fileLoadHandler: trackLoadHandler,
            multipleFileSelection: true,
            igvxhr,
            google
        };

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

    for (let encodeTrackModalId of encodeTrackModalIds) {

        const encodeModalTableConfig =
            {
                id: encodeTrackModalId,
                title: 'ENCODE',
                selectionStyle: 'multi',
                pageLength: 100,
                selectHandler: trackLoadHandler
            }

        encodeModalTables.push( new ModalTable(encodeModalTableConfig) )

    }

    genomeChangeListener = {

        receiveEvent: async ({ data }) => {
            const { genomeID } = data;
            encodeModalTables[ 0 ].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)))
            encodeModalTables[ 1 ].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)))
        }
    }

    EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);

}

const createTrackWidgetsWithTrackRegistry = ($igvMain, $dropdownMenu, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, selectModalId, igvxhr, google, GtexUtils, trackRegistryFile, trackLoadHandler) => {

    createTrackWidgets($igvMain, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, igvxhr, google, trackLoadHandler)

    const $genericSelectModal = $(createGenericSelectModal(selectModalId, `${ selectModalId }-select`));
    $igvMain.append($genericSelectModal);

    genomeChangeListener = {

        receiveEvent: async ({ data }) => {
            const { genomeID } = data;
            encodeModalTables[ 0 ].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)))
            encodeModalTables[ 1 ].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)))
            await updateTrackMenus(genomeID, GtexUtils, encodeModalTables, trackRegistryFile, $dropdownMenu, $genericSelectModal, trackLoadHandler);
        }
    }

    EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);

}

const updateTrackMenus = async (genomeID, GtexUtils, encodeModalTables, trackRegistryFile, $dropdownMenu, $genericSelectModal, fileLoader) => {

    const id_prefix = 'genome_specific_';

    // const $divider = $dropdownMenu.find('#igv-app-annotations-section');
    const $divider = $dropdownMenu.find('.dropdown-divider');

    const searchString = '[id^=' + id_prefix + ']';
    const $found = $dropdownMenu.find(searchString);
    $found.remove();

    const paths = await getPathsWithTrackRegistryFile(genomeID, trackRegistryFile);

    if (undefined === paths) {
        console.warn(`There are no tracks in the track registryy for genome ${ genomeID }`);
        return;
    }

    let responses = [];
    try {
        responses = await Promise.all( paths.map( path => fetch(path) ) )
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    let jsons = [];
    try {
        jsons = await Promise.all( responses.map( response => response.json() ) )
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    let buttonConfigurations = [];

    for (let json of jsons) {

        if ('ENCODE' === json.type) {

            let i = 0;
            for (let config of [ encodeTrackDatasourceSignalConfigurator(genomeID), encodeTrackDatasourceOtherConfigurator(json.genomeID) ]) {
                encodeModalTables[ i++ ].setDatasource( new EncodeTrackDatasource(config) )
            }

            buttonConfigurations.push(json);
        } else if ('GTEX' === json.type) {

            let info = undefined;
            try {
                info = await GtexUtils.getTissueInfo(json.datasetId);
            } catch (e) {
                Alert.presentAlert(e.message);
            }

            if (info) {
                json.tracks = info.tissueInfo.map(tissue => GtexUtils.trackConfiguration(tissue));
                buttonConfigurations.push(json);
            }

        } else {
            buttonConfigurations.push(json);
        }

    } // for (json)


    let encodeConfiguration
    let configurations = []
    for (let config of buttonConfigurations) {
        if (config.type && 'ENCODE' === config.type) {
            encodeConfiguration = config
        } else {
            configurations.unshift(config)
        }
    }

    createDropdownButton($divider, 'ENCODE Other',   id_prefix)
        .on('click', () => encodeModalTables[ 1 ].$modal.modal('show'));

    createDropdownButton($divider, 'ENCODE Signals', id_prefix)
        .on('click', () => encodeModalTables[ 0 ].$modal.modal('show'));

    for (let config of configurations) {

        const $button = createDropdownButton($divider, config.label, id_prefix)

        $button.on('click', () => {
            configureSelectModal($genericSelectModal, config, fileLoader);
            $genericSelectModal.modal('show');
        });

    }


};

const createDropdownButton = ($divider, buttonText, id_prefix) => {
    const $button = $('<button>', { class: 'dropdown-item', type: 'button' })
    $button.text(`${ buttonText } ...`)
    $button.attr('id', `${ id_prefix }${ buttonText.toLowerCase().split(' ').join('_') }`)
    $button.insertAfter($divider)
    return $button
}

const configureSelectModal = ($genericSelectModal, buttonConfiguration, fileLoader) => {

    let markup = `<div>${ buttonConfiguration.label }</div>`

    if (buttonConfiguration.description) {
        markup += `<div>${ buttonConfiguration.description }</div>`
    }

    $genericSelectModal.find('.modal-title').html(markup);

    $genericSelectModal.find('select').remove();

    let $select = $('<select>', {class: 'form-control'});
    $genericSelectModal.find('.form-group').append($select);

    let $option = $('<option>', {text: 'Select...'});
    $select.append($option);

    $option.attr('selected', 'selected');
    $option.val(undefined);

    buttonConfiguration.tracks.reduce(($accumulator, configuration) => {

        $option = $('<option>', {value: configuration.name, text: configuration.name});
        $select.append($option);

        $option.data('track', configuration);

        $accumulator.append($option);

        return $accumulator;
    }, $select);

    $select.on('change', () => {

        let $option = $select.find('option:selected');
        const value = $option.val();

        if ('' === value) {
            // do nothing
        } else {

            $option.removeAttr("selected");

            const configuration = $option.data('track');

            fileLoader([ configuration ])
        }

        $genericSelectModal.modal('hide');

    });

}

const getPathsWithTrackRegistryFile = async (genomeID, trackRegistryFile) => {

    let response = undefined;
    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
    }

    let trackRegistry = undefined
    if (response) {
        trackRegistry = await response.json();
    } else {
        const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()");
        Alert.presentAlert(e.message);
        throw e;
    }

    return trackRegistry[ genomeID ]

}

export { createTrackWidgets, createTrackWidgetsWithTrackRegistry }
