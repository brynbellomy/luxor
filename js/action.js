var Rx = require('rx');
function action(target) {
    var oldFn = target;
    var rx_action = new Rx.Subject();
    var newFn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var retval = oldFn.apply(void 0, args);
        rx_action.onNext(retval);
        return retval;
    };
    newFn.rx_action = rx_action.asObservable();
    return newFn;
}
exports.action = action;
function asyncAction(target) {
    var oldFn = target;
    var rx_action = new Rx.Subject();
    var newFn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return oldFn.apply(void 0, args).then(function (val) {
            rx_action.onNext(val);
            return val;
        });
    };
    newFn.rx_action = rx_action.asObservable();
    return newFn;
}
exports.asyncAction = asyncAction;
//# sourceMappingURL=action.js.map