// Karma configuration file
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine', 
      'webpack',
    ],
    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-sourcemap-loader'),
    ],
    files: [
      { pattern: 'test/test.ts', watched: false }
    ],
    preprocessors: {
      "test/test.ts": ['webpack'],
      "**/*.js": ['sourcemap']
    },
    webpack: {
      // webpack configuration
      devtool: 'inline-source-map',
      output: {
        path: path.join(__dirname, 'temp'),
        clean: true,
      },
      resolve: {
        extensions: ['.ts', '.js'],
        //symlinks: true
      },
      module: {
        rules: [
          {
            test: /\.ts$/i,
            loader: 'ts-loader', 
          },
        ]
      }  
    },
    client: {
      jasmine: {
        // configuration options for Jasmine
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      //dir: require('path').join(__dirname, './coverage/jinqu-ng-http'),
      //subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    //browsers: ['Chrome'],
    browsers: ["ChromeHeadless"],
    singleRun: false,
    restartOnFileChange: true,

    // debug
    customLaunchers: {
      ChromeHeadless: {
          base: 'Chrome',
          flags: [
              "--no-sandbox",
              //"--user-data-dir=/tmp/chrome-test-profile",
              "--disable-web-security",
              //"--remote-debugging-address=0.0.0.0",
              "--remote-debugging-port=9222",
          ],
          debug: true,
      }
    }

  });
};
