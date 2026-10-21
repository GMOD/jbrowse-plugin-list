import loadMolstar from './loadMolstar'
import { parseSite, siteExpression } from './residueSpec'
import { serialPerPlugin } from './serialPerPlugin'

import type * as MolstarExports from './molstarExports'
import type { Site } from './residueSpec'
import type {
  Structure,
  StructureElement,
} from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

type Molstar = typeof MolstarExports

export const MEASUREMENT_TAG = 'jbrowse-measurement'
const KEY_PREFIX = `${MEASUREMENT_TAG}:`

export const DEFAULT_DASH_COLOR = '#ffd60a'
const HEX_COLOR = /^#[0-9a-f]{6}$/i

/**
 * A dashed distance between two sites of one structure. Each side is a residue
 * (`A:248`), an atom of one (`A:248@NH2`) or a component id (`MOV`); a side
 * without an atom contributes the atom nearest the other side.
 */
export interface DistanceMeasurement {
  a: string
  b: string
  structure?: number
  color?: string
}

export interface MeasurementResult {
  measurement: DistanceMeasurement
  distance?: number
  atoms?: [string, string]
  error?: string
}

interface AtomRef {
  unit: Structure['units'][number]
  index: number
  name: string
  residue: string
  position: ReturnType<Molstar['Vec3']>
}

function atomsOf(molstar: Molstar, structure: Structure, site: Site) {
  const {
    MolScriptBuilder: MS,
    OrderedSet,
    Script,
    StructureElement,
    StructureProperties: SP,
    StructureSelection,
    Vec3,
  } = molstar
  const loci = StructureSelection.toLociWithSourceUnits(
    Script.getStructureSelection(siteExpression(MS, site), structure),
  )
  const location = StructureElement.Location.create(structure)
  const atoms: AtomRef[] = []
  for (const { unit, indices } of loci.elements) {
    OrderedSet.forEach(indices, index => {
      const element = unit.elements[index]!
      StructureElement.Location.set(location, structure, unit, element)
      atoms.push({
        unit,
        index,
        name: SP.atom.label_atom_id(location),
        residue: `${SP.chain.auth_asym_id(location)}:${SP.residue.auth_seq_id(location)}`,
        position: unit.conformation.position(element, Vec3()),
      })
    })
  }
  return atoms
}

/**
 * The nearest pair of atoms between two sites, or why there is none. The
 * residue-to-residue distance Mol* draws between two loci is between their
 * centres, so the pair is picked here and handed over as single atoms.
 */
export function closestAtoms(
  molstar: Molstar,
  structure: Structure,
  a: string,
  b: string,
) {
  const siteA = parseSite(a)
  const siteB = parseSite(b)
  if (!siteA || !siteB) {
    return { error: `${siteA ? b : a} is not a residue such as A:248` }
  }
  const atomsA = atomsOf(molstar, structure, siteA)
  const atomsB = atomsOf(molstar, structure, siteB)
  if (atomsA.length === 0 || atomsB.length === 0) {
    return { error: `${atomsA.length === 0 ? a : b} is not in the structure` }
  }
  const { Vec3 } = molstar
  let best: { a: AtomRef; b: AtomRef; distance: number } | undefined
  for (const atomA of atomsA) {
    for (const atomB of atomsB) {
      const distance = Vec3.distance(atomA.position, atomB.position)
      const same = atomA.unit === atomB.unit && atomA.index === atomB.index
      if (!same && (!best || distance < best.distance)) {
        best = { a: atomA, b: atomB, distance }
      }
    }
  }
  return best ?? { error: `${a} and ${b} are the same atom` }
}

function atomLoci(molstar: Molstar, structure: Structure, atom: AtomRef) {
  return molstar.StructureElement.Loci(structure, [
    {
      unit: atom.unit,
      indices: molstar.OrderedSet.ofSingleton(
        atom.index as StructureElement.UnitIndex,
      ),
    },
  ])
}

function keyOf(structure: Structure, m: DistanceMeasurement) {
  return `${KEY_PREFIX}${structure.model.id}|${m.a}|${m.b}|${m.color ?? ''}`
}

/**
 * Make the distances drawn in Mol* match `measurements`: the ones no longer
 * wanted go, the new ones go through Mol*'s measurement manager, and the rest
 * stay. A measurement is addressed by its structure's model and its text, so
 * a reloaded structure draws them again. Distances the user made by hand with
 * Mol*'s own tool carry no tag and are left alone.
 */
export function syncMeasurements({
  plugin,
  structures,
  measurements,
  labels = true,
}: {
  plugin: PluginContext
  structures: readonly (Structure | undefined)[]
  measurements: readonly DistanceMeasurement[]
  /** the Å text beside each line; Node has no canvas to draw it in tests */
  labels?: boolean
}) {
  return serialPerPlugin(plugin, MEASUREMENT_TAG, async () => {
    const molstar = await loadMolstar()
    const { Color, StateSelection, StateTransforms } = molstar
    const existing = plugin.state.data.select(
      StateSelection.Generators.root
        .subtree()
        .withTag(MEASUREMENT_TAG)
        .withTransformer(
          StateTransforms.Model.MultiStructureSelectionFromBundle,
        ),
    )
    const drawn = new Map(
      existing.flatMap(cell => {
        const key = cell.transform.tags?.find(t => t.startsWith(KEY_PREFIX))
        return key ? [[key, cell.transform.ref] as const] : []
      }),
    )
    const wanted = new Map<
      string,
      {
        structure: Structure
        pair: Exclude<ReturnType<typeof closestAtoms>, { error: string }>
        color: string
      }
    >()
    const results = measurements.map((measurement): MeasurementResult => {
      const structure = structures[measurement.structure ?? 0]
      if (!structure) {
        return { measurement, error: 'the structure is not loaded' }
      }
      const pair = closestAtoms(
        molstar,
        structure,
        measurement.a,
        measurement.b,
      )
      if ('error' in pair) {
        return { measurement, error: pair.error }
      }
      wanted.set(keyOf(structure, measurement), {
        structure,
        pair,
        color: HEX_COLOR.test(measurement.color ?? '')
          ? measurement.color!
          : DEFAULT_DASH_COLOR,
      })
      return {
        measurement,
        distance: pair.distance,
        atoms: [
          `${pair.a.residue}@${pair.a.name}`,
          `${pair.b.residue}@${pair.b.name}`,
        ],
      }
    })

    const remove = plugin.state.data.build()
    for (const [key, ref] of drawn) {
      if (!wanted.has(key)) {
        remove.delete(ref)
      }
    }
    if (remove.editInfo.count > 0) {
      await remove.commit()
    }
    for (const [key, { structure, pair, color }] of wanted) {
      if (!drawn.has(key)) {
        await plugin.managers.structure.measurement.addDistance(
          atomLoci(molstar, structure, pair.a),
          atomLoci(molstar, structure, pair.b),
          {
            selectionTags: [MEASUREMENT_TAG, key],
            reprTags: [MEASUREMENT_TAG],
            // sized to read in a figure, not only on screen
            visualParams: {
              linesColor: Color.fromHexStyle(color),
              visuals: labels ? ['lines', 'text'] : ['lines'],
              linesSize: 0.12,
              textSize: 4,
              // beside the line rather than on the atoms it measures
              attachment: 'bottom-left',
              offsetX: 1.2,
              offsetY: 1.2,
              offsetZ: 2,
              background: true,
              backgroundColor: Color.fromHexStyle('#ffffff'),
              backgroundOpacity: 0.85,
              backgroundMargin: 0.3,
            },
          },
        )
      }
    }
    return results
  })
}
