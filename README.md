# The JBrowse 2 Plugin List

This repository contains the metadata for the plugins in the JBrowse 2 plugin
store.

## Adding your plugin to the store

We welcome the addition of new plugins to the store! To add your plugin, please
add the necessary data to the end of the `plugins.json` file, and submit a PR to
this repository.

A plugin is described with the following data:

- **name:** the name of the plugin (this should have the same format as what
  should appear in the `config.json`)
- **authors:** an array of the names of the authors of the plugin
- **description:** a short description of the functionality provided by the
  plugin
- **location:** the URL for the repository containing the plugin source code.
- **packageName:** the NPM package name your plugin is published under. We
  download the package tarball from NPM and rehost it, so this must be published
  to NPM.
- **umdPath:** the path to the UMD bundle _inside_ your published package, e.g.
  `dist/jbrowse-plugin-msaview.umd.production.min.js`. We build the served URL
  from `packageName`, the version, and this path, and verify the file exists in
  the published tarball — so we never have to guess where your bundle lives.
- **license:** the type of software license that your code is provided under. If
  you haven't specified a value, specify `"NONE"`.
- **versions (optional):** an array of
  `{ "pluginVersion": "...", "jbrowseRange": "..." }` entries, listed
  oldest-to-newest, declaring which published versions to host and the semver
  range of JBrowse versions each supports (e.g. `">=3.0.0"`). Omit this to
  simply track the latest published version for all JBrowse versions.
- **image (optional):** if you would like an image of your plugin to be
  displayed in the store, please provide an 800 x 200 screenshot of the feature
  you want to show to the img directory. Please provide the download URL for
  that file in your plugin entry. Examples can be found in the existing entries.

## Publishing updates

Once your plugin is in the store you do not need to open another PR for new
releases. A nightly GitHub Action checks NPM, downloads any new published
version into a version-pinned, rehosted folder, and opens an "Update plugins" PR
that a maintainer reviews and deploys. Plugins that pin explicit `versions` are
only updated when that list changes; all others track the latest NPM release.

See [DEVELOPERS.md](DEVELOPERS.md) for the full pipeline and deploy steps.
