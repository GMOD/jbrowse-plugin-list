import { readWalkReference } from './walkReference'

const walks =
  require.resolve('../RgfaTabixAdapter/test_data/walks7/header.GRCh38.walks.gz')

const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation' as const,
})

test("reads the reference sample from a walk file's header", async () => {
  expect(await readWalkReference(local(walks), undefined)).toBe('GRCh38')
  expect(await readWalkReference(local(walks), local(`${walks}.idx`))).toBe(
    'GRCh38',
  )
})

test('a walk file it cannot read gives no reference', async () => {
  expect(
    await readWalkReference(local(`${walks}.missing`), undefined),
  ).toBeUndefined()
})
