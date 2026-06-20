'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-multilevel-linear-view.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-multilevel-linear-view.cjs.development.js')
}
