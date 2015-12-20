import * as Rx from 'rx';
export interface NextHandler<T> {
    (value: T): void;
}
export interface ErrorHandler<E> {
    (err: E): void;
}
export interface CompletedHandler {
    (): void;
}
export interface SubscriberTuple<T, E> {
    0: NextHandler<T>;
    1: ErrorHandler<E>;
    2: CompletedHandler;
}
export interface IDefaultSubscriberSet<T, E> {
    next: NextHandler<T>;
    error: ErrorHandler<E>;
    completed: CompletedHandler;
}
export declare function debugSubscriber<T, E>(prefix: string, debugLogging?: boolean, stackTraces?: boolean): IDefaultSubscriberSet<T, E>;
export declare function debugObserver<T>(prefix: string, debugLogging?: boolean, stackTrace?: boolean): Rx.Observer<T>;
export declare function rx_log<T>(signal: Rx.Observable<T>, label: string): Rx.Observable<T>;
export declare function rx_logicalAnd(...signals: Rx.Observable<boolean>[]): Rx.Observable<boolean>;
