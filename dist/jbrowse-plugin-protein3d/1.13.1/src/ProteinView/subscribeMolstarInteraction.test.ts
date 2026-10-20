import { EmptyLoci } from 'molstar/lib/mol-model/loci'
import { BehaviorSubject } from 'rxjs'
import { expect, test, vi } from 'vitest'

import subscribeMolstarInteraction from './subscribeMolstarInteraction'

vi.mock('./loadMolstar', async () => {
  const { StructureElement } = await import('molstar/lib/mol-model/structure')
  return { default: async () => ({ StructureElement }) }
})

const event = () => ({ current: { loci: EmptyLoci } })

// Mol*'s streams are behaviors: a subscriber hears the last event at once,
// which at startup is an empty click, read as a click on the background
test('the event a behavior replays on subscribe is not reported', async () => {
  const click = new BehaviorSubject(event())
  const onUpdate = vi.fn()
  const dispose = await subscribeMolstarInteraction({
    plugin: { behaviors: { interaction: { click, hover: click } } },
    kind: 'click',
    onUpdate,
  })
  expect(onUpdate).not.toHaveBeenCalled()

  click.next(event())
  expect(onUpdate).toHaveBeenCalledExactlyOnceWith(undefined)

  dispose()
  click.next(event())
  expect(onUpdate).toHaveBeenCalledTimes(1)
})
