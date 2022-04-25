import {
  Path,
  Reference,
  ReferenceFilterSearchOptions,
  ReferenceOptions,
  ReferenceSchemaType,
  SanityDocument,
} from '@sanity/types'
import * as PathUtils from '@sanity/util/paths'
import {get} from '@sanity/util/paths'
import React, {ComponentProps, ForwardedRef, forwardRef, useCallback, useMemo, useRef} from 'react'
import {from, throwError} from 'rxjs'
import {catchError, mergeMap} from 'rxjs/operators'
import {isNonNullable} from '../../../../util'
import {withValuePath} from '../../../utils/withValuePath'
import {withDocument} from '../../../utils/withDocument'
import * as adapter from '../client-adapters/reference'
import {ReferenceInput} from '../../../inputs/ReferenceInput/ReferenceInput'
import {CreateOption, EditReferenceEvent} from '../../../inputs/ReferenceInput/types'
import {useDocumentPreviewStore} from '../../../../datastores'
import {useSource} from '../../../../studio'
import {useReferenceInputOptions} from '../../contexts'
import {ObjectFieldProps} from '../../../types'

// eslint-disable-next-line require-await
async function resolveUserDefinedFilter(
  options: ReferenceOptions | undefined,
  document: SanityDocument,
  valuePath: Path
): Promise<ReferenceFilterSearchOptions> {
  if (!options) {
    return {}
  }

  if (typeof options.filter === 'function') {
    const parentPath = valuePath.slice(0, -1)
    const parent = get(document, parentPath) as Record<string, unknown>
    return options.filter({document, parentPath, parent})
  }

  return {
    filter: options.filter,
    params: 'filterParams' in options ? options.filterParams : undefined,
  }
}

export interface StudioReferenceInputProps
  extends ObjectFieldProps<Reference, ReferenceSchemaType> {
  // From `withDocument`
  document: SanityDocument

  // From `withValuePath`
  getValuePath: () => Path
}

function useValueRef<T>(value: T): {current: T} {
  const ref = useRef(value)
  ref.current = value
  return ref
}

type SearchError = {
  message: string
  details?: {
    type: string
    description: string
  }
}

const StudioReferenceInputInner = forwardRef(function StudioReferenceInputInner(
  props: StudioReferenceInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const {client, schema} = useSource()
  const documentPreviewStore = useDocumentPreviewStore()
  const searchClient = useMemo(() => client.withConfig({apiVersion: '2021-03-25'}), [client])
  const {getValuePath, type, document} = props
  const {EditReferenceLinkComponent, onEditReference, activePath, initialValueTemplateItems} =
    useReferenceInputOptions()

  const documentRef = useValueRef(document)
  const documentTypeName = documentRef.current?._type
  const refType = schema.get(documentTypeName)

  const isDocumentLiveEdit = useMemo(() => refType?.liveEdit, [refType])

  const valuePath = useMemo(getValuePath, [getValuePath])

  const disableNew = type.options?.disableNew === true

  const handleSearch = useCallback(
    (searchString: string) =>
      from(resolveUserDefinedFilter(type.options, documentRef.current, getValuePath())).pipe(
        mergeMap(({filter, params}) =>
          adapter.search(searchClient, searchString, type, {
            ...type.options,
            filter,
            params,
            tag: 'search.reference',
          })
        ),

        catchError((err: SearchError) => {
          const isQueryError = err.details && err.details.type === 'queryParseError'
          if (type.options?.filter && isQueryError) {
            err.message = `Invalid reference filter, please check the custom "filter" option`
          }
          return throwError(err)
        })
      ),

    [documentRef, getValuePath, searchClient, type]
  )

  const template = props.value?._strengthenOnPublish?.template
  const EditReferenceLink = useMemo(
    () =>
      forwardRef(function EditReferenceLink_(
        _props: ComponentProps<NonNullable<typeof EditReferenceLinkComponent>>,
        forwardedRef: ForwardedRef<'a'>
      ) {
        return EditReferenceLinkComponent ? (
          <EditReferenceLinkComponent
            {..._props}
            ref={forwardedRef}
            parentRefPath={valuePath}
            template={template}
          />
        ) : null
      }),
    [EditReferenceLinkComponent, valuePath, template]
  )

  const handleEditReference = useCallback(
    (event: EditReferenceEvent) => {
      onEditReference?.({
        parentRefPath: valuePath,
        id: event.id,
        type: event.type,
        template: event.template,
      })
    },
    [onEditReference, valuePath]
  )

  const selectedState = PathUtils.startsWith(valuePath, activePath?.path || [])
    ? activePath?.state
    : 'none'

  const createOptions = useMemo(() => {
    if (disableNew) {
      return []
    }
    return (
      (initialValueTemplateItems || [])
        // eslint-disable-next-line max-nested-callbacks
        .filter((i) => type.to.some((_refType) => _refType.name === i.template?.schemaType))
        .map((item): CreateOption | undefined =>
          item.template?.schemaType
            ? {
                id: item.id,
                title:
                  item.title || `${item.template.schemaType} from template ${item.template?.id}`,
                type: item.template.schemaType,
                icon: item.icon,
                template: {
                  id: item.template?.id,
                  params: item.parameters,
                },

                permission: {granted: item.granted, reason: item.reason},
              }
            : undefined
        )
        .filter(isNonNullable)
    )
  }, [disableNew, initialValueTemplateItems, type.to])

  return (
    <ReferenceInput
      {...props}
      onSearch={handleSearch}
      liveEdit={isDocumentLiveEdit}
      getReferenceInfo={(id, _type) => adapter.getReferenceInfo(documentPreviewStore, id, _type)}
      ref={ref}
      selectedState={selectedState}
      editReferenceLinkComponent={EditReferenceLink}
      createOptions={createOptions}
      onEditReference={handleEditReference}
    />
  )
})

export const SanityReferenceInput = withValuePath(withDocument(StudioReferenceInputInner))
