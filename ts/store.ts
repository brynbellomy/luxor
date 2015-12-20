
import * as Rx from 'rx'
import * as π from 'pants'
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
        π.async(() => this.emitNewState())
    }

    listenToStore < S1 > (store: Store<any, S1>, callback: (newState: S1) => void) {
        const disposable = store.rx_observableState.startWith(store.state)
                                                   .doOnNext(newState => callback(newState))
                                                   .subscribe(debugObserver(`${this.debugName} -(observing)-> ${store.debugName}`))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToStores < S1, S2 > (store1: Store<any, S1>, store2: Store<any, S2>, callback: (state1: S1, state2: S2) => void) {
        const s1 = store1.rx_observableState.startWith(store1.state)
        const s2 = store2.rx_observableState.startWith(store2.state)

        const disposable = Rx.Observable.combineLatest(s1, s2, (state1, state2) => { return {state1, state2} })
                                        .doOnNext(t => callback(t.state1, t.state2))
                                        .subscribe(debugObserver(`${this.debugName} -(observing)-> [${store1.debugName} + ${store2.debugName}]`))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToAction < Return > (action: IAction<Return>, callback: (val: Return) => void) {
        const disposable = action.rx_action.doOnNext(newState => callback(newState))
                                           .subscribe(debugObserver(`${this.debugName} -(observing)-> ${action.debugName}`))

        this.rx_destructorDisposable.add(disposable)
    }

    listenToActions < Return > (actions: IAction<Return>[], callback: (val: Return) => void) {
        const rx_actions = actions.map(action => action.rx_action)
        const allNames = actions.map(action => action.debugName).join(', ')

        const disposable = Rx.Observable.merge(...rx_actions)
                                        .doOnNext(val => callback(val))
                                        .subscribe(debugObserver(`${this.debugName} -(observing)-> [${allNames}]`))

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