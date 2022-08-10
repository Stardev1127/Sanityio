/**
 * Looks for and imports (in preferred order):
 *   - src/_document.js
 *   - src/_document.tsx
 *
 * Then renders using ReactDOM to a string, which is sent back to the parent
 * process over the worker `postMessage` channel.
 */
import fs from 'fs'
import path from 'path'
import {Worker, parentPort, workerData, isMainThread} from 'worker_threads'
import chalk from 'chalk'
import importFresh from 'import-fresh'
import {generateHelpUrl} from '@sanity/generate-help-url'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {getAliases} from './aliases'
import {SanityMonorepo} from './sanityMonorepo'
import {debug} from './debug'

// Don't use threads in the jest world
// eslint-disable-next-line no-process-env
const useThreads = typeof process.env.JEST_WORKER_ID === 'undefined'
const hasWarnedAbout = new Set<string>()

const defaultProps = {
  entryPath: './.sanity/runtime/app.js',
}

const autoGeneratedWarning = `
This file is auto-generated on "sanity start".
Modifications to this file is automatically discarded.

To customize the rendering of this file, see
${generateHelpUrl('custom-document-component')}
`.trim()

interface DocumentProps {
  entryPath?: string
  css?: string[]
}

export function renderDocument(options: {
  monorepo?: SanityMonorepo
  studioRootPath: string
  props?: DocumentProps
}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!useThreads) {
      resolve(getDocumentHtml(options.studioRootPath, options.props))
      return
    }

    const worker = new Worker(__filename, {
      workerData: {...options, shouldWarn: true},
    })

    worker.on('message', (msg) => {
      if (msg.type === 'warning') {
        if (hasWarnedAbout.has(msg.warnKey)) {
          return
        }

        if (Array.isArray(msg.message)) {
          msg.message.forEach((warning: string) =>
            console.warn(`${chalk.yellow('[warn]')} ${warning}`)
          )
        } else {
          console.warn(`${chalk.yellow('[warn]')} ${msg.message}`)
        }

        hasWarnedAbout.add(msg.warnKey)
        return
      }

      if (msg.type === 'error') {
        reject(new Error(msg.error || 'Document rendering worker stopped with an unknown error'))
        return
      }

      if (msg.type === 'result') {
        resolve(msg.html)
      }
    })
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Document rendering worker stopped with exit code ${code}`))
      }
    })
  })
}

export function decorateIndexWithAutoGeneratedWarning(template: string): string {
  return template.replace(/<head/, `\n<!--\n${autoGeneratedWarning}\n-->\n<head`)
}

export function getPossibleDocumentComponentLocations(studioRootPath: string): string[] {
  return [path.join(studioRootPath, '_document.js'), path.join(studioRootPath, '_document.tsx')]
}

if (!isMainThread) {
  renderDocumentFromWorkerData()
}

function renderDocumentFromWorkerData() {
  if (!parentPort || !workerData) {
    throw new Error('Must be used as a Worker with a valid options object in worker data')
  }

  const {monorepo, studioRootPath, props} = workerData || {}

  if (typeof studioRootPath !== 'string') {
    parentPort.postMessage({type: 'error', message: 'Missing/invalid `studioRootPath` option'})
    return
  }

  if (props && typeof props !== 'object') {
    parentPort.postMessage({type: 'error', message: '`props` must be an object if provided'})
    return
  }

  // Require hook #1
  // Alias monorepo modules
  require('module-alias').addAliases(getAliases({monorepo}))

  // Require hook #2
  // Use `esbuild` to allow JSX/TypeScript and modern JS features
  const {unregister} = require('esbuild-register/dist/node').register({
    target: `node${process.version.slice(1)}`,
    extensions: ['.jsx', '.ts', '.tsx', '.mjs'],
  })

  // Require hook #3
  // Same as above, but we don't want to enforce a .jsx extension for anything with JSX
  const {unregister: unregisterJs} = require('esbuild-register/dist/node').register({
    target: `node${process.version.slice(1)}`,
    extensions: ['.js'],
    loader: 'jsx',
  })

  const html = getDocumentHtml(studioRootPath, props)

  parentPort.postMessage({type: 'result', html})

  // Be polite and clean up after esbuild-register
  unregister()
  unregisterJs()
}

function getDocumentHtml(studioRootPath: string, props?: DocumentProps): string {
  const Document = getDocumentComponent(studioRootPath)

  // NOTE: Validate the list of CSS paths so implementers of `_document.tsx` don't have to
  // - If the path is not a full URL, check if it starts with `/`
  //   - If not, then prepend a `/` to the string
  const css = props?.css?.map((url) => {
    try {
      // If the URL is absolute, we don't need to prefix it
      return new URL(url).toString()
    } catch {
      return url.startsWith('/') ? url : `/${url}`
    }
  })

  const result = renderToStaticMarkup(createElement(Document, {...defaultProps, ...props, css}))
  return `<!DOCTYPE html>${result}`
}

function getDocumentComponent(studioRootPath: string) {
  const {DefaultDocument} = require('sanity')
  const userDefined = tryLoadDocumentComponent(studioRootPath)

  if (!userDefined) {
    debug('Using default document component')
    return DefaultDocument
  }

  debug('Found user defined document component at %s', userDefined.path)

  const DocumentComp = userDefined.component.default
  if (typeof DocumentComp === 'function') {
    debug('User defined document component is a function, assuming valid')
    return DocumentComp
  }

  debug('User defined document component did not have a default export')
  const userExports = Object.keys(userDefined.component).join(', ') || 'None'
  const relativePath = path.relative(process.cwd(), userDefined.path)
  const typeHint =
    typeof userDefined.component.default === 'undefined'
      ? ''
      : ` (type was ${typeof userDefined.component.default})`

  const warnKey = `${relativePath}/${userDefined.modified}`

  parentPort?.postMessage({
    type: 'warning',
    message: [
      `${relativePath} did not have a default export that is a React component${typeHint}`,
      `Found named exports/properties: ${userExports}`.trim(),
      `Using default document component from "sanity".`,
    ],
    warnKey,
  })

  return DefaultDocument
}

function tryLoadDocumentComponent(studioRootPath: string) {
  const locations = getPossibleDocumentComponentLocations(studioRootPath)

  for (const componentPath of locations) {
    try {
      return {
        // eslint-disable-next-line import/no-dynamic-require
        component: importFresh<any>(componentPath),
        path: componentPath,
        // eslint-disable-next-line no-sync
        modified: Math.floor(fs.statSync(componentPath)?.mtimeMs),
      }
    } catch (err) {
      // Allow "not found" errors
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err
      }
    }
  }

  return null
}
