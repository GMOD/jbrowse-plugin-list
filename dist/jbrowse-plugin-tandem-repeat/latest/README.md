# jbrowse-plugin-tandem-repeat

A JBrowse 2 view of a tandem repeat's alleles: one bar per haplotype on its own
bp axis, with each copy coloured by its repeat unit.

![LPA's KIV-2 array in GRCh38 and eight HPRC haplotypes, each copy coloured by its unit](img/kiv2_copies.png)

## Opening the view

Right-click a VCF 4.5 `<CNV:TR>` record in a variant track and choose **Show
repeat copies**. Both the single-row and the multi-sample variant displays offer
the item. The view keeps the record's alleles in the session, so a saved session
draws them without the track.

## What the view reads

The view draws what the record states, in the fields VCF 4.5 defines for tandem
repeats:

- `RN`: how many repeat sequences (runs) each ALT allele has
- `RUS` or `RUL`: each run's unit sequence or length. Runs of one unit share a
  colour
- `RUC`: copies in each run
- `RB`: bases in each run
- `RUB`: each copy's bases, so a partial or odd-length copy draws at its length
- `GT`: the alleles each sample carries. A phased genotype's k-th allele is
  labelled `sample#k`, its PanSN haplotype

The legend numbers units by how many copies the record's alleles carry, most
first. A record states no runs for its reference allele, so a sample carrying
that allele draws grey, ticked every unit. A dashed line marks the reference
allele's length.

TRGT and vamos state repeats in fields of their own, so their output needs
converting to these fields before the view draws it.

## The KIV-2 example

The hosted HPRC demo's `hprc_kiv2_copies` track holds one record: LPA's KIV-2
array in GRCh38 and eight HPRC haplotypes. jbrowse-plugin-graphgenomeviewer's
`scripts/tandem-repeat-vcf.mjs` wrote it from a pangenome graph cut. The script
splits each haplotype's array into copies and groups copies within 1% of each
other into a unit. Two units come out, 2.3% apart, matching the two repeat types
long-read studies of LPA report.

## Usage

Needs JBrowse 5.0.0-beta.9 or later.

```json
{
  "plugins": [
    {
      "name": "TandemRepeat",
      "esmUrl": "https://unpkg.com/jbrowse-plugin-tandem-repeat/dist/jbrowse-plugin-tandem-repeat.esm.js"
    }
  ]
}
```

## Development

```
pnpm install
pnpm start      # serves the bundle on port 9000
pnpm test
pnpm figures    # reshoots img/ from the hosted HPRC demo on a released JBrowse
```

`pnpm figures` answers the demo's config request with this plugin added and
serves the local `dist/` in place of the published bundle, then right-clicks the
record and chooses the menu item as a reader would.
