import awork from '../src/index.js'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()

describe('Awork as basic wrapper', () => {
    const heavyFn = (a) => {
        return Math.pow(a, a)
    }
    let aHeavyFn

    beforeEach(() => {
        aHeavyFn = awork(heavyFn)
    })

    describe('Happy pass tests', () => {
        it('Should return 27 for 3', () => {
            return aHeavyFn(3).should.eventually.equal(27)
        })

        it('Should return error for wrong arguments', () => {
            return aHeavyFn(9).should.eventually.equal(387420489)
        })
    })

})


describe('Awork as decorator', () => {

})
