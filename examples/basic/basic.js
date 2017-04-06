import awork from '../../../build/awork.js'

function fibonacci(num) {
    let a = 1, b = 0, tmp
    while (num > 0){
        tmp = a
        a = a + b
        b = tmp
        num--
    }
    return b
}

let f = awork(fibonacci)
f(50)
    .then(num => console.log('50th number:', num))
    .catch(error => console.error(error))
