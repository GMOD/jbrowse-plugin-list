# The JBrowse 2 Plugin List

This repository contains the metadata for the plugins in the JBrowse 2 plugin store.

## Adding your plugin to the store

We welcome the addition of new plugins to the store!
To add your plugin, please add the necessary data to the end of the `plugins.json` file,
and submit a PR to this repository.

A plugin is described with the following data:

- **name:** the name of the plugin (this should have the same format as what should appear in the `config.json`)
- **authors:** an array of the names of the authors of the plugin
- **description:** a short description of the functionality provided by the plugin
- **location:** the URL for the repository containing the plugin source code.
- **url:** a URL of where the plugin files are hosted. This enables potential users
of the plugin to use this URL in their configuration to include the plugin in their app.
If you publish your package to NPM, a [unpkg.com](https://unpkg.com/) is automatically created
for your package. 
For example the URL for the `msaview` plugin is `https://unpkg.com/jbrowse-plugin-msaview/dist/jbrowse-plugin-msaview.umd.production.min.js`.
- **license:** the type of software license that your code is provided under.
If you haven't specified a value, specify `"NONE"`.
- **image (optional):** if you would like an image of your plugin to be displayed in the store,
please provide a URL for an 800 x 200 screenshot of the feature you want to show. For creating
a URL, we recommend [imgbox.com](https://imgbox.com/), which doesn't require an account or any
setup to use.
