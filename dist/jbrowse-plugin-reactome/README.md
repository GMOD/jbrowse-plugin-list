# jbrowse-plugin-reactome

> JBrowse 2 plugin for Reactome ([Reactome](https://reactome.org/))

![](img/1.png)

## Install

### For JBrowse Web and JBrowse Desktop

Install the Reactome Plugin through the in-app plugin store. Need some help? Check out [the guide on how to use the plugin store here](https://jbrowse.org/jb2/docs/user_guide/#using-the-plugin-store).

## Usage

### Development

```
git clone https://github.com/GMOD/jbrowse-plugin-reactome
cd jbrowse-plugin-reactome
yarn
yarn start
```

Then (assuming JBrowse Web is running on port 3000) open JBrowse Web to the following:

http://localhost:3000/?config=http://localhost:9200/config.json

Need help getting JBrowse Web running? [Read the docs here](https://jbrowse.org/jb2/docs/quickstart_web).

### Production

Add to the "plugins" of your JBrowse Web config:

```json
{
  "plugins": [
    {
      "name": "Reactome",
      "url": "https://unpkg.com/jbrowse-plugin-reactome/dist/jbrowse-plugin-reactome.umd.production.min.js"
    }
  ]
}
```
