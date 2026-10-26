# jbrowse-plugin-graphgenomeviewer

- **In:** one of
  - a [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix) walk file
    (`<prefix>.<sample>.walks.bed.gz` beside its `.tbi`), opened with File →
    **Open track**
  - a gfa-to-tabix segments index (`<prefix>.segs.bed.gz` beside
    `<prefix>.links.bed.gz` and a `.tbi` for each), opened the same way
  - a [gbz-base](https://github.com/jltsiren/gbz-base) database (`.gbz.db`),
    opened the same way
  - a GFA file (`.gfa` or `.gfa.gz`), opened whole with Add → **Graph genome
    view**
- **Out:** a graph track in a linear view, or a separate graph genome view, with
  haplotypes, bubbles and genes marked

![KIV-2 as a graph track under RefSeq genes and the curated KIV-2 annotation, its reference segments on a strip at their bp](img/force_kiv2.png)

## Quick start

1. Add the plugin to your JBrowse 5.0.0-beta.11 or later config:

   ```json
   {
     "plugins": [
       {
         "name": "GraphGenomeView",
         "esmUrl": "https://jbrowse.org/plugins/jbrowse-plugin-graphgenomeviewer/latest/dist/jbrowse-plugin-graphgenomeviewer.esm.js"
       }
     ]
   }
   ```

2. Write a walk file from a base-level GFA with W or P lines
   (`vg convert -f graph.gbz` writes one):

   ```console
   gfa-to-tabix chr22.gfa --walks --refs GRCh38 -o chr22
   ```

3. In an hg38 session, File → **Open track** on the url of
   `chr22.GRCh38.walks.bed.gz`. The track redraws the graph for the view's
   window as you pan. [docs/data.md](docs/data.md) covers the other formats and
   the track config

4. Explore:
   - Pick a layout from the track menu: force-directed, ordered, anchored,
     sample rows, walk rows or tube map ([docs/layouts.md](docs/layouts.md))
   - Lift haplotypes or show a panel per haplotype
     ([docs/haplotypes.md](docs/haplotypes.md))
   - Launch → **Graph genome view** on a track opens its cut as a view, where
     hovering a node bands its bp in the linear view
   - Export SVG from the track or the view

The [JBrowse tutorials](#tutorials) walk through the whole process with commands
you can run.

## Tutorials

In the [JBrowse 2 docs](https://jbrowse.org/jb2/docs/tutorials/):

- **[Hosting your own graph](https://jbrowse.org/jb2/docs/tutorials/pangenome_prepare_graph):**
  start here
- [pggb](https://jbrowse.org/jb2/docs/tutorials/pangenome_ecoli) and
  [Minigraph-Cactus](https://jbrowse.org/jb2/docs/tutorials/pangenome_cactus)
- [Cattle](https://jbrowse.org/jb2/docs/tutorials/pangenome_cattle) and
  [mouse](https://jbrowse.org/jb2/docs/tutorials/pangenome_mouse)
- HPRC release 2:
  [graph alleles](https://jbrowse.org/jb2/docs/tutorials/pangenome_hprc),
  [haplotypes](https://jbrowse.org/jb2/docs/tutorials/pangenome_hprc_haplotypes),
  [repeat lengths](https://jbrowse.org/jb2/docs/tutorials/pangenome_hprc_repeats)
- [User guide](https://jbrowse.org/jb2/docs/user_guides/graph_genome_view)

## Docs

In reading order:

1. [Data and track config](docs/data.md): index a graph and write the track
2. [Layouts, bubbles and genes](docs/layouts.md): the seven layouts, the
   reference strip, bubble halos, gene outlines, export
3. [Haplotypes](docs/haplotypes.md): lifting, panels, colouring, walk rows
4. [Tube maps](docs/tube-maps.md): axes, box colour, panels, routes, reads
5. [Maize NAM founders](docs/maize.md): MaizeGDB's graph of one gene and a
   Minigraph-Cactus graph of chr8, with links that open each view
6. [syng graphs from impg](docs/syng.md): build C4 as a syng graph and draw it
   with `bandage-figure`
7. [Developing](docs/developing.md): build, test, release

## Gallery

<table>
<tr>
<td><a href="docs/haplotypes.md#facets"><img src="img/force_kiv2_facet.png" width="260" alt="KIV-2, each haplotype's own loops a panel each"></a><br>KIV-2 loops, a panel per haplotype</td>
<td><a href="docs/haplotypes.md#walk-rows"><img src="img/walk_rows_kiv2.png" width="260" alt="KIV-2 copy number as walk rows tiled by kringle"></a><br>KIV-2 copy number as walk rows</td>
<td><a href="docs/tube-maps.md#routes-and-tube-colour"><img src="img/tube_map_c4_routes_by_population.png" width="260" alt="C4, a tube per route by superpopulation"></a><br>C4, a tube per route by superpopulation</td>
</tr>
<tr>
<td><a href="docs/tube-maps.md#panels"><img src="img/tube_map_cfhr_samples.png" width="260" alt="The CFHR3–CFHR1 deletion, a panel per sample"></a><br>The CFHR3–CFHR1 deletion, a panel per sample</td>
<td><a href="docs/layouts.md#bubbles"><img src="img/force_kiv2_bubbles.png" width="260" alt="KIV-2 bubbles under the HPRC bubbles track"></a><br>KIV-2 bubbles under the HPRC bubbles track</td>
<td><a href="docs/maize.md"><img src="docs/maize/walk_rows_variants.png" width="260" alt="Maize NAM founders insertions and walk rows"></a><br>Maize NAM founders: insertions and walk rows</td>
</tr>
<tr>
<td><a href="docs/syng.md"><img src="img/syng_c4.png" width="260" alt="C4 copies as threads round a syng graph from impg"></a><br>C4 copies as threads round a syng graph</td>
<td><a href="docs/haplotypes.md#example-kiv-2-overlaid"><img src="img/force_kiv2_overlay.png" width="260" alt="KIV-2 expansions as extra loops, three walks overlaid"></a><br>KIV-2 expansions as extra loops</td>
</tr>
</table>

## See also

- [BandageJS](https://github.com/cmdcolin/BandageJS): standalone page with the
  same layouts
- [sequenceTubeMap, MemPanG26 edition](https://github.com/cmdcolin/sequenceTubeMap):
  our fork of the tube map app

Supporting utility libraries

- [@jbrowse/bandage-core](https://github.com/GMOD/bandage-core) (npm): bandage
  layout and drawing engine
- [@jbrowse/tubemap-core](https://github.com/GMOD/tubemap-core) (npm): tube map
  layout
- [@jbrowse/graph-walks](https://github.com/GMOD/graph-walks) (npm): walk file
  reader
- [@gmod/gbz-base](https://github.com/GMOD/gbz-base-js) (npm): `.gbz.db` reader

Supporting graph layout libraries

- [@jbrowse/graph-stress-layout](https://github.com/GMOD/graph-stress-layout)
- [@jbrowse/graph-fmmm-layout](https://github.com/GMOD/graph-fmmm-layout)

Supporting data preparation toolkits

- [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix): writes walk files and
  segment indexes from a GFA
- [gbz-haplotype-index](https://github.com/GMOD/gbz-haplotype-index): names
  every walk in a gbz-base cut
- [gfa-to-pairwise-paf](https://github.com/cmdcolin/gfa-to-pairwise-paf-rs):
  graph to PAF, for synteny views

Standalone R packages

- [ggbandage](https://github.com/GMOD/ggbandage) (R): Bandage layout as ggplot2
  layers
- [ggtubemap](https://github.com/GMOD/ggtubemap) (R): tube map as ggplot2 layers

## License

GPL-3.0-or-later, based on work from Bandage and OGDF, both GPL.
