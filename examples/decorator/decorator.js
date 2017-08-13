import awork from '../../../dist/awork.js'

function print(...args) {
    let element = document.createTextNode(args.join(" "))
    let p = document.createElement('P')
    p.setAttribute('style', 'width: 50%')
    p.append(element)
    document.getElementsByTagName('body')[0].append(p)
}

class InefficientFibonacci {
    @awork()
    getNumber(num) {
        let a = 1, b = 0, tmp = 0
        while (num > 0){
            tmp = a
            a = a + b
            b = tmp
            num--
        }
        return a
    }
}

let fib = new InefficientFibonacci()
fib.getNumber(100)
    .then((res) => print('100th Fibonacci number:', res))
    .catch((err) => console.error(err))
