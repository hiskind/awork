module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: [
      './src/*.js',
      './test/*.js'
    ],
    exclude: [
    ],
    preprocessors: {
        'src/*.js': ['browserify'],
        'test/*.js': ['browserify']
    },
    browserify: {
        debug: true,
        configure: function(bundle) {
            bundle.once('prebundle', function() {
                bundle.transform('babelify', {
                    presets: ['env'],
                    plugins: [
                        "transform-decorators-legacy",
                        ["transform-es2015-modules-commonjs", {"loose": true}],
                    ]
                })
            })
        }
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox', 'Safari', 'IE', 'Opera'],
    singleRun: false,
    concurrency: Infinity
  })
}
