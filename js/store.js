var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Rx = require('rx');
var π = require('pants');
var component_1 = require('./component');
var Store = (function (_super) {
    __extends(Store, _super);
    function Store(props, shouldDiffState) {
        var _this = this;
        if (shouldDiffState === void 0) { shouldDiffState = true; }
        _super.call(this, props, shouldDiffState);
        this.rx_observableState = new Rx.ReplaySubject(1);
        π.async(function () { return _this.emitNewState(); });
    }
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
    Store.prototype.didUpdateState = function (oldState, theDiff) {
        _super.prototype.didUpdateState.call(this, oldState, theDiff);
        this.emitNewState();
    };
    return Store;
})(component_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
//# sourceMappingURL=store.js.map