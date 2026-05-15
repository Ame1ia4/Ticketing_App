module.exports = {

    testEnvironment: 'jsdom',

    setupFilesAfterEnv: [
        '<rootDir>/setup.js'
    ],

    collectCoverage: true,

    coverageDirectory: 'coverage',

    collectCoverageFrom: [

        '../assets/js/*.js',

        '!../assets/js/config.js'
    ]
};