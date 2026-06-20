'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-linkout.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-linkout.cjs.development.js')
}
