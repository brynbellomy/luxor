import * as Rx from 'rx';
declare abstract class Component<Props, State> {
    props: Props;
    protected _props: Props;
    state: State;
    protected _state: State;
    protected shouldDiffState: boolean;
    protected rx_destructorDisposable: Rx.CompositeDisposable;
    constructor(props: Props, shouldDiffState?: boolean);
    protected abstract initialState(): State;
    setState(partialState: any, merge?: boolean): void;
    updateState(closure: (state: State) => State): void;
    private checkIfStateModified(oldState, newState);
    protected didUpdateState(oldState: State, diff?: Object): void;
    destroy(): void;
}
export default Component;
