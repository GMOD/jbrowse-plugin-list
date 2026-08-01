# jbrowse-plugin-tview

Loads BAM/CRAM read pileups into
[react-msaview](https://github.com/GMOD/react-msaview) for a `samtools tview`
style interface inside JBrowse 2.

Because the reads are laid out as a multiple alignment, non-reference insertions
get their own columns instead of being collapsed into a marker: every read that
inserts at a position contributes its bases, and reads without that insertion
are padded so the reference columns still line up.

## Gallery

![tview expanding a non-reference insertion](img/tview-insertion.png)

The same reads at `ctgA:15,140..15,190`, twice. In the pileup above, the 1bp
insertion at 15,163 is collapsed into a column of purple `(1)` markers. In the
tview panel below it gets a real column (highlighted): reads carrying the
insertion show their base, reads that span the position without it show `-`, and
reads that do not cover it show `.` — so every row stays the same width and the
reference columns still line up.

Regenerate with `pnpm figure`.

## Usage

- Install the plugin
- Open the track menu (vertical `...`) on an alignments track
- Click "Launch tview for visible region"

The launched view stays connected to the genome view it came from: hovering or
clicking an alignment column highlights the corresponding genome position, and
clicking navigates there. "Zoom to base level on click?" in the view menu
switches between centering and zooming.

The visible region is capped at 20kb, since one column per base gets unwieldy
beyond that.

## Requirements

Needs a JBrowse build shipping `@jbrowse/core` >=4.3 with MUI 9 — currently
jbrowse-web nightly. On JBrowse 4.3.0 the bundle fails to load, because
react-msaview 5.x needs `@jbrowse/mobx-state-tree` 5.13 APIs and MUI 9 icon
internals that the 4.3.0 release does not ship.

## Development

```bash
pnpm install
pnpm start          # dev server on :9000, serves dist/out.js with CORS
pnpm test           # unit tests
pnpm test:e2e       # puppeteer tests (creates .test-jbrowse nightly on first run)
pnpm lint
pnpm build
```

`pnpm start` serves the repo root, so a JBrowse instance unpacked at
`.test-jbrowse` can load the plugin from the same origin via
`http://localhost:9000/.test-jbrowse/index.html?config=../public/config.json`.
