import {Promise} from 'es6-promise'
import awork from '../src/awork.js'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

chai.use(chaiAsPromised)
chai.should()


function createDecorated(options) {
    class DecoratedClass {
        @awork(options)
        parseJSON(jsonString) {
            return JSON.parse(jsonString)
        }
        @awork(options)
        parseJSONAsyncInvalid(jsonString) {
            return new Promise((resolve) => {
                resolve(JSON.notExistingMethod(jsonString))
            })
        }
    }
    return new DecoratedClass()
}

function createWrapped(options) {
    let parseJSON = (jsonString) => {
        return JSON.parse(jsonString)
    }
    return awork(parseJSON, options)
}


describe('keepAlive', () => {
    let terminate = null

    beforeEach(() => {
        terminate = sinon.spy(Worker.prototype, "terminate")
    })

    afterEach(() => {
        Worker.prototype.terminate.restore()
    })

    it('Should keep web worker alive by default', () => {
        return createWrapped()('{"a":1}')
            .then(() => terminate.callCount).should.eventually.equal(0)
    })

    it('Should keep web worker alive if keepAlive is set to true', () => {
        return createWrapped({keepAlive: true})('{"a":1}')
            .then(() => terminate.callCount).should.eventually.equal(0)
    })

    it('Should terminate web worker if keepAlive is set to false', () => {
        return createWrapped({keepAlive: false})('{"a":1}')
            .then(() => terminate.callCount).should.eventually.equal(1)
    })

    it('Should keep worker when keepAlive:true, even if error occured', () => {
        return createWrapped()('{a:1}')
            .catch(() => terminate.callCount).should.eventually.equal(0)
    })

    it('Should terminate worker when keepAlive:false, even if error occured', () => {
        return createWrapped({keepAlive: false})('{a:1}')
            .catch(() => terminate.callCount).should.eventually.equal(1)
    })

    it('Should support multiple wraps with different keepAlive settings', () => {
        return Promise.all([
            createWrapped({keepAlive: false})('{"a":1}'),
            createWrapped({keepAlive: true})('{"a":2}')
        ])
            .then(() => terminate.callCount).should.eventually.equal(1)
    })

    it('Should reuse web worker even if keepAlive is set to false but we have tasks to do', () => {
        let wrapped = createWrapped({keepAlive: false})
        return Promise.all(
            [
                wrapped('{"a":1}'),
                wrapped('{}'),
                wrapped('{"b": 0}')
            ]
        )
            .then(() => terminate.callCount).should.eventually.equal(1)
    })

    it('Should terminate web worker between calls if calls are not in a row', () => {
        let wrapped = createWrapped({keepAlive: false})
        return Promise.all(
            [
                wrapped('{"a":1}'),
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(wrapped('{"b": 0}'))
                    }, 100)
                })
            ]
        )
            .then(() => terminate.callCount).should.eventually.equal(2)
    })

})

describe('Wrapper', () => {
    it('Should fulfill promise when valid arguments provided', () => {
        return createWrapped()('{"a":1}').should.eventually.deep.equal({a:1})
    })

    it('Should reject promise when error occurs', () => {
        return createWrapped()('{a:1}').should.be.rejected
    })
})


describe('Decorator', () => {
    it('Should fulfill promise when valid arguments provided', () => {
        return createDecorated().parseJSON('{"a":[1,2]}').should.eventually.deep.equal({a:[1, 2]})
    })

    it('Should reject promise when decorated function is invalid', () => {
        return createDecorated().parseJSONAsyncInvalid('{"a:[1,2]}').should.be.rejected
    })

    it('Should reject promise when invalid arguments provided', () => {
        return createDecorated().parseJSON('{"a":[}').should.be.rejected
    })
})
