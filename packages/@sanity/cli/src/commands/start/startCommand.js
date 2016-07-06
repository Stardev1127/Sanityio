import path from 'path'
import {getProdServer, getDevServer} from '@sanity/server'
import isProduction from '../../util/isProduction'
import getConfig from '../../util/getConfig'
import thenify from 'thenify'
import storyBook from '@sanity/storybook/server'

export default {
  name: 'start',
  signature: 'start',
  description: 'Starts a webserver that serves Sanity',
  action: ({print, options}) => {
    const sanityConfig = getConfig(options.cwd)
    const config = sanityConfig.get('server')
    const getServer = isProduction ? getProdServer : getDevServer
    const server = getServer({
      staticPath: resolveStaticPath(options.cwd, config),
      basePath: options.cwd
    })

    const {port, hostname} = config
    const httpPort = options.port || port
    const listeners = [thenify(server.listen.bind(server))(httpPort, hostname)]

    const storyConfig = sanityConfig.get('storybook')
    if (storyConfig) {
      const plugins = sanityConfig.get('plugins') || []
      if (plugins.indexOf('@sanity/storybook') === -1) {
        throw new Error(
          '`@sanity/storybook` is missing from `plugins` array. '
          + 'Either add it as a dependency and plugin, or remove the '
          + '`storybook` section of your projects `sanity.json`.'
        )
      }

      listeners.push(storyBook(storyConfig))
    }

    return Promise.all(listeners)
      .then(res => {
        print(`Server listening on http://${hostname}:${httpPort}`)
        if (res.length > 1) {
          print(`Storybook listening on ${res[1]}`)
        }
      })
      .catch(getGracefulDeathHandler(config))
  }
}

function resolveStaticPath(cwd, config) {
  const {staticPath} = config
  return path.isAbsolute(staticPath)
    ? staticPath
    : path.resolve(path.join(cwd, staticPath))
}

function getGracefulDeathHandler(config) {
  return function gracefulDeath(err) {
    if (err.code === 'EADDRINUSE') {
      throw new Error('Port number for Sanity server is already in use, configure `server.port` in `sanity.json`')
    }

    if (err.code === 'EACCES') {
      const help = config.port < 1024
        ? 'port numbers below 1024 requires root privileges'
        : `do you have access to listen to the given hostname (${config.hostname})?`

      throw new Error(`Sanity server does not have access to listen to given port - ${help}`)
    }

    throw err
  }
}
