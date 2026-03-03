'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-refget-api.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-refget-api.cjs.development.js')
}
