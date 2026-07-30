export function checkHovered(hovered) {
    return (!!hovered &&
        typeof hovered === 'object' &&
        'hoverPosition' in hovered &&
        !!hovered.hoverPosition &&
        typeof hovered.hoverPosition === 'object' &&
        'coord' in hovered.hoverPosition &&
        'refName' in hovered.hoverPosition);
}
export function invertMap(arg) {
    return Object.fromEntries(Object.entries(arg).map(([a, b]) => [b, +a]));
}
