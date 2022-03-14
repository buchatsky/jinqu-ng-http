// Karma configuration file

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [
      'jasmine', 
      'karma-typescript'
    ],
    plugins: [
      require('karma-typescript'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    files: [
      'test/test-init.ts',
      'lib/**/*.ts',
      'index.ts',
      'test/**/*.spec.ts'
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/ ,
        transforms: [require("karma-typescript-es6-transform")()]
      },
      compilerOptions: {
        module: "commonjs"
      },
      include: [
        "test/**/*.ts"
      ]
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
      //dir: require('path').join(__dirname, './coverage/ng12-hello'),
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

    customLaunchers: {
      ChromeHeadless: {
          base: 'Chrome',
          flags: [
              //"--no-sandbox",
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
