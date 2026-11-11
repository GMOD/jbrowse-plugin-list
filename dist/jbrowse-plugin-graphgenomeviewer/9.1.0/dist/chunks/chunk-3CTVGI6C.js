function n(e){return e instanceof Error&&(e.name==="NodeLimitError"||e.regionTooLarge===!0||/reads more than nodeLimit|^Subgraph size limit of \d+ nodes exceeded/.test(e.message))}function o(e){return n(e)&&e instanceof Error&&"zoomHelps"in e&&e.zoomHelps===!1&&"bytes"in e&&typeof e.bytes=="number"}export{n as a,o as b};
//# sourceMappingURL=chunk-3CTVGI6C.js.map
