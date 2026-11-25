# jbrowse-plugin-ucsc

A JBrowse 2 adapter that reads features from the
[UCSC Genome Browser API](https://genome.ucsc.edu/goldenPath/help/api.html).

The API serves some tracks whose files UCSC does not offer for download, so
this adapter is a way to show them in JBrowse. On hg38 these include the
GeneHancer regulatory elements, genes and interactions, COSMIC mutations and
the DECIPHER population CNVs. Tracks UCSC marks as protected (HGMD, SpliceAI,
PrimateAI and others) are refused by the API too, and the track shows UCSC's
explanation.

## JBrowse versions

- **JBrowse 2 v2.0.0 and newer** can load the current release. It imports only
  modules every host since v2.0.0 provides, and it has been run on v4.3.0 and
  v5.
- **v5 or newer** is needed for features coloured by their UCSC colour column
  and for the zoom-in notice when a region holds more than `maxItems`
  features. Older hosts draw the default colour and show the limit as an error.
- **The plugin store** serves this release to v5 hosts. Hosts older than v5
  read a frozen store manifest that installs v1.0.3.

## Demo

https://jbrowse.org/code/jb2/latest/?config=https%3A%2F%2Funpkg.com%2Fjbrowse-plugin-ucsc%2Fdist%2Fconfig.json

## Screenshot

![](img/1.png)

## Usage

Add the plugin to the `plugins` of a JBrowse Web config:

```json
{
  "plugins": [
    {
      "name": "UCSC",
      "url": "https://unpkg.com/jbrowse-plugin-ucsc/dist/jbrowse-plugin-ucsc.umd.production.min.js"
    }
  ]
}
```

Then add a track whose adapter names a UCSC track:

```json
{
  "type": "FeatureTrack",
  "trackId": "ucsc_geneHancerRegElementsDoubleElite",
  "name": "GeneHancer regulatory elements (double elite)",
  "assemblyNames": ["hg38"],
  "adapter": {
    "type": "UCSCAdapter",
    "genome": "hg38",
    "track": "geneHancerRegElementsDoubleElite"
  }
}
```

[distconfig.json](distconfig.json) has more examples.

## Adapter options

| Option     | Default                       | Meaning                                                                             |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `track`    |                               | The UCSC track name                                                                 |
| `genome`   | the assembly name             | The UCSC genome, such as `hg38` or a GenArk accession like `GCF_000001405.40`       |
| `maxItems` | 20000                         | The most features fetched for one region; a region holding more asks you to zoom in |
| `base`     | `https://api.genome.ucsc.edu` | The API server, as a file location (`{ "uri": "…" }`)                               |

Set `genome` whenever the JBrowse assembly name is not the UCSC one. It also
lets the adapter list the genome's chromosomes, so assemblies with other
chromosome names map onto UCSC's through their refName aliases.

To find track names, list a genome's tracks:
`https://api.genome.ucsc.edu/list/tracks?genome=hg38;trackLeavesOnly=1`

## What the adapter reads

- **Gene tracks** (genePred and bigGenePred, such as `ncbiRefSeq` and
  `knownGene`) become transcripts with CDS and UTR parts, labelled with the
  gene name.
- **BED tracks with blocks** keep their blocks as subfeatures.
- **RepeatMasker** features are labelled with the repeat name; **chains** are
  placed by their target coordinates.
- **itemRgb** and bigInteract **color** columns colour the features.

## Embedding in @jbrowse/react-linear-genome-view

See [DEVELOPERS.md](DEVELOPERS.md).
