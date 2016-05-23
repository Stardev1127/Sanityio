import fsp from 'fs-promise'
import path from 'path'
import thenify from 'thenify'
import filesize from 'filesize'
import getConfig from '../../util/getConfig'
import sortModulesBySize from '../../stats/sortModulesBySize'
import {
  getWebpackCompiler,
  getDocumentElement,
  ReactDOM
} from '@sanity/server'

export default {
  name: 'build',
  signature: 'build [outputDir]',
  description: 'Builds the current Sanity configuration to a static bundle',
  action: ({print, spinner, error, options}) => {
    const outputDir = options._[1] || path.join(options.cwd, 'dist')
    const config = getConfig(options.cwd).get('server')
    const compilationConfig = {
      env: 'production',
      staticPath: resolveStaticPath(options.cwd, config),
      basePath: options.cwd,
      outputPath: path.join(outputDir, 'static', 'js')
    }

    const compiler = getWebpackCompiler(compilationConfig)
    const compile = thenify(compiler.run.bind(compiler))

    const spin = spinner('Building Sanity...')
    spin.start()

    const bundle = {}

    return compile()
      .then(statistics => {
        const stats = statistics.toJson()
        const chunkMap = {}
        stats.chunks.forEach(chunk =>
          chunk.files.forEach(file => {
            chunkMap[file] = chunk.hash
          })
        )

        bundle.stats = stats
        return chunkMap
      })
      .then(chunkMap => {
        spin.text = 'Building index document'
        return getDocumentElement(compilationConfig, {
          scripts: ['vendor.bundle.js', 'app.bundle.js'].map(asset => ({
            path: `js/${asset}`,
            hash: chunkMap[asset]
          }))
        })
      })
      .then(doc =>
        fsp.writeFile(
          path.join(outputDir, 'index.html'),
          `<!doctype html>${ReactDOM.renderToStaticMarkup(doc)}`
        )
      )
      .then(() => spin.stop())
      .then(() => {
        bundle.stats.warnings.forEach(print)

        print(`Javascript bundles built, time spent: ${bundle.stats.time}ms`)

        if (options.stats) {
          print('\nLargest modules (unminified, uncompressed sizes):')
          sortModulesBySize(bundle.stats.modules).slice(0, 10).forEach(module =>
            print(`[${filesize(module.size)}] ${module.name}`)
          )
        }
      })
      .catch(err => {
        spin.stop()
        error(err)
      })
  }
}

function resolveStaticPath(cwd, config) {
  const {staticPath} = config
  return path.isAbsolute(staticPath)
    ? staticPath
    : path.resolve(path.join(cwd, staticPath))
}
