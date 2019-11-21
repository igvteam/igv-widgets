/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

class FileLoadManager {

    constructor () {
        this.dictionary = {};
    }

    inputHandler (path, isIndexFile) {
        this.ingestPath(path, isIndexFile);
    }

    ingestPath (path, isIndexFile) {
        let key = true === isIndexFile ? 'index' : 'data';

        this.dictionary[ key ] = path.trim();
    }

    didDragDrop (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    }

    dragDropHandler (dataTransfer, isIndexFile) {
        var url,
            files;

        url = dataTransfer.getData('text/uri-list');
        files = dataTransfer.files;

        if (files && files.length > 0) {
            this.ingestPath(files[ 0 ], isIndexFile);
        } else if (url && '' !== url) {
            this.ingestPath(url, isIndexFile);
        }

    }

    indexName () {
        return itemName(this.dictionary.index);
    }

    dataName () {
        return itemName(this.dictionary.data);
    }

    reset () {
        this.dictionary = {};
    }

}

function itemName (item) {
    return igv.isFilePath(item) ? item.name : item;
}

function div(options) {
    return create("div", options);
}

function create(tag, options) {
    const elem = document.createElement(tag);
    if (options) {
        if (options.class) {
            elem.classList.add(options.class);
        }
        if (options.id) {
            elem.id = options.id;
        }
        if(options.style) {
            applyStyle(elem, options.style);
        }
    }
    return elem;
}

function hide(elem) {
    const cssStyle = getComputedStyle(elem);
    if(cssStyle.display !== "none") {
        elem._initialDisplay = cssStyle.display;
    }
    elem.style.display = "none";
}

function show(elem) {
    const currentDisplay = getComputedStyle(elem).display;
    if (currentDisplay === "none") {
        const d = elem._initialDisplay || "block";
        elem.style.display = d;
    }
}

function hideAll(selector) {
    document.querySelectorAll(selector).forEach(elem => { hide(elem); });
}

function empty(elem) {
    while(elem.firstChild){
        elem.removeChild(elem.firstChild);
    }
}

function offset(elem) {
    // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
    // Support: IE <=11 only
    // Running getBoundingClientRect on a
    // disconnected node in IE throws an error
    if (!elem.getClientRects().length) {
        return {top: 0, left: 0};
    }

    // Get document-relative position by adding viewport scroll to viewport-relative gBCR
    const rect = elem.getBoundingClientRect();
    const win = elem.ownerDocument.defaultView;
    return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
    };
}

function pageCoordinates(e) {

    if (e.type.startsWith("touch")) {
        const touch = e.touches[0];
        return {x: touch.pageX, y: touch.pageY};
    } else {
        return {x: e.pageX, y: e.pageY}
    }
}

function applyStyle(elem, style) {
    for (let key of Object.keys(style)) {
        elem.style[key] = style[key];
    }
}

var domUtils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create,
    div: div,
    hide: hide,
    show: show,
    offset: offset,
    hideAll: hideAll,
    empty: empty,
    pageCoordinates: pageCoordinates,
    applyStyle: applyStyle
});

const httpMessages =
    {
        "401": "Access unauthorized",
        "403": "Access forbidden",
        "404": "Not found"
    };


class AlertDialog {
    constructor(parent) {

        // container
        this.container = div({class: "igv-ui-alert-dialog-container"});
        parent.appendChild(this.container);

        // header
        let header = div();
        this.container.appendChild(header);

        // body container
        let bodyContainer = div({id: 'igv-ui-alert-dialog-body'});
        this.container.appendChild(bodyContainer);

        // body copy
        this.body = div({id: 'igv-ui-alert-dialog-body-copy'});
        bodyContainer.appendChild(this.body);

        // ok container
        let ok_container = div();
        this.container.appendChild(ok_container);

        // ok
        this.ok = div();
        ok_container.appendChild(this.ok);
        this.ok.textContent = 'OK';
        const self = this;
        this.ok.addEventListener('click', function (ev) {
            if (typeof self.callback === 'function') {
                self.callback("OK");
                self.callback = undefined;
            }
            self.body.innerHTML = '';
            hide(self.container);
        });

        hide(this.container);
    }

    present(alert, callback) {
        let string = alert.message || alert;
        if (httpMessages.hasOwnProperty(string)) {
            string = httpMessages[string];
        }
        this.body.innerHTML = string;
        this.callback = callback;
        show(this.container);
    }
}

function embedCSS() {

    var css =  '.igv-ui-generic-container {\n  position: absolute;\n  z-index: 2048;\n  background-color: white;\n  cursor: pointer;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .igv-ui-generic-container div:first-child {\n    cursor: move;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-end;\n    align-items: center;\n    height: 24px;\n    width: 100%;\n    background-color: #dddddd; }\n    .igv-ui-generic-container div:first-child div {\n      display: block;\n      color: #5f5f5f;\n      cursor: pointer;\n      width: 14px;\n      height: 14px;\n      margin-right: 8px;\n      margin-bottom: 4px; }\n\n.igv-ui-alert-dialog-container {\n  position: absolute;\n  z-index: 2048;\n  top: 50%;\n  left: 50%;\n  margin: -150px 0 0 -150px;\n  width: 300px;\n  height: 256px;\n  border-color: #7F7F7F;\n  border-radius: 4px;\n  border-style: solid;\n  border-width: thin;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 15px;\n  font-weight: 400;\n  z-index: 2048;\n  background-color: white;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .igv-ui-alert-dialog-container div:first-child {\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-end;\n    align-items: center;\n    width: 100%;\n    height: 24px;\n    cursor: move;\n    border-top-left-radius: 4px;\n    border-top-right-radius: 4px;\n    border-bottom-color: #7F7F7F;\n    border-bottom-style: solid;\n    border-bottom-width: thin;\n    background-color: #eee; }\n    .igv-ui-alert-dialog-container div:first-child div {\n      margin-right: 4px;\n      margin-bottom: 2px;\n      height: 12px;\n      width: 12px;\n      color: #7F7F7F; }\n    .igv-ui-alert-dialog-container div:first-child div:hover {\n      cursor: pointer;\n      color: #444; }\n  .igv-ui-alert-dialog-container #igv-ui-alert-dialog-body {\n    color: #373737;\n    width: 100%;\n    height: calc(100% - 24px - 64px);\n    overflow-y: scroll; }\n    .igv-ui-alert-dialog-container #igv-ui-alert-dialog-body #igv-ui-alert-dialog-body-copy {\n      cursor: pointer;\n      margin: 16px;\n      width: auto;\n      height: auto;\n      overflow-wrap: break-word;\n      word-break: break-word;\n      background-color: white;\n      border: unset; }\n  .igv-ui-alert-dialog-container div:last-child {\n    width: 100%;\n    height: 64px;\n    background-color: white;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: center;\n    align-items: center; }\n    .igv-ui-alert-dialog-container div:last-child div {\n      width: 98px;\n      height: 36px;\n      line-height: 36px;\n      text-align: center;\n      color: white;\n      font-family: \"Open Sans\", sans-serif;\n      font-size: medium;\n      font-weight: 400;\n      border-color: #2B81AF;\n      border-style: solid;\n      border-width: thin;\n      border-radius: 4px;\n      background-color: #2B81AF; }\n    .igv-ui-alert-dialog-container div:last-child div:hover {\n      cursor: pointer;\n      border-color: #25597f;\n      background-color: #25597f; }\n\n.igv-ui-generic-dialog-container {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 300px;\n  height: 200px;\n  border-color: #7F7F7F;\n  border-radius: 4px;\n  border-style: solid;\n  border-width: thin;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: medium;\n  font-weight: 400;\n  z-index: 2048;\n  background-color: white;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-header {\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-end;\n    align-items: center;\n    width: 100%;\n    height: 24px;\n    cursor: move;\n    border-top-left-radius: 4px;\n    border-top-right-radius: 4px;\n    border-bottom-color: #7F7F7F;\n    border-bottom-style: solid;\n    border-bottom-width: thin;\n    background-color: #eee; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-header div {\n      margin-right: 4px;\n      margin-bottom: 2px;\n      height: 12px;\n      width: 12px;\n      color: #7F7F7F; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-header div:hover {\n      cursor: pointer;\n      color: #444; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-one-liner {\n    color: #373737;\n    width: 95%;\n    height: 24px;\n    line-height: 24px;\n    text-align: left;\n    margin-top: 8px;\n    padding-left: 8px;\n    overflow-wrap: break-word;\n    background-color: white; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-label-input {\n    margin-top: 8px;\n    width: 95%;\n    height: 24px;\n    color: #373737;\n    line-height: 24px;\n    padding-left: 8px;\n    background-color: white;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    align-items: center; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-label-input div {\n      width: 30%;\n      height: 100%;\n      font-size: 16px;\n      text-align: right;\n      padding-right: 8px;\n      background-color: white; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-label-input input {\n      display: block;\n      height: 100%;\n      width: 100%;\n      padding-left: 4px;\n      font-family: \"Open Sans\", sans-serif;\n      font-weight: 400;\n      color: #373737;\n      text-align: left;\n      outline: none;\n      border-style: solid;\n      border-width: thin;\n      border-color: #7F7F7F;\n      background-color: white; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-label-input input {\n      width: 50%;\n      font-size: 16px; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-input {\n    margin-top: 8px;\n    width: calc(100% - 16px);\n    height: 24px;\n    color: #373737;\n    line-height: 24px;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: space-around;\n    align-items: center; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-input input {\n      display: block;\n      height: 100%;\n      width: 100%;\n      padding-left: 4px;\n      font-family: \"Open Sans\", sans-serif;\n      font-weight: 400;\n      color: #373737;\n      text-align: left;\n      outline: none;\n      border-style: solid;\n      border-width: thin;\n      border-color: #7F7F7F;\n      background-color: white; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-input input {\n      font-size: 16px; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel {\n    width: 100%;\n    height: 28px;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: space-around;\n    align-items: center; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel div {\n      margin-top: 32px;\n      color: white;\n      font-family: \"Open Sans\", sans-serif;\n      font-size: 14px;\n      font-weight: 400;\n      width: 75px;\n      height: 28px;\n      line-height: 28px;\n      text-align: center;\n      border-color: transparent;\n      border-style: solid;\n      border-width: thin;\n      border-radius: 2px; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel div:first-child {\n      margin-left: 32px;\n      margin-right: 0;\n      background-color: #5ea4e0; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel div:last-child {\n      margin-left: 0;\n      margin-right: 32px;\n      background-color: #c4c4c4; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel div:first-child:hover {\n      cursor: pointer;\n      background-color: #3b5c7f; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok-cancel div:last-child:hover {\n      cursor: pointer;\n      background-color: #7f7f7f; }\n  .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok {\n    width: 100%;\n    height: 36px;\n    margin-top: 32px;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: space-around;\n    align-items: center; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok div {\n      width: 98px;\n      height: 36px;\n      line-height: 36px;\n      text-align: center;\n      color: white;\n      font-family: \"Open Sans\", sans-serif;\n      font-size: medium;\n      font-weight: 400;\n      border-color: white;\n      border-style: solid;\n      border-width: thin;\n      border-radius: 4px;\n      background-color: #2B81AF; }\n    .igv-ui-generic-dialog-container .igv-ui-generic-dialog-ok div:hover {\n      cursor: pointer;\n      background-color: #25597f; }\n\n.igv-ui-popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  min-width: 128px;\n  z-index: 4096;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: small;\n  font-weight: 400;\n  color: #4b4b4b;\n  background-color: white;\n  border-radius: 4px;\n  border-color: #7F7F7F;\n  border-style: solid;\n  border-width: thin;\n  display: none; }\n\n.igv-ui-popover-header {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  align-items: center;\n  width: 100%;\n  height: 24px;\n  cursor: move;\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n  border-bottom-color: #7F7F7F;\n  border-bottom-style: solid;\n  border-bottom-width: thin;\n  background-color: #eee; }\n  .igv-ui-popover-header div {\n    margin-right: 4px;\n    height: 12px;\n    width: 12px;\n    color: #7F7F7F; }\n  .igv-ui-popover-header div:hover {\n    cursor: pointer;\n    color: #444; }\n\n.igv-ui-popover-track-popup-content {\n  position: relative;\n  top: 0;\n  left: 0;\n  max-height: 384px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  background-color: white; }\n  .igv-ui-popover-track-popup-content div {\n    margin-left: 4px;\n    background-color: white; }\n  .igv-ui-popover-track-popup-content div:hover {\n    cursor: pointer;\n    background-color: #efefef; }\n\n.igv-ui-popover-name-value {\n  cursor: default;\n  text-wrap: none;\n  white-space: nowrap;\n  max-width: 384px; }\n\n.igv-ui-popover-name {\n  font-weight: bold;\n  padding-right: 4px;\n  float: left; }\n\n.igv-ui-popover-value {\n  padding-left: 4px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  max-width: 256px;\n  display: inline-block; }\n\n.igv-ui-trackgear-container {\n  position: relative;\n  width: 20px;\n  height: 20px;\n  margin-left: 4px;\n  color: #7F7F7F; }\n\n.igv-ui-trackgear-container:hover {\n  cursor: pointer;\n  color: #444; }\n\n.igv-ui-trackgear-popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  min-width: 132px;\n  z-index: 4096;\n  cursor: pointer;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: small;\n  font-weight: 400;\n  color: #4b4b4b;\n  background: white;\n  border-radius: 4px;\n  border-color: #7F7F7F;\n  border-style: solid;\n  border-width: thin;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: flex-end;\n  text-align: left; }\n  .igv-ui-trackgear-popover > div:not(:first-child) {\n    width: 100%; }\n    .igv-ui-trackgear-popover > div:not(:first-child) > div {\n      background: white; }\n    .igv-ui-trackgear-popover > div:not(:first-child) > div:last-child {\n      border-bottom-left-radius: 4px;\n      border-bottom-right-radius: 4px;\n      border-bottom-color: transparent;\n      border-bottom-style: solid;\n      border-bottom-width: thin; }\n    .igv-ui-trackgear-popover > div:not(:first-child) > div:hover {\n      background: #efefef; }\n\n.igv-ui-trackgear-popover-shim {\n  padding-left: 8px;\n  padding-right: 8px; }\n\n.igv-ui-trackgear-popover-header {\n  position: relative;\n  width: 100%;\n  height: 24px;\n  cursor: move;\n  border-top-color: transparent;\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n  border-bottom-color: #7F7F7F;\n  border-bottom-style: solid;\n  border-bottom-width: thin;\n  background-color: #eee;\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: flex-end;\n  align-items: center; }\n  .igv-ui-trackgear-popover-header div {\n    margin-right: 4px;\n    height: 12px;\n    width: 12px;\n    color: #7F7F7F; }\n  .igv-ui-trackgear-popover-header div:hover {\n    cursor: pointer;\n    color: #444; }\n\n.igv-ui-trackgear-popover-check-container {\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  align-items: center;\n  width: 100%;\n  height: 20px;\n  background-color: transparent; }\n  .igv-ui-trackgear-popover-check-container div {\n    padding-top: 2px;\n    padding-left: 8px; }\n  .igv-ui-trackgear-popover-check-container svg:first-child {\n    position: relative;\n    width: 12px;\n    height: 12px; }\n    .igv-ui-trackgear-popover-check-container svg:first-child svg {\n      position: absolute;\n      width: 12px;\n      height: 12px; }\n\n.igv-ui-color-swatch {\n  display: flex;\n  flex-flow: row;\n  flex-wrap: wrap;\n  justify-content: center;\n  align-items: center;\n  width: 32px;\n  height: 32px;\n  border-style: solid;\n  border-width: 2px;\n  border-color: white;\n  border-radius: 4px; }\n\n.igv-ui-colorpicker-menu-close-button {\n  display: flex;\n  flex-flow: row;\n  flex-wrap: nowrap;\n  justify-content: flex-end;\n  align-items: center;\n  width: 100%;\n  height: 32px;\n  margin-top: 4px;\n  margin-bottom: 4px;\n  padding-right: 8px; }\n  .igv-ui-colorpicker-menu-close-button i.fa {\n    display: block;\n    margin-left: 4px;\n    margin-right: 4px;\n    color: #5f5f5f; }\n  .igv-ui-colorpicker-menu-close-button i.fa:hover,\n  .igv-ui-colorpicker-menu-close-button i.fa:focus,\n  .igv-ui-colorpicker-menu-close-button i.fa:active {\n    cursor: pointer;\n    color: #0f0f0f; }\n\n.igv-ui-panel, .igv-ui-panel-column, .igv-ui-panel-row {\n  z-index: 2048;\n  background-color: white;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: medium;\n  font-weight: 400;\n  display: flex;\n  justify-content: flex-start;\n  align-items: flex-start; }\n\n.igv-ui-panel-column {\n  display: flex;\n  flex-direction: column; }\n\n.igv-ui-panel-row {\n  display: flex;\n  flex-direction: row; }\n\n.igv-ui-dialog {\n  z-index: 2048;\n  position: fixed;\n  width: fit-content;\n  height: fit-content;\n  display: flex;\n  flex-flow: column;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n  background-color: white;\n  border-color: #7F7F7F;\n  border-radius: 4px;\n  border-style: solid;\n  border-width: thin;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: medium;\n  font-weight: 400; }\n  .igv-ui-dialog .igv-ui-dialog-header {\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: flex-end;\n    align-items: center;\n    width: 100%;\n    height: 24px;\n    cursor: move;\n    border-top-left-radius: 4px;\n    border-top-right-radius: 4px;\n    border-bottom-color: #7F7F7F;\n    border-bottom-style: solid;\n    border-bottom-width: thin;\n    background-color: #eee; }\n    .igv-ui-dialog .igv-ui-dialog-header div {\n      margin-right: 4px;\n      margin-bottom: 2px;\n      height: 12px;\n      width: 12px;\n      color: #7F7F7F; }\n    .igv-ui-dialog .igv-ui-dialog-header div:hover {\n      cursor: pointer;\n      color: #444; }\n  .igv-ui-dialog .igv-ui-dialog-one-liner {\n    width: 95%;\n    height: 24px;\n    line-height: 24px;\n    text-align: left;\n    margin: 8px;\n    overflow-wrap: break-word;\n    background-color: white;\n    font-weight: bold; }\n  .igv-ui-dialog .igv-ui-dialog-ok-cancel {\n    width: 100%;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: space-around;\n    align-items: center; }\n    .igv-ui-dialog .igv-ui-dialog-ok-cancel div {\n      margin: 16px;\n      margin-top: 32px;\n      color: white;\n      font-family: \"Open Sans\", sans-serif;\n      font-size: 14px;\n      font-weight: 400;\n      width: 75px;\n      height: 28px;\n      line-height: 28px;\n      text-align: center;\n      border-color: transparent;\n      border-style: solid;\n      border-width: thin;\n      border-radius: 2px; }\n    .igv-ui-dialog .igv-ui-dialog-ok-cancel div:first-child {\n      background-color: #5ea4e0; }\n    .igv-ui-dialog .igv-ui-dialog-ok-cancel div:last-child {\n      background-color: #c4c4c4; }\n    .igv-ui-dialog .igv-ui-dialog-ok-cancel div:first-child:hover {\n      cursor: pointer;\n      background-color: #3b5c7f; }\n    .igv-ui-dialog .igv-ui-dialog-ok-cancel div:last-child:hover {\n      cursor: pointer;\n      background-color: #7f7f7f; }\n  .igv-ui-dialog .igv-ui-dialog-ok {\n    width: 100%;\n    height: 36px;\n    margin-top: 32px;\n    display: flex;\n    flex-flow: row;\n    flex-wrap: nowrap;\n    justify-content: space-around;\n    align-items: center; }\n    .igv-ui-dialog .igv-ui-dialog-ok div {\n      width: 98px;\n      height: 36px;\n      line-height: 36px;\n      text-align: center;\n      color: white;\n      font-family: \"Open Sans\", sans-serif;\n      font-size: medium;\n      font-weight: 400;\n      border-color: white;\n      border-style: solid;\n      border-width: thin;\n      border-radius: 4px;\n      background-color: #2B81AF; }\n    .igv-ui-dialog .igv-ui-dialog-ok div:hover {\n      cursor: pointer;\n      background-color: #25597f; }\n\n.igv-ui-textbox {\n  background-color: white;\n  font-family: \"Open Sans\", sans-serif;\n  font-size: medium;\n  font-weight: 400;\n  display: flex;\n  justify-content: flex-start;\n  align-items: flex-start; }\n\n/*# sourceMappingURL=igv-ui.css.map */\n';

    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = css;

    document.head.insertBefore(style, document.head.childNodes[ document.head.childNodes.length - 1 ]);

}

if(!stylesheetExists("igv-ui.css")) {
    embedCSS();
}



function stylesheetExists(stylesheetName) {
    for (let ss of document.styleSheets) {
        ss = ss.href ? ss.href.replace(/^.*[\\\/]/, '') : '';
        if (ss === stylesheetName) {
            return true;
        }
    }
    return false;
}

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
class FileLoadWidget {

    constructor({ widgetParent, dataTitle, indexTitle, mode, fileLoadManager, dataOnly, doURL }) {

        dataTitle = dataTitle || 'Data';

        indexTitle = indexTitle || 'Index';

        this.fileLoadManager = fileLoadManager;

        dataOnly = dataOnly || false;

        // TODO: Remove?
        doURL = doURL || false;

        // file load widget
        this.container = domUtils.div({ class: 'igv-file-load-widget-container'});
        widgetParent.appendChild(this.container);

        let config;
        if ('localFile' === mode) {
            // local data/index
            config =
                {
                    parent: this.container,
                    doURL: false,
                    dataTitle: dataTitle + ' file',
                    indexTitle: indexTitle + ' file',
                    dataOnly
                };
        } else {

            // url data/index
            config =
                {
                    parent: this.container,
                    doURL: true,
                    dataTitle: dataTitle + ' URL',
                    indexTitle: indexTitle + ' URL',
                    dataOnly
                };
        }

        this.createInputContainer(config);

        // error message container
        this.error_message = domUtils.div({ class: 'igv-flw-error-message-container'});
        this.container.appendChild(this.error_message);

        // error message
        this.error_message.appendChild(domUtils.div({ class: 'igv-flw-error-message'}));

        // error dismiss button
        attachCloseHandler(this.error_message, () => {
            this.dismissErrorMessage();
        });

        this.dismissErrorMessage();

    }

    retrievePaths() {

        this.fileLoadManager.ingestPath(this.inputData.value, false);
        if (this.inputIndex) {
            this.fileLoadManager.ingestPath(this.inputIndex.value, true);
        }

        let paths = [];
        if (this.fileLoadManager.dictionary) {

            if (this.fileLoadManager.dictionary.data) {
                paths.push(this.fileLoadManager.dictionary.data);
            }
            if (this.fileLoadManager.dictionary.index) {
                paths.push(this.fileLoadManager.dictionary.index);
            }
        }

        return paths;

    }

    presentErrorMessage(message) {
        this.error_message.querySelector('.igv-flw-error-message').textContent = message;
        domUtils.show(this.error_message);
    }

    dismissErrorMessage() {
        domUtils.hide(this.error_message);
        this.error_message.querySelector('.igv-flw-error-message').textContent = '';
    }

    present() {
        domUtils.show(this.container);
    }

    dismiss() {

        this.dismissErrorMessage();

        this.container.querySelector('input').value = undefined;
        const e = this.container.querySelector('.igv-flw-local-file-name-container');
        if (e) {
            domUtils.hide(e);
        }

        this.fileLoadManager.reset();

    }

    createInputContainer({ parent, doURL, dataTitle, indexTitle, dataOnly }) {

        // container
        const container = domUtils.div({ class: 'igv-flw-input-container' });
        parent.appendChild(container);

        // data
        const input_data_row = domUtils.div({ class: 'igv-flw-input-row' });
        container.appendChild(input_data_row);

        let label;

        // label
        label = domUtils.div({ class: 'igv-flw-input-label' });
        input_data_row.appendChild(label);
        label.textContent = dataTitle;

        if (true === doURL) {
            this.createURLContainer(input_data_row, 'igv-flw-data-url', false);
        } else {
            this.createLocalFileContainer(input_data_row, 'igv-flw-local-data-file', false);
        }

        if (true === dataOnly) {
            return;
        }

        // index
        const input_index_row = domUtils.div({ class: 'igv-flw-input-row' });
        container.appendChild(input_index_row);

        // label
        label = domUtils.div({ class: 'igv-flw-input-label' });
        input_index_row.appendChild(label);
        label.textContent = indexTitle;

        if (true === doURL) {
            this.createURLContainer(input_index_row, 'igv-flw-index-url', true);
        } else {
            this.createLocalFileContainer(input_index_row, 'igv-flw-local-index-file', true);
        }

    }

    createURLContainer(parent, id, isIndexFile) {

        const input = domUtils.create('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', (true === isIndexFile ? 'Enter index URL' : 'Enter data URL'));
        parent.appendChild(input);

        if (isIndexFile) {
            this.inputIndex = input;
        } else {
            this.inputData = input;
        }

    }

    createLocalFileContainer(parent, id, isIndexFile) {

        const file_chooser_container = domUtils.div({ class: 'igv-flw-file-chooser-container'});
        parent.appendChild(file_chooser_container);

        const str = `${ id }${ igv.guid() }`;

        const label = domUtils.create('label');
        label.setAttribute('for', str);

        file_chooser_container.appendChild(label);
        label.textContent = 'Choose file';

        const input = domUtils.create('input', { class: 'igv-flw-file-chooser-input'});
        input.setAttribute('id', str);
        input.setAttribute('name', str);
        input.setAttribute('type', 'file');
        file_chooser_container.appendChild(input);

        const file_name = domUtils.div({ class: 'igv-flw-local-file-name-container' });
        parent.appendChild(file_name);

        domUtils.hide(file_name);

        input.addEventListener('change', e => {

            this.dismissErrorMessage();

            const file = e.target.files[ 0 ];
            this.fileLoadManager.inputHandler(file, isIndexFile);

            const { name } = file;
            file_name.textContent = name;
            file_name.setAttribute('title', name);
            domUtils.show(file_name);
        });

    }

}

const attachCloseHandler = (parent, closeHandler) => {

    const container = domUtils.div();
    parent.appendChild(container);

    container.innerHTML = igv.iconMarkup('times');

    container.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        closeHandler();
    });

};

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

let validIndexExtensionSet = new Set(['fai', 'bai', 'crai', 'tbi', 'idx']);

let isValidIndexExtension = (path) => {
    // let set;
    // set = new Set(['fai', 'bai', 'crai', 'tbi', 'idx']);
    return validIndexExtensionSet.has(getExtension(path));
};

let getIndexObjectWithDataName = (name) => {
    let extension,
        dataSuffix,
        lookup,
        indexObject,
        aa;

    extension = getExtension(name);

    if (false === isKnownFileExtension(extension)) {
        return undefined;
    }

    dataSuffix = name.split('.').pop();

    lookup = indexLookup(dataSuffix);

    indexObject = {};

    // aa
    aa = name + '.' + lookup.index;

    indexObject[aa] = {};
    indexObject[aa].data = name;
    indexObject[aa].isOptional = lookup.isOptional;


    if ('bam' === extension || 'cram' === extension) {
        let bb,
            parts;

        // bb
        parts = name.split('.');
        parts.pop();
        bb = parts.join('.') + '.' + lookup.index;

        indexObject[bb] = {};
        indexObject[bb].data = name;
        indexObject[bb].isOptional = lookup.isOptional;
    }

    return indexObject;
};

let isKnownFileExtension = (extension) => {
    let fasta = new Set(['fa', 'fasta']);
    let union = new Set([...(igv.knownFileExtensions), ...fasta]);
    return union.has(extension);
};

let getFilename = (path) => {
    return path.google_url ? path.name : igv.getFilename(path);
};

let getExtension = (path) => {
    return igv.getExtension({url: path.google_url ? path.name : path});
};

let configureModal = (fileLoadWidget, modal, okHandler) => {
    let dismiss;

    // upper dismiss - x - button
    dismiss = modal.querySelector('.modal-header button');
    dismiss.addEventListener('click', () => {
        fileLoadWidget.dismiss();
    });

    // lower dismiss - close - button
    dismiss = modal.querySelector('.modal-footer button:nth-child(1)');
    dismiss.addEventListener('click', () => {
        fileLoadWidget.dismiss();
    });

    // ok - button
    const ok = modal.querySelector('.modal-footer button:nth-child(2)');

    ok.addEventListener('click', () => {

        if (true === okHandler(fileLoadWidget)) {
            fileLoadWidget.dismiss();
        }

    });

};

let indexLookup = (dataSuffix) => {

    const fa =
        {
            index: 'fai',
            isOptional: false
        };

    const fasta =
        {
            index: 'fai',
            isOptional: false
        };

    const bam =
        {
            index: 'bai',
            isOptional: false
        };

    const cram =
        {
            index: 'crai',
            isOptional: false
        };

    const gz =
        {
            index: 'tbi',
            isOptional: true
        };

    const bgz =
        {
            index: 'tbi',
            isOptional: true
        };

    const any =
        {
            index: 'idx',
            isOptional: true
        };

    const lut =
        {
            fa,
            fasta,
            bam,
            cram,
            gz,
            bgz
        };

    if (lut[dataSuffix]) {
        return lut[dataSuffix];
    } else {
        return any;
    }

};

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

const indexableFormats = new Set(["vcf", "bed", "gff", "gtf", "gff3", "bedgraph"]);

class MultipleFileLoadController {

    constructor ({ browser, modal, modalTitle, localFileInput, multipleFileSelection, dropboxButton, googleDriveButton, googleFilePickerHandler, configurationHandler, jsonFileValidator, pathValidator, fileLoadHandler, modalPresentationHandler }) {

        this.browser = browser;

        this.modal = modal;

        this.modalTitle = modalTitle;

        localFileInput.addEventListener('change', async () => {

            if (true === MultipleFileLoadController.isValidLocalFileInput(localFileInput)) {
                await this.ingestPaths( Array.from(localFileInput.files) );
                localFileInput.value = '';
            }

        });

        dropboxButton.addEventListener('click', () => {

            const obj =
                {
                    success: (dbFiles) => (this.ingestPaths(dbFiles.map((dbFile) => dbFile.link))),
                    cancel: () => {},
                    linkType: "preview",
                    multiselect: multipleFileSelection,
                    folderselect: false,
                };

            Dropbox.choose( obj );

        });


        if (googleDriveButton && googleFilePickerHandler) {

            googleDriveButton.addEventListener('click', () => {
                googleFilePickerHandler(this, multipleFileSelection);
            });

        }

        this.configurationHandler = configurationHandler;
        this.jsonFileValidator = jsonFileValidator;

        this.pathValidator = pathValidator;
        this.fileLoadHander = fileLoadHandler;
        this.modalPresentationHandler = modalPresentationHandler;
    }

    async ingestPaths(paths) {

        let self = this,
            dataPaths,
            indexPathCandidates,
            indexPaths,
            indexPathNameSet,
            indexPathNamesLackingDataPaths,
            jsonPromises,
            configurations;

        // handle Google Drive paths (not already handled via Google Drive Picker)
        let tmp = [];
        let googleDrivePaths = [];
        for (let path of paths) {

            if (igv.isFilePath(path)) {
                tmp.push(path);
            } else if (undefined === path.google_url && path.includes('drive.google.com')) {
                const fileInfo = await igv.google.getDriveFileInfo(path);
                googleDrivePaths.push({ filename: fileInfo.name, name: fileInfo.name, google_url: path});
            } else {
                tmp.push(path);
            }
        }

        paths = tmp.concat(googleDrivePaths);

        // isolate JSON paths
        let jsonPaths = paths.filter(path => 'json' === getExtension(path) );

        let remainingPaths;
        if (jsonPaths.length > 0) {

            // accumulate JSON retrieval Promises
            jsonPromises = jsonPaths
                .map((path) => {
                    let url = (path.google_url || path);
                    return { name: getFilename(path), promise: igv.xhr.loadJson(url) }
                });

            // validate JSON
            const jsons = await Promise.all(jsonPromises.map(task => task.promise));
            const booleans = jsons.map(json => self.jsonFileValidator(json));
            const invalids = booleans
                .map((boolean, index) => { return { isValid: boolean, path: jsonPaths[ index ] } })
                .filter(o => false === o.isValid);

            if (invalids.length > 0) {
                this.presentModalWithInvalidFiles(invalids.map(o => o.path));
                return;
            }

            // Handle Session file. There can only be ONE.
            const json = jsons.pop();
            if (true === MultipleFileLoadController.sessionJSONValidator(json)) {
                let path = jsonPaths.pop();

                if (path.google_url) {
                    this.browser.loadSession({ url:path.google_url, filename:path.name });
                } else {
                    let o = {};
                    o.filename = getFilename(path);
                    if (true === igv.isFilePath(path)) {
                        o.file = path;
                    } else {
                        o.url = path;
                    }
                    this.browser.loadSession(o);
                }

                return;
            }

            // non-JSON paths
            remainingPaths = paths.filter((path) => ('json' !== getExtension(path)) );

        } else {

            // there are no JSON paths
            remainingPaths = paths;
        }

        // bail if no files
        if (0 === jsonPaths.length && 0 === remainingPaths.length) {
            AlertDialog.present("ERROR: No valid data files submitted");
            return;
        }


        // Isolate XML paths. We only care about one and we assume it is a session path
        let xmlPaths = remainingPaths.filter(path => 'xml' === getExtension(path) );

        if (xmlPaths.length > 0) {
            let path = xmlPaths.pop();
            let o = {};
            o.filename = getFilename(path);
            if (true === igv.isFilePath(path)) {
                o.file = path;
            } else {
                o.url = path.google_url || path;
            }
            this.browser.loadSession(o);

            return;
        }

        // validate data paths (non-JSON)
        let extensions = remainingPaths.map(path => getExtension(path));

        if (extensions.length > 0) {
            let results = extensions.map((extension) => self.pathValidator( extension ));

            if (results.length > 0) {

                let invalid = results
                    .map((boolean, index) => { return { isValid: boolean, path: remainingPaths[ index ] } })
                    .filter(obj => false === obj.isValid);

                if (invalid.length > 0) {
                    this.presentModalWithInvalidFiles(invalid.map(o => o.path));
                    return;
                }

            }
        }

        // isolate data paths in dictionary
        dataPaths = createDataPathDictionary(remainingPaths);

        // isolate index path candidates in dictionary
        indexPathCandidates = createIndexPathCandidateDictionary(remainingPaths);

        // identify index paths that are
        // 1) present
        // 2) names of missing index paths for later error reporting
        indexPaths = getIndexPaths(dataPaths, indexPathCandidates);

        indexPathNameSet = new Set();
        for (let key in indexPaths) {
            if (indexPaths.hasOwnProperty(key)) {
                indexPaths[ key ]
                    .forEach(function (obj) {
                        if (obj) {
                            indexPathNameSet.add( obj.name );
                        }
                    });
            }
        }

        indexPathNamesLackingDataPaths = Object
            .keys(indexPathCandidates)
            .reduce((accumulator, key) => {

                if (false === indexPathNameSet.has(key)) {
                    accumulator.push(key);
                }

                return accumulator;
            }, []);

        configurations = Object
            .keys(dataPaths)
            .reduce((accumulator, key) => {

                if (false === dataPathIsMissingIndexPath(key, indexPaths) ) {
                    accumulator.push( self.configurationHandler(key, dataPaths[key], indexPaths) );
                }

                return accumulator;
            }, []);

        if (jsonPaths.length > 0) {

            this.jsonRetrievalSerial(jsonPromises, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths);

        } else {

            if (configurations.length > 0) {
                this.fileLoadHander( configurations );
            }

            this.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
        }

    }

    jsonRetrievalParallel(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {
        let self = this;

        Promise
            .all(retrievalTasks.map((task) => (task.promise)))
            .then(function (list) {

                if (list && list.length > 0) {
                    let jsonConfigurations;

                    jsonConfigurations = list
                        .reduce(function(accumulator, item) {

                            if (true === Array.isArray(item)) {
                                item.forEach(function (config) {
                                    accumulator.push(config);
                                });
                            } else {
                                accumulator.push(item);
                            }

                            return accumulator;
                        }, []);

                    configurations.push.apply(configurations, jsonConfigurations);
                    self.fileLoadHander(configurations);

                    self.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
                } else {
                    self.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
                }

            })
            .catch(function (error) {
                console.log(error);
                self.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
            });

    }

    jsonRetrievalSerial(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {

        let self = this,
            taskSet,
            successSet,
            jsonConfigurations;

        taskSet = new Set(retrievalTasks.map(task => task.name));
        successSet = new Set();
        jsonConfigurations = [];
        retrievalTasks
            .reduce((promiseChain, task) => {

                return promiseChain
                    .then((chainResults) => {
                        let promise;

                        promise = task.promise;

                        return promise
                            .then((currentResult) => {

                                successSet.add(task.name);
                                jsonConfigurations = [...chainResults, currentResult];
                                return jsonConfigurations;
                            })
                    })
            }, Promise.resolve([]))
            .then(ignore => {

                self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);

            })
            .catch(function (error) {

                self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);

            });

    }

    presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonFailureNameSet) {

        let markup = Object.keys(dataPaths)
            .filter(name => { return true === dataPathIsMissingIndexPath(name, indexPaths) })
            .map(name => `'<div><span>${ name }</span> ERROR: index file must also be selected</div>`);

        if (indexPathNamesLackingDataPaths.length > 0) {
            markup = markup.concat(indexPathNamesLackingDataPaths.map(name => `<div><span>${ name }</span> ERROR: data file must also be selected</div>`));
        }

        if (jsonFailureNameSet.size > 0) {
            markup = markup.concat(jsonFailureNameSet.map(name => `<div><span>${ name }</span> problems parsing JSON</div>`));
        }

        if (markup.length > 0) {

            markup.unshift('<div> The following files were not loaded ...</div>');
            this.modal.querySelector('.modal-title').textContent = this.modalTitle;

            const modal_body = this.modal.querySelector('.modal-body');
            modal_body.innerHTML = "";
            modal_body.innerHTML = markup.join('');

            this.modalPresentationHandler();
        }
    }

    jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet) {
        let self = this,
            failureSet;

        if (jsonConfigurations.length > 0) {
            let reduction;

            reduction = jsonConfigurations
                .reduce(function(accumulator, item) {

                    if (true === Array.isArray(item)) {
                        item.forEach(function (config) {
                            accumulator.push(config);
                        });
                    } else {
                        accumulator.push(item);
                    }

                    return accumulator;
                }, []);

            configurations.push.apply(configurations, reduction);
            self.fileLoadHander(configurations);

            failureSet = [...taskSet].filter(x => !successSet.has(x));
            self.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);

        } else {

            if (configurations.length > 0) {
                self.fileLoadHander(configurations);
            }

            failureSet = [...taskSet].filter(x => !successSet.has(x));
            self.presentModalWithFileLoadingErrors(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);
        }
    }

    presentModalWithInvalidFiles(paths) {

        let markup = [];

        markup.push('<div> Invalid Files </div>');

        markup = markup.concat(paths.map(path => `<div><span> ${ getFilename(path) }</span></div>`));

        this.modal.querySelector('.modal-title').textContent = this.modalTitle;
        const modal_body = this.modal.querySelector('.modal-body');
        modal_body.innerHTML = '';
        modal_body.innerHTML = markup.join('');

        this.modalPresentationHandler();
    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0);
    }

    //
    static trackConfigurator(dataKey, dataValue, indexPaths) {
        let config;



        config =
            {
                name: dataKey,
                filename:dataKey,
                format: igv.inferFileFormat(dataKey),
                url: dataValue,
                indexURL: getIndexURL(indexPaths[ dataKey ])
            };

        const indexURL = getIndexURL(indexPaths[ dataKey ]);
        if(indexURL) {
            config.indexURL = indexURL;
        } else {
            if(indexableFormats.has(config.format)) {
                config.indexed = false;
            }
        }

        igv.inferTrackTypes(config);

        return config;

    }

    static genomeConfigurator(dataKey, dataValue, indexPaths) {

        let config;

        config =
            {
                fastaURL: dataValue,
                indexURL: getIndexURL(indexPaths[ dataKey ])
            };

        return config;

    }

    static sessionConfigurator(dataKey, dataValue, indexPaths) {
        return { session: dataValue };
    }

    //
    static genomeJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('fastaURL');
    }

    static sessionJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('genome') || candidateSet.has('reference');
    }

    static trackJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('url');
    }

    //
    static genomePathValidator(extension) {
        let referenceSet = new Set(['fai', 'fa', 'fasta']);
        return referenceSet.has(extension);
    }

    static trackPathValidator(extension) {
        return igv.knownFileExtensions.has(extension) || validIndexExtensionSet.has(extension);
    }

}

function createDataPathDictionary(paths) {

    return paths
        .filter((path) => (isKnownFileExtension( getExtension(path) )))
        .reduce((accumulator, path) => {
            accumulator[ getFilename(path) ] = (path.google_url || path);
            return accumulator;
        }, {});

}

function createIndexPathCandidateDictionary (paths) {

    return paths
        .filter((path) => isValidIndexExtension( getExtension(path) ))
        .reduce(function(accumulator, path) {
            accumulator[ getFilename(path) ] = (path.google_url || path);
            return accumulator;
        }, {});

}

function getIndexURL(indexValue) {

    if (indexValue) {

        if        (indexValue[ 0 ]) {
            return indexValue[ 0 ].path;
        } else if (indexValue[ 1 ]) {
            return indexValue[ 1 ].path;
        } else {
            return undefined;
        }

    } else {
        return undefined;
    }

}

function getIndexPaths(dataPathNames, indexPathCandidates) {
    let list,
        indexPaths;

    // add info about presence and requirement (or not) of an index path
    list = Object
        .keys(dataPathNames)
        .map(function (dataPathName) {
            let indexObject;

            // assess the data files need/requirement for index files
            indexObject  = getIndexObjectWithDataName(dataPathName);

            // identify the presence/absence of associated index files
            for (let p in indexObject) {
                if (indexObject.hasOwnProperty(p)) {
                    indexObject[ p ].missing = (undefined === indexPathCandidates[ p ]);
                }
            }

            return indexObject;
        })
        .filter(function (indexObject) {

            // prune optional AND missing index files
            if (1 === Object.keys(indexObject).length) {

                let obj;

                obj = indexObject[ Object.keys(indexObject)[ 0 ] ];
                if( true === obj.missing &&  true === obj.isOptional) {
                    return false;
                } else if (false === obj.missing && false === obj.isOptional) {
                    return true;
                } else if ( true === obj.missing && false === obj.isOptional) {
                    return true;
                } else /*( false === obj.missing && true === obj.isOptional)*/ {
                    return true;
                }

            } else {
                return true;
            }

        });

    indexPaths = list
        .reduce(function(accumulator, indexObject) {

            for (let key in indexObject) {

                if (indexObject.hasOwnProperty(key)) {
                    let value;

                    value = indexObject[ key ];

                    if (undefined === accumulator[ value.data ]) {
                        accumulator[ value.data ] = [];
                    }

                    accumulator[ value.data ].push(((false === value.missing) ? { name: key, path: indexPathCandidates[ key ] } : undefined));
                }
            }

            return accumulator;
        }, {});

    return indexPaths;
}

function dataPathIsMissingIndexPath(dataName, indexPaths) {
    let status,
        aa;

    // if index for data is not in indexPaths it has been culled
    // because it is optional AND missing
    if (undefined === indexPaths[ dataName ]) {

        status = false;
    }

    else if (indexPaths && indexPaths[ dataName ]) {

        aa = indexPaths[ dataName ][ 0 ];
        if (1 === indexPaths[ dataName ].length) {
            status = (undefined === aa);
        } else /* BAM Track with two naming conventions */ {
            let bb;
            bb = indexPaths[ dataName ][ 1 ];
            if (aa || bb) {
                status = false;
            } else {
                status = true;
            }
        }

    } else {
        status = true;
    }

    return status;

}

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const getDataWrapper = function (data) {

    if (typeof(data) == 'string' || data instanceof String) {
        return new StringDataWrapper(data);
    } else {
        return new ByteArrayDataWrapper(data);
    }
};


// Data might be a string, or an UInt8Array
var StringDataWrapper = function (string) {
    this.data = string;
    this.ptr = 0;
};

StringDataWrapper.prototype.nextLine = function () {
    //return this.split(/\r\n|\n|\r/gm);
    var start = this.ptr,
        idx = this.data.indexOf('\n', start);

    if (idx > 0) {
        this.ptr = idx + 1;   // Advance pointer for next line
        return idx === start ? undefined : this.data.substring(start, idx).trim();
    }
    else {
        // Last line
        this.ptr = this.data.length;
        return (start >= this.data.length) ? undefined : this.data.substring(start).trim();
    }
};

// For use in applications where whitespace carries meaning
// Returns "" for an empty row (not undefined like nextLine), since this is needed in AED
StringDataWrapper.prototype.nextLineNoTrim = function () {
    var start = this.ptr,
        idx = this.data.indexOf('\n', start),
        data = this.data;

    if (idx > 0) {
        this.ptr = idx + 1;   // Advance pointer for next line
        if (idx > start && data.charAt(idx - 1) === '\r') {
            // Trim CR manually in CR/LF sequence
            return data.substring(start, idx - 1);
        }
        return data.substring(start, idx);
    }
    else {
        var length = data.length;
        this.ptr = length;
        // Return undefined only at the very end of the data
        return (start >= length) ? undefined : data.substring(start);
    }
};

var ByteArrayDataWrapper = function (array) {
    this.data = array;
    this.length = this.data.length;
    this.ptr = 0;
};

ByteArrayDataWrapper.prototype.nextLine = function () {

    var c, result;
    result = "";

    if (this.ptr >= this.length) return undefined;

    for (var i = this.ptr; i < this.length; i++) {
        c = String.fromCharCode(this.data[i]);
        if (c === '\r') continue;
        if (c === '\n') break;
        result = result + c;
    }

    this.ptr = i + 1;
    return result;
};

// The ByteArrayDataWrapper does not do any trimming by default, can reuse the function
ByteArrayDataWrapper.prototype.nextLineNoTrim = ByteArrayDataWrapper.prototype.nextLine;

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const columns = [
    'Biosample',
    'Target',
    'Assay Type',
    'Output Type',
    'Bio Rep',
    'Tech Rep',
    'Format',
    'Experiment',
    'Accession',
    'Lab'
];

class EncodeDataSource {

    constructor(genomeId, filter, suffix) {
        this.genomeId = genomeId;
        this.filter = filter;
        this.suffix = suffix || ".txt";
    };

    async tableData() {
        return this.fetchData()
    };

    async tableColumns() {
        return columns;
    };

    async fetchData() {

        const id = canonicalId(this.genomeId);
        const url = "https://s3.amazonaws.com/igv.org.app/encode/" + id + this.suffix;
        const response = await fetch(url);
        const data = await response.text();
        const records = parseTabData(data, this.filter);
        records.sort(encodeSort);
        return records
    }

    static supportsGenome(genomeId) {
        const knownGenomes = new Set(["ce10", "ce11", "dm3", "dm6", "GRCh38", "hg19", "mm9", "mm10"]);
        const id = canonicalId(genomeId);
        return knownGenomes.has(id)
    }

}

function parseTabData(data, filter) {

    var dataWrapper,
        line;

    dataWrapper = getDataWrapper(data);

    let records = [];

    dataWrapper.nextLine();  // Skip header
    while (line = dataWrapper.nextLine()) {

        let tokens = line.split("\t");
        let record = {
            "Assembly": tokens[1],
            "ExperimentID": tokens[0],
            "Experiment": tokens[0].substr(13).replace("/", ""),
            "Biosample": tokens[2],
            "Assay Type": tokens[3],
            "Target": tokens[4],
            "Format": tokens[8],
            "Output Type": tokens[7],
            "Lab": tokens[9],
            "url": "https://www.encodeproject.org" + tokens[10],
            "Bio Rep": tokens[5],
            "Tech Rep": tokens[6],
            "Accession": tokens[11]
        };
        record["Name"] = constructName(record);

        if (filter === undefined || filter(record)) {
            records.push(record);
        }
    }

    return records;
}

function constructName(record) {

    let name = record["Cell Type"] || "";

    if (record["Target"]) {
        name += " " + record["Target"];
    }
    if (record["Assay Type"].toLowerCase() !== "chip-seq") {
        name += " " + record["Assay Type"];
    }
    if (record["Bio Rep"]) {
        name += " " + record["Bio Rep"];
    }
    if (record["Tech Rep"]) {
        name += (record["Bio Rep"] ? ":" : " 0:") + record["Tech Rep"];
    }

    name += " " + record["Output Type"];

    name += " " + record["Experiment"];

    return name

}

function encodeSort(a, b) {
    var aa1,
        aa2,
        cc1,
        cc2,
        tt1,
        tt2;

    aa1 = a['Assay Type'];
    aa2 = b['Assay Type'];
    cc1 = a['Biosample'];
    cc2 = b['Biosample'];
    tt1 = a['Target'];
    tt2 = b['Target'];

    if (aa1 === aa2) {
        if (cc1 === cc2) {
            if (tt1 === tt2) {
                return 0;
            } else if (tt1 < tt2) {
                return -1;
            } else {
                return 1;
            }
        } else if (cc1 < cc2) {
            return -1;
        } else {
            return 1;
        }
    } else {
        if (aa1 < aa2) {
            return -1;
        } else {
            return 1;
        }
    }
}

function canonicalId(genomeId) {

    switch(genomeId) {
        case "hg38":
            return "GRCh38"
        case "CRCh37":
            return "hg19"
        case "GRCm38":
            return "mm10"
        case "NCBI37":
            return "mm9"
        case "WBcel235":
            return "ce11"
        case "WS220":
            return "ce10"
        default:
            return genomeId
    }

}

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

class TrackLoadController {

    constructor({browser, trackRegistryFile, modal, encodeModalTable, dropdownMenu, genericTrackSelectModal, uberFileLoader, modalDismissHandler}) {

        let urlConfig;

        this.browser = browser;
        this.trackRegistryFile = trackRegistryFile;
        this.encodeModalTable = encodeModalTable;
        this.dropdownMenu = dropdownMenu;
        this.modal = genericTrackSelectModal;

        urlConfig =
            {
                widgetParent: modal.querySelector('.modal-body'),
                dataTitle: undefined,
                indexTitle: undefined,
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: undefined,
                doURL: undefined
            };

        this.urlWidget = new FileLoadWidget(urlConfig);
        configureModal(this.urlWidget, modal, (fileLoadWidget) => {
            uberFileLoader.ingestPaths( fileLoadWidget.retrievePaths() );
            return true;
        });

        this.modalDismissHandler = modalDismissHandler;

        this.updateTrackMenus(browser.genome.id);

    }

    updateTrackMenus(genomeID) {

        (async (genomeID) => {

            const id_prefix = 'genome_specific_';

            const divider = this.dropdownMenu.querySelector('#igv-app-annotations-section');

            const e = this.dropdownMenu.querySelector(`[id^=${ id_prefix }]`);
            if (e) {
                e.parentNode.removeChild(e);
            }

            if (undefined === this.trackRegistryFile) {
                const e = new Error("Error: Missing track registry file");
                AlertDialog.present(e.message);
                throw e;
            }

            const trackRegistry = await getTrackRegistry(this.trackRegistryFile);

            if (trackRegistry) {

                const paths = trackRegistry[ genomeID ];

                if (undefined === paths) {
                    console.warn(`There are no tracks in the track registry for genome ${ genomeID }`);
                    return;
                }

                let responses = [];
                try {
                    responses = await Promise.all( paths.map( path => fetch(path) ) );
                } catch (e) {
                    AlertDialog.present(e.message);
                }

                if (responses.length > 0) {

                    let jsons = [];
                    try {
                        jsons = await Promise.all( responses.map( response => response.json() ) );
                    } catch (e) {
                        AlertDialog.present(e.message);
                    }

                    if (jsons.length > 0) {

                        let buttonConfigurations = [];

                        for (let json of jsons) {

                            if ('ENCODE' === json.type) {
                                const datasource = new EncodeDataSource(json.genomeID);
                                this.encodeModalTable.setDatasource(datasource);
                                buttonConfigurations.push(json);
                            } else if ('GTEX' === json.type) {
                                let info = undefined;
                                try {
                                    info = await igv.GtexUtils.getTissueInfo(json.datasetId);
                                } catch (e) {
                                    AlertDialog.present(e.message);
                                } finally {
                                    if (info) {
                                        json.tracks = info.tissueInfo.map(tissue => igv.GtexUtils.trackConfiguration(tissue));
                                        buttonConfigurations.push(json);
                                    }
                                }
                            } else {
                                buttonConfigurations.push(json);
                            }

                        }

                        buttonConfigurations = buttonConfigurations.reverse();
                        for (let config of buttonConfigurations) {

                            const { label, type, description, tracks } = config;

                            const button = domUtils.create('button', { class: 'dropdown-item' });
                            button.setAttribute('type', 'button');
                            button.id = id_prefix + label.toLowerCase().split(' ').join('_');

                            button.textContent = `${ label } ...`;

                            // $button.insertAfter($divider);
                            divider.parentNode.insertBefore(button, divider.nextSibling);

                            button.addEventListener('click', () => {

                            });

                            button.setAttribute('data-toggle', 'modal');

                            if ('ENCODE' === type) {
                                button.setAttribute('data-target', `#${ this.encodeModalTable.$modal.get(0).id }`);
                            } else {

                                button.setAttribute('data-target', `#${ this.modal.id }`);

                                button.addEventListener('click', () => {

                                    let markup = `<div>${ label }</div>`;

                                    if (description) {
                                        markup += `<div>${ description }</div>`;
                                    }

                                    this.modal.querySelector('#igv-app-generic-track-select-modal-label').innerHTML = markup;

                                    configureModalSelectList(this.browser, this.modal, tracks, this.modalDismissHandler);

                                });


                            }

                        }

                    }

                }

            }



        })(genomeID);

    };

}

const getTrackRegistry = async trackRegistryFile => {

    let response = undefined;

    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
        AlertDialog.present(e.message);
    } finally {

        if (response) {
            let trackRegistry = undefined;
            try {
                trackRegistry = await response.json();
            } catch (e) {
                console.error(e);
                AlertDialog.present(e.message);
            } finally {
                return trackRegistry;
            }

        } else {
            return undefined;
        }

    }


};

const configureModalSelectList = (browser, modal, configurations, modalDismissHandler) => {

    let select,
        option;

    const e = modal.querySelector('select');
    e.parentNode.removeChild(e);

    select = domUtils.create('select', { class: 'form-control' });
    modal.querySelector('.form-group').appendChild(select);

    option = domUtils.create('option');
    option.setAttribute('text', 'Select...');
    option.setAttribute('selected', 'selected');
    option.value = undefined;

    select.appendChild(option);

    configurations.forEach((configuration, key) => {

        const { name } = configuration;

        select[ key ] = new Option(name, name, false, false);

        select[ key ].setAttribute('data-track', JSON.stringify(configuration));


    });


    select.addEventListener('change', () => {

        let selectedOption = select.options[ select.selectedIndex ];
        const value = selectedOption.value;

        if ('' === value) ; else {

            selectedOption.removeAttribute('selected');

            const configuration = JSON.parse(selectedOption.getAttribute('data-track'));
            browser.loadTrack(configuration);
        }

        modalDismissHandler();

    });

};

export { FileLoadManager, FileLoadWidget, MultipleFileLoadController, TrackLoadController };
