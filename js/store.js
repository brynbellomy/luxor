var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Rx = require('rx');
var π = require('pants');
var component_1 = require('./component');
var utils_1 = require('./utils');
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
            .doOnNext(function (newState) { return callback(newState); })
            .subscribe(utils_1.debugObserver(this.debugName + " -(observing)-> " + store.debugName));
        this.rx_destructorDisposable.add(disposable);
    };
    Store.prototype.listenToStores = function (store1, store2, callback) {
        var s1 = store1.rx_observableState.startWith(store1.state);
        var s2 = store2.rx_observableState.startWith(store2.state);
        var disposable = Rx.Observable.combineLatest(s1, s2, function (state1, state2) { return { state1: state1, state2: state2 }; })
            .doOnNext(function (t) { return callback(t.state1, t.state2); })
            .subscribe(utils_1.debugObserver(this.debugName + " -(observing)-> [" + store1.debugName + " + " + store2.debugName + "]"));
        this.rx_destructorDisposable.add(disposable);
    };
    Store.prototype.listenToAction = function (action, callback) {
        var disposable = action.rx_action.doOnNext(function (newState) { return callback(newState); })
            .subscribe(utils_1.debugObserver(this.debugName + " -(observing)-> " + action.debugName));
        this.rx_destructorDisposable.add(disposable);
    };
    Store.prototype.listenToActions = function (actions, callback) {
        var rx_actions = actions.map(function (action) { return action.rx_action; });
        var allNames = actions.map(function (action) { return action.debugName; }).join(', ');
        var disposable = (_a = Rx.Observable).merge.apply(_a, rx_actions)
            .doOnNext(function (val) { return callback(val); })
            .subscribe(utils_1.debugObserver(this.debugName + " -(observing)-> [" + allNames + "]"));
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