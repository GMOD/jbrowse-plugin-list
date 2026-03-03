# jbrowse-plugin-trackhub-registry

Plugin for using the trackhub registry (http://www.trackhubregistry.org/)

## Usage in jbrowse-web

Add to the "plugins" of your JBrowse Web config. The unpkg CDN should be stable, or you can download the js file to your server

```json
{
  "plugins": [
    {
      "name": "GWAS",
      "url": "https://unpkg.com/jbrowse-plugin-trackhub-registry/dist/jbrowse-plugin-trackhub-registry.umd.production.min.js"
    }
  ]
}
```

This plugin is currently quite basic, and there is no mouseover interactivity or drawn labels on features

#### Demo

https://jbrowse.org/code/jb2/main/index.html?config=https%3A%2F%2Funpkg.com%2Fjbrowse-plugin-trackhub-registry%2Fdist%2Fconfig.json&session=share-iehjT6AoHd&password=lZS7v

