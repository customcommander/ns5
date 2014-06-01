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

    name: 'built-in validators',

    'test: NS5.isObject': function () {

        Y.Assert.isTrue(NS5.isObject({})                , "expected '{}' to have succeeded");
        Y.Assert.isTrue(NS5.isObject(new function () {}), "expected 'new function () {}' to have succeeded");

        Y.Assert.isFalse(NS5.isObject(null)      , "expected 'null' to have failed");
        Y.Assert.isFalse(NS5.isObject([])        , "expected '[]' to have failed");
        Y.Assert.isFalse(NS5.isObject(new Date()), "expected 'new Date()' to have failed");
    }
}));

Y.Test.Runner.add(suite);

});