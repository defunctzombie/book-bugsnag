var http = require('http');
var url = require('url');
var xtend = require('xtend');
var bugsnag = require('bugsnag');

// level is a numeric value for book from [0, 5]
// panic, error, warning, info, debug, trace
var snag_levels = ['error', 'error', 'warning', 'info', 'info', 'info'];

module.exports = function(uri, opt) {
    opt = opt || {};

    var conn_info = url.parse(uri);
    var key = conn_info.path.slice(1);

    bugsnag.register(key, {
        notifyHost: conn_info.hostname,
        notifyPort: conn_info.port
    });

    // we will ignore anything above this level
    var ignore_levels = opt.ignore_levels || 2;

    function report(err, extra) {
        return bugsnag.notify(err, extra, function(err) {
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

        var extra = extra;
        extra.severity = lvl;

        for (var idx=0 ; idx < arguments.length ; ++idx) {
            var arg = arguments[idx];

            // http interface handling
            if (arg instanceof http.IncomingMessage) {
                extra.req = arg;
            }
            // error will be handled below
            // only allowed as first argument
            else if (arg instanceof Error) {
                continue;
            }
            // if user passed an object, then capture extra fields
            else if (arg instanceof Object) {
                extra = xtend(extra, arg);
            }
        }

        // if the first argument is an error, capture it as the error interface
        if (arguments[0] instanceof Error) {
            var err = arguments[0];

            // if error object has extra things attached, grab those too
            if (Object.keys(err).length > 0) {
                extra.error = err;
            }

            return report(err, extra);
        }

        return report(err, extra);
    }
}
