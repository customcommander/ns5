(function () {

/**
 * Returns the corresponding validator for a given key in a schema.
 * @private
 */
function get_validator(schema, key) {

    var validator = schema[key];

    // if there is no validator for a value create one that automatically passes
    if (typeof validator === 'undefined') {
        return function () {
            return true;
        };
    }

    // if validator is not a function assume it is the name of a registered validator:
    // e.g. 'isString' ~> NS5.isString
    // otherwise create a validator that passes if and only if the value is the same
    // as the validator value:
    // e.g. '5' ~> function (val) { return val === '5'; }
    if (!NS5.isFunction(validator)) {
        validator = NS5[validator] ? NS5[validator] : function (val) {
            return schema[key] === val;
        };
    }

    return validator;
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
 * Checks whether a thing is a string.
 *
 * @method isString
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isString = function (thing) {
    return typeof thing === 'string';
};

/**
 * Checks whether a thing is a boolean.
 *
 * @method isBoolean
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isBoolean = function (thing) {
    return thing === true || thing === false;
};

/**
 * Checks whether a thing is a function.
 *
 * @method isFunction
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isFunction = function (thing) {
    return typeof thing === 'function';
};

/**
 * Checks whether a thing is an array
 *
 * @method isArray
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isArray = Array.isArray || function (thing) {
    return Object.prototype.toString.call(thing) === '[object Array]';
};

/**
 * Registers a validator globally.
 *
 * @method register
 * @param fn_name {String} The validator name.
 * @param fn {Function} The validator function itself.
 * @param [args] {Array} Additional parameters to pass on to the validator.
 * @static
 */
NS5.register = function (fn_name, fn, args) {

    fn_name = NS5.isString(fn_name) ? fn_name : null;
    fn      = NS5.isFunction(fn)    ? fn      : null;
    args    = NS5.isArray(args)     ? args    : [];

    // bail if validator details are wrong or already exist.
    if (!fn_name || !fn || NS5[fn_name]) {
        return false;
    }

    NS5[fn_name] = function (val) {
        return fn.apply(null, [val].concat(args));
    };

    return NS5[fn_name];
};

/**
 * Checks whether a thing is valid.
 *
 * If `thing` is not an object, NS5 automatically passes the test. If NS5 doesn't
 * know how to check a value it assumes the value is correct.
 *
 * @example
 *     var ns5 = new NS5({
 *         foo: function (val) {
 *             return val === 'bar';
 *         }
 *     });
 *
 *     ns5.test(99);
 *     //=> true
 *
 *     ns5.test({ foo: 'xxx' });
 *     //=> false
 *
 *     ns5.test({ foo: 'bar' });
 *     //=> true
 *
 *     ns5.test({ xxx: 'yyy' });
 *     //=> true
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
        if ( validator(thing[key]) !== true ) {
            return false;
        }
    }

    return true;
};

window.NS5 = NS5;

}());