import { useEffect } from 'react';
import { getSession } from '@jbrowse/core/util';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
const ProteinToMsaHoverSync = observer(function ProteinToMsaHoverSync({ model, }) {
    const session = getSession(model);
    const { views } = session;
    const proteinView = views.find(f => f.type === 'ProteinView');
    const connectedMsaViewId = proteinView?.connectedMsaViewId;
    const msaView = connectedMsaViewId
        ? views.find(f => f.id === connectedMsaViewId)
        : undefined;
    // Sync protein hover to MSA
    useEffect(() => {
        if (!proteinView || !msaView?.setMouseoveredColumn) {
            return;
        }
        const disposer = autorun(() => {
            const structure = proteinView.structures[0];
            if (structure) {
                const pos = structure.structureSeqHoverPos;
                msaView.setMouseoveredColumn?.(pos);
            }
        });
        return () => {
            disposer();
        };
    }, [proteinView, msaView]);
    // Sync MSA hover to protein
    useEffect(() => {
        if (!proteinView || !msaView) {
            return;
        }
        const disposer = autorun(() => {
            const col = msaView.mouseoveredColumn;
            const structure = proteinView.structures[0];
            if (structure && col !== undefined) {
                structure.highlightFromExternal(col);
            }
            else if (structure && col === undefined) {
                structure.clearHighlightFromExternal();
            }
        });
        return () => {
            disposer();
        };
    }, [proteinView, msaView]);
    return null;
});
export default ProteinToMsaHoverSync;
//# sourceMappingURL=ProteinToMsaHoverSync.js.map