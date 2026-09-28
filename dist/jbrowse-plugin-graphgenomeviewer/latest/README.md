# jbrowse-plugin-graphgenomeviewer

Pangenome graphs in JBrowse 2.

## As a track of a linear view

A `GraphTrack` cuts the graph for the view's window and redraws it as you pan.

A force-directed track draws a strip of the reference segments at their bp above
the graph, each in its node's colour, so the reference-position ramp ties the
graph back to the linear view's coordinates.

![KIV-2 as a graph track under RefSeq genes, force-directed, its reference segments on a strip at their bp](img/force_kiv2.png)

![MICB's exons 2–4 as a tube map track, eight HPRC haplotypes, each reference node tied to its bp on the ruler](img/tube_map_micb_track.png)

## As its own view

**Add → Graph genome view** opens a whole GFA file. A graph track's **Launch →
Graph genome view** opens the cut on screen, drawn as the track draws it; a
session spec does the same with `loadedTrackId` and `loadedRegion`.

![MICB's exons 2–4 as a tube map on its own axis, with the reference ruler under it](img/tube_map_micb.png)

![KIV-2 walk rows: eight haplotypes, each bar tiled by the kringle unit](img/walk_rows_kiv2.png)

## Features

- Seven layouts: force-directed (Bandage FMMM), ordered, anchored, sample rows,
  walk rows, and sequenceTubeMap's tube map on its own axis or the reference's
- Genes from the session's annotation track, drawn on the graph
- Bubbles from `gfatools bubble` or the graph itself, opened level by level
- gbz-base haplotypes as walks: carriage as node thickness, one walk lifted out
- GAF reads in the tube map, with their mismatches, from a gbz-base track

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
- `"reads": "….gaf.gz"` on that adapter draws GAF reads in the tube map layouts,
  fetched through its tabix index; [docs/layouts.md](docs/layouts.md#reads) has
  the config and how to make one

## Docs

- [docs/layouts.md](docs/layouts.md) — layouts, bubbles, walks, genes, loci
- [docs/developing.md](docs/developing.md) — building, testing, `host-compat`

## License

GPL-3.0-or-later (this module is based on work from Bandage and ODGF graph
drawing algorithms which are both GPL).
