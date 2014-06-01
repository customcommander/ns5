(function () {

/**
 * Returns the corresponding validator for a given key in a schema.
 * @private
 */
function get_validator(schema, key) {
    return schema[key] || function () {
        return true; };
}

/**
 * NS5 Validation Class
 *
 * @class NS5
 * @constructor
 * @param schema {Object} The validation schema.
 */
function NS5(schema) {
    if ( !NS5.isObject(schema) ) {
        throw new TypeError('NS5: schema is not an object');
    }
    this._schema = schema;
}

/**
 * Checks whether a thing is an object.
 *
 * @method isObject
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isObject = function (thing) {
    return Object.prototype.toString.call(thing) === '[object Object]';
};

/**
 * Checks whether a thing is valid.
 *
 * If `thing` is not an object, NS5 automatically passes the test. If NS5 doesn't
 * know how to check a value it assumes the value is correct.
 *
 * @example
 *    var ns5 = new NS5({
 *        foo: function (val) {
 *            return val === 'bar';
 *        }
 *    });
 *
 *    ns5.test(99);
 *    //=> true
 *
 *    ns5.test({ foo: 'xxx' });
 *    //=> false
 *
 *    ns5.test({ foo: 'bar' });
 *    //=> true
 *
 *    ns5.test({ xxx: 'yyy' });
 *    //=> true
 *
 * @method test
 * @param thing {Object}
 * @return {Boolean}
 */
NS5.prototype.test = function (thing) {

    var validator, key;

    if ( !NS5.isObject(thing) ) {
        return true;
    }

    for (key in thing) {
        validator = get_validator(this._schema, key);
        if ( !validator(thing[key]) ) {
            return false;
        }
    }

    return true;
};

window.NS5 = NS5;

}());