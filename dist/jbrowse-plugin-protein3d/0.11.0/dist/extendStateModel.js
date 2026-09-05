export function extendPluggableStateModel(elt, extend) {
    const element = elt;
    if (element.extendStateModel) {
        element.extendStateModel(extend);
    }
    else {
        element.stateModel = extend(element.stateModel);
    }
}
