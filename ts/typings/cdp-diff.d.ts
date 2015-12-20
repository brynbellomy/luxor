

declare module 'cdp-diff' {
    export function createDiff (left:Object, right:Object): Object;
    export function applyDiff (diff:Object, object:Object): Object;
    export function copyObject (object:Object): Object;
}