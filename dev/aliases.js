// These are path mappings/aliases used by various tools in the monorepo to map imported modules to
// source files in order to speed up rebuilding and avoid having a separate watcher process to build
// from src => lib.

// This file is currently read by:
//   - vite when running the dev server (only when running in this monorepo)
//   - jest when running test suite

// prettier-ignore
module.exports = {
  // NOTE: do not use regex in the module expressions,
  // because they will be escaped by the jest config
  '@sanity/base': './packages/@sanity/base/src/_exports',
  '@sanity/block-tools': './packages/@sanity/block-tools/src',
  '@sanity/code-input': './packages/@sanity/code-input/src',
  '@sanity/diff': './packages/@sanity/diff/src',
  '@sanity/imagetool': './packages/@sanity/imagetool/src',
  '@sanity/mutator': './packages/@sanity/mutator/src',
  '@sanity/portable-text-editor': './packages/@sanity/portable-text-editor/src',
  '@sanity/schema': './packages/@sanity/schema/src/_exports',
  '@sanity/transaction-collator': './packages/@sanity/transaction-collator/src',
  '@sanity/types': './packages/@sanity/types/src',
  '@sanity/types/parts': './packages/@sanity/types/parts',
  '@sanity/util': './packages/@sanity/util/src',
  '@sanity/validation': './packages/@sanity/validation/src',
  'sanity': "./packages/sanity/src/_exports"
}
