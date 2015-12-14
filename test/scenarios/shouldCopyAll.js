module.exports = {
    setup: {
        source: {
            a: 'c'
        }
    },


    sewConfig: {
        'dest/#*': 'source/#*'
    },


    resultPath: 'dest',


    result: {
        dest: {
            a: 'c'
        }
    }
}

