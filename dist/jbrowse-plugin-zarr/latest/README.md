# jbrowse-plugin-zarr

Reads multi-sample quantitative signal from a [Zarr v3](https://zarr.dev/) store
into a JBrowse 2
[`MultiQuantitativeTrack`](https://jbrowse.org/jb2/docs/user_guides/multiquantitative_track).
The store holds one samples-by-bins array per resolution level, described by the
[`jbrowse_signal_matrix`](#store-format) metadata below, so this reads stores
written for it rather than Zarr in general.

![Copy number for 2504 individuals as a red and blue heatmap, one row per person, over a 190 kb window of human chromosome 17](img/zarr_cohort.png)

Every individual in the 1000 Genomes panel over the CCL3L1 locus, one row each,
clustered so the copy-number classes separate. White is two copies, red a gain,
blue a loss. The whole screen is three requests against one store. Built in
[Population copy number with the 1000 Genomes panel](https://jbrowse.org/jb2-staging/docs/tutorials/population_cnv/),
this adapter's worked example, which also covers writing the store.

The copy-number values are not ours. They are
[QuicK-mer2](https://github.com/KiddLab/QuicK-mer2) estimates over the 30x 1000
Genomes panel, produced by the Kidd lab at the University of Michigan and
published as the [KiddLab/kmer_1KG](https://github.com/KiddLab/kmer_1KG) track
hub. If you use them, cite Shen F and Kidd JM,
[Rapid, Paralog-Sensitive CNV Analysis of 2457 Human Genomes Using QuicK-mer2](https://doi.org/10.3390/genes11020141),
Genes 2020, 11(2):141.

## Why

A multi-sample signal track built from one BigWig per sample is bound by round
trips, not bytes. Each file needs its header, chrom B-tree and R-tree index
before it knows where a region's values live, so a screen costs three to four
sequential requests per sample however small the values are. At 2500 samples
that is thousands of requests for a few kilobytes of data.

A samples-by-bins array chunked `[all samples, N bins]` answers the same screen
in one or two chunk reads, whatever the sample count, straight off static
hosting with no tile server.

### Consider a multi-column bedGraph first

Most of that gain comes from putting every sample in one file, and a
Tabix-indexed bedGraph with one value column per sample does the same. JBrowse
reads it with the built-in `BedGraphTabixAdapter`, so it needs no plugin. For
the 2,504-sample panel on jbrowse.org,
[jb2bench](https://github.com/cmdcolin/jb2bench) (`scripts/cohort-signal/`)
measured:

| view                   | 2,504 BigWigs                | this store                  | multi-column bedGraph       |
| ---------------------- | ---------------------------- | --------------------------- | --------------------------- |
| 190 kb of chr17        | 15,048 requests, 48 MB, 14 s | 3 requests, 0.19 MB, 0.06 s | 3 requests, 0.31 MB, 0.08 s |
| all of chr17, 1,500 px | 15,048 requests, 69 MB, 15 s | 40 requests, 9.5 MB, 0.5 s  | 4 requests, 5.9 MB, 1.1 s   |

At a locus the two single-file layouts are the same. The store is ahead only
when zoomed out: a bedGraph has one bin size, so a whole-chromosome view
returns every row, and parsing that text is most of its 1.1 s.

### Per-base signal

Copy number changes slowly and repeats across samples, so one bedGraph row
stands for a long stretch. Per-base signal does neither. For 100 ENCODE
ATAC-seq fold-change tracks over chr1:10–20 Mb at their native resolution, the
same jb2bench script (`SET=perbase`) measured:

| view   | 100 BigWigs                 | this store                 | multi-column bedGraph       |
| ------ | --------------------------- | -------------------------- | --------------------------- |
| 1 kb   | 692 requests, 2.3 MB, 0.9 s | 7 requests, 0.05 MB, 0.1 s | 3 requests, 1.0 MB, 0.2 s   |
| 100 kb | 674 requests, 5.8 MB, 0.9 s | 46 requests, 2.1 MB, 0.2 s | 4 requests, 6.5 MB, 1.5 s   |
| 1 Mb   | 600 requests, 5.2 MB, 1.0 s | 46 requests, 2.4 MB, 0.4 s | 14 requests, 51 MB, 11 s    |
| 10 Mb  | 600 requests, 3.2 MB, 0.9 s | 46 requests, 2.1 MB, 0.2 s | 111 requests, 502 MB, 109 s |

A hundred samples rarely share a value at adjacent bases, so the bedGraph keeps
9.0 million rows for 10 million bases after merging equal ones, and every view
reads all of them. The store reads a coarser level instead. The BigWigs have
zoom levels too and hold near 1 s, at 600–700 requests a screen.

The store is the largest of the three on disk: 1.0 GB against 634 MB for the
BigWigs and 495 MB for the bedGraph. Its 10 bp level with min and max is 390 MB
of that, more than the 1 bp level, so start the pyramid coarser if disk
matters more than views around 10–50 kb.

Use this plugin for per-base signal across many samples, for genome-wide views
of a large cohort, or when the [summary levels](#summary-levels) matter at
coarse zoom. For binned data viewed at a locus, a multi-column bedGraph is
simpler, smaller (178 MB against this store's 662 MB for the whole-genome
copy-number panel) and needs no plugin.

## Install

Needs JBrowse 5. Install it from the
[plugin store](https://jbrowse.org/jb2/docs/user_guides/plugin_store), or name
it in a config by its store name, which resolves to the newest release the host
supports (see
[configuring plugins](https://jbrowse.org/jb2/docs/config_guides/plugins)):

```json
{
  "plugins": [{ "storePlugin": "Zarr" }],
  "tracks": [
    {
      "type": "MultiQuantitativeTrack",
      "trackId": "cohort_signal",
      "name": "Cohort signal",
      "assemblyNames": ["hg38"],
      "adapter": {
        "type": "MultiWiggleZarrAdapter",
        "uri": "https://example.com/cohort.zarr"
      },
      "displayDefaults": { "defaultRendering": "multirowdensity" }
    }
  ]
}
```

The adapter config is the store's location and nothing else. Sample names, bin
size and resolution levels come from the store's own metadata.

## Store format

A Zarr v3 group whose root attributes carry a `jbrowse_signal_matrix` object,
plus one `float32` array per resolution level:

```json
{
  "jbrowse_signal_matrix": {
    "version": 2,
    "samples": [{ "name": "HG00551", "group": "PUR" }],
    "decimals": 2,
    "levels": [
      {
        "path": "bin1000",
        "binSize": 1000,
        "refs": {
          "chr17": { "start": 35000000, "binOffset": 0, "numBins": 2500 }
        }
      },
      {
        "path": "bin10000",
        "binSize": 10000,
        "minPath": "bin10000_min",
        "maxPath": "bin10000_max",
        "refs": {
          "chr17": { "start": 35000000, "binOffset": 0, "numBins": 250 }
        }
      }
    ]
  }
}
```

Each level array is shaped `[samples, bins]`, C order, with every refName laid
end to end on the bin axis at its own `binOffset`. `start` is the genomic
coordinate of that refName's first bin, so a store can cover one window of one
chromosome rather than a whole genome. Unmeasured bins are the array's `NaN`
fill value and are dropped rather than drawn as zero.

Chunk each level with the whole sample axis inside one chunk,
`[all samples, 256 bins]` or thereabouts. This is the opposite of the natural
per-sample layout, and it is what the format buys: split the samples across
chunks instead and a screenful costs a read per sample again.

Levels are a resolution pyramid: the adapter reads the coarsest level whose bins
are still no wider than a screen pixel.

### Summary levels

A level may name two sibling arrays holding the min and max of the finer bins
each of its bins averages, the same thing a BigWig zoom record carries beside
its mean. They are the same shape and chunking as the level itself:

- `minPath` and `maxPath` are optional and always travel together. One without
  the other is rejected, because the display would draw a whisker against the
  mean on the other side and it would read as real asymmetry in the data.
- The finest level has neither: it has nothing below it to summarize.
- Their presence is the feature test, not `version`. A store written before v2
  has none, and a reader that predates them opens `path` and behaves as before.

Without them a zoomed-out view can only show a mean, and anything narrower than
a coarse bin averages back into the baseline at exactly the zoom someone would
be scanning for it. With them, the multi-wiggle display's `mark.extent`
`min-max` and `encoding.y.field` `minScore` or `maxScore` do what they do for a
BigWig. A view at a summary level reads all three arrays whatever it draws, as a
BigWig ships its zoom record whole, so changing either setting redraws without
a refetch.

The min and max are over the store's own finer bins, not over whatever the input
was. If the finest level is itself an aggregate of something finer, the whiskers
describe the store, not the source.

### Size

Two knobs, both read-side transparent, so neither needs a reader to know:

- **`chunk-bins`** trades requests against overfetch, not total bytes: a view
  needs the bins it needs. 256 leaves under 20% edge overfetch on a typical
  view; going much smaller multiplies requests to save very little.
- **Stored precision** is usually the bigger lever. gzip on this layout is
  mostly matching repeated values rather than modelling a distribution, so the
  number of distinct values dominates. Quantizing copy number to 0.01 roughly
  halves a store; it does nothing for genuinely continuous data. Record what was
  used in `decimals` — provenance only, since the values arrive already rounded.

The coarse levels are not the cheap ones. Averaging manufactures distinct values
and destroys the repetition gzip was feeding on, so a level with a third of the
bins is not a third of the bytes. Measure before assuming.

Write one with
[`build_signal_zarr.ts`](https://github.com/GMOD/jbrowse-components/blob/main/scripts/build_signal_zarr.ts),
which packs a list of BigWigs into this layout and takes both knobs as flags.

## Codecs

This build ships zarrita's own codecs (`bytes`, `gzip`, `zlib`, `transpose`,
`crc32c`) and stubs the numcodecs ones (`blosc`, `lz4`, `zstd`), which are
1.35 MB of wasm against a 52 KB plugin. A store compressed with one of those
fails with a message naming the codec rather than silently misreading. Write
stores with gzip.

That is less of a compromise than it looks. On a 2504-sample copy-number chunk,
gzip-9 gets 9.9x and zstd-9 gets 11.4x, so the wasm buys 13%. A byte-shuffle
filter ahead of either makes it _worse_, by 73%: shuffle helps floats that vary
smoothly in their mantissa, and this layout's wins come from long runs of
identical values that shuffle splits across four distant regions of the buffer.
Reducing stored precision beats every codec choice here, and costs no bytes on
the wire to support.

## Develop

```bash
pnpm install
pnpm test          # vitest, adapter round trip against an in-memory store
pnpm start         # esbuild watch, serves dist/out.js on :9000
pnpm build         # dist/jbrowse-plugin-zarr.umd.production.min.js
```

Point a JBrowse config's plugin `url` at `http://localhost:9000/dist/out.js` to
develop against the watch build.

## Release

```bash
pnpm version patch # lint, typecheck, test, build, then push the v* tag
```

The tag publishes to npm from CI by trusted publishing, and the plugin store
takes it from npm at its next update.

`pnpm betabuild` still pushes an unreleased build to
`https://jbrowse.org/demos/zarr/jbrowse-plugin-zarr.umd.production.min.js` for
trying a change in a config before releasing it. It re-downloads the entry point
through CloudFront afterwards and fails if it does not match what was just
built.
