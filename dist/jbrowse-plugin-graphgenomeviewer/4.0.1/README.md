# jbrowse-plugin-graphgenomeviewer

A JBrowse 2 plugin that draws a pangenome graph (GFA / rGFA) as a track of a
linear genome view, and as a **GraphGenomeView** of its own for a whole file.

## Screenshots

The LPA KIV-2 window of the HPRC release 2 graph in the **force-directed
layout**: the GRCh38 backbone runs left to right, coloured by position the way
the rGFA segments track above it is, and the kringle repeat array is the knot of
loops in the middle. Each bubble the graph holds is haloed along its own nodes
and labelled by what it is; the label opens the bubble on its own.

![KIV-2, force-directed, with its bubbles marked](img/force_kiv2.png)

Clicking the array's label opens its 29 segments in the same layout, with a
button back to the window. A popped graph derives its own bubbles, so a
superbubble opens level by level:

![The KIV-2 array popped open](img/force_kiv2_popped.png)

Over a gbz-base database the cut carries the haplotypes' walks. A node draws
thicker the more of them carry it, Bandage's depth as width, and every route
through a bubble is labelled at the far point of its loop for the haplotypes
that take it and how long it is, so the array reads as one copy count per
haplotype:

![KIV-2 over gbz-base, eight haplotypes, force-directed](img/force_kiv2_gbz.png)

Picking one walk lifts it out of the drawing. HG00133's route through the window
keeps its ink and the other haplotypes fade; the readout says it carries 116 kb
more than GRCh38 through the array:

![HG00133's walk lifted out of the KIV-2 cut](img/force_kiv2_walk.png)

MHC class II, where one 254-segment superbubble covers the DRB haplotype block
and a run of small indels follows it. The session's gene track is drawn onto the
graph: exons as dark stretches along the backbone nodes that carry them, and
each gene's name pinned under the backbone at its midpoint, so the superbubble
reads as HLA-DRB5's and the indels as HLA-DRB6's and HLA-DRB1's:

![MHC class II, force-directed, with genes on the backbone](img/force_mhc.png)

The KIV-2 window as a **variant map**, the reference as one line with one typed
glyph per bubble:

![Variant map of KIV-2](img/variant_map_kiv2.png)

It ships six layouts:

- **Force-directed**: the graph's shape, computed by the OGDF FMMM engine from
  [Bandage](https://github.com/rrwick/Bandage), seeded along the reference and
  turned to read left to right. The engine lays out unbranching runs rather than
  nodes, so a base-level cut of 15,000 nodes draws in a few seconds. The Walk
  picker lifts one haplotype out: its route keeps its ink, the rest fades, and a
  readout gives its length against the reference.
- **Variant map** (rGFA or a reference path): the reference as a line, one typed
  glyph per bubble, click to open a bubble's graph, and again for a bubble
  inside it.
- **Ordered** (rGFA or a reference path): x is reference order rather than bp,
  so every node gets room and a bubble reads as a lens. Scrolls sideways.
- **Anchored** (rGFA or a reference path): x is reference bp, one row per stable
  rank, aligned under a linear view.
- **Sample rows**: x is reference bp, one row per contributing assembly.
- **Walk rows** (W or P lines): x is each walk's own bp, one bar per haplotype,
  sequence the reference also carries in blue and sequence it does not in
  purple, so a repeat expansion reads as bar length. The Repeat picker tiles the
  bars by a repeat annotation's unit and marks the allele a genotyper called.

The bubbles come from `gfatools bubble` output beside the rGFA index
(`<prefix>.bubbles.bed.gz`), which HPRC's hosted graph has and
`scripts/build_rgfa_tabix.sh` in jbrowse-components writes, or, for a graph with
no index, a GBZ cut, a pggb file or a popped bubble, from the graph itself off
the ordered layout's layering. Every node layout marks them as halos; the
variant map draws them as glyphs.

### The graph as a track

A graph track's display is `LinearGraphDisplay`. It cuts the view's window plus
a window-width each side and re-cuts once the view leaves the cut, keeping its
sample rows in the order they were drawn. On a layout whose x is reference bp,
such as Anchored or Sample rows, the graph draws under the view's own
coordinates and pans and zooms with it. The force-directed, ordered and walk-row
layouts draw in their own coordinates inside the track, fitted to it, with their
own zoom in the track menu, the way a variant matrix does. The track menu also
picks the layout, the colour, a walk to lift out, and opens the settings.

```json
{
  "type": "FeatureTrack",
  "trackId": "hprc_graph",
  "name": "HPRC release 2 graph",
  "assemblyNames": ["hg38"],
  "adapter": { "type": "RgfaTabixAdapter", "uri": "https://example.com/hprc" },
  "displays": [
    {
      "type": "LinearGraphDisplay",
      "displayId": "hprc_graph-LinearGraphDisplay"
    },
    {
      "type": "LinearBasicDisplay",
      "displayId": "hprc_graph-LinearBasicDisplay"
    }
  ]
}
```

The first display is the one the track opens with; the second is the segments
lane, one block per segment, reachable from the track menu.

A fine cut spans at most 5 Mb. An rGFA track can carry a coarse tier, one node
per bubble, built by `build_bubble_tier.sh` in jbrowse-components; past
`aboveBpPerPx` in the linear view the track cuts that pair instead, with no bp
cap:

```json
{
  "type": "RgfaTabixAdapter",
  "uri": "https://example.com/hprc-v2.0-mc-grch38",
  "coarse": {
    "uri": "https://example.com/hprc-v2.0-mc-grch38.tier10000",
    "aboveBpPerPx": 1000
  }
}
```

**Add → Graph genome view** opens a whole GFA file in a view of its own, with
the same layouts and its own pan and zoom.

### Demonstration loci

Six HPRC release 2 windows, the ones the
[HPRC tutorials](https://jbrowse.org/jb2/docs/tutorials/pangenome_hprc/) walk
through, are the standing test set for layout screenshots. Each cuts to under
300 nodes and shows a different kind of variation:

| Locus        | Window                         | What it shows                       |
| ------------ | ------------------------------ | ----------------------------------- |
| LPA KIV-2    | `chr6:160,525,000-160,655,000` | the kringle repeat, copy per loop   |
| MHC class II | `chr6:32,510,000-32,600,000`   | DRB haplotypes, dozens of alleles   |
| AMY1         | `chr1:103,690,000-103,780,000` | amylase copy number                 |
| C4           | `chr6:31,980,000-32,050,000`   | one bubble over the C4 duplication  |
| CFH          | `chr1:196,640,000-196,900,000` | an 84 kb deletion as a bare edge    |
| KIR          | `chr19:54,750,000-54,840,000`  | the KIR cluster, densest of the six |

[docs/layout-experiments.md](docs/layout-experiments.md) draws all six in every
layout the plugin has and in the ones proposed to replace them, and
`scripts/layout-lab/` reproduces the figures.

## License (GPL-3.0)

This plugin is **GPL-3.0-or-later**. The force-directed layout is computed by a
WebAssembly build of Bandage's FMMM layout from [OGDF](https://ogdf.github.io/),
and both Bandage and OGDF are GPL-licensed, so this plugin takes the same
license rather than linking around it.

JBrowse itself is unaffected and stays Apache-2.0: this is a separate plugin,
loaded at runtime only by configs that ask for it. The anchored and sample-row
layouts are pure TypeScript and need no external engine.

## Developing

Requires [pnpm](https://pnpm.io/installation). The plugin builds against the
published `@jbrowse/*` packages at 5.0.0-beta.9 and needs a host of at least
that version: it hands its RPC calls an AbortSignal, which an earlier JBrowse 5
beta cannot post to its worker.

```console
pnpm install
pnpm start        # esbuild watch, serves dist/out.js on :9000 with CORS
```

In another terminal, serve a JBrowse Web that points at `config.json` (its
`plugins` entry already targets `http://localhost:9000/dist/out.js`).

## Building

```console
pnpm build        # native ESM bundle via esbuild (code-split)
pnpm typecheck    # tsc, separately — esbuild strips types without checking them
```

This writes the plugin to `dist/`, and the **whole directory must be served
together** — the entry loads its sibling chunks relative to its own url:

- `jbrowse-plugin-graphgenomeviewer.esm.js` — the plugin entry
- `chunks/bandage-layout-<hash>.js` — the Bandage layout engine (~425kb),
  imported on demand and named by content hash so a redeployed engine is never
  served from cache
- `chunks/*.js` — other lazily-loaded code split out of the entry

Load the plugin from any JBrowse config, 5.0.0-beta.9 or later, with an
`esmUrl`:

```json
{
  "plugins": [
    {
      "name": "GraphGenomeView",
      "esmUrl": "https://unpkg.com/jbrowse-plugin-graphgenomeviewer/dist/jbrowse-plugin-graphgenomeviewer.esm.js"
    }
  ]
}
```

Note: ESM plugins are loaded via a dynamic `import()`, which cannot carry a
subresource-integrity hash the way a UMD `<script integrity>` can — there is
nowhere to put a digest. For a deployment that needs pinned, tamper-evident
bytes, serve the plugin from an immutable, version-pinned url on a host you
control. The engine chunk is already immutable by content hash.

The engine is a lazy chunk: it is only fetched the first time someone selects
the force-directed layout, so sessions that use the anchored or sample-row
layouts never download it. Its url is not configured anywhere — `loadBandage` is
a plain dynamic `import()`, so the browser resolves the chunk relative to the
plugin module's own url (`import.meta.url`, defined on the main thread and in
the RPC worker alike). That is why the whole `dist/` has to be served together,
and it is also why there is nothing to point elsewhere: to host the engine on
another origin, rebuild with the chunk emitted there.

### Rebuilding the engine

`src/bandage/bandage-layout.js` is a committed build artifact, so a normal
`pnpm build` never needs Emscripten. Regenerate it only when the C++ layout
sources change:

```console
pnpm build:wasm   # needs emsdk, nothing else
```

Emscripten is the only thing you have to install. OGDF is vendored at
`vendor/ogdf` (a stock checkout of it does not build for wasm at all — see
[`vendor/README.md`](vendor/README.md)), so this works offline from a fresh
clone of this repo alone. Roughly four minutes the first time, seconds after
that.

It compiles with `-sSINGLE_FILE=1`, embedding the wasm as base64 so the result
is one self-contained ES module that esbuild can copy rather than bundle.

A rebuild has to be checked against the drawing rather than against the file,
since the artifact's bytes move for reasons the layout does not — see
[`src/bandage/README.md`](src/bandage/README.md) for
`scripts/layout-digest.mjs`.

## Testing

```console
pnpm test         # vitest unit tests
pnpm test:watch
pnpm test:wasm    # runs the committed Bandage engine, no deps needed
pnpm test:e2e     # puppeteer, opt-in — see test/README.md
pnpm host-compat  # boots dist/ on the hosted JBrowse releases and cuts a graph
pnpm lint
pnpm typecheck
```

`pnpm test:e2e` drives the force layout through a real JBrowse in a headless
browser, behind `RUN_E2E=1` because it needs a jbrowse-web build to serve;
[`test/README.md`](test/README.md) explains how to run it.

`pnpm host-compat` is the check a publish has to pass, and `pnpm version` runs
it. It serves the built `dist/` to a real shipped config on each hosted release
and cuts a subgraph there, because the failures it catches pass tsc, eslint and
the unit tests: an RPC argument a released core cannot post to its worker, or a
re-export the host no longer serves, shows only when the bundle runs on the
host.
