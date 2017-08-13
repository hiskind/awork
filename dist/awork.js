"use strict";

exports.__esModule = true;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrap(fn) {
    var main = "\n        addEventListener('message', function (e) {\n            try {\n                if (self && self.Promise) {\n                    self.Promise.all([userFn.apply(this, e.data.raw)])\n                        .then(function(all_results) {\n                            postMessage({data: all_results.pop(), key: e.data.key})\n                        })\n                        .catch(function(error) {\n                            postMessage({error: error.toString(), key: e.data.key})\n                        })\n                } else {\n                    var results = userFn.apply(this, e.data.raw)\n                    postMessage({data: results, key: e.data.key})\n                }\n            } catch (ex) {\n                postMessage({error: ex.toString(), key: e.data.key})\n            }\n        });\n    ";
    return makeBlob(main, "var userFn = ", fn, ";");
}

function makeBlobPolyfill(data) {
    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    var blob = new BlobBuilder();
    data.forEach(function (d) {
        return blob.append(d);
    });
    blob = blob.getBlob();
}

function makeBlob() {
    try {
        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        var blob = Blob ? new Blob(data, { type: "application/javascript" }) : makeBlobPolyfill(data);
        return blob;
    } catch (e) {
        throw new Error("Blob is not supported in this browser");
    }
}

function create(fn) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { keepAlive: true };

    var blob = wrap(fn);
    var worker = null;
    var callbacks = {};
    var index = 0;

    return function promisify() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        if (!worker) {
            worker = new Worker(URL.createObjectURL(blob));
            callbacks = {};
            worker.onmessage = function (e) {
                var message = e.data;
                if (message.error) {
                    callbacks[message.key].reject(message.error);
                } else {
                    callbacks[message.key].resolve(message.data);
                }
                delete callbacks[message.key];
                if (!options.keepAlive && !(0, _keys2.default)(callbacks).length) {
                    worker.terminate();
                    worker = null;
                }
            };
        }
        var result = new _promise2.default(function (resolve, reject) {
            callbacks[index] = {
                resolve: resolve,
                reject: reject
            };
        });
        worker.postMessage({ raw: args, key: index });
        index++;
        return result;
    };
}

function awork() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    if (typeof args[0] === "function") {
        return create.apply(undefined, args);
    }

    return function (target, key, descriptor) {
        var wrapper = create(descriptor.value, args[0]);
        descriptor.value = wrapper;
        return descriptor;
    };
}

exports.default = awork;
