(function () {

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

window.NS5 = NS5;

}());