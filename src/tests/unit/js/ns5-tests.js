YUI.add('ns5-tests', function (Y) {

var suite = new Y.Test.Suite('NS5 tests suite');

suite.add(new Y.Test.Case({

    name: 'new NS5(schema)',

    'should throw an error if schema is not an object': function () {

        Y.Assert.throwsError(TypeError, function () { new NS5(null); },
            'new NS5(null) should have failed');

        Y.Assert.throwsError(TypeError, function () { new NS5([]); },
            'new NS5([]) should have failed');
    },

    'a validator can be the name of a known function': function () {
        var ns5 = new NS5({ foo: 'isString' });
        Y.Assert.isFalse( ns5.test({ foo: 1 }) );
    },

    'a validator can be a value': function () {

        var ns5;

        ns5 = new NS5({ foo: 'bar' });
        Y.Assert.isFalse(ns5.test({ foo: 1 })   , "expected to have failed because foo is not bar");
        Y.Assert.isTrue(ns5.test({ foo: 'bar' }), "expected to have succeeded because foo is bar");

        ns5 = new NS5({ foo: 0 });
        Y.Assert.isTrue(ns5.test({ foo: 0 }), "expected to have succeeded because foo is 0");

        ns5 = new NS5({ foo: false });
        Y.Assert.isTrue(ns5.test({ foo: false }), "expected to have succeeded because foo is false");

        ns5 = new NS5({ foo: 0 });
        Y.Assert.isFalse(ns5.test({ foo: '0' }), "value validator should use strict equality");
    }
}));

suite.add(new Y.Test.Case({

    name: 'validator function',

    'receive value, key and data as parameters (unregistered validator)': function () {

        var ns5;
        var args;
        var data = { foo: 1 };

        ns5 = new NS5({
            foo: function () {
                args = Y.Array(arguments);
            }
        });

        ns5.test(data);

        Y.ArrayAssert.itemsAreSame([ 1, 'foo', data ], args);
    },

    'receive value, key and data as parameters (registered validator)': function () {

        var ns5;
        var args;
        var fn_name = Y.guid('test');
        var data    = { foo: 1 };

        NS5.register(fn_name, function () {
            args = Y.Array(arguments);
        });

        ns5 = new NS5({ foo: fn_name });
        ns5.test(data);

        Y.ArrayAssert.itemsAreSame([ 1, 'foo', data ], args);
    },

    'should not return a truthy value to validate': function () {
        var ns5 = new NS5({
                foo: function () { return 1;       },
                bar: function () { return [];      },
                baz: function () { return "hello"; },
                bat: function () { return {};      }
            });
        Y.Assert.isFalse(ns5.test({ foo: 'xxx' }), "should have rejected 1");
        Y.Assert.isFalse(ns5.test({ bar: 'xxx' }), "should have rejected []");
        Y.Assert.isFalse(ns5.test({ baz: 'xxx' }), "should have rejected 'hello'");
        Y.Assert.isFalse(ns5.test({ bat: 'xxx' }), "should have rejected {}");
    }
}));

// Test case for when an array is used in a schema
suite.add(new Y.Test.Case({

    name: 'validator: array',

    init: function () {
        this.ns5 = new NS5({ foo: [ 'bar', '1' ] });
    },

    'validates if value is found in the array': function () {
        Y.Assert.isTrue( this.ns5.test({ foo: 'bar' }) );
    },

    'when searching for an element, use strict equality only': function () {
        Y.Assert.isFalse( this.ns5.test({ foo: 1 }));
    },

    'fails if value is not found in the array': function () {
        Y.Assert.isFalse( this.ns5.test({ foo: 'xxx' }) );
    }
}));

suite.add(new Y.Test.Case({

    name: 'built-in validators',

    'test: NS5.isObject': function () {

        Y.Assert.isTrue(NS5.isObject({})                , "expected '{}' to have succeeded");
        Y.Assert.isTrue(NS5.isObject(new function () {}), "expected 'new function () {}' to have succeeded");

        Y.Assert.isFalse(NS5.isObject(null)      , "expected 'null' to have failed");
        Y.Assert.isFalse(NS5.isObject([])        , "expected '[]' to have failed");
        Y.Assert.isFalse(NS5.isObject(new Date()), "expected 'new Date()' to have failed");
    },

    'test: NS5.isString': function () {
        Y.Assert.isTrue(NS5.isString("")  , "expected '' (empty string) to have succeeded");
        Y.Assert.isTrue(NS5.isString("hi"), "expected 'hi' to have succeeded");
        Y.Assert.isFalse(NS5.isString([]) , "expected '[]' to have failed");
    },

    'test: NS5.isFunction': function () {
        Y.Assert.isTrue(NS5.isFunction(function () {}), "expected 'function () {}' to have succeeded");
        Y.Assert.isFalse(NS5.isFunction([])           , "expected '[]' to have failed");
    },

    'test: NS5.isArray': function () {
        Y.Assert.isTrue(NS5.isArray([]) , "expected '[]' to have succeeded");
        Y.Assert.isFalse(NS5.isArray({}), "expected '{}' to have failed");
    },

    'test: NS5.isBoolean': function () {
        Y.Assert.isTrue(NS5.isBoolean(true) , "expected true to be a boolean");
        Y.Assert.isTrue(NS5.isBoolean(false), "expected false to be a boolean");

        Y.Assert.isFalse(NS5.isBoolean(1)  , "truthy 1 failure");
        Y.Assert.isFalse(NS5.isBoolean("1"), "truthy '1' failure");
        Y.Assert.isFalse(NS5.isBoolean([]) , "truthy [] failure");

        Y.Assert.isFalse(NS5.isBoolean(0)         , "falsy 0 failure");
        Y.Assert.isFalse(NS5.isBoolean("0")       , "falsy '0' failure");
        Y.Assert.isFalse(NS5.isBoolean(null)      , "falsy null failure");
        Y.Assert.isFalse(NS5.isBoolean(undefined) , "falsy undefined failure");
    },

    'test: NS5.isNumber': function () {
        Y.Assert.isTrue(NS5.isNumber(1)        , "expected 1 to be a number");
        Y.Assert.isTrue(NS5.isNumber(NaN)      , "expected NaN to be a number");
        Y.Assert.isTrue(NS5.isNumber(Infinity) , "expected Infinity to be a number");
        Y.Assert.isTrue(NS5.isNumber(-Infinity), "expected -Infinity to be a number");
        Y.Assert.isFalse(NS5.isNumber([])      , "an array is not a number");
        Y.Assert.isFalse(NS5.isNumber("1")     , "a number withing a string is not a number");
    },

    'test: NS5.isFiniteNumber': function () {
        Y.Assert.isTrue(NS5.isFiniteNumber(1)         , "expected 1 to be a number");
        Y.Assert.isFalse(NS5.isFiniteNumber(NaN)      , "expected NaN not to be a finite number");
        Y.Assert.isFalse(NS5.isFiniteNumber(Infinity) , "expected Infinity not to be a finite number");
        Y.Assert.isFalse(NS5.isFiniteNumber(-Infinity), "expected -Infinity not to be a finite number");
        Y.Assert.isFalse(NS5.isFiniteNumber([])       , "an array is not a number");
        Y.Assert.isFalse(NS5.isFiniteNumber("1")      , "a number withing a string is not a number");
    },

    'test: NS5.isDate': function () {
        Y.Assert.isFalse(NS5.isDate([])       , "an array is not a date");
        Y.Assert.isTrue(NS5.isDate(new Date()), "expected a date to be a date");
    },

    'test: NS5.isArguments': function () {
        var arr  = [ 1, 2, 3 ];
        var args = ( function (a, b, c) { return arguments; }(1, 2, 3) );
        Y.Assert.isFalse(NS5.isArguments(arr), 'expected [1,2,3] not be an arguments object');
        Y.Assert.isTrue(NS5.isArguments(args), 'expected arguments to be an arguments object');
    },

    'test: NS5.isNotEmptyString': function () {
        Y.Assert.isFalse(NS5.isNotEmptyString([])        , 'should have failed because thing is not a string');
        Y.Assert.isFalse(NS5.isNotEmptyString('')        , 'should have failed because thing is an empty string');
        Y.Assert.isFalse(NS5.isNotEmptyString(" \t\r\n "), 'should have failed because thing is a whitespace string');
        Y.Assert.isTrue(NS5.isNotEmptyString("\na b\t ") , 'should have succeeded because thing is not an empty string');
    }
}));

suite.add(new Y.Test.Case({

    name: 'NS5.register(fn_name, fn[, args])',

    'should fail if fn_name is not valid': function () {
        Y.Assert.isFalse(NS5.register([]), "expected '[]' to have failed");
        Y.Assert.isFalse(NS5.register(''), "expected '' (empty string) to have failed");
    },

    'should fail if fn is not valid': function () {
        var fn_name = Y.guid('test');
        Y.Assert.isFalse(NS5.register(fn_name, []), "expected '[]' to have failed");
    },

    'should fail if validator already exists': function () {

        var fn_name;

        Y.Assert.isFalse(NS5.register('isString', function () {}),
            "expected attempt at overriding default validator to have failed");

        fn_name = Y.guid('test');
        NS5.register(fn_name, function () {});

        Y.Assert.isFalse(NS5.register(fn_name, function () {}),
            "expected attempt at overriding custom validator to have failed");
    },

    'should register a custom validator': function () {
        var fn_name = Y.guid('test');
        NS5.register(fn_name, function () {});
        Y.Assert.isFunction(NS5[fn_name]);
    },

    'should pass registered arguments on to the validator': function () {

        var ns5;
        var args;
        var data = { foo: 1 };
        var fn_name = Y.guid('test');

        NS5.register(fn_name, function () {
            args = Y.Array(arguments);
        }, ['bar', 'baz']);

        ns5 = new NS5({ foo: fn_name });
        ns5.test(data);

        Y.ArrayAssert.itemsAreSame([ 1, 'foo', data, 'bar', 'baz' ], args);
    },

    'should be available for different instances': function () {

        var fn_name = Y.guid('test');

        NS5.register(fn_name, function () {
            return true;
        });

        Y.Assert.isTrue( ( new NS5({ foo: fn_name }) ).test({ foo: 1 }),
            'expected success for the 1st instance');

        Y.Assert.isTrue( ( new NS5({ foo: fn_name }) ).test({ foo: 1 }),
            'expected success for the 2nd instance');
    }
}));

suite.add(new Y.Test.Case({

    name: '.test(thing)',

    'should pass if thing is not an object': function () {
        var ns5 = new NS5({});
        Y.Assert.isTrue(ns5.test("foobar"));
    },

    'should fail if thing is not valid': function () {
        var ns5 = new NS5({
            foo: function () {
                return false; // automatically fails foo
            },
            bar: function () {
                return true; // automatically passes bar
            }
        });
        Y.Assert.isFalse(ns5.test({ foo: 1, bar: 1 }));
    },

    'should pass if thing is valid': function () {
        var ns5 = new NS5({
            foo: function () {
                return true; // automatically passes foo
            }
        });
        Y.Assert.isTrue(ns5.test({ foo: 1 }));
    },

    'unknown data automatically pass': function () {
        var ns5 = new NS5({
            foo: function () {
                return false;
            }
        });
        Y.Assert.isTrue(ns5.test({ xxx: 1 }));
    }
}));

suite.add(new Y.Test.Case({

    name: '.test(thing, func) - method signature',

    'should map thing according to its function signature': function () {

        var baz;

        function foo(/*int*/a, /*int*/b, /*int*/c) {
            var robot = new NS5({ a: 10, b: 20, c: 30 });
            return robot.test(arguments, foo);
        }

        function
            bar (
                a,        /* integer */
                    b,    /* integer */
                        c /* integer */
                )
        {
            var robot = new NS5({ a: 15, b: 30, c: 45 });
            return robot.test(arguments, bar);
        }

        baz = function(a,b,c){
            var robot = new NS5({ a: 20, b: 40, c: 60 });
            return robot.test(arguments, baz);
        };

        // test() returns true for anything that is not an object.
        // therefore it can return true for an arguments that couldn't have been
        // mapped with its originating function signature.
        // If it returns false then it means that arguments has been mapped
        // correctly but one of its value ('xyz') is not valid.
        Y.Assert.isFalse(foo(10, 20, 'xyz'), 'foo failure');
        Y.Assert.isFalse(bar(15, 30, 'xyz'), 'bar failure');
        Y.Assert.isFalse(baz(20, 40, 'xyz'), 'baz failure');
    },

    'should try using `arguments.callee` if function is not provided': function () {

        function foo(a, b, c) {
            var robot = new NS5({a: 10, b: 20, c: 30 });
            return robot.test(arguments);
        }

        Y.Assert.isFalse(foo(10, 20, 'panda'));
    }
}));

suite.add(new Y.Test.Case({

    name: '.pick(thing)',

    _should: {
        ignore: {
            // @TODO This test fails when running on Node.js/Windows. Why?
            'throws an error when using `arguments` in strict mode': (Y.UA.os === 'windows')
        }
    },

    'should return thing if it is not an object': function () {

        var ns5 = new NS5({ a: 1 });
        var arr = [1,2];

        Y.Assert.areSame(arr, ns5.pick(arr)  , 'should have returned an array');
        Y.Assert.areSame(null, ns5.pick(null), 'should have returned null');
    },

    'the object that is returned only contains valid values': function () {

        var ns5;
        var ret;

        ns5 = new NS5({
            a: 1,
            b: 'isString',
            c: function (val) {
                return val === 'c';
            }
        });

        ret = ns5.pick({
            a: 1,
            b: 'foo',
            c: 'c',
            z: 100
        });

        Y.ArrayAssert.itemsAreSame(Y.Object.keys(ret)  , ['a', 'b', 'c', 'z'], 'test #1');
        Y.ArrayAssert.itemsAreSame(Y.Object.values(ret), [1, 'foo', 'c', 100], 'test #2');

        ret = ns5.pick({
            a: 999,
            b: [],
            c: 'xxx',
            z: 123456
        });

        Y.ArrayAssert.itemsAreSame(Y.Object.keys(ret)  , ['z']   , 'test #3');
        Y.ArrayAssert.itemsAreSame(Y.Object.values(ret), [123456], 'test #4');
    },

    'can accept `arguments`': function () {

        var ret;
        var ns5 = new NS5({
            a: 1,
            b: 'isString',
            c: function (val) { return val === 'c'; }
        });

        function foo(
            a  , /* param a */
            b  , /* param b */
            c    /* param c */ ) {
            return ns5.pick(arguments);
        }

        ret = foo(1, 'xxx', []);

        Y.ArrayAssert.itemsAreSame(Y.Object.keys(ret)  , ['a', 'b'], 'keys failure');
        Y.ArrayAssert.itemsAreSame(Y.Object.values(ret), [1, 'xxx'], 'values failure');
    },

    'throws an error when using `arguments` in strict mode': function () {

        var ns5 = new NS5({
            a: 1
        });

// Looks like the "use strict" pragma doesn't work if it is indented. Weird.
        function foo(a) {
"use strict";
            return ns5.pick(arguments);
        }

        Y.Assert.throwsError(Error, function () {
            foo([]);
        });
    }
}));

Y.Test.Runner.add(suite);

});