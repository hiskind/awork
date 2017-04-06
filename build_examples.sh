#!/bin/bash

echo 'Build awork'
npm run build

echo 'Build decorator example'
./node_modules/.bin/babel ./examples/decorator/decorator.js -o ./examples/decorator/build/decorator.js
./node_modules/.bin/browserify ./examples/decorator/build/decorator.js -o ./examples/decorator/build/decorator.js

echo 'Build basic example'
./node_modules/.bin/babel ./examples/basic/basic.js -o ./examples/basic/build/basic.js
./node_modules/.bin/browserify ./examples/basic/build/basic.js -o ./examples/basic/build/basic.js
