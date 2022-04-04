const JEST_PROJECTS = [
  '@sanity/core',
  '@sanity/base',
  '@sanity/block-tools',
  '@sanity/export',
  '@sanity/imagetool',
  '@sanity/import',
  '@sanity/mutator',
  '@sanity/portable-text-editor',
  '@sanity/schema',
  '@sanity/transaction-collator',
  '@sanity/util',
  '@sanity/validation',
]

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  projects: JEST_PROJECTS.map((pkgName) => `<rootDir>/packages/${pkgName}`),
}
