import awork from '../../../dist/awork.js'


function print(...args) {
    let element = document.createTextNode(args.join(" "))
    let p = document.createElement('P')
    p.setAttribute('style', 'width: 50%')
    p.append(element)
    document.getElementsByTagName('body')[0].append(p)
}

function inefficientFibonacci(num) {
    let a = 1, b = 0, tmp = null
    while (num > 0){
        tmp = a
        a = a + b
        b = tmp
        num--
    }
    return b
}

let round = 0
let fib = awork(inefficientFibonacci, {keepAlive: false})

setInterval(() => {
    Promise.all(
        [...Array(10)].map((v, i) => fib(i + round))
    )
        .then(num => print(`Fibonacci numbers:`, num.join(', ')))
        .catch(error => console.error(error))
    round += 10
}, 1000)
