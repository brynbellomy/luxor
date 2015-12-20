var Rx = require('rx');
function debugSubscriber(prefix, debugLogging, stackTraces) {
    if (debugLogging === void 0) { debugLogging = false; }
    if (stackTraces === void 0) { stackTraces = false; }
    return {
        next: function (val) {
            console.log("[" + prefix + ": next] =>", val);
            if (stackTraces === true) {
                console.trace();
            }
        },
        error: function (err) {
            console.error("[" + prefix + ": error] =>", err, err.stack);
            if (stackTraces === true) {
                console.trace();
            }
            throw err;
        },
        completed: function () {
            console.log("[" + prefix + ": completed] =>|");
            if (stackTraces === true) {
                console.trace();
            }
        }
    };
}
exports.debugSubscriber = debugSubscriber;
function debugObserver(prefix, debugLogging, stackTrace) {
    if (debugLogging === void 0) { debugLogging = false; }
    if (stackTrace === void 0) { stackTrace = false; }
    var subsc = debugSubscriber(prefix, debugLogging, stackTrace);
    return Rx.Observer.create(subsc.next, subsc.error, subsc.completed);
}
exports.debugObserver = debugObserver;
function rx_log(signal, label) {
    return signal.doOnNext(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        console.log.apply(console, [label].concat(args));
    });
}
exports.rx_log = rx_log;
function rx_logicalAnd() {
    var signals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        signals[_i - 0] = arguments[_i];
    }
    return (_a = Rx.Observable).combineLatest.apply(_a, signals.concat([function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return args.reduce(function (a, b) { return a && b; });
    }]));
    var _a;
}
exports.rx_logicalAnd = rx_logicalAnd;
//# sourceMappingURL=utils.js.map