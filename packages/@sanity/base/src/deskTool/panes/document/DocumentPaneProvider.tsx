import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ObjectSchemaType, Path, SanityDocument} from '@sanity/types'
import {omit} from 'lodash'
import {useToast} from '@sanity/ui'
import {fromString as pathFromString} from '@sanity/util/paths'
import isHotkey from 'is-hotkey'
import {useMemoObservable} from 'react-rx'
import {PaneMenuItem} from '../../types'
import {useHistoryStore, useInitialValue, usePresenceStore} from '../../../datastores'
import {
  useConnectionState,
  useDocumentOperation,
  useDocumentPresence,
  useEditState,
  useValidationStatus,
} from '../../../hooks'
import {isDev} from '../../../environment'
import {useSource} from '../../../studio'
import {getPublishedId, useUnique} from '../../../util'
import {useDeskTool, usePaneRouter} from '../../components'
import {PatchEvent, toMutationPatches} from '../../../form'
import {useFormState} from '../../../form/store/useFormState'
import {DocumentPaneContext, DocumentPaneContextValue} from './DocumentPaneContext'
import {getMenuItems} from './menuItems'
import {DocumentPaneProviderProps} from './types'
import {usePreviewUrl} from './usePreviewUrl'
import {getInitialValueTemplateOpts} from './getInitialValueTemplateOpts'

const emptyObject = {} as Record<string, string | undefined>

/**
 * @internal
 */
// eslint-disable-next-line complexity, max-statements
export const DocumentPaneProvider = memo((props: DocumentPaneProviderProps) => {
  const {children, index, pane, paneKey} = props
  const {
    client,
    schema,
    templates,
    document: {actions: documentActions, badges: documentBadges},
  } = useSource()
  const historyStore = useHistoryStore()
  const presenceStore = usePresenceStore()
  const paneRouter = usePaneRouter()
  const {features} = useDeskTool()
  const {push: pushToast} = useToast()
  const {options, menuItemGroups, title = null, views: viewsProp = []} = pane
  const paneOptions = useUnique(options)
  const documentIdRaw = paneOptions.id
  const documentId = getPublishedId(documentIdRaw)
  const documentType = options.type
  const paneParams = useUnique(paneRouter.params)
  const panePayload = useUnique(paneRouter.payload)
  const {templateName, templateParams} = useMemo(
    () =>
      getInitialValueTemplateOpts(templates, {
        documentType,
        templateName: paneOptions.template,
        templateParams: paneOptions.templateParameters,
        panePayload,
        urlTemplate: paneParams?.template,
      }),
    [documentType, paneOptions, paneParams, panePayload, templates]
  )
  const initialValueRaw = useInitialValue({
    documentId,
    documentType,
    templateName,
    templateParams,
  })
  const initialValue = useUnique(initialValueRaw)
  const {patch}: any = useDocumentOperation(documentId, documentType)
  const editState = useEditState(documentId, documentType)
  const {validation: validationRaw} = useValidationStatus(documentId, documentType)
  const connectionState = useConnectionState(documentId, documentType)
  const documentSchema = schema.get(documentType) as ObjectSchemaType
  const value: Partial<SanityDocument> =
    editState?.draft || editState?.published || initialValue.value
  const actions = useMemo(
    () => documentActions({schemaType: documentType, documentId}),
    [documentActions, documentId, documentType]
  )
  const badges = useMemo(
    () => documentBadges({schemaType: documentType, documentId}),
    [documentBadges, documentId, documentType]
  )
  const validation = useUnique(validationRaw)
  const views = useUnique(viewsProp)
  const params = paneRouter.params || emptyObject
  const [focusPath, setFocusPath] = useState<Path>(() =>
    params.path ? pathFromString(params.path) : []
  )
  const activeViewId = params.view || (views[0] && views[0].id) || null
  const timeline = useMemo(
    () => historyStore.getTimeline({publishedId: documentId, enableTrace: isDev}),
    [documentId, historyStore]
  )
  const [timelineMode, setTimelineMode] = useState<'since' | 'rev' | 'closed'>('closed')
  // NOTE: this emits sync so can never be null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {historyController} = useMemoObservable(
    () => historyStore.getTimelineController({client, documentId, documentType, timeline}),
    [client, documentId, documentType, timeline]
  )!
  /**
   * @todo: this will now happen on each render, but should be refactored so it happens only when
   * the `rev`, `since` or `historyController` values change.
   */
  historyController.setRange(params.since || null, params.rev || null)
  const changesOpen = historyController.changesPanelActive()

  // TODO: this may cause a lot of churn. May be a good idea to prevent these
  // requests unless the menu is open somehow
  const previewUrl = usePreviewUrl(value)

  const hasValue = Boolean(value)
  const menuItems = useMemo(
    () => getMenuItems({features, hasValue, changesOpen, previewUrl}),
    [features, hasValue, changesOpen, previewUrl]
  )
  const inspectOpen = params.inspect === 'on'
  const compareValue: Partial<SanityDocument> | null = changesOpen
    ? historyController.sinceAttributes()
    : editState?.published || null
  const ready = connectionState === 'connected' && editState.ready
  const viewOlderVersion = historyController.onOlderRevision()
  const displayed: Partial<SanityDocument> | null = useMemo(
    () => (viewOlderVersion ? historyController.displayed() : value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historyController, params.rev, params.since, value, viewOlderVersion]
  )

  const setTimelineRange = useCallback(
    (newSince: string, newRev: string | null) => {
      paneRouter.setParams({
        ...paneRouter.params,
        since: newSince,
        rev: newRev || undefined,
      })
    },
    [paneRouter]
  )

  const handleFocus = useCallback(
    (nextFocusPath: Path) => {
      setFocusPath(nextFocusPath)
      presenceStore.setLocation([
        {
          type: 'document',
          documentId,
          path: nextFocusPath,
          lastActiveAt: new Date().toISOString(),
        },
      ])
    },
    [documentId, presenceStore, setFocusPath]
  )

  const patchRef = useRef<(event: PatchEvent) => void>(() => {
    throw new Error('Nope')
  })

  patchRef.current = (event: PatchEvent) =>
    patch.execute(toMutationPatches(event.patches), initialValue.value)

  const handleChange = useCallback((event) => patchRef.current(event), [])

  const handleHistoryClose = useCallback(() => {
    paneRouter.setParams({...params, since: undefined})
  }, [paneRouter, params])

  const handleHistoryOpen = useCallback(() => {
    paneRouter.setParams({...params, since: '@lastPublished'})
  }, [paneRouter, params])

  const handlePaneClose = useCallback(() => paneRouter.closeCurrent(), [paneRouter])

  const handlePaneSplit = useCallback(() => paneRouter.duplicateCurrent(), [paneRouter])

  const toggleInspect = useCallback(
    (toggle = !inspectOpen) => {
      if (toggle) {
        paneRouter.setParams({...params, inspect: 'on'})
      } else {
        paneRouter.setParams(omit(params, 'inspect'))
      }
    },
    [inspectOpen, paneRouter, params]
  )

  const handleMenuAction = useCallback(
    (item: PaneMenuItem) => {
      if (item.action === 'production-preview' && previewUrl) {
        window.open(previewUrl)
        return true
      }

      if (item.action === 'inspect') {
        toggleInspect(true)
        return true
      }

      if (item.action === 'reviewChanges') {
        handleHistoryOpen()
        return true
      }

      return false
    },
    [handleHistoryOpen, previewUrl, toggleInspect]
  )

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      for (const item of menuItems) {
        if (item.shortcut) {
          if (isHotkey(item.shortcut, event)) {
            event.preventDefault()
            event.stopPropagation()
            handleMenuAction(item)
            return
          }
        }
      }
    },
    [handleMenuAction, menuItems]
  )

  const handleInspectClose = useCallback(() => toggleInspect(false), [toggleInspect])

  const documentPresence = useDocumentPresence(documentId)

  const formState = useFormState(documentSchema, {
    value,
    onChange: handleChange,
    onFocus: handleFocus,
    validation,
    focusPath,
    presence: documentPresence || [],
  })

  const documentPane: DocumentPaneContextValue = {
    actions,
    activeViewId,
    badges,
    changesOpen,
    compareValue,
    connectionState,
    displayed,
    documentId,
    documentIdRaw,
    documentSchema,
    documentType,
    editState,
    focusPath,
    handleChange,
    handleHistoryClose,
    handleHistoryOpen,
    handleInspectClose,
    handleKeyUp,
    handleMenuAction,
    handlePaneClose,
    handlePaneSplit,
    historyController,
    index,
    inspectOpen,
    validation,
    menuItems,
    menuItemGroups: menuItemGroups || [],
    paneKey,
    previewUrl,
    ready,
    setTimelineMode,
    setTimelineRange,
    timeline,
    timelineMode,
    title,
    value,
    views,
    formState,
  }

  useEffect(() => {
    if (connectionState === 'reconnecting') {
      pushToast({
        id: 'desk-tool/reconnecting',
        status: 'warning',
        title: <>Connection lost. Reconnecting…</>,
      })
    }
  }, [connectionState, pushToast])

  // Reset `focusPath` when `documentId` or `params.path` changes
  useEffect(() => {
    // Reset focus path
    setFocusPath(params.path ? pathFromString(params.path) : [])
  }, [documentId, params.path])

  return (
    <DocumentPaneContext.Provider value={documentPane}>{children}</DocumentPaneContext.Provider>
  )
})

DocumentPaneProvider.displayName = 'DocumentPaneProvider'
