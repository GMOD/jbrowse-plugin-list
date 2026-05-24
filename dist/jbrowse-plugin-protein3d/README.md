# jbrowse-plugin-protein3d

This is a 3-D protein structure viewer for JBrowse 2

The major workflow enabled by this is

- Right click gene of interest -> launch 3-D protein viewer with linked
  mouseover between genome and structure

It has features to automatically look up a protein structure of interest using
the UniProt ID mapping API to connect to AlphaFoldDB, and can also use Foldseek
to look up related structures also

## Screenshot

![](img/1.png)

Example at
https://jbrowse.org/code/jb2/latest/?config=%2Fucsc%2Fhg38%2Fconfig.json&session=share-aZOIjR_qs4&password=NT4sa

## Publication

If you find this tool useful please cite our work

Diesh, C., Stevens, G., Bridge, C., Hogue, G., Buels, R., Cain, S., Stein, L., &
Holmes, I. (2026). Proteins in the Genome Browser: Integration of Phylogenies,
Alignments, and Structures With Nucleotide-level Evidence in JBrowse 2. Journal
of Molecular Biology, 169645. https://doi.org/10.1016/j.jmb.2026.169645

See also https://github.com/GMOD/proteinbrowser for overview

## Availability

This plugin is installed by default on https://genomes.jbrowse.org so you can
use it on any species there

## Programmatic usage

See [DEVELOPERS.md](DEVELOPERS.md)

## Publishing

just push a new tag using e.g.

```
pnpm version minor
```
