function wrap(fn) {
    let main =  `
        addEventListener('message', function (e) {
            try {
                var results = userFn.apply(this, e.data)
                postMessage({data: results})
            } catch (ex) {
                postMessage({error: ex.message})
            }
        });
    `
    return makeBlob(main, 'var userFn = ', fn, ';')
}


function makeBlob () {
    let data = Array.prototype.slice.call(arguments, 0)
    let blob
    try {
        blob = new Blob(data, {type: 'application/javascript'})
    }
    catch (e) {
        try {
            let BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
            blob = new BlobBuilder()
            data.forEach(d => blob.append(d))
            blob = blob.getBlob()
        } catch (e) {
            throw new Error('Blob is not supported')
        }
    }

    return blob
}


function create(fn, options={keepAlive: true}) {
    let blob = wrap(fn)
    let worker = new Worker(URL.createObjectURL(blob))

    return function() {
        if (!worker) {
            worker = new Worker(URL.createObjectURL(blob))
        }
        let result = new Promise((resolve, reject) => {
            worker.onmessage = function(e) {
                let message = e.data
                if (!options.keepAlive) {
                    worker.terminate()
                    worker = undefined
                }
                if (message.error) {
                    reject(message.error)
                }
                resolve(message.data)
            }
        })
        worker.postMessage(Array.prototype.slice.call(arguments, 0))
        return result
    }
}


function awork() {
    if(typeof arguments[0] === 'function') {
        return create(arguments[0], arguments[1])
    }

    return function (target, key, descriptor) {
        let wrapper = create(descriptor.value, arguments[0])
        descriptor.value = wrapper
        return descriptor
    }
}

export default awork
