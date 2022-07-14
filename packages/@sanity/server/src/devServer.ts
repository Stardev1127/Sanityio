import path from 'path'
import fs from 'fs/promises'
import chalk from 'chalk'
import chokidar from 'chokidar'
import {createServer, InlineConfig} from 'vite'
import {getViteConfig} from './getViteConfig'
import {
  decorateIndexWithAutoGeneratedWarning,
  getPossibleDocumentComponentLocations,
  renderDocument,
} from './renderDocument'
import {debug} from './debug'
import {getEntryModule} from './getEntryModule'
import {loadSanityMonorepo} from './sanityMonorepo'
import {getSanityStudioConfigPath} from './sanityConfig'

export interface DevServerOptions {
  cwd: string
  basePath: string
  staticPath: string

  httpPort: number
  httpHost?: string
  projectName?: string

  vite?: (config: InlineConfig) => InlineConfig
}

export interface DevServer {
  close(): Promise<void>
}

export async function startDevServer(options: DevServerOptions): Promise<DevServer> {
  const {cwd, httpPort, httpHost, basePath: base, vite: extendViteConfig} = options

  const monorepo = await loadSanityMonorepo(cwd)
  const runtimeDir = path.join(cwd, '.sanity', 'runtime')
  const startTime = Date.now()

  debug('Making runtime directory')
  await fs.mkdir(runtimeDir, {recursive: true})

  async function renderAndWriteDocument() {
    debug('Rendering document template')
    const indexHtml = decorateIndexWithAutoGeneratedWarning(
      await renderDocument({
        studioRootPath: cwd,
        monorepo,
        props: {entryPath: `/${path.relative(cwd, path.join(runtimeDir, 'app.js'))}`},
      })
    )

    debug('Writing index.html to runtime directory')
    await fs.writeFile(path.join(runtimeDir, 'index.html'), indexHtml)
  }

  chokidar
    .watch(getPossibleDocumentComponentLocations(cwd))
    .on('all', () => renderAndWriteDocument())

  await renderAndWriteDocument()

  debug('Writing app.js to runtime directory')
  const studioConfigPath = await getSanityStudioConfigPath(cwd)
  const relativeConfigLocation = path.relative(runtimeDir, studioConfigPath)
  await fs.writeFile(path.join(runtimeDir, 'app.js'), getEntryModule({relativeConfigLocation}))

  debug('Resolving vite config')
  let viteConfig = await getViteConfig({
    basePath: base || '/',
    mode: 'development',
    server: {port: httpPort, host: httpHost},
    cwd,
  })

  if (extendViteConfig) {
    viteConfig = extendViteConfig(viteConfig)
  }

  debug('Creating vite server')
  const server = await createServer(viteConfig)
  const info = server.config.logger.info

  await server.listen()

  const startupDuration = Date.now() - startTime
  const url = `http://${httpHost || 'localhost'}:${httpPort || '3333'}`
  info(
    `Sanity Studio ` +
      `using ${chalk.cyan(`vite@${require('vite/package.json').version}`)} ` +
      `ready in ${chalk.cyan(`${Math.ceil(startupDuration)}ms`)} ` +
      `and running at ${chalk.cyan(url)}`
  )

  return {close: () => server.close()}
}
