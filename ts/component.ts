
import * as _ from 'lodash'
import * as Rx from 'rx'
import * as assert from 'assert'
import diff = require('cdp-diff')
import { EventEmitter } from 'events'


/**
    Component provides an architectural parallel to React.Component, but is intended for view-less components and singletons.  A Component is easy to observe
    for changes so that other things on the page can stay in sync with it as it updates.  In React, it's difficult to obtain a reference to a component on the
    page if your entire page is not rendered from a single React root.  This allows us to circumvent that problem for controller components ([[ModalStore]]),
    external API client components ([[FBStore]]), etc.

    @param Props A simple object type containing the immutable properties of the `Component`.
    @param State A simple object type containing the mutable properties of the `Component`.
 */
abstract class Component < Props, State > {
    /** Immutable variables.  These can only be set when the component is created.  Note that this is not quite the same as React's terminology. */
    get props() { return this._props }

    /** Private backing variable for [[props]]. */
    protected _props: Props

    /** Mutable variables.  These must be mutated with [[updateState]].  When the mutation operation is finished, `rx_observableState` fires with the new
        value of [[state]] and the component is re-rendered.  Note that this is not quite the same as the usage of "state" in React's terminology. */
    get state() { return this._state }

    /** Private backing variable for [[state]]. */
    protected _state: State

    /** If `true`, the component will object-diff its [[state]] every time [[updateState]] is called, and will only call [[didUpdateState]] and fire
        notifications on [[rx_observableState]] if something actually changed.

        @note If [[state]] contains circular references (like DOM elements), you can't use diffing. */
    protected shouldDiffState: boolean = true

    protected rx_destructorDisposable = new Rx.CompositeDisposable()

    /**
        @param props The component's initial [[props]].  Cannot be `null`.
     */
    constructor (props: Props, shouldDiffState: boolean = false) {
        this.shouldDiffState = shouldDiffState

        this._props = props
        this._state = this.initialState()
    }

    /**
        This method must be implemented by subclasses and should return an object representing the initial state of the component.

        @returns An object representing the initial state of the component.
     */
    protected abstract initialState(): State;

    setState (partialState: any, merge: boolean = true) {
        // const newState = _.assignIn({}, oldState, partialState) as State
        // const [didModify, theDiff] = this.checkIfStateModified(oldState, newState)

        const assignFn = merge ? assignAvailableProperties : undefined
        const newState = _.assignWith({}, this._state, partialState, assignFn) as State
        const oldState = _.clone(this._state)
        const [didModify, theDiff] = this.checkIfStateModified(oldState, newState)
        this._state = newState

        if (didModify) {
            this.didUpdateState(oldState, theDiff)
        }
    }

    updateState(closure: (state: State) => State) {
        let newState = _.cloneDeep(this.state)
        newState = closure(newState)
        this.setState(newState, false)
    }

    /**
        @returns A 2-tuple of the form `[didModify, diff]`.
     */
    private checkIfStateModified (oldState: State, newState: State): [boolean, Object] {
        if (this.shouldDiffState) {
            const theDiff = diff.createDiff(oldState, newState)
            const didModify = _.keysIn(theDiff).length > 0
            return [didModify, theDiff]
        }
        return [true, null]
    }

    /**
        Subclasses can override this method to perform side effects triggered by their own state changes.

        @important You **must** call `super.didUpdateState()` or your component will die a fiery death (its state will stop updating).
     */
    protected didUpdateState (oldState: State, diff?: Object) {
        // no-op.
    }


    /**
        Ensure you call this method when a component should be torn down. Subclasses implementing this method should
        ensure they break all observations and retain cycles here or there will be memory leaks (possibly large ones).
     */
    destroy() {
        this.rx_destructorDisposable.dispose()
    }
}


export default Component


/**
    Intended to be passed as the fourth argument of `_.assign(...)`.  Causes any object properties
    to be recursively merged rather than overwriting one another.
 */
function assignAvailableProperties(value, other) {
    if (_.isArray(value)) {
        return _.isUndefined(other) ? value : other
    } else if (_.isObject(value) && _.isObject(other)) {
        return _.assignInWith({}, value, other, assignAvailableProperties)
    } else {
        return _.isUndefined(other) ? value : other
    }
}

