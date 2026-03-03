'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-gdc.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-gdc.cjs.development.js')
}
