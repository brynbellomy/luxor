import * as Rx from 'rx';
import Component from './component';
import { IAction } from './action';
declare abstract class Store<Props, State> extends Component<Props, State> implements Store.Listenable<State> {
    rx_observableState: Rx.ReplaySubject<State>;
    debugName: string;
    constructor(props: Props, shouldDiffState?: boolean);
    listenToStore<S1>(store: Store<any, S1>, callback: (newState: S1) => void): void;
    listenToStores<S1, S2>(store1: Store<any, S1>, store2: Store<any, S2>, callback: (state1: S1, state2: S2) => void): void;
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
