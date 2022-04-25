import {AssetSource, Schema, SchemaType} from '@sanity/types'
import React, {useMemo} from 'react'
import {SanityFormBuilderConfig} from '../config'
import {FormBuilderFilterFieldFn} from './types'
import {fallbackInputs} from './fallbackInputs'
import {FormBuilderContext, FormBuilderContextValue} from './FormBuilderContext'
import {PatchChannel} from './patchChannel'
import {DefaultArrayInputFunctions} from './inputs/arrays/common/ArrayFunctions'
import {DefaultMarkers} from './inputs/PortableText/_legacyDefaultParts/Markers'
import {DefaultCustomMarkers} from './inputs/PortableText/_legacyDefaultParts/CustomMarkers'
import {FileSource, ImageSource} from './studio/DefaultAssetSource'
import {EMPTY_ARRAY} from './utils/empty'
import {FieldProps} from './store/types'

const defaultFileAssetSources = [FileSource]
const defaultImageAssetSources = [ImageSource]

function resolveComponentFromType<Props>(
  providedResolve:
    | ((type: SchemaType) => React.ComponentType<Props> | null | false | undefined)
    | undefined,
  type: SchemaType
) {
  let itType: SchemaType | undefined = type

  while (itType) {
    const resolved = providedResolve?.(itType)

    if (resolved) return resolved

    itType = itType.type
  }

  return undefined
}

export interface FormBuilderProviderProps extends SanityFormBuilderConfig {
  schema: Schema
  value?: unknown
  children?: React.ReactNode
  filterField?: FormBuilderFilterFieldFn
  /**
   * @internal
   */
  __internal_patchChannel?: PatchChannel // eslint-disable-line camelcase
}

const missingPatchChannel: PatchChannel = {
  publish: () => undefined,
  subscribe: () => {
    console.warn(
      'No patch channel provided to form-builder. If you need input based patch updates, please provide one'
    )

    return () => undefined
  },
}

export function FormBuilderProvider(props: FormBuilderProviderProps) {
  const {
    children,
    components,
    file,
    image,
    schema,
    filterField,
    __internal_patchChannel: patchChannel = missingPatchChannel,
    resolveInputComponent: resolveInputComponentProp,
    resolvePreviewComponent: resolvePreviewComponentProp,
    value,
  } = props

  const formBuilder: FormBuilderContextValue = useMemo(() => {
    return {
      components: {
        ArrayFunctions: components?.ArrayFunctions || DefaultArrayInputFunctions,
        CustomMarkers: components?.CustomMarkers || DefaultCustomMarkers,
        Markers: components?.Markers || DefaultMarkers,
        inputs: components?.inputs || {},
      },

      file: {
        assetSources: file?.assetSources
          ? ensureArrayOfSources(file.assetSources) || defaultFileAssetSources
          : defaultFileAssetSources,
        directUploads: file?.directUploads !== false,
      },

      filterField: filterField || (() => true),
      image: {
        assetSources: image?.assetSources
          ? ensureArrayOfSources(image.assetSources) || defaultImageAssetSources
          : defaultFileAssetSources,
        directUploads: image?.directUploads !== false,
      },

      getValuePath: () => EMPTY_ARRAY,
      __internal_patchChannel: patchChannel, // eslint-disable-line camelcase
      schema,
      resolveInputComponent: (type) =>
        resolveComponentFromType(resolveInputComponentProp, type) ||
        (fallbackInputs[type.jsonType] as React.ComponentType<FieldProps>),
      resolvePreviewComponent: (type) =>
        resolveComponentFromType(resolvePreviewComponentProp, type),
      getDocument: () => value,
    }
  }, [
    components,
    file,
    filterField,
    image,
    patchChannel,
    resolveInputComponentProp,
    resolvePreviewComponentProp,
    schema,
    value,
  ])

  return <FormBuilderContext.Provider value={formBuilder}>{children}</FormBuilderContext.Provider>
}

function ensureArrayOfSources(sources: unknown): AssetSource[] | null {
  if (Array.isArray(sources)) {
    return sources
  }

  console.warn('Configured asset sources is not an array:', sources)

  return null
}
