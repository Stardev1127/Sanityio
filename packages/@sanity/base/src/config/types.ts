import T, {Template, TemplateBuilder} from '@sanity/initial-value-templates'
import {Router, RouterState} from '@sanity/state-router'
import {
  Asset,
  AssetFromSource,
  Marker,
  Schema as SanitySchema,
  Schema,
  SchemaType,
  ValidationMarker,
} from '@sanity/types'
import React from 'react'
import {SanityPlugin} from '../plugin'
import {DocumentNodeResolver} from '../structure'
import {SanityTheme} from '../theme'

export interface InitialValueTemplatesResolver {
  (_T: typeof T, options: {schema: Schema}): Array<Template | TemplateBuilder>
}

export type {SanitySchema}

export interface SanityAuthConfig {
  mode?: 'append' | 'replace'
  redirectOnSingle?: boolean
  providers?: {
    name: string
    title: string
    url: string
    logo?: string
  }[]
}

export type SanityFormBuilderAssetSourceComponent = React.ComponentType<{
  assetType: 'file' | 'image'
  onClose: () => void
  onSelect: (assetsFromSource: AssetFromSource[]) => void
  selectedAssets: Asset[]
  dialogHeaderTitle?: string
}>

export interface SanityFormBuilderAssetSourceConfig {
  type: 'file' | 'image'
  name: string
  title: string
  component: SanityFormBuilderAssetSourceComponent
  icon: React.ComponentType
}

export interface SanityFormBuilderConfig {
  components?: {
    // @todo
    ArrayFunctions?: React.ComponentType<any>
    CustomMarkers?: React.ComponentType<{markers: ValidationMarker[]}>
    Markers?: React.ComponentType<{
      markers: Marker[]
      renderCustomMarkers?: (markers: Marker[]) => JSX.Element
    }>
  }
  assetSources?: SanityFormBuilderAssetSourceConfig[]
  inputResolver?: (schemaType: SchemaType) => React.ComponentType<any> | undefined | false | null
}

export interface SanityTool<Options = any> {
  component: React.ComponentType<{tool: SanityTool<Options>}>
  icon?: React.ComponentType
  name: string
  options: Options
  router?: Router
  title: string
  getIntentState?: (
    intent: string,
    params: Record<string, string>,
    routerState: RouterState | undefined,
    payload: unknown
  ) => unknown
  canHandleIntent?: (intent: string, params: Record<string, unknown>, payload: unknown) => boolean
}

export interface SanitySourceConfig {
  projectId: string
  dataset: string
  name: string
  title: string
  initialValueTemplates?: Template[] | InitialValueTemplatesResolver
  schemaTypes?: any[]
  structureDocumentNode?: DocumentNodeResolver
}

export interface SanityConfig {
  auth?: SanityAuthConfig
  formBuilder?: SanityFormBuilderConfig
  plugins?: SanityPlugin[]
  project?: {
    basePath?: string
    name?: string
    logo?: React.ComponentType<{'aria-label'?: string}>
  }
  /**
   * @beta
   */
  __experimental_spaces?: SanitySpace[] // eslint-disable-line camelcase
  schemaTypes?: any[]
  sources?: SanitySourceConfig[]
  theme?: SanityTheme
  tools?: SanityTool[]
}

/**
 * @beta
 */
export interface SanitySpace {
  name: string
  title: string
  default?: boolean
  api: SanitySourceConfig
}
