import { nameHue, pathCssColor, pathLegend } from './pathColors'

test('a P record legend is labelled by sample', () => {
  expect(
    pathLegend([
      { name: 'K12#1#chr:1004500-1004961', nodeIds: [] },
      { name: 'IAI39#1#chr:2249412-2249872', nodeIds: [] },
    ]),
  ).toEqual([
    {
      name: 'K12#1#chr:1004500-1004961',
      label: 'K12',
      color: pathCssColor(0, 2),
    },
    {
      name: 'IAI39#1#chr:2249412-2249872',
      label: 'IAI39',
      color: pathCssColor(1, 2),
    },
  ])
})

test('two haplotypes of one sample widen every label, not just theirs', () => {
  expect(
    pathLegend([
      { name: 'HG00738#1', nodeIds: [] },
      { name: 'HG00738#2', nodeIds: [] },
      { name: 'GRCh38#0', nodeIds: [] },
    ]).map(e => e.label),
  ).toEqual(['HG00738#1', 'HG00738#2', 'GRCh38#0'])
})

// The two names that motivated spreading hues by index rather than hashing
// them: hashed, they land 26 degrees apart and draw as two purples that no
// legend can separate.
test('names that hash to neighbouring hues still get distinct ribbons', () => {
  const sakai = 'Sakai#1#chr:1983339-1983535'
  const nctc86 = 'NCTC86#1#chr:1709109-1710286'
  expect(Math.abs(nameHue(sakai) - nameHue(nctc86))).toBeLessThan(30)

  const [a, b] = pathLegend([
    { name: sakai, nodeIds: [] },
    { name: nctc86, nodeIds: [] },
  ])
  expect(a!.color).toBe('hsl(0, 70%, 50%)')
  expect(b!.color).toBe('hsl(180, 70%, 50%)')
})

test('five paths spread evenly over the wheel', () => {
  expect(Array.from({ length: 5 }, (_, i) => pathCssColor(i, 5))).toEqual([
    'hsl(0, 70%, 50%)',
    'hsl(72, 70%, 50%)',
    'hsl(144, 70%, 50%)',
    'hsl(216, 70%, 50%)',
    'hsl(288, 70%, 50%)',
  ])
})

// The E. coli rRNA operons: pggb folds nine locations across five chromosomes
// onto one 908 bp run of graph, so odgi extract emits nine paths whose names
// differ only in the offset it appends.
test('repeat copies of one sequence are told apart by offset, not by name', () => {
  expect(
    pathLegend(
      [
        'K12#1#chr:4166751-4167659',
        'Sakai#1#chr:4735469-4736377',
        'Sakai#1#chr:4976146-4977054',
      ].map(name => ({ name, nodeIds: [] })),
    ).map(e => e.label),
  ).toEqual(['K12 @4,166,751', 'Sakai @4,735,469', 'Sakai @4,976,146'])
})

// but a plain two-haplotype cut still widens the name rather than reaching for
// an offset both paths share
test('two haplotypes at the same offset widen the name instead', () => {
  expect(
    pathLegend([
      { name: 'HG00738#1', nodeIds: [] },
      { name: 'HG00738#2', nodeIds: [] },
    ]).map(e => e.label),
  ).toEqual(['HG00738#1', 'HG00738#2'])
})
