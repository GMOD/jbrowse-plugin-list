# jbrowse-plugin-graphgenomeviewer

Pangenome graphs in JBrowse 2.

## As a track of a linear view

A `GraphTrack` cuts the graph for the view's window and redraws it as you pan. A
force-directed track draws a strip of the reference segments at their bp above
the graph, each in its node's colour, so the graph reads against the tracks
above it.

- **LPA's KIV-2 repeat.** The goldenrod outlines on the graph are the gene
  track's LPA exons. The charcoal loops, sequence off the reference, hang inside
  the array the curated VNTR track marks.

![KIV-2 as a graph track under RefSeq genes and the curated KIV-2 annotation, its reference segments on a strip at their bp](img/force_kiv2.png)

- **Each haplotype takes its own loops.** Side by side, one walk per panel:
  HG01960 skips most of GRCh38's loops for the big one, and HG00133 takes both.

![The KIV-2 array side by side: GRCh38, HG00097, HG01960 and HG00133 each followed start to end](img/force_kiv2_facet.png)

- **Copy number off a bar.** Walk rows tile each haplotype by the 5,548 bp
  kringle: GRCh38's six units are the six LPA exon pairs above, and HG00133
  carries 27.

![KIV-2 walk rows under LPA and the curated KIV-2 annotation](img/walk_rows_kiv2.png)

- **Variants at their bp.** A tube map on the reference axis puts each of MICB's
  variant columns under its exon.

![MICB's exons 2–4 as a tube map on the reference axis under the RefSeq genes](img/tube_map_micb_ref.png)

## As its own view

**Add → Graph genome view** opens a whole GFA file. A graph track's **Launch →
Graph genome view** opens the cut on screen, drawn as the track draws it; a
session spec does the same with `loadedTrackId` and `loadedRegion`. Hovering a
node in the view bands its bp in the linear view:

![The MICB cut as a view under its linear view, a variant's box hovered and its bp banded in exon 2](img/tube_map_micb.png)

## Features

- Seven layouts: force-directed (Bandage FMMM), ordered, anchored, sample rows,
  walk rows, and sequenceTubeMap's tube map on its own axis or the reference's
- Genes from the session's annotation track, drawn on the graph
- Bubbles from `gfatools bubble` or the graph itself, opened level by level
- gbz-base haplotypes as walks: carriage as node thickness, walks lifted out as
  metro-map lanes or side by side, a panel per walk or a row per sample, each
  shading from its start to its end
- GAF reads in the tube map, with their mismatches, from a gbz-base track
- Figures as SVG, from the view's Export SVG or from a JSON spec with no browser
  ([docs/figures.md](docs/figures.md))

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
