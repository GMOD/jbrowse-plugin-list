function toP(s = 0) {
    return +s.toPrecision(6);
}
const en = (n) => n.toLocaleString('en-US');
function getTooltip(feature) {
    const start = feature.get('start') + 1;
    const end = feature.get('end');
    const refName = feature.get('refName');
    const name = feature.get('name');
    const rsid = feature.get('rsid');
    const loc = [refName, start === end ? en(start) : `${en(start)}..${en(end)}`]
        .filter(f => !!f)
        .join(':');
    return `${loc}<br/>${toP(feature.get('score'))}<br/>${name || rsid}`;
}
export default function JexlMouseoverF(pluginManager) {
    pluginManager.jexl.addFunction('getTooltip', (feature) => getTooltip(feature));
}
//# sourceMappingURL=jexlMouseover.js.map