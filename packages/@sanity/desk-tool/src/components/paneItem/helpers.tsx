import {getDraftId, getPublishedId} from '@sanity/base/_internal'
import {DocumentPreviewStore, PreviewValue} from '@sanity/base/preview'
import {WarningOutlineIcon} from '@sanity/icons'
import {SanityDocument, SchemaType} from '@sanity/types'
import {assignWith} from 'lodash'
import React from 'react'
import {combineLatest, Observable, of} from 'rxjs'
import {map, startWith} from 'rxjs/operators'
import {PaneItemPreviewState} from './types'

export const isLiveEditEnabled = (schemaType: SchemaType) => schemaType.liveEdit === true

export const getMissingDocumentFallback = (item: SanityDocument): PreviewValue => ({
  title: (
    <span style={{fontStyle: 'italic'}}>
      {item.title ? String(item.title) : 'Missing document'}
    </span>
  ),
  subtitle: (
    <span style={{fontStyle: 'italic'}}>
      {item.title ? `Missing document ID: ${item._id}` : `Document ID: ${item._id}`}
    </span>
  ),
  media: WarningOutlineIcon,
})

export const getValueWithFallback = ({
  value,
  draft,
  published,
}: {
  value: SanityDocument
  draft?: Partial<SanityDocument> | PreviewValue | null
  published?: Partial<SanityDocument> | PreviewValue | null
}): PreviewValue | SanityDocument => {
  const snapshot = draft || published

  if (!snapshot) {
    return getMissingDocumentFallback(value)
  }

  return assignWith({}, snapshot, value, (objValue, srcValue) => {
    return typeof srcValue === 'undefined' ? objValue : srcValue
  })
}

export function getPreviewStateObservable(
  documentPreviewStore: DocumentPreviewStore,
  schemaType: SchemaType,
  documentId: string,
  title: React.ReactNode
): Observable<PaneItemPreviewState> {
  const draft$ = isLiveEditEnabled(schemaType)
    ? of({snapshot: null})
    : documentPreviewStore.observeForPreview(
        {_type: 'reference', _ref: getDraftId(documentId)},
        schemaType
      )

  const published$ = documentPreviewStore.observeForPreview(
    {_type: 'reference', _ref: getPublishedId(documentId)},
    schemaType
  )

  return combineLatest([draft$, published$]).pipe(
    map(([draft, published]) => ({
      draft: draft.snapshot ? {title, ...(draft.snapshot || {})} : null,
      isLoading: false,
      published: published.snapshot ? {title, ...(published.snapshot || {})} : null,
    })),
    startWith({draft: null, isLoading: true, published: null})
  )
}
