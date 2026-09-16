# jbrowse-plugin-reactome2

Published as `jbrowse-plugin-reactome2`; `jbrowse-plugin-reactome` 1.0.1 on npm
is the JBrowse 1.x-era build.

> JBrowse 2 plugin for [Reactome](https://reactome.org/)

![](img/1.png)

Adds a Reactome view (Add → Reactome view). Enter a gene name to list the
Reactome pathways it takes part in; the most specific one opens in Reactome's
diagram viewer, and clicking another pathway opens that one.

## Install

### For JBrowse Web and JBrowse Desktop

Install the Reactome plugin through the in-app plugin store. Need some help?
Check out
[the guide on how to use the plugin store](https://jbrowse.org/jb2/docs/user_guide/#using-the-plugin-store).

### In a config

```json
{
  "plugins": [
    {
      "name": "Reactome",
      "url": "https://unpkg.com/jbrowse-plugin-reactome2/dist/jbrowse-plugin-reactome.umd.production.min.js"
    }
  ]
}
```

## Development

Requires [pnpm](https://pnpm.io/installation).

```console
pnpm install
pnpm dev  # rollup watch + static file server on port 9000
```

Point JBrowse Web at
`http://localhost:3000/?config=http://localhost:9000/config.json`.

```console
pnpm build     # tsc + rollup UMD bundle → dist/
pnpm test      # unit tests (jsdom + React Testing Library)
pnpm test:e2e  # puppeteer against nightly JBrowse (downloads on first run)
```

`TEST_JBROWSE_VERSION=<name>` runs the e2e test against `.test-jbrowse-<name>/`
instead.

## Known limitation

Reactome's embeddable diagram viewer draws a high-level pathway (one with an
illustrated overview, such as "Cell Cycle") blank and throws in the console,
while reactome.org's own Pathway Browser draws it. Pathways further down the
hierarchy draw normally, which is why a search selects the most specific one.
