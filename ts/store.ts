
import * as _ from 'lodash'
import * as Rx from 'rx'
import { IAction, } from './action'


class Store < State > implements Store.Listenable <State> {

    /** Mutable variables.  These must be mutated with [[updateState]].  When the mutation operation is finished, `rx_observableState` fires with the new
        value of [[state]] and the component is re-rendered.  Note that this is not quite the same as the usage of "state" in React's terminology. */
    get state() { return this._state }

    /** Private backing variable for [[state]]. */
    protected _state: State

    protected rx_destructorDisposable = new Rx.CompositeDisposable()

    /** An `Rx.ReplaySubject` (a subclass of `Rx.Observable`) that fires the component's [[state]] each time an [[updateState]] operation finishes.  Subscribe
        to this if your code needs to be able to synchronize its state with the state of the component. */
    rx_observableState = new Rx.ReplaySubject<State>(1)
    debugName: string

    constructor (initialState: State) {
        this._state = initialState
        setTimeout(() => this.emitNewState(), 0)
    }

    listenToStore < S1 > (store: Store<S1>, callback: (newState: S1) => void) {
        const disposable = store.rx_observableState.startWith(store.state)
                                                   .subscribeOnNext(newState => callback(newState))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToStores<S1>(stores: [Store<S1>], callback: (state1: S1) => void);
    listenToStores<S1, S2>(stores: [Store<S1>, Store<S2>], callback: (state1: S1, state2: S2) => void);
    listenToStores<S1, S2, S3>(stores: [Store<S1>, Store<S2>, Store<S3>], callback: (state1: S1, state2: S2, state: S3) => void);
    listenToStores<S1, S2, S3, S4>(stores: [Store<S1>, Store<S2>, Store<S3>, Store<S4>], callback: (state1: S1, state2: S2, state3: S3, state4: S4) => void);
    listenToStores<S1, S2, S3, S4, S5>(stores: [Store<S1>, Store<S2>, Store<S3>, Store<S4>, Store<S5>], callback: (state1: S1, state2: S2, state3: S3, state4: S4, state5: S5) => void);
    listenToStores(stores: Store<any>[], callback: (...args: any[]) => void) {
        const stateSignals: Rx.Observable<any>[] = stores.map(store => {
            return store.rx_observableState.startWith(store.state)
        })

        let args = stateSignals as any[]
        function handlerFn(...args: any[]) { return args }
        args.push(handlerFn)

        const disposable = (Rx.Observable.combineLatest as any)(...args)
                                        .subscribeOnNext(tpl => callback(...tpl))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToAction < Return > (action: IAction<Return>, callback: (val: Return) => void) {
        const disposable = action.rx_action.subscribeOnNext(newState => callback(newState))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToActions < Return > (actions: IAction<Return>[], callback: (val: Return) => void) {
        const rx_actions = actions.map(action => action.rx_action)
        const allNames = actions.map(action => action.debugName).join(', ')

        const disposable = Rx.Observable.merge(...rx_actions)
                                        .subscribeOnNext(val => callback(val))

        this.rx_destructorDisposable.add(disposable)
    }

    private emitNewState() {
        this.rx_observableState.onNext(this._state)
    }

    setState (partialState: any, merge: boolean = true) {
        const assignFn = merge ? assignAvailableProperties : undefined
        const newState = _.assignWith({}, this._state, partialState, assignFn) as State
        this._state = newState

        this.emitNewState()
    }

    updateState(closure: (state: State) => State) {
        // let newState = _.cloneDeep(this.state)
        // newState = closure(newState)
        closure(this.state)
        // this.setState(newState, false)
        this.emitNewState()
    }

    /**
        Ensure you call this method when a component should be torn down. Subclasses implementing this method should
        ensure they break all observations and retain cycles here or there will be memory leaks (possibly large ones).
     */
    destroy() {
        this.rx_destructorDisposable.dispose()
    }
}

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


namespace Store {
    export interface Listenable <T> {
        rx_observableState: Rx.Observable<T>;
    }
}

export default Store

