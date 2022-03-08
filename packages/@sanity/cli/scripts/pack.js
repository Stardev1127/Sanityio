#!/usr/bin/env node
/* eslint-disable no-console, no-process-exit, no-sync */
const path = require('path')
const fse = require('fs-extra')
const webpack = require('webpack')
const klawSync = require('klaw-sync')

const shebangLoader = require.resolve('./shebang-loader')
const basedir = path.join(__dirname, '..')
const modulesDir = path.join(basedir, 'node_modules')
const isAllowedNativeModule = (mod) => {
  const modName = mod.path.slice(modulesDir.length + 1).split(path.sep)[0]
  return !['fsevents'].includes(modName)
}

console.log('Building CLI to a single file')

// Make sure there are no native modules
const isBinding = (file) => path.basename(file.path) === 'binding.gyp'
const bindings = klawSync(modulesDir, {nodir: true, filter: isBinding}).filter(
  isAllowedNativeModule
)

if (bindings.length > 0) {
  console.error('Eek! Found native module at:')
  bindings.forEach((file) => console.error(file.path))
  process.exit(1)
}

const openDir = path.dirname(require.resolve('open'))
const xdgPath = path.join(openDir, 'xdg-open')
fse.copy(xdgPath, path.join(basedir, 'bin', 'xdg-open'))

const babelRc = JSON.parse(fse.readFileSync(path.join(basedir, '.babelrc'), 'utf8'))

// Use the real node __dirname and __filename in order to get Yarn's source
// files on the user's system. See constants.js
const nodeOptions = {
  __filename: false,
  __dirname: false,
}

const compiler = webpack({
  mode: 'production',
  entry: {
    sanity: path.join(basedir, 'bin/entry.js'),
  },
  output: {
    pathinfo: true,
    filename: 'sanity-cli.js',
    path: path.join(basedir, 'bin'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{loader: 'babel-loader', options: babelRc}],
      },
      {
        test: /node_modules[/\\](rc)[/\\]/,
        use: [{loader: shebangLoader}],
      },
    ],
  },
  externals: {
    // We don't want to bundle esbuild as it contains binaries that needs to be executed as-is,
    // and there are multiple different platforms that are targetted
    esbuild: 'commonjs2 esbuild',
    'esbuild-register/dist/node': 'commonjs2 esbuild-register/dist/node',
    'esbuild-register': 'commonjs2 esbuild-register',
    'esbuild-windows-arm64': 'commonjs2 esbuild-windows-arm64',
    'esbuild-windows-32': 'commonjs2 esbuild-windows-32',
    'esbuild-windows-64': 'commonjs2 esbuild-windows-64',
    'esbuild-android-arm64': 'commonjs2 esbuild-android-arm64',
    'esbuild-darwin-arm64': 'commonjs2 esbuild-darwin-arm64',
    'esbuild-darwin-64': 'commonjs2 esbuild-darwin-64',
    'esbuild-freebsd-arm64': 'commonjs2 esbuild-freebsd-arm64',
    'esbuild-freebsd-64': 'commonjs2 esbuild-freebsd-64',
    'esbuild-openbsd-64': 'commonjs2 esbuild-openbsd-64',
    'esbuild-linux-arm': 'commonjs2 esbuild-linux-arm',
    'esbuild-linux-arm64': 'commonjs2 esbuild-linux-arm64',
    'esbuild-linux-32': 'commonjs2 esbuild-linux-32',
    'esbuild-linux-mips64le': 'commonjs2 esbuild-linux-mips64le',
    'esbuild-linux-ppc64le': 'commonjs2 esbuild-linux-ppc64le',
    'esbuild-linux-64': 'commonjs2 esbuild-linux-64',
    'esbuild-sunos-64': 'commonjs2 esbuild-sunos-64',
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
    new webpack.DefinePlugin({
      __SANITY_IS_BUNDLED__: JSON.stringify(true),

      // Workaround for rc module console.logging if module.parent does not exist
      'module.parent': JSON.stringify({}),

      // Do _NOT_ set NODE_ENV to production (default with `mode: production`),
      // as it will make `.env` file loading inconsistent - always loading production
      // unless `SANITY_ACTIVE_ENV` is set
      'process.env.NODE_ENV': undefined,
    }),
  ],
  target: 'node',
  node: nodeOptions,
})

compiler.run((err, stats) => {
  if (err) {
    throw err
  }

  const filtered = stats.compilation.warnings.filter((warn) => {
    return (
      !warn.origin ||
      (warn.origin.userRequest.indexOf('spawn-sync.js') === -1 &&
        warn.origin.userRequest.indexOf('write-file-atomic') === -1)
    )
  })

  if (filtered.length > 0) {
    console.warn('=== [  Warnings  ]========')
    filtered.forEach((warn) => {
      console.warn(warn.origin ? `\n${warn.origin.userRequest}:` : '\n')
      console.warn(`${warn}\n`)
    })
    console.warn('=== [ /Warnings  ]========\n')
  }

  if (stats.compilation.errors.length > 0) {
    console.error(stats.compilation.errors)
    process.exit(1)
  }

  // Make the file executable
  const outputPath = path.join(basedir, 'bin', 'sanity')
  fse.chmodSync(outputPath, 0o755)

  // Make paths more dynamic
  let replacePath = path.normalize(path.join(__dirname, '..'))
  try {
    const monorepoPkg = require('../../../../package.json')
    if (monorepoPkg.name === 'sanity') {
      replacePath = path.normalize(path.join(__dirname, '..', '..', '..', '..'))
    }
  } catch (reqErr) {
    // do nothing
  }

  const content = fse.readFileSync(outputPath, 'utf8')
  const replaceRegex = new RegExp(escapeRegex(`*** ${replacePath}`), 'ig')
  const normalized = content.replace(replaceRegex, '*** ')
  fse.writeFileSync(outputPath, normalized, 'utf8')

  console.log(`Done packing to ${path.join(basedir, 'bin', 'sanity-cli.js')}`)
})

function escapeRegex(string) {
  return `${string}`.replace(/([?!${}*:()|=^[\]/\\.+])/g, '\\$1')
}
