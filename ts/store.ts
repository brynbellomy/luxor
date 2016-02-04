
import * as Rx from 'rx'
import Component from './component'
import { debugObserver } from './utils'
import { IAction, } from './action'


abstract class Store < Props, State >
    extends Component <Props, State>
    implements Store.Listenable <State>
{
    /** An `Rx.ReplaySubject` (a subclass of `Rx.Observable`) that fires the component's [[state]] each time an [[updateState]] operation finishes.  Subscribe
        to this if your code needs to be able to synchronize its state with the state of the component. */
    rx_observableState = new Rx.ReplaySubject<State>(1)
    debugName: string

    constructor (props: Props, shouldDiffState: boolean = true) {
        super(props, shouldDiffState)
        setTimeout(() => this.emitNewState(), 0)
    }

    listenToStore < S1 > (store: Store<any, S1>, callback: (newState: S1) => void) {
        const disposable = store.rx_observableState.startWith(store.state)
                                                   .subscribeOnNext(newState => callback(newState))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToStores<S1>(stores: [Store<any, S1>], callback: (state1: S1) => void);
    listenToStores<S1, S2>(stores: [Store<any, S1>, Store<any, S2>], callback: (state1: S1, state2: S2) => void);
    listenToStores<S1, S2, S3>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>], callback: (state1: S1, state2: S2, state: S3) => void);
    listenToStores<S1, S2, S3, S4>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>, Store<any, S4>], callback: (state1: S1, state2: S2, state3: S3, state4: S4) => void);
    listenToStores<S1, S2, S3, S4, S5>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>, Store<any, S4>, Store<any, S5>], callback: (state1: S1, state2: S2, state3: S3, state4: S4, state5: S5) => void);
    listenToStores(stores: Store<any, any>[], callback: (...args: any[]) => void) {
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

    emitNewState() {
        this.rx_observableState.onNext(this._state)
    }

    protected didUpdateState(oldState: State, theDiff: State) {
        super.didUpdateState(oldState, theDiff)
        this.emitNewState()
    }

    /**
        This method must be implemented by subclasses and should return an object representing the initial state of the Store.

        @returns An object representing the initial state of the component.
     */
    // protected abstract initialState(): State;
}

namespace Store {
    export interface Listenable <T> {
        rx_observableState: Rx.Observable<T>;
    }
}

export default Store