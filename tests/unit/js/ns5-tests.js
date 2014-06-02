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