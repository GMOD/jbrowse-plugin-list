# jbrowse-plugin-protein3d

A 3-D protein structure viewer for JBrowse 2, linked residue by residue to the
genome.

![TP53 beside PDB 1TUP, p53's core domain bound to DNA, with the R248 hotspot selected](https://raw.githubusercontent.com/GMOD/jbrowse-plugin-protein3d/readme-figure/readme.png)

TP53 beside PDB 1TUP, p53's core domain bound to DNA. R248, a cancer hotspot, is
selected in magenta on the structure, and its codon is marked on the gene.
[Open this session](https://jbrowse.org/code/jb2/main/?config=test_data/protein3d_config.json&session=spec-%7B%22views%22%3A%5B%7B%22type%22%3A%22ProteinView%22%2C%22structures%22%3A%5B%7B%22pdbId%22%3A%221TUP%22%2C%22initialResidues%22%3A%7B%22start%22%3A248%2C%22end%22%3A248%7D%7D%5D%2C%22transcriptId%22%3A%22NM_000546.6%22%2C%22sideBySide%22%3Atrue%2C%22zoomToBaseLevel%22%3Afalse%2C%22colorScheme%22%3A%22mapped-chain%22%2C%22connectedView%22%3A%7B%22assembly%22%3A%22hg38%22%2C%22loc%22%3A%22chr17%3A7%2C673%2C700-7%2C674%2C700%22%2C%22tracks%22%3A%5B%7B%22trackId%22%3A%22hg38-ncbiRefSeq%22%2C%22geneGlyphMode%22%3A%22longestCoding%22%7D%2C%22clinvar_ncbi_hg38%22%5D%7D%7D%5D%7D).
CI re-renders the figure from `main` every hour
([scripts/readme-figure.mjs](scripts/readme-figure.mjs)).

Right-click a gene and choose to open its protein structure. The plugin looks up
the AlphaFold model through UniProt, lists the experimental PDB entries SIFTS
maps to that UniProt entry, and can search Foldseek for related structures. It
aligns each structure to the transcript's translation, so hovering a residue
highlights its codon and hovering a codon highlights its residue.

## Try it

The [protein browser](https://staging.genomes.jbrowse.org/protein-browser/)
takes a gene name and opens it in JBrowse with its structure linked to the
genome. The plugin is also installed by default on
[genomes.jbrowse.org](https://genomes.jbrowse.org), so it works for any species
there.

## Documentation

Using the plugin:

- Tutorials on jbrowse.org:
  [TP53 from prediction to crystal](https://jbrowse.org/jb2/docs/tutorials/tp53_structures/)
  opens an AlphaFold model and two crystal structures superposed beside the
  gene, and reads the R248 hotspot back to its codon;
  [Proteins on genomes.jbrowse.org](https://jbrowse.org/jb2/docs/tutorials/genomes_proteins/)
  launches a structure and an MSA from any gene's right-click menu.
- [Demos](docs/demos.md): structures that are easy to map wrong, each one link
  away — a peptide bound to a larger partner, a protein bound to DNA, a receptor
  with another protein fused into it, a phosphorylated residue, and a
  mitochondrial protein.
- [Your own structures](docs/your-own-structures.md): opening a model you folded
  yourself (ColabFold, AlphaFold 3, Boltz…) instead of the AlphaFold DB one,
  from a file, a URL or a generated link per gene, and which features carry
  over.

Linking and embedding:

- [Launching from a URL or code](docs/launching.md): worked session-spec links,
  the short `uniprotId`/`pdbId` + `transcriptId` form, several structures in one
  view, and the `LaunchView-ProteinView` extension point.
- [Launch parameters](docs/launch-parameters.md): every argument, the
  `connectedView` settings, and the transcript `feature` shape.
- [Session snapshots](docs/session-snapshots.md): the saved view's shape, the
  structure shorthands, and which chain maps.

How it works, for someone extending the plugin or checking what a number on
screen means:

- [Genome to structure alignment](docs/genome-to-structure-alignment.md): why
  the plugin aligns the transcript's translation to the structure on the fly,
  the precedent for that in SIFTS and G2S, how it picks the chain and isoform,
  and what sequence alignment cannot decide.
- [UniProt feature tracks](docs/uniprot-feature-tracks.md): where the accession
  and the UniProt-to-structure offset come from for AlphaFold models, PDB
  entries and your own models.
- [Residue numbering](docs/residue-numbering.md): how a paper's R248 becomes
  position 154 in the file, `label_seq_id` 155 for Mol\*, and the codon on
  chr17, and how a session spec names a residue the literature's way.

Working on the plugin:

- [DEVELOPERS.md](DEVELOPERS.md): running it locally and publishing.
- [Testing](docs/testing.md): the unit, e2e, documentation and demo checks.
- [Host compatibility](docs/host-compatibility.md): keeping the published bundle
  working on JBrowse releases years old.
- [Live checks](docs/live-checks.md): serving a local build to a session on
  jbrowse.org.

## Publication

If you find this tool useful please cite our work

Diesh, C., Stevens, G., Bridge, C., Hogue, G., Buels, R., Cain, S., Stein, L., &
Holmes, I. (2026). Proteins in the Genome Browser: Integration of Phylogenies,
Alignments, and Structures With Nucleotide-level Evidence in JBrowse 2. Journal
of Molecular Biology, 169645. https://doi.org/10.1016/j.jmb.2026.169645

See also https://github.com/GMOD/proteinbrowser for overview
