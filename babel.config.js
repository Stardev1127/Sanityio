/* eslint-disable @typescript-eslint/no-var-requires, no-sync, strict */

'use strict'

const fs = require('fs')
const path = require('path')

// eslint-disable-next-line no-sync
const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf8'))

module.exports = Object.assign({}, babelrc, {
  babelrcRoots: ['.'].concat(require('./lerna.json').packages),
})
