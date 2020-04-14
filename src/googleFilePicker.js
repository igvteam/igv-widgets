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

import {Alert} from "../node_modules/igv-ui/src/index.js";

let appGoogle_picker;
let appGoogle_oauth;
let appGoogle_google;

function init(clientId, oauth, google) {

    appGoogle_oauth = oauth;
    appGoogle_google = google;

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
                console.error('Error loading Google Picker library');
                alert('Error loading Google Picker library');
            }
        };

    gapi.load('picker', config);

}

const createDropdownButtonPicker = async (multipleFileSelection, filePickerHandler) => {

    let accessToken;

    try {
        accessToken = await getAccessToken();
    } catch (e) {
        Alert.presentAlert(e.message);
        return;
    }

    updateSignInStatus(true);

    const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
    view.setIncludeFolders(true);

    const teamView = new google.picker.DocsView(google.picker.ViewId.DOCS);
    teamView.setEnableTeamDrives(true);
    teamView.setIncludeFolders(true);

    if (accessToken) {

        if (multipleFileSelection) {
            appGoogle_picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setOAuthToken(appGoogle_oauth.google.access_token)
                .addView(view)
                .addView(teamView)
                .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                .setCallback(function (data) {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        filePickerHandler(data[google.picker.Response.DOCUMENTS]);
                    }
                })
                .build();

        } else {
            appGoogle_picker = new google.picker.PickerBuilder()
                .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setOAuthToken(appGoogle_oauth.google.access_token)
                .addView(view)
                .addView(teamView)
                .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                .setCallback(function (data) {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        filePickerHandler(data[google.picker.Response.DOCUMENTS]);
                    }
                })
                .build();

        }

        appGoogle_picker.setVisible(true);

    } else {
        Alert.presentAlert("Sign into Google before using picker");
    }

}

const getAccessToken = async () => {

    if (appGoogle_oauth.google.access_token) {
        return appGoogle_oauth.google.access_token;
    } else {
        return await signInHandler();
    }
}

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

    const user = await gapi.auth2.getAuthInstance().signIn(options);

    const { access_token } = user.getAuthResponse();

    appGoogle_oauth.setToken(access_token)

    return access_token;
}

function updateSignInStatus(signInStatus) {
    // do nothing
}


export { init, postInit, createDropdownButtonPicker, appGoogle_oauth, appGoogle_google };
