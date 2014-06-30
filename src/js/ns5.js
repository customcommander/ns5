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
 * Returns an array with the parameters names of given function.
 *
 * @example
 *     function foo(a, b) {}
 *     get_function_signature(foo);
 *     //=> ['a', 'b']
 *
 * @param func {Function} The function to analyze.
 * @return {Array} An array of parameters names.
 * @private
 */
function get_function_signature(func) {
    var params = func.toString().match( /^function.+?\(([\s\S]*?)\)\s*\{/ );
    params = params[1].match( /(\w+)/g );
    return params ? params : [];
}

/**
 * Transforms an arguments object to be a key/value pairs object as opposed to an index based array.
 *
 * @example
 *     function foo(a, b) {
 *         map_arguments(arguments, foo);
 *         //=> { a: 1000, b: 2000 }
 *     }
 *     foo(1000, 2000);
 *
 * @param args {Arguments}
 * @param func {Function}
 * @return {Object}
 * @private
 */
function map_arguments(args, func) {

    var ret = {},
        sig = get_function_signature(func),
        i;

    for ( i = 0 ; i < args.length; i++ ) {
        ret[ sig[i] ] = args[i];
    }

    return ret;
}

/**
 * NS5 Validation Class
 *
 * NS5 validates objects with the help of a schema.
 *
 * A schema is a key/function pairs object where `key` is the name of a property
 * and `function` a function that will test its value.
 * There must be one pair for each property that requires validation
 *
 * If `function` returns false then the value of `key` is deemed invalid and the
 * whole validation process fails. When NS5 encounters a property that doesn't
 * exist in the schema it automatically validates its value.
 * Meaning that if you don't care about a property you don't have to include it in the schema.
 *
 * @example
 *     var user_validator = new NS5({
 *         age: function (value) {
 *             return value >= 21;
 *         }
 *     });
 *
 *     // passes
 *     user_validator.test({
 *         name: 'john doe',
 *         age: 37
 *     });
 *
 *     // fails
 *     user_validator.test({
 *         name: 'peter pan',
 *         age: 12
 *     });
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
 * Checks whether a thing is a number.
 *
 * Please note that this function will return true for `NaN`, `Infinity` and `-Infinity`.
 *
 * @method isNumber
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isNumber = function (thing) {
    return typeof thing === 'number';
};

/**
 * Checks whether a thing is a finite number. (i.e. a number that is neither `NaN`, `Infinity` or `-Infinity`)
 *
 * @example
 *      NS5.isNumber(NaN);       //true
 *      NS5.isFiniteNumber(NaN); //false
 *
 * @method isFiniteNumber
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isFiniteNumber = function (thing) {
    return typeof thing === 'number' && isFinite(thing);
};

/**
 * Checks whether a thing is a date.
 *
 * @method isDate
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isDate = function (thing) {
    return Object.prototype.toString.call(thing) === '[object Date]';
};

/**
 * Checks whether a thing is an arguments object.
 *
 * @method isArguments
 * @param thing {Any} The value to test.
 * @return {Boolean}
 * @static
 */
NS5.isArguments = function (thing) {
    return Object.prototype.toString.call(thing) === '[object Arguments]';
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

    NS5[fn_name] = function (val, key, data) {
        return fn.apply(null, [ val, key, data ].concat(args));
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
 * @param thing {Object|Arguments}
 * @param [func] {Function}
 * @return {Boolean}
 */
NS5.prototype.test = function (thing, func) {

    var validator, key;

    if ( NS5.isArguments(thing) ) {
        if ( NS5.isFunction(func) ) {
            thing = map_arguments(thing, func);
        }
    }

    if ( !NS5.isObject(thing) ) {
        return true;
    }

    for (key in thing) {
        validator = get_validator(this._schema, key);
        if ( validator(thing[key], key, thing) !== true ) {
            return false;
        }
    }

    return true;
};

window.NS5 = NS5;

}());