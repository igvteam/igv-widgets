/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// TODO: igvjs dependencies
import {Alert} from "../node_modules/igv-ui/src/index.js";

let KGooglePicker;
let KGooglePickerOauth;
let KGooglePickerGoogle;

function init(clientId, oath, google) {

    KGooglePickerOauth = oath;
    KGooglePickerGoogle = google;

    const scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ].join(' ');


    return gapi.client.init({ clientId, scope })
}

function postInit() {

    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

    const config =
        {
            callback: () => {
                console.log('Google Picker library loaded successfully');
            },
            onerror: () => {
                console.log('Error loading Google Picker library');
                alert('Error loading Google Picker library');
            }
        };

    gapi.load('picker', config);

}

const createFilePickerHandler = () => {

    return (multipleFileLoadController, multipleFileSelection) => {

        createDropdownButtonPicker(multipleFileSelection, responses => {
            const paths = responses.map(({ name, url: google_url }) => { return { filename: name, name, google_url }; });
            multipleFileLoadController.ingestPaths(paths);
        });

    };

};

const createDropdownButtonPicker = async (multipleFileSelection, filePickerHandler) => {

    let accessToken = undefined;
    try {
        accessToken = await getAccessToken();
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    if (accessToken) {

        updateSignInStatus(true);

        const view = new KGooglePickerGoogle.picker.DocsView(KGooglePickerGoogle.picker.ViewId.DOCS);
        view.setIncludeFolders(true);

        const teamView = new KGooglePickerGoogle.picker.DocsView(KGooglePickerGoogle.picker.ViewId.DOCS);
        teamView.setEnableTeamDrives(true);
        teamView.setIncludeFolders(true);

        if (accessToken) {

            if (multipleFileSelection) {
                KGooglePicker = new KGooglePickerGoogle.picker.PickerBuilder()
                    .enableFeature(KGooglePickerGoogle.picker.Feature.MULTISELECT_ENABLED)
                    .setOAuthToken(KGooglePickerOauth.google.access_token)
                    .addView(view)
                    .addView(teamView)
                    .enableFeature(KGooglePickerGoogle.picker.Feature.SUPPORT_TEAM_DRIVES)
                    .setCallback(function (data) {
                        if (data[KGooglePickerGoogle.picker.Response.ACTION] === KGooglePickerGoogle.picker.Action.PICKED) {
                            filePickerHandler(data[KGooglePickerGoogle.picker.Response.DOCUMENTS]);
                        }
                    })
                    .build();

            } else {
                KGooglePicker = new KGooglePickerGoogle.picker.PickerBuilder()
                    .disableFeature(KGooglePickerGoogle.picker.Feature.MULTISELECT_ENABLED)
                    .setOAuthToken(KGooglePickerOauth.google.access_token)
                    .addView(view)
                    .addView(teamView)
                    .enableFeature(KGooglePickerGoogle.picker.Feature.SUPPORT_TEAM_DRIVES)
                    .setCallback(function (data) {
                        if (data[KGooglePickerGoogle.picker.Response.ACTION] === KGooglePickerGoogle.picker.Action.PICKED) {
                            filePickerHandler(data[KGooglePickerGoogle.picker.Response.DOCUMENTS]);
                        }
                    })
                    .build();

            }

            KGooglePicker.setVisible(true);

        }

    }

};

const signInHandler = async () => {

    const scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ].join(' ');

    const options = new gapi.auth2.SigninOptionsBuilder();
    options.setPrompt('select_account');
    options.setScope(scope);

    let user = undefined;
    try {
        user = await gapi.auth2.getAuthInstance().signIn(options);
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    if (user) {
        const { access_token } = user.getAuthResponse();
        KGooglePickerOauth.setToken(access_token);
        return access_token;
    } else {
        return undefined;
    }

}

const getAccessToken = async () => {

    if (KGooglePickerOauth.google.access_token) {
        return KGooglePickerOauth.google.access_token;
    } else {

        const result = await signInHandler();
        return result;
    }
}

function pickerCallback(data) {

    let doc,
        obj,
        documents;

    documents = data[KGooglePickerGoogle.picker.Response.DOCUMENTS];

    doc = documents[0];

    obj =
        {
            name: doc[KGooglePickerGoogle.picker.Document.NAME],
            path: 'https://www.googleapis.com/drive/v3/files/' + doc[KGooglePickerGoogle.picker.Document.ID] + '?alt=media'
        };

    return obj;
};

function updateSignInStatus(signInStatus) {
    // do nothing
};


export { init, postInit, createDropdownButtonPicker, createFilePickerHandler, KGooglePicker, KGooglePickerGoogle, KGooglePickerOauth };
