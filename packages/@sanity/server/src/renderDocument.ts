/**
 * Looks for and imports (in preferred order):
 *   - src/_document.js
 *   - src/_document.tsx
 *
 * Then renders using ReactDOM to a string, which is sent back to the parent
 * process over the worker `postMessage` channel.
 */
import path from 'path'
import {Worker, parentPort, workerData, isMainThread} from 'worker_threads'
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
      workerData: options,
    })

    worker.on('message', (msg) => {
      if (msg.type === 'warn') {
        console.warn(msg.message)
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

  const monorepo = workerData.monorepo
  const studioRootPath = workerData.studioRootPath
  const props = workerData.props

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
  // eslint-disable-next-line import/no-unassigned-import
  const {unregister} = require('esbuild-register/dist/node').register({
    target: `node${process.version.slice(1)}`,
    loader: 'tsx',
  })

  const html = getDocumentHtml(studioRootPath, props)

  parentPort.postMessage({type: 'result', html})

  // Be polite and clean up after esbuild-register
  unregister()
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

  if (userDefined) {
    debug('Found user defined document component at %s', userDefined.path)

    const DocumentComp = userDefined.component.default || userDefined.component
    if (typeof DocumentComp === 'function') {
      return DocumentComp
    }

    parentPort?.postMessage({
      type: 'warning',
      message: `Component at ${userDefined.path} did not have a default export that is a React component, using default document component from "sanity"`,
    })
  }

  debug('Using default document component')
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
