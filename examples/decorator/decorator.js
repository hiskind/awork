import awork from '../../../build/awork.js'

class Fibonacci {
    @awork()
    calc(num) {
        let a = 1, b = 0, tmp
        while (num > 0){
            tmp = a
            a = a + b
            b = tmp
            num--
        }
        return a
    }
}

let fib = new Fibonacci()
fib.calc(100)
    .then((res) => console.log('100th number:', res))
    .catch((err) => console.error(err))
