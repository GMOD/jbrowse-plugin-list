interface MsaViewLike {
  id: string
  type: string
  connectedViewId?: string
}

/**
 * Find the MsaView a protein view should sync hover with. Two ways they pair:
 *  - an explicit `connectedMsaViewId` (set when the protein view was launched
 *    from an alignment), or
 *  - a shared genome view: the protein structure and an MsaView are both
 *    connected to the same LinearGenomeView via `connectedViewId` — the
 *    genome-centric gene-explorer flow, where no explicit MSA link is set but
 *    both views already bridge through the same genome coordinates.
 *
 * Mirrors react-msaview's structureMatchesMsa (the MSA→structure side): a shared
 * genome view is sufficient to connect, so neither side has to thread an
 * explicit cross-view id.
 */
export function findConnectedMsaView<T extends MsaViewLike>(
  views: T[],
  {
    connectedMsaViewId,
    structureViewId,
  }: { connectedMsaViewId?: string; structureViewId?: string },
): T | undefined {
  const msaViews = views.filter(v => v.type === 'MsaView')
  const byExplicitId = connectedMsaViewId
    ? msaViews.find(v => v.id === connectedMsaViewId)
    : undefined
  const bySharedGenomeView = structureViewId
    ? msaViews.find(v => v.connectedViewId === structureViewId)
    : undefined
  return byExplicitId ?? bySharedGenomeView
}
