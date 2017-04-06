## Awork
Awork is an experimental library meant to simplify Web Workers usage.
Just wrap or decorate any heavy method you want to run in a separate process and work with it in a usual async way.

### Installation

Via npm:

```
$ npm install awork --save
```

### Basic Example:

As a decorator:

```javascript
const awork = require('awork').default
// Or for ES2015 modules:
import awork

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

```

As a wrapper:


## Error handling
Any thrown errors from the worker will be propagated as a rejected Promise.
