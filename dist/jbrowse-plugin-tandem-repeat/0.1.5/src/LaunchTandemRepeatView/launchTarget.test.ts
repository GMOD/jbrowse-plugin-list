import { launchTarget } from './index'

import type { DisplayModel } from './index'
import type { Feature } from '@jbrowse/core/util'

function feature(data: Record<string, unknown>) {
  return { get: (name: string) => data[name] } as Feature
}

const tandem = feature({
  refName: 'chr6',
  start: 100,
  end: 101,
  ALT: ['<CNV:TR>'],
  INFO: { SVLEN: [30], RN: [1], RUL: [10], RUC: [3] },
  samples: { HG00097: { GT: ['1'] } },
})

const display = (info: DisplayModel['contextMenuInfo'], fetched?: Feature) =>
  ({
    contextMenuItems: () => [],
    contextMenuInfo: info,
    fetchFullFeature: () => Promise.resolve(fetched),
  }) as unknown as DisplayModel

test('the multi-sample display offers the item on a <CNV:TR> record', () => {
  const slim = feature({
    refName: 'chr6',
    start: 100,
    end: 131,
    ALT: ['<CNV:TR>'],
  })
  expect(launchTarget(display({ feature: slim }))).toBeInstanceOf(Function)
  const snv = feature({ refName: 'chr6', start: 1, end: 2, ALT: ['A'] })
  expect(launchTarget(display({ feature: snv }))).toBeUndefined()
})

test('the single-row display offers it on a CNV-typed record and fetches on click', async () => {
  const fetchRecord = launchTarget(
    display(
      {
        item: { featureId: 'f1', type: 'copy_number_variation' },
        displayedRegionIndex: 0,
      },
      tandem,
    ),
  )
  expect(await fetchRecord?.()).toBe(tandem)
  expect(
    launchTarget(display({ item: { featureId: 'f2', type: 'SNV' } })),
  ).toBeUndefined()
})
