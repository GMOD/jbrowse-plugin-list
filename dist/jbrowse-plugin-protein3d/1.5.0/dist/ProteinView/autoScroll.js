import { reaction } from 'mobx';
export function followHoverTarget({ x, width, scrollLeft, clientWidth, }) {
    const visible = x >= scrollLeft && x + width <= scrollLeft + clientWidth;
    return visible ? undefined : x + width / 2 - clientWidth / 2;
}
export function offScreenCenterTarget({ start, end, scrollLeft, clientWidth, }) {
    const viewEnd = scrollLeft + clientWidth;
    const visible = end >= scrollLeft && start <= viewEnd;
    return visible ? undefined : (start + end) / 2 - clientWidth / 2;
}
export function followHover(model, getContainer) {
    return reaction(() => model.alignmentHoverPos, pos => {
        const container = getContainer();
        if (pos !== undefined &&
            container &&
            model.autoScrollAlignment &&
            !model.isMouseInAlignment) {
            const target = followHoverTarget({
                x: pos * model.columnWidth,
                width: model.columnWidth,
                scrollLeft: container.scrollLeft,
                clientWidth: container.clientWidth,
            });
            if (target !== undefined) {
                container.scrollLeft = target;
            }
        }
    });
}
