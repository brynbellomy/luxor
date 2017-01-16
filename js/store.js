var _ = require('lodash');
var Rx = require('rx');
var Store = (function () {
    function Store(initialState) {
        var _this = this;
        this.rx_destructorDisposable = new Rx.CompositeDisposable();
        this.rx_observableState = new Rx.ReplaySubject(1);
        this._state = initialState;
        setTimeout(function () { return _this.emitNewState(); }, 0);
    }
    Object.defineProperty(Store.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    Store.prototype.listenToStore = function (store, callback) {
        var disposable = store.rx_observableState.startWith(store.state)
            .subscribeOnNext(function (newState) { return callback(newState); });
        this.rx_destructorDisposable.add(disposable);
    };
    Store.prototype.listenToStores = function (stores, callback) {
        var stateSignals = stores.map(function (store) {
            return store.rx_observableState.startWith(store.state);
        });
        var args = stateSignals;
        function handlerFn() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return args;
        }
        args.push(handlerFn);
        var disposable = (_a = Rx.Observable).combineLatest.apply(_a, args)
            .subscribeOnNext(function (tpl) { return callback.apply(void 0, tpl); });
        this.rx_destructorDisposable.add(disposable);
        var _a;
    };
    Store.prototype.listenToAction = function (action, callback) {
        var disposable = action.rx_action.subscribeOnNext(function (newState) { return callback(newState); });
        this.rx_destructorDisposable.add(disposable);
    };
    Store.prototype.listenToActions = function (actions, callback) {
        var rx_actions = actions.map(function (action) { return action.rx_action; });
        var allNames = actions.map(function (action) { return action.debugName; }).join(', ');
        var disposable = (_a = Rx.Observable).merge.apply(_a, rx_actions)
            .subscribeOnNext(function (val) { return callback(val); });
        this.rx_destructorDisposable.add(disposable);
        var _a;
    };
    Store.prototype.emitNewState = function () {
        this.rx_observableState.onNext(this._state);
    };
    Store.prototype.setState = function (partialState, merge) {
        if (merge === void 0) { merge = true; }
        var assignFn = merge ? assignAvailableProperties : undefined;
        var newState = _.assignWith({}, this._state, partialState, assignFn);
        this._state = newState;
        this.emitNewState();
    };
    Store.prototype.updateState = function (closure) {
        closure(this.state);
        this.emitNewState();
    };
    Store.prototype.destroy = function () {
        this.rx_destructorDisposable.dispose();
    };
    return Store;
})();
function assignAvailableProperties(value, other) {
    if (_.isArray(value)) {
        return _.isUndefined(other) ? value : other;
    }
    else if (_.isObject(value) && _.isObject(other)) {
        return _.assignInWith({}, value, other, assignAvailableProperties);
    }
    else {
        return _.isUndefined(other) ? value : other;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
//# sourceMappingURL=store.js.map