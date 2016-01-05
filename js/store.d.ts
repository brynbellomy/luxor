import * as Rx from 'rx';
import Component from './component';
import { IAction } from './action';
declare abstract class Store<Props, State> extends Component<Props, State> implements Store.Listenable<State> {
    rx_observableState: Rx.ReplaySubject<State>;
    debugName: string;
    constructor(props: Props, shouldDiffState?: boolean);
    listenToStore<S1>(store: Store<any, S1>, callback: (newState: S1) => void): void;
    listenToStores<S1>(stores: [Store<any, S1>], callback: (state1: S1) => void): any;
    listenToStores<S1, S2>(stores: [Store<any, S1>, Store<any, S2>], callback: (state1: S1, state2: S2) => void): any;
    listenToStores<S1, S2, S3>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>], callback: (state1: S1, state2: S2, state: S3) => void): any;
    listenToStores<S1, S2, S3, S4>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>, Store<any, S4>], callback: (state1: S1, state2: S2, state3: S3, state4: S4) => void): any;
    listenToStores<S1, S2, S3, S4, S5>(stores: [Store<any, S1>, Store<any, S2>, Store<any, S3>, Store<any, S4>, Store<any, S5>], callback: (state1: S1, state2: S2, state3: S3, state4: S4, state5: S5) => void): any;
    listenToAction<Return>(action: IAction<Return>, callback: (val: Return) => void): void;
    listenToActions<Return>(actions: IAction<Return>[], callback: (val: Return) => void): void;
    emitNewState(): void;
    protected didUpdateState(oldState: State, theDiff: State): void;
}
declare namespace Store {
    interface Listenable<T> {
        rx_observableState: Rx.Observable<T>;
    }
}
export default Store;
