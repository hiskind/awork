'use strict';

exports.__esModule = true;
function wrap(fn) {
    var main = '\n        addEventListener(\'message\', function (e) {\n            try {\n                var results = userFn.apply(this, e.data)\n                postMessage({data: results})\n            } catch (ex) {\n                postMessage({error: ex.message})\n            }\n        });\n    ';
    return makeBlob(main, 'var userFn = ', fn, ';');
}

function makeBlob() {
    var data = Array.prototype.slice.call(arguments, 0);
    var blob = void 0;
    try {
        blob = new Blob(data, { type: 'application/javascript' });
    } catch (e) {
        try {
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            blob = new BlobBuilder();
            data.forEach(function (d) {
                return blob.append(d);
            });
            blob = blob.getBlob();
        } catch (e) {
            throw new Error('Blob is not supported');
        }
    }

    return blob;
}

function create(fn) {
    var blob = wrap(fn);

    return function () {
        var worker = new Worker(URL.createObjectURL(blob));
        var result = new Promise(function (resolve, reject) {
            worker.onmessage = function (e) {
                var message = e.data;
                if (message.error) {
                    worker.terminate();
                    worker = undefined;
                    reject(message.error);
                }
                resolve(message.data);
                worker.terminate();
                worker = undefined;
            };
        });
        worker.postMessage(Array.prototype.slice.call(arguments, 0));
        return result;
    };
}

function awork() {
    if (typeof arguments[0] === 'function') {
        return create(arguments[0]);
    }

    return function (target, key, descriptor) {
        var wrapper = create(descriptor.value);
        descriptor.value = wrapper;
        return descriptor;
    };
}

exports.awork = a;
