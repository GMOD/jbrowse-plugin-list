import { setMolstarLoci } from './applyLociInteractivity';
/**
 * Builds the body of the autorun that keeps one Mol* interactivity channel lit
 * on what every structure of the view wants: the click or declarative
 * selection for `select`, the hover for `highlight`. One autorun per view,
 * because the channel is plugin-wide (see setMolstarLoci). Every observable
 * read happens before setMolstarLoci's first await, so MobX tracks them all.
 */
export function makeLociChannel(host, channel) {
    return function applyLociChannel() {
        const plugin = host.molstarPluginContext;
        const targets = host.structures.flatMap(s => s.molstarStructure
            ? [
                {
                    structure: s.molstarStructure,
                    entityId: s.mappedEntity?.entityId,
                    labelSeqIds: channel === 'select' ? s.selectLabelSeqIds : s.hoverLabelSeqIds,
                },
            ]
            : []);
        if (plugin) {
            setMolstarLoci({
                interactivity: plugin.managers.interactivity,
                channel,
                targets,
            }).catch((e) => {
                console.error(e);
            });
        }
    };
}
