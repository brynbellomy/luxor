import * as Rx from 'rx';
export interface IAction<Return> extends Function {
    rx_action: Rx.Observable<Return>;
    debugName: string;
}
export interface ICallable<Return> extends Function {
    (...args: any[]): Return;
}
export declare function action<T extends Function, Return>(target: T & ICallable<Return>): T & ICallable<Return> & IAction<Return>;
export declare function asyncAction<T extends Function, Return>(target: T & ICallable<Promise<Return>>): T & ICallable<Promise<Return>> & IAction<Return>;
