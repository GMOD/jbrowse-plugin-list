import { applyLociInteractivity } from './applyLociInteractivity';
export default async function highlightResidueRange({ structure, startResidue, endResidue, plugin, }) {
    await applyLociInteractivity({
        structure,
        startResidue,
        endResidue,
        plugin,
        mode: 'highlight',
    });
}
export async function selectResidueRange({ structure, startResidue, endResidue, plugin, }) {
    await applyLociInteractivity({
        structure,
        startResidue,
        endResidue,
        plugin,
        mode: 'select',
    });
}
//# sourceMappingURL=highlightResidueRange.js.map