import classNames from 'classnames'
import {MenuItemGroupType} from 'part:@sanity/components/menus/default'
import {PortalProvider, usePortal} from 'part:@sanity/components/portal'
import React, {createElement, useCallback, useMemo, useRef} from 'react'
import {useDeskToolFeatures} from '../../../features'
import {useDocumentHistory} from '../documentHistory'
import {Doc, DocumentView} from '../types'
import {DocumentHeaderTitle} from './header/title'
import {DocumentPanelHeader} from './header/header'
import {getMenuItems} from './menuItems'
import {FormView} from './views'

import styles from './documentPanel.css'

interface DocumentPanelProps {
  activeViewId: string
  documentId: string
  documentType: string
  draft: Doc | null
  idPrefix: string
  initialFocusPath: any[]
  initialValue: Doc
  isClosable: boolean
  isCollapsed: boolean
  isHistoryOpen: boolean
  isTimelineOpen: boolean
  markers: any
  menuItemGroups: MenuItemGroupType[]
  onChange: (patches: any[]) => void
  onCloseView: () => void
  onCollapse?: () => void
  onExpand?: () => void
  onSetActiveView: (id: string | null) => void
  onSplitPane: () => void
  onTimelineOpen: () => void
  paneTitle?: string
  published: Doc | null
  rootElement: HTMLDivElement | null
  schemaType: any
  timelineMode: 'rev' | 'since' | 'closed'
  toggleInspect: (val: boolean) => void
  value: any
  versionSelectRef: React.MutableRefObject<HTMLDivElement | null>
  views: DocumentView[]
}

export function DocumentPanel(props: DocumentPanelProps) {
  const parentPortal = usePortal()
  const features = useDeskToolFeatures()
  const portalRef = useRef<HTMLDivElement | null>(null)
  const {displayed, historyController, open: openHistory} = useDocumentHistory()
  const {toggleInspect, isHistoryOpen} = props
  const formRef = useRef<any>()
  const activeView = props.views.find(view => view.id === props.activeViewId) ||
    props.views[0] || {type: 'form'}

  const {revTime} = historyController

  const menuItems = useMemo(() => {
    return (
      getMenuItems({
        features,
        isHistoryOpen: props.isHistoryOpen,
        rev: revTime ? revTime.id : null,
        value: props.value
      }) || []
    )
  }, [features, props.isHistoryOpen, revTime, props.value])

  const handleContextMenuAction = useCallback(
    item => {
      if (item.action === 'production-preview') {
        window.open(item.url)
        return true
      }

      if (item.action === 'inspect') {
        toggleInspect(true)
        return true
      }

      if (item.action === 'reviewChanges') {
        openHistory()
        return true
      }

      return false
    },
    [openHistory, toggleInspect]
  )

  const setFocusPath = useCallback(
    (path: any) => {
      if (formRef.current) {
        formRef.current.handleFocus(path)
      }
    },
    [formRef.current]
  )

  // Use a local portal container when split panes is supported
  const portalElement: HTMLElement = features.splitPanes
    ? portalRef.current || parentPortal.element
    : parentPortal.element

  return (
    <div className={classNames(styles.root, props.isCollapsed && styles.isCollapsed)}>
      <div className={styles.headerContainer}>
        <DocumentPanelHeader
          activeViewId={props.activeViewId}
          idPrefix={props.idPrefix}
          isClosable={props.isClosable}
          isCollapsed={props.isCollapsed}
          isTimelineOpen={props.isTimelineOpen}
          markers={props.markers}
          menuItemGroups={props.menuItemGroups}
          menuItems={menuItems}
          onCloseView={props.onCloseView}
          onCollapse={props.onCollapse}
          onContextMenuAction={handleContextMenuAction}
          onExpand={props.onExpand}
          onSetActiveView={props.onSetActiveView}
          onSplitPane={props.onSplitPane}
          onTimelineOpen={props.onTimelineOpen}
          rootElement={props.rootElement}
          schemaType={props.schemaType}
          setFocusPath={setFocusPath}
          timelineMode={props.timelineMode}
          title={
            <DocumentHeaderTitle
              documentType={props.documentType}
              paneTitle={props.paneTitle}
              value={props.value}
            />
          }
          versionSelectRef={props.versionSelectRef}
          views={props.views}
          rev={revTime}
          isHistoryOpen={isHistoryOpen}
        />
      </div>

      <PortalProvider element={portalElement}>
        <div className={styles.documentViewerContainer}>
          <div className={styles.documentScroller}>
            {activeView.type === 'form' && (
              <FormView
                id={props.documentId}
                initialFocusPath={props.initialFocusPath}
                initialValue={props.initialValue}
                markers={props.markers}
                onChange={props.onChange}
                readOnly={revTime !== null}
                ref={formRef}
                schemaType={props.schemaType}
                value={displayed}
              />
            )}

            {activeView.type === 'component' &&
              createElement(activeView.component, {
                document: {
                  draft: props.draft,
                  displayed: displayed || props.value || props.initialValue,
                  historical: displayed,
                  published: props.published
                },
                documentId: props.documentId,
                options: activeView.options,
                schemaType: props.schemaType
              })}
          </div>

          <div className={styles.portal} ref={portalRef} />
        </div>
      </PortalProvider>
    </div>
  )
}
