import fsp from 'fs-promise'
import path from 'path'
import {install as npmInstall} from '../../npm-bridge/install'
import readLocalManifest from '../../util/readLocalManifest'
import generateConfigChecksum from '../../util/generateConfigChecksum'
import {setChecksum, hasSameChecksum} from '../../util/pluginChecksumManifest'

export default {
  name: 'install',
  signature: 'install [plugin]',
  description: 'Installs a Sanity plugin to the current Sanity configuration',
  action: args => {
    const plugins = args.options._.slice(1)
    if (!plugins.length) {
      return args.error(new Error('Plugin name must be specified'))
    }

    return Promise.all(plugins.map(plugin => installPlugin(plugin, args)))
  }
}

function installPlugin(plugin, {print, spinner, error, options}) {
  const isNamespaced = plugin[0] === '@'
  let shortName = plugin
  let fullName = plugin

  if (!isNamespaced) {
    const isFullName = plugin.indexOf('sanity-plugin-') === 0
    shortName = isFullName ? plugin.substr(14) : plugin
    fullName = isFullName ? plugin : `sanity-plugin-${plugin}`
  }

  const spin = spinner('Installing plugin...')
  spin.start()

  return npmInstall(['--save', fullName])
    .then(() => saveToSanityManifest(options.cwd, shortName))
    .then(() => copyConfiguration(options.cwd, fullName, shortName, print))
    .then(() => spin.stop())
    .then(() => print(`Plugin '${fullName}' installed`))
    .catch(err => {
      spin.stop()
      handleNpmError(err, error, fullName)
    })
}

function handleNpmError(err, printError, pluginName) {
  if (err.message.includes(`'${pluginName}' is not in the npm registry`)) {
    return printError(new Error(`'${pluginName}' is not in the npm registry`))
  }

  printError(err)
}

function saveToSanityManifest(cwd, pluginName) {
  return readLocalManifest(cwd, 'sanity.json')
    .then(manifest => {
      manifest.plugins = manifest.plugins || []
      if (manifest.plugins.indexOf(pluginName) === -1) {
        manifest.plugins.push(pluginName)
      }
      return manifest
    })
    .then(manifest => fsp.writeJson(path.join(cwd, 'sanity.json'), manifest, {spaces: 2}))
}

function copyConfiguration(cwd, fullName, shortName, print) {
  const configPath = path.join(cwd, 'node_modules', fullName, 'config.dist.json')
  const dstPath = path.join(cwd, 'config', `${shortName}.json`)

  return fsp.stat(configPath).then(() => {
    // Configuration exists, check if user has local configuration already
    return fsp.stat(dstPath)
      .then(() => generateConfigChecksum(configPath))
      .then(distChecksum => hasSameChecksum(cwd, fullName, distChecksum))
      .then(sameChecksum => warnOnDifferentChecksum(shortName, sameChecksum, print))
      .catch(() => {
        // Destination file does not exist, copy
        return fsp.copy(configPath, dstPath)
          .then(() => generateConfigChecksum(configPath))
          .then(checksum => setChecksum(cwd, fullName, checksum))
      })
  })
}

// @todo Improve with some sort of helpful key differ or similar
function warnOnDifferentChecksum(plugin, sameChecksum, printer) {
  if (!sameChecksum) {
    printer([
      `[Warning] Default configuration for plugin '${plugin}' has changed since you first installed it,`,
      'check local configuration vs distributed configuration to ensure your configuration is up to date'
    ].join(' '))
  }
}
