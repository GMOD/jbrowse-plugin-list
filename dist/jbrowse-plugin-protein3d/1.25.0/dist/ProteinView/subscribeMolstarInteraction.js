import loadMolstar from './loadMolstar';
function extractLocationInfo(molstar, location) {
    return {
        labelSeqId: molstar.StructureProperties.residue.label_seq_id(location),
        code: molstar.StructureProperties.atom.label_comp_id(location),
        chain: molstar.StructureProperties.chain.auth_asym_id(location),
        entityId: molstar.StructureProperties.entity.id(location),
        modelId: location.unit.model.id,
    };
}
export default async function subscribeMolstarInteraction({ plugin, kind, onUpdate, }) {
    const molstar = await loadMolstar();
    let subscribed = false;
    const subscription = plugin.behaviors.interaction[kind].subscribe(e => {
        if (!subscribed) {
            return;
        }
        if (molstar.StructureElement.Loci.is(e.current.loci)) {
            const loc = molstar.StructureElement.Loci.getFirstLocation(e.current.loci);
            onUpdate(loc ? extractLocationInfo(molstar, loc) : undefined);
        }
        else {
            onUpdate(undefined);
        }
    });
    subscribed = true;
    return () => {
        subscription.unsubscribe();
    };
}
