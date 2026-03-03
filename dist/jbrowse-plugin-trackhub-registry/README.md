# jbrowse-plugin-trackhub-registry

Plugin for using the trackhub registry (http://www.trackhubregistry.org/)

## Usage in jbrowse-web

Add to the "plugins" of your JBrowse Web config. The unpkg CDN should be
stable, or you can download the js file to your server

```json
{
  "plugins": [
    {
      "name": "TrackHubRegistry",
      "url": "https://unpkg.com/jbrowse-plugin-trackhub-registry/dist/jbrowse-plugin-trackhub-registry.umd.production.min.js"
    }
  ]
}
```

#### Demo

https://jbrowse.org/code/jb2/main/index.html?config=https%3A%2F%2Funpkg.com%2Fjbrowse-plugin-trackhub-registry%2Fdist%2Fconfig.json

Use "File"->"Open connection"->Select "Track Hub Registry" from dropdown
