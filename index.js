var http = require('http');
var url = require('url');
var xtend = require('xtend');
var bugsnag = require('bugsnag');

// level is a numeric value for book from [0, 5]
// panic, error, warning, info, debug, trace
var snag_levels = ['error', 'error', 'warning', 'info', 'info', 'info'];

module.exports = function(uri, opt) {
    if (!uri) {
        return function() {};
    }

    opt = opt || {};

    var conn_info = url.parse(uri, true);
    var key = conn_info.pathname.slice(1);

    var config = conn_info.query || Object.create(null);

    config.notifyHost = conn_info.hostname;
    config.notifyPort = conn_info.port;

    // by defualt, do not turn on the automatic notification stuff
    // let the user handle uncaught exceptions
    // the reason for this is to avoid domains which are shit
    config.autoNotify = config.autoNotify || false;

    bugsnag.register(key, config);

    // we will ignore anything above this level
    var ignore_levels = opt.ignore_levels || 2;

    function report(err, opt) {
        return bugsnag.notify(err, opt, function(err) {
            if (err) {
                console.error(err);
            }
        });
    }

    return function() {
        var self = this;

        // default is error
        var lvl = 'error';
        if (self.level < snag_levels.length) {
            lvl = snag_levels[self.level];
        }

        // ignore anything below warning
        if (self.level > ignore_levels) {
            return;
        }

        var extra = xtend({}, self);
        delete extra.level;
        delete extra.hostname;

        var opt = {};
        opt.severity = lvl;
        opt.metadata = {};
        opt.book = extra;

        for (var idx=0 ; idx < arguments.length ; ++idx) {
            var arg = arguments[idx];

            // http interface handling
            if (arg instanceof http.IncomingMessage) {
                opt.req = arg;
            }
            // error will be handled below
            // only allowed as first argument
            else if (arg instanceof Error) {
                continue;
            }
            // if user passed an object, then capture extra fields
            else if (arg instanceof Object) {
                opt.metadata = xtend(opt.metadata, arg);
            }
        }

        // if the first argument is an error, capture it as the error interface
        if (arguments[0] instanceof Error) {
            var err = arguments[0];

            // if error object has extra things attached, grab those too
            if (Object.keys(err).length > 0) {
                opt.metadata.error = err;
            }

            return report(err, opt);
        }

        return report(arguments[0], opt);
    }
}
