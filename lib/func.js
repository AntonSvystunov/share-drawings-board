var parseJSON = function(s) {
    try {
        return JSON.parse(s);
    } catch(e) {
        return null;
    }
};

var log = function() {
    var isErrorMessage = false;
    if (typeof(arguments[0]) == 'boolean') {
        isErrorMessage = arguments[0];
    } else {
        console.log('[' + (new Date()).toUTCString() + '] ' + arguments[0].toString());
    }

    for (var i = 1; i < arguments.length; i++) {
        if (isErrorMessage) {
            console.error('[' + (new Date()).toUTCString() + '] ' + arguments[i].toString());
        } else {
            console.log('[' + (new Date()).toUTCString() + '] ' + arguments[i].toString());
        }
    }
};

module.exports = {
    'parseJSON': parseJSON,
    'log': log
};