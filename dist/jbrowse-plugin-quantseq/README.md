![Integration](https://github.com/elliothershberg/jbrowse-plugin-quantseq/workflows/Integration/badge.svg?branch=main)

# jbrowse-plugin-quantseq

This is an external plugin for the [JBrowse 2](https://jbrowse.org/jb2/)
open-source platform for visualizing and integrating biological data.
This plugin implements a QuantitativeSequence (quantseq) track type. It builds on the concept of a "dynamic sequence (dynseq)" track that was added to the
awesome [WashU Epigenome Browser](http://epigenomegateway.wustl.edu/).

This track combines the QuantitativeTrack and the ReferenceSequenceTrack from
JBrowse 2 in order to visualize quantitative data for regulatory genomics at
base-resolution, such as the predictions of the [BPNet](https://github.com/kundajelab/bpnet) model. Here is what this new track looks like:

![image](https://user-images.githubusercontent.com/19295181/113226964-4a7cf000-9246-11eb-86f2-b7fb9645c8d8.png)

## Install

### For use in [JBrowse Web](https://jbrowse.org/jb2/docs/quickstart_web)

No installation required

### For use in [`@jbrowse/react-linear-view`](https://www.npmjs.com/package/@jbrowse/react-linear-genome-view)

```
yarn add jbrowse-plugin-quantseq
```

## Usage

Add to the "plugins" of your JBrowse Web config:

```json
{
  "plugins": [
    {
      "name": "Quantseq",
      "url": "https://unpkg.com/jbrowse-plugin-quantseq/dist/jbrowse-plugin-seq.umd.production.min.js"
    }
  ]
}
```

Here is an example track configuration for this view:

```json
{
  "type": "QuantitativeTrack",
  "trackId": "ngmlr_cov",
  "name": "Nanog importance counts (BPNet)",
  "assemblyNames": ["hg38"],
  "adapter": {
    "type": "QuantitativeSequenceAdapter",
    "wiggleAdapter": {
      "type": "BigWigAdapter",
      "bigWigLocation": {
        "uri": "https://jbrowse.org/genomes/GRCh38/BPNet/Nanog.importance.counts.bw"
      }
    },
    "sequenceAdapter": {
      "type": "BgzipFastaAdapter",
      "fastaLocation": {
        "uri": "https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz"
      },
      "faiLocation": {
        "uri": "https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz.fai"
      },
      "gziLocation": {
        "uri": "https://jbrowse.org/genomes/GRCh38/fasta/hg38.prefix.fa.gz.gzi"
      }
    }
  },
  "displays": [
    {
      "displayId": "QuantitativeSequence_display",
      "type": "QuantitativeSequenceDisplay"
    }
  ]
}
```

This specifies an adapter for where the sequence is derived from, in addition to the where the bigWig data is derived from, and configures the display format.

## Contributing

We welcome any contributions or PRs to this repo. Developer information for this
codebase can be found [here](https://github.com/elliothershberg/jbrowse-plugin-quantseq/blob/main/CONTRIBUTING.md)
