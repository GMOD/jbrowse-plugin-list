import { useEffect } from 'react';
import { getSession } from '@jbrowse/core/util';
import { autorun, untracked } from 'mobx';
import { observer } from 'mobx-react';
import { findStructureRowName } from './msaRowMatch';
import { getProteinView } from './util';
import { stripStopCodon } from '../LaunchProteinView/utils/util';
const ProteinToMsaHoverSync = observer(function ProteinToMsaHoverSync({ model, }) {
    const session = getSession(model);
    const { views } = session;
    const proteinView = getProteinView(session);
    const connectedMsaViewId = proteinView?.connectedMsaViewId;
    const msaView = connectedMsaViewId
        ? views.find(f => f.id === connectedMsaViewId)
        : undefined;
    useEffect(() => {
        if (!proteinView || !msaView) {
            return;
        }
        const disposers = [];
        // Resolve which MSA row corresponds to the structure once the MSA loads.
        // Recomputes only when the alignment rows or structure sequence change, not
        // on every hover, so the per-hover conversions below stay cheap.
        let structureRowName;
        disposers.push(autorun(() => {
            const seq = proteinView.primaryStructure?.structureSequences?.[0];
            structureRowName = findStructureRowName(msaView.rowMap, seq === undefined ? undefined : stripStopCodon(seq));
        }));
        if (msaView.setMousePos) {
            const { setMousePos } = msaView;
            disposers.push(autorun(() => {
                const structure = proteinView.primaryStructure;
                if (structure) {
                    const seqPos = structure.structureSeqHoverPos;
                    const col = seqPos !== undefined &&
                        structureRowName !== undefined &&
                        msaView.seqPosToVisibleCol
                        ? msaView.seqPosToVisibleCol(structureRowName, seqPos)
                        : seqPos;
                    setMousePos(col);
                }
            }));
        }
        disposers.push(autorun(() => {
            const col = msaView.mouseCol;
            const structure = proteinView.primaryStructure;
            if (structure) {
                const hasFeatureHoverRange = untracked(() => !!structure.alignmentHoverRange);
                if (!hasFeatureHoverRange) {
                    const structureSeqPos = col !== undefined &&
                        structureRowName !== undefined &&
                        msaView.visibleColToSeqPos
                        ? msaView.visibleColToSeqPos(structureRowName, col)
                        : col;
                    structure.setHoveredPosition(structureSeqPos === undefined ? undefined : { structureSeqPos });
                }
            }
        }));
        return () => {
            disposers.forEach(d => {
                d();
            });
        };
    }, [proteinView, msaView]);
    return null;
});
export default ProteinToMsaHoverSync;
