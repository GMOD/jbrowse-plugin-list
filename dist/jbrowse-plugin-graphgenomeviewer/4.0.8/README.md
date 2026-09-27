# jbrowse-plugin-graphgenomeviewer

Pangenome graphs in JBrowse 2.

![KIV-2, force-directed, with its bubbles marked](img/force_kiv2.png)

![Tube maps, and a tube map track under a linear view](img/tube_map.png)

- Eight layouts: force-directed (Bandage FMMM), variant map, ordered, anchored,
  sample rows, walk rows, and sequenceTubeMap's tube map on its own axis or the
  reference's
- Bubbles from `gfatools bubble` or the graph itself, opened level by level
- gbz-base haplotypes as walks: carriage as node thickness, one walk lifted out

## Usage

Needs JBrowse 5.0.0-beta.9 or later.

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

- **File → Open track** opens an rGFA index (`.segs.bed.gz` from
  `build_rgfa_tabix.sh`) or a gbz-base database (`.gbz.db`) as a `GraphTrack`
- **Add → Graph genome view** opens a whole GFA file
- A hand-written track needs only the adapter:

```json
{
  "type": "GraphTrack",
  "trackId": "hprc_graph",
  "name": "HPRC release 2 graph",
  "assemblyNames": ["hg38"],
  "adapter": {
    "type": "RgfaTabixAdapter",
    "uri": "https://example.com/hprc",
    "coarse": {
      "uri": "https://example.com/hprc.tier10000",
      "aboveBpPerPx": 1000
    }
  }
}
```

- The track menu picks layout, colour and walk, and switches to the segments
  lane or, for gbz-base, the haplotype lanes
- Cuts the window plus a window each side, up to 5 Mb; past `aboveBpPerPx`, the
  `coarse` tier (`build_bubble_tier.sh` in jbrowse-components)
- gbz-base swaps in `{ "type": "GbzBaseSyntenyAdapter", "uri": "….gbz.db" }`; an
  `hg38` or `hs1` track finds the graph's GRCh38 or CHM13 reference sample, and
  `assemblyNameToPanSN` covers other names

## Docs

- [docs/layouts.md](docs/layouts.md) — layouts, bubbles, walks, genes, loci
- [docs/developing.md](docs/developing.md) — building, testing, `host-compat`
- [docs/layout-experiments.md](docs/layout-experiments.md) — every locus in
  every layout

## License

GPL-3.0-or-later (the wasm FMMM engine is OGDF, GPL).
