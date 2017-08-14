## Awork

### The simplest way to execute code in Web Worker process

Awork is a small experimental library meant to simplify Web Workers usage in some cases.
Just wrap or decorate your function with `awork` and continue using it in a usual async way.
However, be aware of some limitations:


### Limitations
 - **Only pure functions without side effects and external dependencies can be wrapped at the moment. All necessary data should be passed to this function via arguments.**
 - **The function should return computed value, which then will be used to fulfill the promise.**
 - **Polyfilled features will not work correctly inside a web worker process due to external dependencies. For example, Promise polyfills will refer to variables outside the function scope, like _es6Promise (es6-promise) or _promise2 (babel-polyfill).**
 - **If you are using awork as a decorator for a class method, remember that `this` inside the method doesn't refer to the class instance.**

### Installation

Via npm:

```
$ npm install awork --save
```

### Basic examples:

As a decorator:

```javascript
import awork from 'awork'

class ClassWithFibonacciNumbers {
    @awork()
    getFibonacciNumber(num) {
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

let instance = new ClassWithFibonacciNumbers()
instance.getFibonacciNumber(100)
    .then((res) => console.log('100th number:', res))
    .catch((err) => console.error(err))

```

As a wrapper:

```javascript
import awork from 'awork'

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

let fib = awork(inefficientFibonacci)
Promise.all(
    [...Array(100)].map((v, i) => fib(i))
)
    .then(num => print(`First 100 Fibonacci numbers:`, num.join(', ')))
    .catch(error => console.error(error))

```

## Error handling
All errors from web worker will propagate back to the main process and lead to Promise rejection:

```javascript
const awork = require('awork')

function parseJSON(str) {
    return JSON.parse(str)
}

awork(parseJSON)('{not even close to valid JSON}')
    .then(() => console.log('Surprise'))
    .catch((err) => console.log('Well, it was expected:', err))
```

## Options

Creating a new web worker every call is quite expensive, that's why awork keeps and reuses the same instance by default. But if you are going to call your function only once or twice - you can notify awork that there is no need to keep this web worker instance alive. To do this, pass `{keepAlive: false}` to awork:

```javascript
//Config decorator
@awork({keepAlive: false})
fn (args) {
    // ...
}

//Config wrapper
let afn = awork(fn, {keepAlive: false})
```

## Examples
To run examples locally, use:
 1. Run `yarn run build:examples && yarn run start:examples`
 2. Open http://127.0.0.1:8080 to explore examples folder.
