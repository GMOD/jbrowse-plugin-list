export function connectedHighlights(views, genomeViewId, genomeHovered) {
    const regions = views
        .filter(isLinkedMsaView)
        .filter(v => v.connectedViewId === genomeViewId)
        .flatMap(v => [
        ...v.connectedClickHighlights,
        ...(genomeHovered ? [] : v.connectedHoverHighlights),
    ]);
    return [
        ...new Map(regions.map(r => [`${r.refName}:${r.start}-${r.end}`, r])).values(),
    ];
}
function isLinkedMsaView(view) {
    return view.type === 'MsaView';
}
