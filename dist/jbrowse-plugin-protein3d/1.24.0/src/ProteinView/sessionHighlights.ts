/**
 * The session's highlights on a structure. `session.highlights` is one list of
 * labelled genome regions that every view draws on its own terms: a band on
 * the genome, a column on the alignment, and here the residues the region
 * codes for, on every chain that has them: sticks for an unlabelled
 * highlight, and spheres for a labelled one, with the cartoon around them
 * faded and the label written over the canvas by HighlightLabels on the copy
 * nearest the viewer. A figure or a shared session thus names the same
 * position in each view.
 *
 * Every Mol* cell this makes is tagged `SESSION_HIGHLIGHTS_TAG`. A change
 * rebuilds all of them, since highlights change by hand and a structure holds
 * a few.
 */
import { colord } from '@jbrowse/core/util/colord'

import { SITES_TAG } from './alignmentSites'
import loadMolstar from './loadMolstar'
import { structureRootCell } from './structureCells'

import type { GenomeNaming } from './util'
import type { Camera } from 'molstar/lib/mol-canvas3d/camera'
import type { Vec3 } from 'molstar/lib/mol-math/linear-algebra'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

type Molstar = Awaited<ReturnType<typeof loadMolstar>>

export const SESSION_HIGHLIGHTS_TAG = 'jbrowse-session-highlights'

// core's default highlight color, which the genome view's band draws in
export const DEFAULT_HIGHLIGHT_COLOR = '#ffb11d'

/** A session highlight: a genome region, 0-based half-open */
export interface GenomeHighlight {
  assemblyName: string
  refName: string
  start: number
  end: number
  label?: string
  color?: string
}

// The genome band draws a translucent highlight over the tracks; Mol* would
// read the alpha into the sphere's color
function opaque(css: string) {
  return colord(css).alpha(1).toHex()
}

const THREE_LETTER: Record<string, string> = {
  A: 'Ala',
  R: 'Arg',
  N: 'Asn',
  D: 'Asp',
  C: 'Cys',
  Q: 'Gln',
  E: 'Glu',
  G: 'Gly',
  H: 'His',
  I: 'Ile',
  L: 'Leu',
  K: 'Lys',
  M: 'Met',
  F: 'Phe',
  P: 'Pro',
  S: 'Ser',
  T: 'Thr',
  W: 'Trp',
  Y: 'Tyr',
  V: 'Val',
}

// a protein change as a paper writes it: E46K, Y220C, R273H
const PROTEIN_CHANGE = /^[A-Z](\d+)[A-Z]$/

/**
 * A label naming a protein change, such as E46K, reads in 3D as the residue
 * this structure has there: Glu46 on wild type, Lys46 on the E46K structure.
 * The genome band keeps the change's name. Any other label is drawn as given.
 */
export function structureLabel(label: string, aa: string | undefined) {
  const match = PROTEIN_CHANGE.exec(label)
  const name = aa ? THREE_LETTER[aa] : undefined
  return match && name ? `${name}${match[1]}` : label
}

/** One highlight's residues on the mapped entity */
export interface ResidueMark {
  entityId: string
  labelSeqIds: number[]
  label?: string
  color: string
}

/**
 * Each highlight's residues on the mapped entity: genome base → transcript
 * residue (`g2p`) → structure residue → `label_seq_id`. A highlight on
 * another assembly or chromosome, or on residues the structure lacks, marks
 * nothing.
 */
export function sessionHighlightResidues({
  highlights,
  mapping,
  naming,
  entity,
  transcriptToStructure,
  labels,
}: {
  highlights: readonly GenomeHighlight[]
  mapping: { g2p: Record<number, number>; refName: string }
  naming: GenomeNaming
  entity: { entityId: string; seqIds: readonly number[]; seq?: string }
  transcriptToStructure: Record<number, number>
  /** whether the session writes labels on its highlights */
  labels: boolean
}): ResidueMark[] {
  const refName = naming.canonicalRefName(mapping.refName)
  return highlights.flatMap(h => {
    if (
      !naming.isAssembly(h.assemblyName) ||
      naming.canonicalRefName(h.refName) !== refName
    ) {
      return []
    }
    const labelSeqIds = new Set<number>()
    let firstPos: number | undefined
    for (let base = h.start; base < h.end; base++) {
      const residue = mapping.g2p[base]
      const structurePos =
        residue === undefined ? undefined : transcriptToStructure[residue]
      const labelSeqId =
        structurePos === undefined ? undefined : entity.seqIds[structurePos]
      if (labelSeqId !== undefined) {
        labelSeqIds.add(labelSeqId)
        firstPos ??= structurePos
      }
    }
    return labelSeqIds.size > 0
      ? [
          {
            entityId: entity.entityId,
            labelSeqIds: [...labelSeqIds].sort((a, b) => a - b),
            label:
              labels && h.label
                ? structureLabel(
                    h.label,
                    firstPos === undefined ? undefined : entity.seq?.[firstPos],
                  )
                : undefined,
            color: opaque(h.color ?? DEFAULT_HIGHLIGHT_COLOR),
          },
        ]
      : []
  })
}

/**
 * `labelSeqIds` without the residues a labelled mark draws: a seeded
 * selection's solid color would hide the mark's, and the label already
 * points there
 */
export function withoutLabelledResidues(
  labelSeqIds: readonly number[],
  marks: readonly ResidueMark[],
) {
  const labelled = new Set(marks.flatMap(m => (m.label ? m.labelSeqIds : [])))
  return labelSeqIds.filter(id => !labelled.has(id))
}

/** The label and color of each labelled residue's anchor cell, by state ref */
const anchorsByPlugin = new WeakMap<
  PluginContext,
  Map<string, { label: string; color: string; labelSeqIds: number[] }>
>()

export function labelAnchors(plugin: PluginContext) {
  let anchors = anchorsByPlugin.get(plugin)
  if (!anchors) {
    anchors = new Map()
    anchorsByPlugin.set(plugin, anchors)
  }
  return anchors
}

/**
 * Each chain's copy of the residues in `loci` and its centre, in the order
 * the structure holds the chains: haemoglobin's four β chains each carry
 * Val6, and the label goes on the copy nearest the viewer
 */
export function copyCenters(
  molstar: Molstar,
  loci: Parameters<Molstar['StructureElement']['Loci']['getBoundary']>[0],
) {
  const { StructureElement } = molstar
  const byChain = new Map<number, (typeof loci.elements)[number][]>()
  for (const element of loci.elements) {
    const chain = element.unit.chainGroupId
    byChain.set(chain, [...(byChain.get(chain) ?? []), element])
  }
  return [...byChain.entries()].map(([chain, elements]) => ({
    chain,
    center: StructureElement.Loci.getBoundary(
      StructureElement.Loci(loci.structure, elements),
    ).sphere.center,
  }))
}

/**
 * Whether a Mol* pick landed on `chain`'s copy of the residues: a hit on the
 * same chain's cartoon in front of them does not count
 */
export function pickHitsCopy(
  molstar: Molstar,
  loci: { kind: string } | undefined,
  chain: number,
  labelSeqIds: readonly number[],
) {
  const { StructureElement, StructureProperties: SP } = molstar
  if (!loci || !StructureElement.Loci.is(loci)) {
    return false
  }
  const location = StructureElement.Loci.getFirstLocation(loci)
  return (
    location?.unit.chainGroupId === chain &&
    labelSeqIds.includes(SP.residue.label_seq_id(location))
  )
}

// how far around a labelled residue the cartoon fades, and how much
const FADE_RADIUS = 12
const FADE_TRANSPARENCY = 0.75

/**
 * Make each structure's highlight marks match `marks`: the old ones go, and
 * each mark gets its residues in its color on every chain that has them. A
 * labelled mark also gets an anchor cell, the selection HighlightLabels
 * points its label at, and fades the cartoon around it.
 */
export async function syncSessionHighlightMarks({
  plugin,
  structures,
}: {
  plugin: PluginContext
  structures: readonly {
    molstarStructure: Structure
    marks: readonly ResidueMark[]
    /** the author chains drawn, when the structure draws only some */
    chains?: readonly string[]
  }[]
}) {
  const molstar = await loadMolstar()
  const {
    Color,
    MolScriptBuilder: MS,
    Script,
    StateSelection,
    StateTransforms,
    createStructureRepresentationParams,
    formatMolScript,
  } = molstar
  const anchors = labelAnchors(plugin)
  const update = plugin.state.data.build()
  const existing = plugin.state.data.select(
    StateSelection.Generators.root.subtree().withTag(SESSION_HIGHLIGHTS_TAG),
  )
  for (const cell of existing) {
    anchors.delete(cell.transform.ref)
    update.delete(cell.transform.ref)
  }
  for (const { molstarStructure, marks, chains } of structures) {
    const root = structureRootCell(plugin, molstar, molstarStructure)
    if (!root) {
      continue
    }
    const labelled = []
    for (const { entityId, labelSeqIds, label, color } of marks) {
      const expression = MS.struct.generator.atomGroups({
        'entity-test': MS.core.rel.eq([MS.ammp('label_entity_id'), entityId]),
        'residue-test': MS.core.set.has([
          MS.set(...labelSeqIds),
          MS.ammp('label_seq_id'),
        ]),
        ...(chains?.length
          ? {
              'chain-test': MS.core.set.has([
                MS.set(...chains),
                MS.ammp('auth_asym_id'),
              ]),
            }
          : {}),
      })
      update
        .to(root)
        .apply(
          StateTransforms.Model.StructureComponent,
          {
            type: { name: 'expression', params: expression },
            nullIfEmpty: true,
            label: label ?? 'Session highlight',
          },
          { tags: [SESSION_HIGHLIGHTS_TAG] },
        )
        .apply(
          StateTransforms.Representation.StructureRepresentation3D,
          createStructureRepresentationParams(plugin, molstarStructure, {
            ...(label
              ? { type: 'spacefill', typeParams: { sizeFactor: 1 } }
              : {
                  type: 'ball-and-stick',
                  typeParams: { sizeFactor: 0.3, sizeAspectRatio: 0.6 },
                }),
            color: 'uniform',
            colorParams: { value: Color.fromHexStyle(color) },
          }),
          { tags: [SESSION_HIGHLIGHTS_TAG] },
        )
      if (label) {
        labelled.push(expression)
        const anchor = update.toRoot().apply(
          StateTransforms.Model.MultiStructureSelectionFromExpression,
          {
            selections: [{ key: 'a', ref: root.transform.ref, expression }],
            isTransitive: true,
            label,
          },
          {
            dependsOn: [root.transform.ref],
            tags: [SESSION_HIGHLIGHTS_TAG],
          },
        )
        anchors.set(anchor.ref, { label, color, labelSeqIds })
      }
    }
    if (labelled.length > 0) {
      const hotspots = MS.struct.combinator.merge(labelled)
      const around = Script(
        formatMolScript(
          MS.struct.modifier.exceptBy({
            0: MS.struct.modifier.includeSurroundings({
              0: hotspots,
              radius: FADE_RADIUS,
              'as-whole-residues': true,
            }),
            by: hotspots,
          }),
        ),
        'mol-script',
      )
      const representations = plugin.state.data.select(
        StateSelection.Generators.ofTransformer(
          StateTransforms.Representation.StructureRepresentation3D,
          root.transform.ref,
        ),
      )
      for (const representation of representations) {
        if (
          !representation.state.isGhost &&
          !representation.transform.tags?.includes(SESSION_HIGHLIGHTS_TAG) &&
          !representation.transform.tags?.includes(SITES_TAG)
        ) {
          update
            .to(representation)
            .apply(
              StateTransforms.Representation
                .TransparencyStructureRepresentation3DFromScript,
              { layers: [{ script: around, value: FADE_TRANSPARENCY }] },
              { tags: [SESSION_HIGHLIGHTS_TAG] },
            )
        }
      }
    }
  }
  await update.commit()
}

/**
 * The camera that looks at the whole structure from the side the first copy
 * of its labelled residues sits on, at the distance Mol* frames the scene
 * from, or undefined when nothing is labelled or the residues average out at
 * the centre. A residue facing away from the camera hides behind the fold,
 * so a label there points at nothing visible.
 */
export function highlightCameraSnapshot(
  plugin: PluginContext,
  molstar: Molstar,
) {
  const { StateSelection, StateTransforms, Vec3 } = molstar
  const anchors = plugin.state.data.select(
    StateSelection.Generators.root
      .subtree()
      .withTag(SESSION_HIGHLIGHTS_TAG)
      .withTransformer(
        StateTransforms.Model.MultiStructureSelectionFromExpression,
      ),
  )
  const mean = Vec3()
  let n = 0
  let sphere: { center: Vec3; radius: number } | undefined
  for (const cell of anchors) {
    const loci = (
      cell.obj?.data as
        | {
            loci: Parameters<
              Molstar['StructureElement']['Loci']['getBoundary']
            >[0]
          }[]
        | undefined
    )?.[0]?.loci
    const first = loci ? copyCenters(molstar, loci)[0] : undefined
    if (loci && first) {
      Vec3.add(mean, mean, first.center)
      sphere ??= loci.structure.boundary.sphere
      n++
    }
  }
  if (!sphere) {
    return undefined
  }
  const target = Vec3.clone(sphere.center)
  const { radius } = sphere
  const outward = Vec3.sub(Vec3(), Vec3.scale(mean, mean, 1 / n), target)
  if (Vec3.magnitude(outward) < 1) {
    return undefined
  }
  Vec3.normalize(outward, outward)
  return (camera: Pick<Camera, 'getFocus' | 'state'>) => {
    const focus = camera.getFocus(target, radius)
    const distance = Vec3.distance(focus.position!, target)
    // the camera's up, levelled into the plane the new view faces
    const up = Vec3.clone(camera.state.up)
    Vec3.scaleAndAdd(up, up, outward, -Vec3.dot(up, outward))
    return {
      ...focus,
      position: Vec3.scaleAndAdd(Vec3(), target, outward, distance),
      ...(Vec3.magnitude(up) > 1e-6 ? { up: Vec3.normalize(up, up) } : {}),
    }
  }
}
