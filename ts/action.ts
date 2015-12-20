/// <reference path='../typings/tsd.d.ts' />

import * as Rx from 'rx'
import { Promise } from 'es6-promise'


export interface IAction<Return> extends Function {
    rx_action: Rx.Observable<Return>
    debugName: string
}

export interface ICallable < Return > extends Function {
    (...args): Return;
}

/**
    Creates an action that modifies a [[Store]].  An `rx_action` property is added to the action function that emits
    each time the function returns (it emits the action's return value).  Stores often listen to actions that change
    state by observing their `rx_action` property.

    @note The action function must perform its work synchronously (asynchronous actions should use [[asyncAction]]).

    @param target The function that performs the work of the action.  Optionally can take one parameter containing
        arguments to be used by the action.  Whatever is returned by this function is passed through by the `IAction` wrapper.
    @return An `IAction` function that can be called with the same arguments as the function passed in.
 */
export function action < T extends Function, Return > (target: T & ICallable<Return>): T & ICallable<Return> & IAction<Return> {

    var oldFn = target
    var rx_action = new Rx.Subject<Return>()

    var newFn = (function (...args) {
        log(`(action) ${ newFn.debugName } called with args:`, args)
        var retval = oldFn(...args)
        rx_action.onNext(retval)
        log(`(action) ${ newFn.debugName } returned:`, retval)
        return retval
    } as any) as T & ICallable<Return> & IAction<Return>

    newFn.rx_action = rx_action.doOnNext(next => log(`rx_action(${ newFn.debugName }) next ~>`, next))
                               .doOnError(error => log(`rx_action(${ newFn.debugName }) error ~>`, error))
                               .asObservable()
    return newFn
}

/**
    Creates an asynchronous action (perhaps representing an API call, etc.) that modifies a [[Store]].  An `rx_action`
    property is added to the action function that emits each time the function returns (it emits the action's return
    value).  Stores often listen to actions that change state by observing their `rx_action` property.

    @param target The function that performs the work of the action.  Optionally can take one parameter containing
        arguments to be used by the action.  Must return a [[Promise]].  The [[Promise]] returned by this function is
        passed through by the [[IAsyncAction]] wrapper and can be chained normally using `.then()`, etc.

    @return An [[IAsyncAction]] function that can be called with the same arguments as the function passed in.
 */
export function asyncAction < T extends Function, Return > (target: T & ICallable<Promise<Return>>): T & ICallable<Promise<Return>> & IAction<Return> {
    var oldFn = target
    var rx_action = new Rx.Subject<Return>()

    var newFn = (function (...args) {
        log(`(asyncAction) ${ newFn.debugName } called with args:`, args)

        return (oldFn(...args) as any).then(val => {
            rx_action.onNext(val as any)
            log(`(asyncAction) ${ newFn.debugName } returned:`, val)
            return val
        })
    } as any) as T & ICallable<Promise<Return>> & IAction<Return>

    newFn.rx_action = rx_action.doOnNext(next => log(`rx_action[ ${ newFn.debugName } ] ~>`, next))
                               .asObservable()

    return newFn
}

function log (msg:string, ...args: any[]) {
    // if (ENABLE_ACTION_DEBUG_LOGGING) { console.log(msg, ...args) }
    console.log(msg, ...args)
}




