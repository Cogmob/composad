var ramda = require('ramda');
var mapObjIndexed = ramda.mapObjIndexed;
var map = ramda.map;
var curry = ramda.curry;
var reduce = ramda.reduce;
var compose = ramda.compose;

function isFunction(object) {
    return object && getClass.call(object) == '[object Function]';
}

// All monads must implement name, unit, bind, canBeRemoved

exports.pipe = ramda.pipe;

exports.pipeIf = function(guardFunc) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return function(i) {
        if (guardFunc(i)) {
            return ramda.pipe.apply(this, args)(i);
        }
        return i;
    }
};

exports.pipeIfElse = function(guardFunc, trueArgs, falseArgs) {
    return function(i) {
        if (guardFunc(i)) {
            return ramda.pipe.apply(this, trueArgs)(i);
        }
        return ramda.pipe.apply(this, falseArgs)(i);
    }
}

exports.pipeSwitch = function(guardFunc, cases) {
    return function(i) {
        var key = guardFunc(i);
        if (cases.hasOwnProperty(key)) {
            return ramda.pipe.apply(this, cases[key])(i);
        }
        return i;
    }
}

exports.equal = curry(function(a, b) {
    return a === b ? true : false;
});

exports.makeComposad = function() {
    var monad = {};

    monad.monads = [];

    monad.unit = function(i) {
        return reduce(
            function(acc, mon) {
                return mon.unit(acc);
            },
            i,
            monad.monads
        );
    };

    monad.bind = curry(function(func, i) {
        return reduce(
            function(acc, mon) {
                return compose(mon.bind, acc);
            },
            func,
            monad.monads
        )(i);
    });

    monad.addMonad = function(m) {
        return function(i) {
            monad.monads.push(m);
            return m.unit(i);
        }
    };

    monad.removeMonad = function(i) {
        lastMonad = monad.monads.pop();
        if (!lastMonad.canBeRemoved) {
           throw 'monad '+m.name+' cannot be removed';
        }
        return i;
    };

    monad.tee = function(i) {
        return pro(monad.unit(i));
    }

    return monad;
}

exports.removeMonad = function() {
}

exports.bind = function(func) {
}

exports.echo = function (i) {
    return function() {
        return i;
    }
}

exports.result = {
    unit: function(i) {
        return {
            type: 'carry',
            value: i
        };
    },

    bind: curry(function(func, bound) {
        if (bound.type === 'result') {
            return bound.value;
        } else {
            return func(bound.value);
        }
    }),

    carry: function(i) {
        return {
            type: 'carry',
            value: i
        };
    },

    result: function(i) {
        return {
            type: 'result',
            value: i
        }
    }
};

exports.maybe = {
    unit: function(i) {
        if (i == null) {
            return {
                hasValue: false
            };
        }

        return {
            hasValue: true,
            value: i
        };
    },
    bind: function(func, i) {
        if (exports.maybe.hasValue(i)) {
            return func(i.value);
        }
        return {
            hasValue: false
        };
    },
    hasValue: function(i) {
        if (i.hasOwnProperty('value') && (!i.hasOwnProperty('hasValue') || i.hasValue)) {
            return true;
        }
        return false;
    }
};

exports.makeWrap = function (id) {
    var wrapFunc = {id: id};

    wrapFunc.unit = function(i) {
        return {
            id: id,
            val: i
        };
    };

    wrapFunc.bind = curry(function(func, bound) {
        pro(bound);
        return wrapFunc.unit(bound.val);
    });

    return wrapFunc;
}

exports.writer = {
    name: 'makeWriter',
    unit: function(i) {
        return {
            value: i,
            logs: {}
        }
    },
    bind: function(func, i) {
        var logs = i.logs;
        var result = func(i.value);
        return {
            logs: exports.writer.mergeLogs(logs, result.logs),
            value: result.value
        };
    },
    mergeLogs: function(log1, log2) {
        // make sure log1 has all the keys of log2
        mapObjIndexed(
            function(val, key) {
                if(!log1.hasOwnProperty(key)) {
                    log1[key] = [];
                }
            },
            log2
        );

        // concat both arrays
        return mapObjIndexed(
            function(val, key) {
                if (log2.hasOwnProperty(key)) {
                    return exports.writer.makeArray(val).concat(
                            exports.writer.makeArray(log2[key]));
                }
                return val;
            },
            log1
        );
    },
    makeArray: function(i) {
        if(i.constructor === Array) {
            return i;
        }
        return [i];
    }
}
