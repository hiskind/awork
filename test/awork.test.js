import awork from '../src/index.js'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
chai.should()


describe('Awork as a basic wrapper', () => {
    const heavyFn = (num) => {
        return Math.pow(num, num)
    }
    let aHeavyFn

    beforeEach(() => {
        aHeavyFn = awork(heavyFn)
    })

    describe('Happy path tests', () => {
        it('Should return 27 for 3', () => {
            return aHeavyFn(3).should.eventually.equal(27)
        })

        it('Should return 387420489 for 9', () => {
            return aHeavyFn(9).should.eventually.equal(387420489)
        })
    })

})


describe('Awork as decorator', () => {
    let aHeavyCl

    describe('With keepAlive off', () => {
        class heavyClNotAlive {
            @awork({keepAlive: false})
            heavyFn(num) {
                return Math.pow(num, num)
            }
        }

        beforeEach(() => {
            aHeavyCl = new heavyClNotAlive()
        })

        describe('Happy path tests', () => {
            it('Should return 4 for 2', () => {
                return aHeavyCl.heavyFn(4).should.eventually.equal(256)
            })

            it('Should return 387420489 for 9', () => {
                return aHeavyCl.heavyFn(9).should.eventually.equal(387420489)
            })

            it('Should return 27 for 3 on the second call', () => {
                return aHeavyCl.heavyFn(9).then(() => {
                    return aHeavyCl.heavyFn(3).should.eventually.equal(27)
                })
            })
        })

    })


    describe('With keepAlive on', () => {
        class heavyClAlive {
            @awork({keepAlive: true})
            heavyFn(num) {
                return Math.pow(num, num)
            }
        }

        beforeEach(() => {
            aHeavyCl = new heavyClAlive()
        })

        describe('Happy path tests', () => {
            it('Should return 4 for 2', () => {
                return aHeavyCl.heavyFn(4).should.eventually.equal(256)
            })

            it('Should return 387420489 for 9', () => {
                return aHeavyCl.heavyFn(9).should.eventually.equal(387420489)
            })

            it('Should return 27 for 3 on the second call', () => {
                return aHeavyCl.heavyFn(9).then(() => {
                    return aHeavyCl.heavyFn(3).should.eventually.equal(27)
                })
            })
        })

    })

})
