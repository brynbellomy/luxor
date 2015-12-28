var _ = require('lodash');
var Rx = require('rx');
var pants_1 = require('pants');
var assert = require('assert');
var diff = require('cdp-diff');
var Component = (function () {
    function Component(props, shouldDiffState) {
        if (shouldDiffState === void 0) { shouldDiffState = false; }
        this.shouldDiffState = true;
        this.rx_destructorDisposable = new Rx.CompositeDisposable();
        this.shouldDiffState = shouldDiffState;
        this.validateProps(props);
        this._props = props;
        this._state = this.initialState();
    }
    Object.defineProperty(Component.prototype, "props", {
        get: function () { return this._props; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    Component.prototype.validateProps = function (newProps) {
        assert(!pants_1.nullish(newProps), 'newProps cannot be null.');
    };
    Component.prototype.setState = function (partialState, merge) {
        if (merge === void 0) { merge = true; }
        var oldState = _.clone(this._state);
        var newState = _.assign({}, oldState, partialState);
        var _a = this.checkIfStateModified(oldState, newState), didModify = _a[0], theDiff = _a[1];
        var assignFn = merge ? pants_1.assignAvailableProperties : undefined;
        this._state = _.assign({}, this._state, partialState, assignFn);
        if (didModify) {
            this.didUpdateState(oldState, theDiff);
        }
    };
    Component.prototype.updateState = function (closure) {
        var newState = _.cloneDeep(this.state);
        newState = closure(newState);
        this.setState(newState, false);
    };
    Component.prototype.checkIfStateModified = function (oldState, newState) {
        if (this.shouldDiffState) {
            var theDiff = diff.createDiff(oldState, newState);
            var didModify = _.keys(theDiff).length > 0;
            return [didModify, theDiff];
        }
        return [true, null];
    };
    Component.prototype.didUpdateState = function (oldState, diff) {
    };
    Component.prototype.destroy = function () {
        this.rx_destructorDisposable.dispose();
    };
    return Component;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Component;
//# sourceMappingURL=component.js.map