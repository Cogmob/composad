var c = require('../composad');
var composad = c.makeComposad();
var maybe = c.maybe;
var pipe = c.pipe;
var writer = c.writer;
var pipeIf = c.pipeIf;
var pipeIfElse = c.pipeIfElse;
var pipeSwitch = c.pipeSwitch;
var equal = c.equal;
var echo = c.echo;
var expect = require('chai').expect;
var map = require('ramda').map;

// console.log(JSON.stringify());

describe('composad', function() {
    it('should just run the function', function() {
        var getResultString = function() {
            return 'correct result';
        };
        expect(pipe(composad.bind(getResultString))(null)).to.equal('correct result');
    });
});

describe('maybe', function() {
    it('should recognise when a value is given', function() {
        var hasValue = maybe.hasValue({
            value: 1
        });
        expect(hasValue).to.be.true;
    });

    it('should recognise a value wrapped with unit', function() {
        var hasValue = maybe.hasValue(maybe.unit(1));
        expect(hasValue).to.be.true;
    });

    it('should return the value with correct math', function() {
        var result = maybe.bind(function(i) {
            return {
                value: i
            };
        }, maybe.unit(1));

        expect(result.value).to.equal(1);
        expect(result).to.not.have.property('hasValue');
    });

    it('should return null with incorrect math', function() {
        var result = maybe.bind(function(i) {
            return {
                hasValue: false
            };
        }, maybe.unit(1));

        expect(result.hasValue).to.be.false;
        expect(result).to.not.have.property('value');
    });
});

describe('writer', function() {
    it('should wrap correctly', function() {
        expect(writer.unit(1)).to.deep.equal({
            value: 1,
            logs: {}
        });
    });

    it('should preserve log with bind', function() {
        var result = writer.bind(
            function(i) {
                return {
                    value: 1,
                    logs: {}
                };
            },
            {
                value: 1,
                logs: {
                    preserved: ['yes']
                }
            }
        );
        expect(result).to.deep.equal({
            value: 1,
            logs: {
                preserved: ['yes']
            }
        });
    });

    it('should concat logs', function() {
        var result = writer.bind(
            function(i) {
                return {
                    value: 1,
                    logs: {
                        log: ['two']
                    }
                };
            },
            {
                value: 1,
                logs: {
                    log: ['one']
                }
            }
        );
        expect(result).to.deep.equal({
            value: 1,
            logs: {
                log: ['one', 'two']
            }
        });
    });
});

describe('pipeIf', function() {
    it('should run the function', function() {
        expect(pipeIf(function() {return true;}, function() {
            return 'hey';
        })()).to.equal('hey');
    });

    it('should run in a composad chain', function() {
        var result = pipe(
            echo('asdf'),
            pipeIf(
                equal('asdf'),
                echo('correct')
            )
        )();
        expect(result).to.equal('correct');
    });

    it('should not run in a composad chain', function() {
        var result = pipe(
            echo('asdf'),
            pipeIf(
                equal('not equal'),
                echo('correct')
            )
        )();
        expect(result).to.equal('asdf');
    });
});

describe('pipeIfElse', function() {
    it('should run the true function', function() {
        expect(pipeIfElse(
            function() {return true;},
            [function() {return 'hey';}],
            [function() {}]
        )()).to.equal('hey');
    });

    it('should run the false function', function() {
        expect(pipeIfElse(
            function() {return false;},
            [function() {}],
            [function() {return 'other';}]
        )()).to.equal('other');
    });

    it('should run in a composad chain', function() {
        var result = pipe(
            echo('asdf'),
            pipeIfElse(
                equal('asdf'),
                [echo('correct')],
                [echo('incorrect')]
            )
        )();
        expect(result).to.equal('correct');
    });

    it('should not run in a composad chain', function() {
        var result = pipe(
            echo('asdf'),
            pipeIfElse(
                equal('not equal'),
                [echo('incorrect')],
                [echo('correct')]
            )
        )();
        expect(result).to.equal('correct');
    });
});

describe('pipeSwitch', function() {
    it('should run the first function', function() {
        expect(pipeSwitch(
            function() {return 'one';},
            {
                'one': [function() {return 'hey';}],
                'two': [function() {}]
            }
        )()).to.equal('hey');
    });

    it('should run the second function', function() {
        expect(pipeSwitch(
            function() {return 'two';},
            {
                'one': [function() {}],
                'two': [function() {return 'hey';}]
            }
        )()).to.equal('hey');
    });

    it('should run in a composad chain', function() {
        var result = pipe(
            echo('one'),
            pipeSwitch(
                function() {return 'one';},
                {
                    'one': [echo('correct')],
                    'two': [echo('incorrect')]
                }
            )
        )();
        expect(result).to.equal('correct');
    });

    it('should not run in a composad chain', function() {
        var result = pipe(
            echo('correct'),
            pipeSwitch(
                function() {return 'no match';},
                {
                    'one': [echo('one')],
                    'two': [echo('two')]
                }
            )
        )();
        expect(result).to.equal('correct');
    });
});

