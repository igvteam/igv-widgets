function getExtension(url) {

    if (undefined === url) {
        return undefined;
    }

    let path = (isFilePath(url) || url.google_url) ? url.name : url;
    let filename = path.toLowerCase();

    //Strip parameters -- handle local files later
    let index = filename.indexOf("?");
    if (index > 0) {
        filename = filename.substr(0, index);
    }

    //Strip aux extensions .gz, .tab, and .txt
    if (filename.endsWith(".gz")) {
        filename = filename.substr(0, filename.length - 3);
    } else if (filename.endsWith(".txt") || filename.endsWith(".tab") || filename.endsWith(".bgz")) {
        filename = filename.substr(0, filename.length - 4);
    }

    index = filename.lastIndexOf(".");

    return index < 0 ? filename : filename.substr(1 + index);
}

/**
 * Return the filename from the path.   Example
 *   https://foo.com/bar.bed?param=2   => bar.bed
 * @param path
 */

function getFilename (path) {

    if (path.google_url || path instanceof File) {
        return path.name;
    } else {

        let index = path.lastIndexOf("/");
        let filename = index < 0 ? path : path.substr(index + 1);

        //Strip parameters -- handle local files later
        index = filename.indexOf("?");
        if (index > 0) {
            filename = filename.substr(0, index);
        }

        return filename;

    }

}

function isFilePath (path) {
    return (path instanceof File);
}

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Broad Institute
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

const knownFileExtensions = new Set([

    "narrowpeak",
    "broadpeak",
    "regionpeak",
    "peaks",
    "bedgraph",
    "wig",
    "gff3",
    "gff",
    "gtf",
    "fusionjuncspan",
    "refflat",
    "seg",
    "aed",
    "bed",
    "vcf",
    "bb",
    "bigbed",
    "bw",
    "bigwig",
    "bam",
    "tdf",
    "refgene",
    "genepred",
    "genepredext",
    "bedpe",
    "bp",
    "snp",
    "rmsk",
    "cram"
]);

function inferTrackTypes(config) {

    // function inferFileFormat(config) {
    //
    //     var path;
    //
    //     if (config.format) {
    //         config.format = config.format.toLowerCase();
    //         return;
    //     }
    //
    //     path = isFilePath(config.url) ? config.url.name : config.url;
    //
    //     config.format = inferFileFormat(path);
    // }


    translateDeprecatedTypes(config);

    if (undefined === config.sourceType && config.url) {
        config.sourceType = "file";
    }

    if ("file" === config.sourceType) {
        if (undefined === config.format) {
            const path = isFilePath(config.url) ? config.url.name : config.url;
            config.format = inferFileFormat(path);
        } else {
            config.format = config.format.toLowerCase();
        }
    }

    if (undefined === config.type) {
        if (config.type) return;

        if (config.format) {

            switch (config.format.toLowerCase()) {
                case "bw":
                case "bigwig":
                case "wig":
                case "bedgraph":
                case "tdf":
                    config.type = "wig";
                    break;
                case "vcf":
                    config.type = "variant";
                    break;
                case "seg":
                    config.type = "seg";
                    break;
                case "bam":
                case "cram":
                    config.type = "alignment";
                    break;
                case "bedpe":
                case "bedpe-loop":
                    config.type = "interaction";
                    break;
                case "bp":
                    config.type = "arc";
                    break;
                default:
                    config.type = "annotation";

            }
        }

    }
}

function inferFileFormat(fn) {

    var idx, ext;

    fn = fn.toLowerCase();

    // Special case -- UCSC refgene files
    if (fn.endsWith("refgene.txt.gz") ||
        fn.endsWith("refgene.txt.bgz") ||
        fn.endsWith("refgene.txt") ||
        fn.endsWith("refgene.sorted.txt.gz") ||
        fn.endsWith("refgene.sorted.txt.bgz")) {
        return "refgene";
    }


    //Strip parameters -- handle local files later
    idx = fn.indexOf("?");
    if (idx > 0) {
        fn = fn.substr(0, idx);
    }

    //Strip aux extensions .gz, .tab, and .txt
    if (fn.endsWith(".gz")) {
        fn = fn.substr(0, fn.length - 3);
    }

    if (fn.endsWith(".txt") || fn.endsWith(".tab") || fn.endsWith(".bgz")) {
        fn = fn.substr(0, fn.length - 4);
    }


    idx = fn.lastIndexOf(".");
    ext = idx < 0 ? fn : fn.substr(idx + 1);

    switch (ext) {
        case "bw":
            return "bigwig";
        case "bb":
            return "bigbed";

        default:
            if (knownFileExtensions.has(ext)) {
                return ext;
            } else {
                return undefined;
            }
    }

}

function translateDeprecatedTypes(config) {

    if (config.featureType) {  // Translate deprecated "feature" type
        config.type = config.type || config.featureType;
        config.featureType = undefined;
    }
    if ("bed" === config.type) {
        config.type = "annotation";
        config.format = config.format || "bed";
    } else if ("annotations" === config.type) {
        config.type = "annotation";
    } else if ("alignments" === config.type) {
        config.type = "alignment";
    } else if ("bam" === config.type) {
        config.type = "alignment";
        config.format = "bam";
    } else if ("vcf" === config.type) {
        config.type = "variant";
        config.format = "vcf";
    } else if ("t2d" === config.type) {
        config.type = "gwas";
    } else if ("FusionJuncSpan" === config.type && !config.format) {
        config.format = "fusionjuncspan";
    } else if ("aed" === config.type) {
        config.type = "annotation";
        config.format = config.format || "aed";
    }
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
    return isFilePath(item) ? item.name : item;
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

function applyStyle(elem, style) {
    for (let key of Object.keys(style)) {
        elem.style[key] = style[key];
    }
}

function guid  () {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}

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

function createIcon(name, color) {
    return iconMarkup(name, color);
}

function iconMarkup(name, color) {
    color = color || "currentColor";
    let icon = icons[name];
    if (!icon) {
        console.error(`No icon named: ${name}`);
        icon = icons["question"];
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null,'viewBox', '0 0 ' + icon[0] + ' ' + icon[1]);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttributeNS(null,'fill',  color );
    path.setAttributeNS(null,'d', icon[4]);
    svg.appendChild(path);
    return svg;
}

const icons = {
    "check": [512, 512, [], "f00c", "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"],
    "cog": [512, 512, [], "f013", "M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z"],
    "exclamation": [192, 512, [], "f12a", "M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z"],
    "exclamation-circle": [512, 512, [], "f06a", "M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"],
    "exclamation-triangle": [576, 512, [], "f071", "M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"],
    "minus": [448, 512, [], "f068", "M424 318.2c13.3 0 24-10.7 24-24v-76.4c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h400z"],
    "minus-circle": [512, 512, [], "f056", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z"],
    "minus-square": [448, 512, [], "f146", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM92 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H92z"],
    "plus": [448, 512, [], "f067", "M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z"],
    "plus-circle": [512, 512, [], "f055", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"],
    "plus-square": [448, 512, [], "f0fe", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-32 252c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92H92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"],
    "question": [384, 512, [], "f128", "M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z"],
    "save": [448, 512, [], "f0c7", "M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"],
    "search": [512, 512, [], "f002", "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"],
    "share": [512, 512, [], "f064", "M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"],
    "spinner": [512, 512, [], "f110", "M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"],
    "square": [448, 512, [], "f0c8", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z"],
    "square-full": [512, 512, [], "f45c", "M512 512H0V0h512v512z"],
    "times": [384, 512, [], "f00d", "M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z"],
    "times-circle": [512, 512, [], "f057", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"],
    "wrench": [512, 512, [], "f0ad", "M481.156 200c9.3 0 15.12 10.155 10.325 18.124C466.295 259.992 420.419 288 368 288c-79.222 0-143.501-63.974-143.997-143.079C223.505 65.469 288.548-.001 368.002 0c52.362.001 98.196 27.949 123.4 69.743C496.24 77.766 490.523 88 481.154 88H376l-40 56 40 56h105.156zm-171.649 93.003L109.255 493.255c-24.994 24.993-65.515 24.994-90.51 0-24.993-24.994-24.993-65.516 0-90.51L218.991 202.5c16.16 41.197 49.303 74.335 90.516 90.503zM104 432c0-13.255-10.745-24-24-24s-24 10.745-24 24 10.745 24 24 24 24-10.745 24-24z"],
};

function attachDialogCloseHandlerWithParent(parent, closeHandler) {

    var container = document.createElement("div");
    parent.appendChild(container);
    container.appendChild(createIcon("times"));
    container.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeHandler();
    });
}

// The global Alert dialog

let alertDialog;

const Alert = {
    init(root) {
        if (!alertDialog) {
            alertDialog = new AlertDialog(root);
        }
    },

    presentAlert: function (alert, callback) {
        alertDialog.present(alert, callback);
    },
};

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
        this.container = div({ class: 'igv-file-load-widget-container'});
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
        this.error_message = div({ class: 'igv-flw-error-message-container'});
        this.container.appendChild(this.error_message);

        // error message
        this.error_message.appendChild(div({ class: 'igv-flw-error-message'}));

        // error dismiss button
        attachDialogCloseHandlerWithParent(this.error_message, () => {
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

        // clear input elements
        this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
            div.querySelector('input').value = '';
        });

        return paths;

    }

    presentErrorMessage(message) {
        this.error_message.querySelector('.igv-flw-error-message').textContent = message;
        show(this.error_message);
    }

    dismissErrorMessage() {
        hide(this.error_message);
        this.error_message.querySelector('.igv-flw-error-message').textContent = '';
    }

    present() {
        show(this.container);
    }

    dismiss() {

        this.dismissErrorMessage();

        const e = this.container.querySelector('.igv-flw-local-file-name-container');
        if (e) {
            hide(e);
        }

        // clear input elements
        this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
            div.querySelector('input').value = '';
        });

        this.fileLoadManager.reset();

    }

    createInputContainer({ parent, doURL, dataTitle, indexTitle, dataOnly }) {

        // container
        const container = div({ class: 'igv-flw-input-container' });
        parent.appendChild(container);

        // data
        const input_data_row = div({ class: 'igv-flw-input-row' });
        container.appendChild(input_data_row);

        let label;

        // label
        label = div({ class: 'igv-flw-input-label' });
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
        const input_index_row = div({ class: 'igv-flw-input-row' });
        container.appendChild(input_index_row);

        // label
        label = div({ class: 'igv-flw-input-label' });
        input_index_row.appendChild(label);
        label.textContent = indexTitle;

        if (true === doURL) {
            this.createURLContainer(input_index_row, 'igv-flw-index-url', true);
        } else {
            this.createLocalFileContainer(input_index_row, 'igv-flw-local-index-file', true);
        }

    }

    createURLContainer(parent, id, isIndexFile) {

        const input = create('input');
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

        const file_chooser_container = div({ class: 'igv-flw-file-chooser-container'});
        parent.appendChild(file_chooser_container);

        const str = `${ id }${ guid() }`;

        const label = create('label');
        label.setAttribute('for', str);

        file_chooser_container.appendChild(label);
        label.textContent = 'Choose file';

        const input = create('input', { class: 'igv-flw-file-chooser-input'});
        input.setAttribute('id', str);
        input.setAttribute('name', str);
        input.setAttribute('type', 'file');
        file_chooser_container.appendChild(input);

        const file_name = div({ class: 'igv-flw-local-file-name-container' });
        parent.appendChild(file_name);

        hide(file_name);

        input.addEventListener('change', e => {

            this.dismissErrorMessage();

            const file = e.target.files[ 0 ];
            this.fileLoadManager.inputHandler(file, isIndexFile);

            const { name } = file;
            file_name.textContent = name;
            file_name.setAttribute('title', name);
            show(file_name);
        });

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
    let union = new Set([...(TrackUtils.knownFileExtensions), ...fasta]);
    return union.has(extension);
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

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    validIndexExtensionSet: validIndexExtensionSet,
    isValidIndexExtension: isValidIndexExtension,
    getIndexObjectWithDataName: getIndexObjectWithDataName,
    isKnownFileExtension: isKnownFileExtension,
    configureModal: configureModal
});

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

let picker;
let oauth;

function init(clientId, oa) {

    oauth = oa;

    let scope,
        config;

    scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ];

    config =
        {
            'clientId': clientId,
            'scope': scope.join(' ')
        };

    return gapi.client.init(config)
}

function postInit() {
    let callback,
        onerror,
        config;

    gapi.auth2
        .getAuthInstance()
        .isSignedIn
        .listen(updateSignInStatus);

    callback = () => {
        console.log('Google Picker library loaded successfully');
    };

    onerror = () => {
        console.log('Error loading Google Picker library');
        alert('Error loading Google Picker library');
    };

    config =
        {
            callback: callback,
            onerror: onerror
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

function createDropdownButtonPicker(multipleFileSelection, filePickerHandler) {

    getAccessToken()
        .then(function (accessToken) {
            return accessToken;
        })
        .then(function (accessToken) {

            let view,
                teamView;

            view = new google.picker.DocsView(google.picker.ViewId.DOCS);
            view.setIncludeFolders(true);

            teamView = new google.picker.DocsView(google.picker.ViewId.DOCS);
            teamView.setEnableTeamDrives(true);
            teamView.setIncludeFolders(true);

            if (accessToken) {

                if (multipleFileSelection) {
                    picker = new google.picker.PickerBuilder()
                        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                        .setOAuthToken(oauth.google.access_token)
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
                    picker = new google.picker.PickerBuilder()
                        .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                        .setOAuthToken(oauth.google.access_token)
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

                picker.setVisible(true);

            } else {
                Alert.presentAlert("Sign into Google before using picker");
            }
        })
        .catch(function (error) {
            console.log(error);
        });


}
function signInHandler() {

    let scope,
        options;

    scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ];

    options = new gapi.auth2.SigninOptionsBuilder();
    options.setPrompt('select_account');
    options.setScope(scope.join(' '));

    return gapi.auth2
        .getAuthInstance()
        .signIn(options)
        .then(function (user) {

            let authResponse;

            authResponse = user.getAuthResponse();

            oauth.setToken(authResponse["access_token"]);

            return authResponse["access_token"];
        })
}
function getAccessToken() {

    if (oauth.google.access_token) {
        return Promise.resolve(oauth.google.access_token);
    } else {
        return signInHandler();
    }
}
function updateSignInStatus(signInStatus) {
    // do nothing
}

var googleFilePicker = /*#__PURE__*/Object.freeze({
    __proto__: null,
    init: init,
    postInit: postInit,
    createDropdownButtonPicker: createDropdownButtonPicker,
    createFilePickerHandler: createFilePickerHandler
});

class FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google }) {

        this.igvxhr = igvxhr;
        this.google = google;

        localFileInput.addEventListener('change', async () => {

            if (true === FileLoad.isValidLocalFileInput(localFileInput)) {
                await this.loadPaths( Array.from(localFileInput.files) );
                localFileInput.value = '';
            }

        });

        dropboxButton.addEventListener('click', () => {

            const config =
                {
                    success: dbFiles => this.loadPaths( dbFiles.map(dbFile => dbFile.link) ),
                    cancel: () => {},
                    linkType: 'preview',
                    multiselect: true,
                    folderselect: false,
                };

            Dropbox.choose( config );

        });


        if (false === googleEnabled) {
            hide(googleDriveButton.parentElement);
        }

        if (true === googleEnabled && googleDriveButton) {

            googleDriveButton.addEventListener('click', () => {

                createDropdownButtonPicker(true, responses => {

                    const paths = responses
                        .map(({ name, url: google_url }) => {
                            return { filename: name, name, google_url };
                        });

                    this.loadPaths(paths);
                });

            });

        }

    }

    async loadPaths(paths) {
        console.log('FileLoad: loadPaths(...)');
    }

    async processPaths(paths) {

        let tmp = [];
        let googleDrivePaths = [];
        for (let path of paths) {

            if (isFilePath(path)) {
                tmp.push(path);
            } else if (undefined === path.google_url && path.includes('drive.google.com')) {
                const fileInfo = await google.getDriveFileInfo(path);
                googleDrivePaths.push({ filename: fileInfo.name, name: fileInfo.name, google_url: path});
            } else {
                tmp.push(path);
            }
        }

        return tmp.concat(googleDrivePaths);

    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0);
    }

    static getIndexURL(indexValue) {

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

    static getIndexPaths(dataPathNames, indexPathCandidates) {

        // add info about presence and requirement (or not) of an index path
        const list = Object.keys(dataPathNames)
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

        return list.reduce(function(accumulator, indexObject) {

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

    }

}

const referenceSet = new Set(['fai', 'fa', 'fasta']);
const dataSet = new Set(['fa', 'fasta']);
const indexSet = new Set(['fai']);

const errorString = 'ERROR: Load either: 1) single XML file 2). single JSON file. 3) data file (.fa or .fasta ) & index file (.fai).';
class GenomeFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr, google }) {
        super(
            { localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        if (1 === list.length) {

            const path = list[ 0 ];
            if ('json' === getExtension(path)) {
                const json = await this.igvxhr.loadJson((path.google_url || path));
                this.loadHandler(json);
            } else if ('xml' === getExtension(path)) {

                const key = true === isFilePath(path) ? 'file' : 'url';
                const o = {};
                o[ key ] = path;

                this.loadHandler(o);
            } else {
                Alert.presentAlert(`${ errorString }`);
            }

        } else if (2 === list.length) {

            let [ a, b ] = list.map(path => {
                return getExtension(path)
            });

            if (false === GenomeFileLoad.extensionValidator(a, b)) {
                Alert.presentAlert(`${ errorString }`);
                return;
            }

            const [ dataPath, indexPath ] = GenomeFileLoad.retrieveDataPathAndIndexPath(list);

            await this.loadHandler({ fastaURL: dataPath, indexURL: indexPath });

        } else {
            Alert.presentAlert(`${ errorString }`);
        }

    };

    static retrieveDataPathAndIndexPath(list) {

        let [ a, b ] = list.map(path => {
            return getExtension(path)
        });

        if (dataSet.has(a) && indexSet.has(b)) {
            return [ list[ 0 ], list[ 1 ] ];
        } else {
            return [ list[ 1 ], list[ 0 ] ];
        }

    };

    static extensionValidator(a, b) {
        if (dataSet.has(a) && indexSet.has(b)) {
            return true;
        } else {
            return dataSet.has(b) && indexSet.has(a);
        }
    }

    static pathValidator(extension) {
        return referenceSet.has(extension);
    }

    static configurationHandler(dataKey, dataValue, indexPaths) {
        return { fastaURL: dataValue, indexURL: FileLoad.getIndexURL(indexPaths[ dataKey ]) };
    }

}

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr, google }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        const path = list[ 0 ];
        if ('json' === getExtension(path)) {
            const json = await this.igvxhr.loadJson((path.google_url || path));
            this.loadHandler(json);
        } else if ('xml' === getExtension(path)) {

            const key = true === isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.loadHandler(o);
        }

    };

}

const indexableFormats = new Set(["vcf", "bed", "gff", "gtf", "gff3", "bedgraph"]);

class TrackFileLoad extends FileLoad {
    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr, google }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        let configurations = [];

        // isolate JSON paths
        let jsonPaths = list.filter(path => 'json' === getExtension(path) );
        if (jsonPaths.length > 0) {
            const promises = jsonPaths
                .map(path => {
                    let url = (path.google_url || path);
                    return { promise: this.igvxhr.loadJson(url) }
                });


            const jsons = await Promise.all(promises.map(task => task.promise));
            configurations.push(...jsons);

        }

        let remainingPaths = list.filter(path => 'json' !== getExtension(path) );

        if (remainingPaths.length > 0) {

            // isolate data paths
            let dataPaths = TrackFileLoad.createDataPathDictionary(remainingPaths);
            if (0 === Object.keys(dataPaths).length) {
                Alert.presentAlert('ERROR: Must provide data file(s)');
                return;
            }

            // isolate index path candidates
            let indexPathCandidates = TrackFileLoad.createIndexPathCandidateDictionary(remainingPaths);

            // identify index paths that are
            // 1) present
            // 2) names of missing index paths for later error reporting
            let indexPaths = FileLoad.getIndexPaths(dataPaths, indexPathCandidates);

            TrackFileLoad.trackConfigurator(dataPaths, indexPaths, configurations);

            const str = TrackFileLoad.getErrorString(dataPaths, indexPaths, indexPathCandidates);
            if (str) {
                Alert.presentAlert(str);
            }

        }

        if (configurations.length > 0) {
            this.loadHandler(configurations);
        }


    }

    static createDataPathDictionary(paths) {

        return paths
            .filter(path => isKnownFileExtension( getExtension(path) ))
            .reduce((accumulator, path) => {
                accumulator[ getFilename(path) ] = (path.google_url || path);
                return accumulator;
            }, {});

    }

    static createIndexPathCandidateDictionary(paths) {

        return paths
            .filter(path => isValidIndexExtension( getExtension(path) ))
            .reduce((accumulator, path) => {
                accumulator[ getFilename(path) ] = (path.google_url || path);
                return accumulator;
            }, {});

    }

    static trackConfigurator(dataPaths, indexPaths, configurations) {

        for (let key of Object.keys(dataPaths)) {

            if (false === TrackFileLoad.IndexPathIsMissing(key, indexPaths)) {

                let config =
                    {
                        name: key,
                        filename:key,
                        format: inferFileFormat(key),
                        url: dataPaths[ key ]
                    };

                const indexURL = FileLoad.getIndexURL(indexPaths[ key ]);

                if(indexURL) {
                    config.indexURL = indexURL;
                } else {
                    if(indexableFormats.has(config.format)) {
                        config.indexed = false;
                    }
                }

                inferTrackTypes(config);

                configurations.push(config);
            }
        }

    }

    static jsonConfigurator(jsonConfigurations) {

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

            self.fileLoadHander(configurations);


        }
    }

    static jsonRetrievalSerial(tasks, configurations) {

        let jsonConfigurations = [];

        tasks
            .reduce((promiseChain, task) => {

                return promiseChain
                    .then((chainResults) => {

                        let { promise } = task;

                        return promise
                            .then((currentResult) => {
                                jsonConfigurations = [...chainResults, currentResult];
                                return jsonConfigurations;
                            })
                    })
            }, Promise.resolve([]))
            .then(() => {
                configurations.push(...jsonConfigurations);
                TrackFileLoad.jsonConfigurator(configurations);
            })
            .catch(error => {
                Alert.presentAlert(error.message);
            });

    }

    static IndexPathIsMissing(dataName, indexPaths) {
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

    static getErrorString(dataPaths, indexPaths, indexPathCandidates) {

        let errorStrings = [];

        for (let dataKey of Object.keys(dataPaths)) {
            if (true === TrackFileLoad.IndexPathIsMissing(dataKey, indexPaths)) {
                errorStrings.push(`Index file missing for ${ dataKey }`);
            }
        }

        let indexPathNameSet = new Set();
        for (let key in indexPaths) {
            if (indexPaths.hasOwnProperty(key)) {
                indexPaths[ key ].forEach(function (obj) {
                    if (obj) {
                        indexPathNameSet.add( obj.name );
                    }
                });
            }
        }

        for (let key of Object.keys(indexPathCandidates)) {
            if (false === indexPathNameSet.has(key)) {
                errorStrings.push(`Data file is missing for ${ name }`);
            }

        }

        return errorStrings.length > 0 ? errorStrings.join(' ') : undefined;
    }

}

export { FileLoad, FileLoadManager, FileLoadWidget, GenomeFileLoad, googleFilePicker as GoogleFilePicker, SessionFileLoad, TrackFileLoad, utils as Utils };
