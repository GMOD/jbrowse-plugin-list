import loadMolstar from './loadMolstar'
import { serialPerPlugin } from './serialPerPlugin'
import { structureRootCell } from './structureCells'
import {
  describeSuperposition,
  dissimilarFold,
  pairsCorrespond,
  shortChain,
} from './superpositionOutcome'

import type * as MolstarExports from './molstarExports'
import type {
  FallbackReason,
  ResiduePairFit,
  ResiduePairs,
  SuperposedChain,
  SuperpositionOutcome,
} from './superpositionOutcome'
import type { Mat4 } from 'molstar/lib/mol-math/linear-algebra'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StateObjectRef } from 'molstar/lib/mol-state'

type Molstar = typeof MolstarExports
type TraceLoci = ReturnType<Molstar['StructureElement']['Loci']['remap']>

const SuperpositionTag = 'SuperpositionTransform'

export interface LoadMapping {
  entityId: string
  /** each aligned residue's transcript position and one-letter code, by
   * label_seq_id */
  residues: ReadonlyMap<number, { transcript: number; code: string }>
  /** the author chains drawn, when only some are */
  drawnChains?: readonly string[]
}

export interface SuperposedLoad {
  label: string
  structures: readonly Structure[]
  /** absent for a structure no transcript maps to, which aligns whole */
  mapping?: LoadMapping
}

/**
 * Superpose every load onto the first, one load per structure of the view. A
 * load's first model decides its transform and all its models take the same
 * one, so an NMR ensemble moves as a unit and keeps its spread. The loads come
 * from the view rather than `hierarchy.current.structures`, which lists an
 * ensemble's models as separate structures: it used to align each of them on
 * its own, twenty TM-aligns for one NMR entry.
 *
 * A mapped load aligns by one copy of its mapped chain, the first one drawn,
 * as its highlight labels are placed: TM-align flattens every chain it is
 * given into one with no breaks, so a partner, a second copy or a DNA strand
 * steered the fit, and a peptide's partner landed where the peptide should.
 * Resolves to each load's outcome, the pivot's undefined.
 */
export function superposeStructures(
  plugin: PluginContext,
  loads: readonly SuperposedLoad[],
) {
  return serialPerPlugin(plugin, () => superpose(plugin, loads))
}

function primaryCopy(
  { StructureElement, StructureProperties: SP }: Molstar,
  structure: Structure,
  { entityId, drawnChains }: LoadMapping,
) {
  const copies = structure.units.flatMap(unit => {
    const location = StructureElement.Location.create(
      structure,
      unit,
      unit.elements[0],
    )
    return SP.entity.id(location) === entityId
      ? [
          {
            unit,
            chain: SP.chain.auth_asym_id(location),
            key: `${SP.chain.label_asym_id(location)} ${SP.unit.operator_name(location)}`,
          },
        ]
      : []
  })
  const first =
    copies.find(c => drawnChains?.includes(c.chain) ?? true) ?? copies[0]
  return first
    ? {
        chain: first.chain,
        unitIds: new Set(
          copies.filter(c => c.key === first.key).map(c => c.unit.id),
        ),
      }
    : undefined
}

interface Point {
  x: number
  y: number
  z: number
  code: string
}

// each traced residue's position, by the transcript position it aligns to
function transcriptTrace(
  { StructureElement, StructureProperties: SP }: Molstar,
  loci: TraceLoci,
  residues: LoadMapping['residues'],
) {
  const byTranscript = new Map<number, Point>()
  StructureElement.Loci.forEachLocation(loci, ({ unit, element }) => {
    const residue = residues.get(
      SP.residue.label_seq_id(
        StructureElement.Location.create(loci.structure, unit, element),
      ),
    )
    if (residue && !byTranscript.has(residue.transcript)) {
      const { conformation: c } = unit
      byTranscript.set(residue.transcript, {
        x: c.x(element),
        y: c.y(element),
        z: c.z(element),
        code: residue.code,
      })
    }
  })
  return byTranscript
}

// one copy of the mapped chain's trace, or the whole structure's unmapped
function traceLoci(
  molstar: Molstar,
  structure: Structure,
  mapping: LoadMapping | undefined,
) {
  const {
    QueryContext,
    StructureElement,
    StructureSelection,
    StructureSelectionQueries,
  } = molstar
  const whole = StructureSelection.toLociWithSourceUnits(
    StructureSelectionQueries.trace.query(new QueryContext(structure)),
  )
  const copy = mapping ? primaryCopy(molstar, structure, mapping) : undefined
  return {
    chain: copy?.chain,
    loci: copy
      ? StructureElement.Loci(
          whole.structure,
          whole.elements.filter(e => copy.unitIds.has(e.unit.id)),
        )
      : whole,
  }
}

function loadTrace(
  plugin: PluginContext,
  molstar: Molstar,
  { label, structures, mapping }: SuperposedLoad,
) {
  const [first] = structures
  const cells = structures.flatMap(
    s => structureRootCell(plugin, molstar, s) ?? [],
  )
  const [rootCell] = cells
  const root = rootCell?.obj?.data
  const traced = first ? traceLoci(molstar, first, mapping) : undefined
  const loci =
    traced && root
      ? molstar.StructureElement.Loci.remap(traced.loci, root)
      : undefined
  return rootCell && traced && loci
    ? {
        rootCell,
        cells,
        loci,
        chain: { label, chain: traced.chain } satisfies SuperposedChain,
        residues: molstar.StructureElement.Loci.size(loci),
        trace:
          traced.chain !== undefined && mapping
            ? transcriptTrace(molstar, loci, mapping.residues)
            : undefined,
      }
    : undefined
}

function residuePairs(
  pivot: ReadonlyMap<number, Point>,
  mobile: ReadonlyMap<number, Point>,
) {
  return [...mobile].flatMap(([t, b]) => {
    const a = pivot.get(t)
    return a ? [{ a, b }] : []
  })
}

type Pairs = ReturnType<typeof residuePairs>

function pairStats(pairs: Pairs): ResiduePairs {
  return {
    count: pairs.length,
    identity: pairs.length
      ? pairs.filter(({ a, b }) => a.code === b.code).length / pairs.length
      : 0,
  }
}

function placedRmsd(
  { Vec3 }: Molstar,
  pairs: Pairs,
  transform: Mat4,
): ResiduePairFit {
  const sum = pairs.reduce(
    (acc, { a, b }) =>
      acc +
      Vec3.squaredDistance(
        Vec3.create(a.x, a.y, a.z),
        Vec3.transformMat4(Vec3(), Vec3.create(b.x, b.y, b.z), transform),
      ),
    0,
  )
  return { ...pairStats(pairs), rmsd: Math.sqrt(sum / pairs.length) }
}

function fitPairs({ MinimizeRmsd }: Molstar, pairs: Pairs) {
  const side = (points: Point[]) => ({
    x: points.map(p => p.x),
    y: points.map(p => p.y),
    z: points.map(p => p.z),
  })
  return MinimizeRmsd.compute({
    a: side(pairs.map(p => p.a)),
    b: side(pairs.map(p => p.b)),
  })
}

type Trace = NonNullable<ReturnType<typeof loadTrace>>

/**
 * Where `mobile` goes: TM-align's placement, unless both chains map to the
 * transcript and the shorter is too short to have a fold or TM-align finds
 * none, in which case the residues aligned to the same transcript positions
 * decide; with too few of them, or too few identical to be the same
 * protein's, it stays where its file places it.
 */
function place(molstar: Molstar, pivot: Trace, mobile: Trace) {
  const mapped = !!pivot.trace && !!mobile.trace
  const pairs =
    pivot.trace && mobile.trace ? residuePairs(pivot.trace, mobile.trace) : []
  const ends = { structure: mobile.chain, pivot: pivot.chain }

  const fallBack = (reason: FallbackReason) => {
    const stats = pairStats(pairs)
    const fit = pairsCorrespond(stats) ? fitPairs(molstar, pairs) : undefined
    return fit
      ? {
          transform: fit.bTransform,
          outcome: {
            method: 'residue-pairs',
            ...ends,
            reason,
            pairs: { ...stats, rmsd: fit.rmsd },
          } satisfies SuperpositionOutcome,
        }
      : {
          transform: undefined,
          outcome: {
            method: 'unmoved',
            ...ends,
            reason,
            pairs: stats,
          } satisfies SuperpositionOutcome,
        }
  }

  const tmAligned = (tm: ReturnType<Molstar['tmAlign']>) => {
    const tmScore =
      mobile.residues <= pivot.residues ? tm.tmScoreB : tm.tmScoreA
    const dissimilar = mapped ? dissimilarFold(tmScore) : undefined
    return dissimilar
      ? fallBack(dissimilar)
      : {
          transform: tm.bTransform,
          outcome: {
            method: 'tm-align',
            ...ends,
            tmScore,
            rmsd: tm.rmsd,
            alignedLength: tm.alignedLength,
            pairs: pairs.length
              ? placedRmsd(molstar, pairs, tm.bTransform)
              : undefined,
          } satisfies SuperpositionOutcome,
        }
  }

  const short = mapped
    ? shortChain(
        { ...pivot.chain, residues: pivot.residues },
        { ...mobile.chain, residues: mobile.residues },
      )
    : undefined
  return short
    ? fallBack(short)
    : tmAligned(molstar.tmAlign(pivot.loci, mobile.loci))
}

async function superpose(
  plugin: PluginContext,
  loads: readonly SuperposedLoad[],
) {
  const molstar = await loadMolstar()
  const { PluginCommands, StateTransforms } = molstar

  // each trace stays paired with the load it came from and the cells it
  // moves, so a load that yields none cannot shift a transform onto its
  // neighbour
  const traces = loads.flatMap((load, index) => {
    const trace = loadTrace(plugin, molstar, load)
    return trace ? [{ index, ...trace }] : []
  })

  const [pivot, ...mobile] = traces
  const outcomes = new Map<number, SuperpositionOutcome>()
  if (pivot && mobile.length > 0) {
    // the pivot keeps a transform an earlier superposition gave it, as when
    // the structure it was aligned to has been removed, and the rest follow
    // it there
    const pivotTransform = plugin.state.data.selectQ(q =>
      q
        .byValue(pivot.rootCell)
        .subtree()
        .withTransformer(StateTransforms.Model.TransformStructureConformation),
    )[0]
    const coordinateSystem = pivotTransform?.obj?.data.coordinateSystem

    for (const trace of mobile) {
      const { transform, outcome } = place(molstar, pivot, trace)
      for (const cell of trace.cells) {
        await applyTransform(molstar, plugin, cell, transform, coordinateSystem)
      }
      outcomes.set(trace.index, outcome)
      const line = describeSuperposition(outcome)
      if (outcome.method === 'tm-align') {
        plugin.log.info(line)
      } else {
        plugin.log.warn(line)
      }
    }

    // a hidden tab runs no animation frame, and the wait would never end
    await new Promise(res => {
      requestAnimationFrame(res)
      setTimeout(res, 100)
    })
    await PluginCommands.Camera.Reset(plugin)
  }
  return loads.map((_, index) => outcomes.get(index))
}

/**
 * Moves `s` by `matrix` in the pivot's coordinate system, or with no matrix
 * back to where its file places it.
 */
async function applyTransform(
  { Mat4, StateObjectRef, StateTransforms }: Molstar,
  plugin: PluginContext,
  s: StateObjectRef,
  matrix: Mat4 | undefined,
  coordinateSystem: { matrix: Mat4 } | undefined,
) {
  const r = StateObjectRef.resolveAndCheck(plugin.state.data, s)
  const o = r
    ? plugin.state.data.selectQ(q =>
        q
          .byRef(r.transform.ref)
          .subtree()
          .withTransformer(
            StateTransforms.Model.TransformStructureConformation,
          ),
      )[0]
    : undefined

  const finalTransform = !matrix
    ? Mat4.identity()
    : coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix)
      ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix)
      : matrix

  const params = {
    transform: {
      name: 'matrix' as const,
      params: { data: finalTransform, transpose: false },
    },
  }

  const b = o
    ? plugin.state.data.build().to(o).update(params)
    : matrix
      ? plugin.state.data
          .build()
          .to(s)
          .insert(
            StateTransforms.Model.TransformStructureConformation,
            params,
            {
              tags: SuperpositionTag,
            },
          )
      : undefined

  if (r && b) {
    await plugin.runTask(plugin.state.data.updateTree(b))
  }
}
