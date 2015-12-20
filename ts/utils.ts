import * as Rx from 'rx'
import * as assert from 'assert'

export interface NextHandler<T>   { (value: T): void; }
export interface ErrorHandler<E>  { (err: E): void; }
export interface CompletedHandler { (): void; }
export interface SubscriberTuple<T, E> {
    0: NextHandler<T>;
    1: ErrorHandler<E>;
    2: CompletedHandler;
}

export interface IDefaultSubscriberSet <T, E> {
    next: NextHandler<T>;
    error: ErrorHandler<E>;
    completed: CompletedHandler;
}

/**
    Centralizing the creation of a debug subscriber for Rx observables lets us easily control debug logging, disposable handling, etc.

    @param prefix The string that will be prepended to log messages.  Usually just the signal's name.
 */
export function debugSubscriber <T, E> (prefix: string, debugLogging: boolean = false, stackTraces: boolean = false): IDefaultSubscriberSet<T, E> {
    return {
        next: function (val) {
            console.log(`[${prefix}: next] =>`, val)
            if (stackTraces === true) {
                console.trace()
            }
        },
        error: function (err) {
            console.error(`[${prefix}: error] =>`, err, (<any>err).stack)
            if (stackTraces === true) {
                console.trace()
            }
            throw err
        },
        completed: function () {
            console.log  (`[${prefix}: completed] =>|`)
            if (stackTraces === true) {
                console.trace()
            }
        }
    }
}

/**
    Returns an observer configured for easier debugging.  If you need to debug a confusing signal chain, it can be useful
    to add a `.subscribe(debugObserver('my signal name'))` at the very end to spit out any errors or unwanted state changes.
 */
export function debugObserver <T> (prefix: string, debugLogging: boolean = false, stackTrace: boolean = false): Rx.Observer<T> {
    const subsc = debugSubscriber<T, any>(prefix, debugLogging, stackTrace)
    return Rx.Observer.create<T>(subsc.next, subsc.error, subsc.completed)
}


/**
    Returns a signal that wraps the provided `signal`, logging the values it sends and passing them through.  For debugging.
 */
export function rx_log <T> (signal: Rx.Observable<T>, label: string): Rx.Observable<T> {
    return signal.doOnNext(function (...args:any[]) {
        console.log(label, ...args)
    })
}


/**
    Given any number of Observables that fire boolean values, this function creates a new Observable that fires `false`
    every time one of the given input signals fires, until all of them fire `true`.  This signal never completes by
    itself, even when a `true` is fired, so you'll need to tear it down manually (with something like `.take()`) if needed.
 */
export function rx_logicalAnd(...signals: Rx.Observable<boolean>[]): Rx.Observable<boolean> {
    return (<Function>(Rx.Observable.combineLatest))(...signals, (...args) => args.reduce((a, b) => a && b)) as Rx.Observable<boolean>
}





