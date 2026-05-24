import { useEffect } from 'react';
import { getSession } from '@jbrowse/core/util';
import { autorun, untracked } from 'mobx';
import { observer } from 'mobx-react';
import { getProteinView } from './util';
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
        if (msaView.setMouseoveredColumn) {
            const { setMouseoveredColumn } = msaView;
            disposers.push(autorun(() => {
                const structure = proteinView.structures[0];
                if (structure) {
                    setMouseoveredColumn(structure.structureSeqHoverPos);
                }
            }));
        }
        disposers.push(autorun(() => {
            const col = msaView.mouseoveredColumn;
            const structure = proteinView.structures[0];
            if (structure) {
                const hasFeatureHoverRange = untracked(() => !!structure.alignmentHoverRange);
                if (!hasFeatureHoverRange) {
                    structure.setHoveredPosition(col === undefined ? undefined : { structureSeqPos: col });
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
