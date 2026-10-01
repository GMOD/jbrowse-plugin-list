import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

// A pluggable element registered with a lazy state-model loader
// (jbrowse-components main, as of writing) has not resolved `stateModel` yet
// when Core-extendPluggableElement fires, so reading it there is `undefined`
// and composing on it throws. Those hosts expose `extendStateModel`, which
// composes immediately if the model already resolved or queues the extension
// for when the loader does. A host without that method (v4.3.0 and earlier,
// where every state model is synchronous) never has this problem, so a plain
// read-and-reassign is correct there. Duck-typed rather than imported: the
// installed @jbrowse/core types do not declare the method on older hosts.
interface ExtendableElement {
  stateModel: IAnyModelType
  extendStateModel?: (
    extend: (stateModel: IAnyModelType) => IAnyModelType,
  ) => void
}

export function extendPluggableStateModel(
  elt: { stateModel: IAnyModelType },
  extend: (stateModel: IAnyModelType) => IAnyModelType,
) {
  const element = elt as ExtendableElement
  if (element.extendStateModel) {
    element.extendStateModel(extend)
  } else {
    element.stateModel = extend(element.stateModel)
  }
}
