# jbrowse-plugin-graphgenomeviewer

Pangenome graphs in JBrowse 2.

- **In:** a GFA, rGFA, GBZ or walk-indexed graph
- **Out:** a graph track in a linear view, or a view of its own, with
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

2. Open a graph:
   - **A small GFA:** Add → **Graph genome view** opens the whole file
   - **A large graph:** index it with
     [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix) or build a gbz-base
     database, then File → **Open track**. The track redraws the graph for the
     view's window as you pan. See [docs/data.md](docs/data.md)

3. Explore:
   - Pick a layout from the track menu: force-directed, ordered, anchored,
     sample rows, walk rows or tube map ([docs/layouts.md](docs/layouts.md))
   - Lift haplotypes or show a panel per haplotype
     ([docs/haplotypes.md](docs/haplotypes.md))
   - Launch → **Graph genome view** on a track opens its cut as a view, where
     hovering a node bands its bp in the linear view
   - Export SVG from the track or the view

The [JBrowse tutorials](#tutorials) walk through the whole process with commands
you can run.

## What it draws

![The KIV-2 array side by side: GRCh38, HG00097, HG01960 and HG00133 each followed start to end](img/force_kiv2_facet.png)

![KIV-2 walk rows under LPA and the curated KIV-2 annotation](img/walk_rows_kiv2.png)

![C4A and C4B as a tube per route coloured by superpopulation](img/tube_map_c4_routes_by_population.png)

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
2. [Layouts](docs/layouts.md): the seven layouts, colour, the reference strip
3. [Haplotypes](docs/haplotypes.md): lifting, panels, colouring, walk rows
4. [Tube maps](docs/tube-maps.md): panels, routes, reads
5. [Bubbles](docs/bubbles.md) and [genes](docs/genes.md)
6. [Developing](docs/developing.md): build, test, release

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
- [@gmod/gbz-base](https://github.com/GMOD/gbz-base-js) (npm): `.gbz.db` reader

Supporting graph layout libraries

- [@jbrowse/graph-stress-layout](https://github.com/GMOD/graph-stress-layout)
- [@jbrowse/graph-fmmm-layout](https://github.com/GMOD/graph-fmmm-layout)

Supporting data preparation toolkits

- [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix): indexes a GFA
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
