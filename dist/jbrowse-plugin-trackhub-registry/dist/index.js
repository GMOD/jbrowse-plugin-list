'use strict'

if (process.env.NODE_ENV === 'production') {
module.exports = require('./jbrowse-plugin-trackhub-registry.cjs.production.min.js')
} else {
module.exports = require('./jbrowse-plugin-trackhub-registry.cjs.development.js')
}
