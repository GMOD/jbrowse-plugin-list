
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./jbrowse-plugin-ucsc.cjs.production.min.js')
} else {
  module.exports = require('./jbrowse-plugin-ucsc.cjs.development.js')
}
