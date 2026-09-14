import type { IAnyModelType } from '@jbrowse/mobx-state-tree';
export declare function extendPluggableStateModel(elt: {
    stateModel: IAnyModelType;
}, extend: (stateModel: IAnyModelType) => IAnyModelType): void;
