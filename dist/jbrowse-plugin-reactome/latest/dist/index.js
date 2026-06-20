'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-reactome.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-reactome.cjs.development.js')
}
