/// <reference path='../typings/tsd.d.ts' />

import * as Rx from 'rx'
import * as React from 'react'
import { debugObserver } from './utils'
import { IAction, } from './action'


class Store < Props, State >
    extends React.Component <Props, State>
    implements Store.Listenable <State>
{
    /** An `Rx.ReplaySubject` (a subclass of `Rx.Observable`) that fires the component's [[state]] each time an [[updateState]] operation finishes.  Subscribe
        to this if your code needs to be able to synchronize its state with the state of the component. */
    rx_observableState = new Rx.ReplaySubject<State>(1)
    debugName: string
    protected rx_destructorDisposable = new Rx.CompositeDisposable()

    constructor (props: Props, shouldDiffState: boolean = true) {
        super(props, shouldDiffState)
        this.emitState()
    }

    componentDidUpdate(oldProps: Props, oldState: State) {
        this.emitState()
    }

    componentWillUnmount() {
        this.rx_destructorDisposable.dispose()
    }

    listenToStore < State > (store: Store<any, State>, callback: (newState: State) => void) {
        const disposable = store.rx_observableState.startWith(store.state)
                                                   .doOnNext(newState => callback(newState))
                                                   .subscribe(debugObserver(`${this.debugName} -(observing)-> ${store.debugName}`))

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

        const disposable = Rx.Observable.merge(...rx_actions).doOnNext(val => callback(val))
                                                             .subscribe(debugObserver(`${this.debugName} -(observing)-> [${allNames}]`))

        this.rx_destructorDisposable.add(disposable)
    }

    emitState() {
        this.rx_observableState.onNext(this.state)
    }
}

namespace Store {
    export interface Listenable <T> {
        rx_observableState: Rx.Observable<T>
    }
}

export default Store