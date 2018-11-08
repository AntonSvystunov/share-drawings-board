/**
 * Represents a Message sent by app
 * @constructor
 * @param {string} status Status of response 'ok' or 'error'
 * @param {string} type  Type of message
 * @param {any} body Any data
 */

var Message = function(status, type, body) {
    this.status = status;
    this.type = type;
    this.body = body;
};

/**
 * Returns Message typed as error
 * @param {any} what Error message or any other object
 * @returns Message
 */
var getError = function(what) {
    return new Message('error', 'error', what);
};

/**
 * Returns Message typed as update
 * @param {string | Array} data Update data
 * @returns Message
 */
var getUpdate = function(data) {
    var msgBody = data instanceof Array ? data : [data];
    return new Message('ok', 'update', msgBody);
};

var getInit = function(data) {
    var msgBody = data instanceof Array ? data : [data];
    return new Message('ok', 'init', msgBody);
};

var getClear = function() {
    return new Message('ok', 'clear', null);
};

module.exports = {
    'Message': Message,
    'getError': getError,
    'getUpdate': getUpdate,
    'getInit': getInit,
    'getClear': getClear
};