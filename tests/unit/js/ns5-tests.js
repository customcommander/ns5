YUI.add('ns5-tests', function (Y) {

var suite = new Y.Test.Suite('NS5 tests suite');

suite.add(new Y.Test.Case({

    name: 'new NS5(schema)',

    'should throw an error if schema is not an object': function () {

        function assert_it_throws(bad_schema) {
            var bad_call = Y.bind(NS5, null, bad_schema);
            var msg = Y.Lang.sub("a schema of type '{type}' should have failed", { type: Y.Lang.type(bad_schema)});
            Y.Assert.throwsError(TypeError, bad_call, msg);
        }

        assert_it_throws();
        assert_it_throws(null);
        assert_it_throws([]);
        assert_it_throws(1);
        assert_it_throws(true);
        assert_it_throws(NaN);
        assert_it_throws(Infinity);
        assert_it_throws("");
        assert_it_throws("foo");
        assert_it_throws(function () {});
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

    'should receive the value to test as the first argument': function () {
        var mock = Y.Mock({ foo: function () {} });
        var ns5  = new NS5(mock);

        Y.Mock.expect(mock, {
            method: 'foo',
            args: [1]
        });

        ns5.test({ foo: 1 });
        Y.Mock.verify(mock);
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

        var fn_name = Y.guid('test'), ns5;

        NS5.register(fn_name, function () {
            return Y.Array(arguments).join(',') === 'foo,bar,baz';
        }, ['bar', 'baz']);

        ns5 = new NS5({ foo: NS5[fn_name] });

        Y.Assert.isTrue( ns5.test({ foo: 'foo' }) );
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

Y.Test.Runner.add(suite);

});