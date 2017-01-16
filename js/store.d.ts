import * as Rx from 'rx';
import { IAction } from './action';
declare class Store<State> implements Store.Listenable<State> {
    state: State;
    protected _state: State;
    protected rx_destructorDisposable: Rx.CompositeDisposable;
    rx_observableState: Rx.ReplaySubject<State>;
    debugName: string;
    constructor(initialState: State);
    listenToStore<S1>(store: Store<S1>, callback: (newState: S1) => void): void;
    listenToStores<S1>(stores: [Store<S1>], callback: (state1: S1) => void): any;
    listenToStores<S1, S2>(stores: [Store<S1>, Store<S2>], callback: (state1: S1, state2: S2) => void): any;
    listenToStores<S1, S2, S3>(stores: [Store<S1>, Store<S2>, Store<S3>], callback: (state1: S1, state2: S2, state: S3) => void): any;
    listenToStores<S1, S2, S3, S4>(stores: [Store<S1>, Store<S2>, Store<S3>, Store<S4>], callback: (state1: S1, state2: S2, state3: S3, state4: S4) => void): any;
    listenToStores<S1, S2, S3, S4, S5>(stores: [Store<S1>, Store<S2>, Store<S3>, Store<S4>, Store<S5>], callback: (state1: S1, state2: S2, state3: S3, state4: S4, state5: S5) => void): any;
    listenToAction<Return>(action: IAction<Return>, callback: (val: Return) => void): void;
    listenToActions<Return>(actions: IAction<Return>[], callback: (val: Return) => void): void;
    private emitNewState();
    setState(partialState: any, merge?: boolean): void;
    updateState(closure: (state: State) => State): void;
    destroy(): void;
}
declare namespace Store {
    interface Listenable<T> {
        rx_observableState: Rx.Observable<T>;
    }
}
export default Store;
