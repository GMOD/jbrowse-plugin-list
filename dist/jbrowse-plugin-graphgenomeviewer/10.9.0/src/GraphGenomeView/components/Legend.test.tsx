import { PLACEMENT_CHOICE_TEXT } from '@jbrowse/bandage-core/gfa/departures'
import { render, screen } from '@testing-library/react'

import { LegendRowView } from './Legend'
import { NOTE_MAX_WIDTH_PX } from './legendStyles'

// pggb's walk rows key wrote its placement choice note on one line, and the
// key took about 550 px of the pane
test('a long note wraps at its width, so the key is no wider than that', () => {
  render(
    <LegendRowView
      row={{
        key: 'placement',
        label: `${PLACEMENT_CHOICE_TEXT}: the writer chose which pass of a node the reference passes more than once a step takes`,
      }}
    />,
  )
  const note = screen.getByText(new RegExp(`^${PLACEMENT_CHOICE_TEXT}:`))
  expect(NOTE_MAX_WIDTH_PX).toBe(260)
  expect(note.style.maxWidth).toBe('260px')
  expect(note.style.whiteSpace).toBe('normal')
})

// The review's clipped count lines: every placeholder unlabelled, some, and
// none. The count rides the row of "nodes not shown", after its words, and
// is sized by the widest it can come to, unseen, whether or not the labels
// have filled it; nothing is kept for it under the row, which read as an
// empty line where every placeholder was labelled. Their lengths are the
// row's title.
test('the unlabelled count rides its row after the words, sized unseen by the widest it can come to, filled or blank', () => {
  for (const [count, sizer, title] of [
    [
      '1,204 unlabelled',
      '1,204 unlabelled',
      '1,204 unlabelled, 10.5 kb or less each',
    ],
    ['361 unlabelled', '377 unlabelled', '361 unlabelled, 2 bp or less each'],
    ['', '377 unlabelled', undefined],
  ]) {
    const { container, unmount } = render(
      <LegendRowView
        row={{
          key: 'not-shown',
          label: 'nodes not shown',
          swatch: { kind: 'fill', stops: [{ offset: 0, color: '#fff' }] },
          count,
          sizer,
          ...(title ? { title } : {}),
        }}
      />,
    )
    const sized = screen.getByTestId('graph-key-sizer')
    expect(sized.textContent).toBe(`· ${sizer}`)
    expect(sized.style.visibility).toBe('hidden')
    const shown = screen.getByTestId('graph-key-count')
    expect(shown.textContent).toBe(count ? `· ${count}` : '')
    expect(container.firstElementChild!.getAttribute('title')).toBe(
      title ?? null,
    )
    // one line: the words, then the count in the sizer's cell
    expect(container.firstElementChild!.children).toHaveLength(1)
    expect(shown.parentElement).toBe(sized.parentElement)
    expect(shown.parentElement!.previousElementSibling!.textContent).toBe(
      'nodes not shown',
    )
    // no wider than the sizer makes the key, clipped past it
    expect(shown.style.width).toBe('0px')
    expect(shown.style.minWidth).toBe('100%')
    expect(shown.style.overflow).toBe('hidden')
    expect(shown.style.textOverflow).toBe('ellipsis')
    unmount()
  }
})
