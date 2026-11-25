# jbrowse-plugin-blat

UCSC BLAT search and in-silico PCR for JBrowse 2. The plugin adds **BLAT
search** and **In-silico PCR** to the Tools menu, a **BLAT** launch item on
reads and ruler selections, and turns hits into a track with a results list.
Queries go through a jbrowse.org server that holds a UCSC apiKey, so a search
needs no account; the server shares one budget among its users, waits out a busy
slot, and gives each network a share per hour and per day.

It comes pre-installed on the hosted genomes: every genome on
[genomes.jbrowse.org](https://genomes.jbrowse.org), and every genome JBrowse
Desktop opens from **Browse hosted genomes**. Their configs name it; neither
JBrowse Web nor Desktop bundles it, since a search finds something only on an
assembly UCSC hosts.

Another JBrowse turns it on with a config `plugins` entry:

```json
{
  "plugins": [
    {
      "name": "Blat",
      "url": "https://jbrowse.org/plugins/jbrowse-plugin-blat/latest/dist/jbrowse-plugin-blat.umd.production.min.js"
    }
  ]
}
```

A genome UCSC does not host needs a UCSC Genome Browser mirror that has it, set
in the dialog's server field. The field also takes a proxy of your own: the
jbrowse.org one is
[`products/aws/blat-proxy`](https://github.com/GMOD/jbrowse-components/tree/main/products/aws/blat-proxy)
in jbrowse-components, deployable with your own UCSC apiKey. Either has to send
CORS headers, since the browser calls it directly.

User guide: https://jbrowse.org/jb2/docs/user_guides/blat

## Development

```sh
pnpm install
pnpm test          # vitest
pnpm typecheck
pnpm build         # dist/jbrowse-plugin-blat.umd.production.min.js
pnpm floor         # build against what the newest JBrowse release serves
pnpm host-compat   # boot the build on hosted JBrowse releases
```

Release with `pnpm version patch`; the tag publishes to npm, and the plugin
store rehosts the new version at the `latest/` url hub configs name.
