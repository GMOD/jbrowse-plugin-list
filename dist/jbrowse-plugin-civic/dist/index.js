
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./jbrowseplugincivic.cjs.production.min.js')
} else {
  module.exports = require('./jbrowseplugincivic.cjs.development.js')
}
