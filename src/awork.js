function wrap(fn) {
    let main =  `
        addEventListener('message', function (e) {
            try {
                if (self && self.Promise) {
                    self.Promise.all([userFn.apply(this, e.data.raw)])
                        .then(function(all_results) {
                            postMessage({data: all_results.pop(), key: e.data.key})
                        })
                        .catch(function(error) {
                            postMessage({error: error.toString(), key: e.data.key})
                        })
                } else {
                    var results = userFn.apply(this, e.data.raw)
                    postMessage({data: results, key: e.data.key})
                }
            } catch (ex) {
                postMessage({error: ex.toString(), key: e.data.key})
            }
        });
    `
    return makeBlob(main, "var userFn = ", fn, ";")
}

function makeBlobPolyfill(data) {
    let BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
    let blob = new BlobBuilder()
    data.forEach(d => blob.append(d))
    blob = blob.getBlob()
}

function makeBlob (...data) {
    try {
        let blob = (Blob) ? new Blob(data, {type: "application/javascript"}) : makeBlobPolyfill(data)
        return blob
    }
    catch (e) {
        throw new Error("Blob is not supported in this browser")
    }
}

function create(fn, options = {keepAlive: true}) {
    let blob = wrap(fn)
    let worker = null
    let callbacks = {}
    let index = 0

    return function promisify(...args) {
        if (!worker) {
            worker = new Worker(URL.createObjectURL(blob))
            callbacks = {}
            worker.onmessage = function(e) {
                let message = e.data
                if (message.error) {
                    callbacks[message.key].reject(message.error)
                } else {
                    callbacks[message.key].resolve(message.data)
                }
                delete callbacks[message.key]
                if (!options.keepAlive && !Object.keys(callbacks).length) {
                    worker.terminate()
                    worker = null
                }
            }
        }
        let result = new Promise((resolve, reject) => {
            callbacks[index] = {
                resolve: resolve,
                reject: reject
            }
        })
        worker.postMessage({ raw: args, key: index})
        index++
        return result
    }
}


function awork(...args) {
    if(typeof args[0] === "function") {
        return create(...args)
    }

    return function (target, key, descriptor) {
        let wrapper = create(descriptor.value, args[0])
        descriptor.value = wrapper
        return descriptor
    }

}

export default awork
