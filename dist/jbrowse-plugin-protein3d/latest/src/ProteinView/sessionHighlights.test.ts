// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import loadMolstar from './loadMolstar'
import {
  DEFAULT_HIGHLIGHT_COLOR,
  SESSION_HIGHLIGHTS_TAG,
  copyCenters,
  highlightCameraSnapshot,
  labelAnchors,
  sessionHighlightResidues,
  syncSessionHighlightMarks,
  withoutLabelledResidues,
} from './sessionHighlights'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { GenomeHighlight } from './sessionHighlights'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

// minus strand: residue 0 on bases 109..107, residue 1 on 106..104, residue 2
// on 103..101; the structure starts at residue 1, numbered label_seq_id 5..
const g2p: Record<number, number> = {}
for (let base = 101; base < 110; base++) {
  g2p[base] = Math.floor((109 - base) / 3)
}

function residues(highlights: GenomeHighlight[], labels = true) {
  return sessionHighlightResidues({
    highlights,
    mapping: { g2p, refName: 'chr12' },
    naming: {
      canonicalRefName: r => r.replace(/^chr/, ''),
      isAssembly: name => name === 'hg38',
    },
    entity: { entityId: '1', seqIds: [5, 6] },
    transcriptToStructure: { 1: 0, 2: 1 },
    labels,
  })
}

const codon = (start: number, label?: string, color?: string) => ({
  assemblyName: 'hg38',
  refName: 'chr12',
  start,
  end: start + 3,
  label,
  color,
})

test("a codon marks the structure residue it codes, in core's highlight color by default", () => {
  expect(residues([codon(104, 'G12')])).toEqual([
    {
      entityId: '1',
      labelSeqIds: [5],
      label: 'G12',
      color: DEFAULT_HIGHLIGHT_COLOR,
    },
  ])
  expect(residues([codon(101, undefined, '#00f')])[0]?.color).toBe('#00f')
})

test('a region over the structure and off it marks only the residues it has', () => {
  expect(
    residues([{ assemblyName: 'hg38', refName: '12', start: 101, end: 110 }]),
  ).toEqual([
    {
      entityId: '1',
      labelSeqIds: [5, 6],
      label: undefined,
      color: DEFAULT_HIGHLIGHT_COLOR,
    },
  ])
  // residue 0 has no structure residue
  expect(residues([codon(107)])).toEqual([])
})

test('a highlight on another assembly or chromosome marks nothing', () => {
  expect(
    residues([
      { ...codon(104), assemblyName: 'mm39' },
      { ...codon(104), refName: 'chr7' },
    ]),
  ).toEqual([])
})

test('labels turned off in the session keep the residues and drop the text', () => {
  expect(residues([codon(104, 'G12')], false)[0]?.label).toBeUndefined()
})

function tagged(plugin: PluginContext) {
  const cells = (transformer: unknown) =>
    plugin.state.data.select(
      StateSelection.Generators.root
        .subtree()
        .withTag(SESSION_HIGHLIGHTS_TAG)
        .filter(c => c.transform.transformer === transformer),
    )
  const residues = cells(
    StateTransforms.Representation.StructureRepresentation3D,
  )
  return {
    residues,
    types: residues.map(c => c.transform.params?.type.name),
    anchors: cells(StateTransforms.Model.MultiStructureSelectionFromExpression),
  }
}

async function helix(plugin: PluginContext, chains = ['A']) {
  const [molstarStructure] = (
    await loadCaOnly(
      plugin,
      chains.map(asym => ({
        asym,
        entity: '1',
        residues: Array(12).fill('ALA'),
      })),
    )
  ).structures
  if (!molstarStructure) {
    throw new Error('no structure loaded')
  }
  return molstarStructure
}

test('a labelled mark draws spheres and an anchor, an unlabelled one sticks, and a re-sync replaces them', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const molstarStructure = await helix(plugin)
    const sync = (marks: Parameters<typeof residues>[0]) =>
      syncSessionHighlightMarks({
        plugin,
        structures: [{ molstarStructure, marks: residues(marks) }],
      })

    await sync([codon(104, 'G12'), codon(101)])
    const first = tagged(plugin)
    expect(first.types).toEqual(['spacefill', 'ball-and-stick'])
    expect([...labelAnchors(plugin).values()]).toEqual([
      { label: 'G12', color: DEFAULT_HIGHLIGHT_COLOR },
    ])

    await sync([codon(101, 'Q61')])
    expect(tagged(plugin).types).toEqual(['spacefill'])
    expect([...labelAnchors(plugin).values()].map(a => a.label)).toEqual([
      'Q61',
    ])

    await sync([])
    expect(tagged(plugin).residues).toHaveLength(0)
    expect(labelAnchors(plugin).size).toBe(0)
  })
})

// haemoglobin's four β chains each carry Val6, and each copy is the residue
test('a homo-oligomer draws a highlighted residue on every chain, and its anchor finds each copy', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const molstarStructure = await helix(plugin, ['A', 'B'])
    const chainsOf = (cell: { obj?: { data?: unknown } } | undefined) =>
      new Set(
        (
          cell?.obj?.data as
            { sourceData: { units: { chainGroupId: number }[] } } | undefined
        )?.sourceData.units.map(u => u.chainGroupId),
      ).size
    await syncSessionHighlightMarks({
      plugin,
      structures: [
        {
          molstarStructure,
          marks: residues([codon(104, 'G12'), codon(101)]),
        },
      ],
    })
    const { residues: drawn, anchors } = tagged(plugin)
    expect(drawn.map(chainsOf)).toEqual([2, 2])
    const molstar = await loadMolstar()
    const loci = (
      anchors[0]?.obj?.data as
        { loci: Parameters<typeof copyCenters>[1] }[] | undefined
    )?.[0]?.loci
    const centers = copyCenters(molstar, loci!)
    expect(centers).toHaveLength(2)
    // the test chains sit 20 Å apart along x
    expect(centers[1]![0]! - centers[0]![0]!).toBeCloseTo(20)
  })
})

test("the camera looks from the labelled residues' side at Mol*'s framing distance", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const molstarStructure = await helix(plugin)
    await syncSessionHighlightMarks({
      plugin,
      structures: [{ molstarStructure, marks: residues([codon(104, 'G12')]) }],
    })
    const molstar = await loadMolstar()
    const snapshot = highlightCameraSnapshot(plugin, molstar)
    expect(snapshot).toBeDefined()
    const { center } = molstarStructure.boundary.sphere
    const residue = molstar.StructureElement.Loci.getBoundary(
      (
        tagged(plugin).anchors[0]?.obj?.data as {
          loci: Parameters<typeof molstar.StructureElement.Loci.getBoundary>[0]
        }[]
      )[0]!.loci,
    ).sphere.center
    const camera = {
      state: { up: [0, 1, 0] },
      getFocus: (target: number[]) => ({
        target,
        position: [target[0]!, target[1]!, target[2]! + 50],
      }),
    }
    const next = snapshot!(camera as never)
    const { Vec3 } = molstar
    const view = Vec3.sub(Vec3(), next.position, center)
    const outward = Vec3.sub(Vec3(), residue, center)
    expect(Vec3.magnitude(view)).toBeCloseTo(50)
    expect(Vec3.angle(view, outward)).toBeCloseTo(0)
    expect(Vec3.dot(next.up!, view)).toBeCloseTo(0)
  })
})

test('nothing labelled leaves the camera alone', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const molstarStructure = await helix(plugin)
    await syncSessionHighlightMarks({
      plugin,
      structures: [{ molstarStructure, marks: residues([codon(104)]) }],
    })
    expect(highlightCameraSnapshot(plugin, await loadMolstar())).toBeUndefined()
  })
})

test('a labelled residue fades the cartoon around it, and an unlabelled one does not', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const molstarStructure = await helix(plugin)
    const fades = () =>
      plugin.state.data.select(
        StateSelection.Generators.root
          .subtree()
          .withTag(SESSION_HIGHLIGHTS_TAG)
          .filter(
            c =>
              c.transform.transformer ===
              StateTransforms.Representation
                .TransparencyStructureRepresentation3DFromScript,
          ),
      )
    const sync = (marks: Parameters<typeof residues>[0]) =>
      syncSessionHighlightMarks({
        plugin,
        structures: [{ molstarStructure, marks: residues(marks) }],
      })
    await sync([codon(104)])
    expect(fades()).toHaveLength(0)
    await sync([codon(104, 'G12')])
    expect(fades().length).toBeGreaterThan(0)
  })
})

test("a seeded selection skips a labelled mark's residues and keeps an unlabelled mark's", () => {
  const marks = [
    { entityId: '1', labelSeqIds: [12], label: 'G12', color: '#000' },
    { entityId: '1', labelSeqIds: [13], color: '#000' },
  ]
  expect(withoutLabelledResidues([11, 12, 13], marks)).toEqual([11, 13])
})
