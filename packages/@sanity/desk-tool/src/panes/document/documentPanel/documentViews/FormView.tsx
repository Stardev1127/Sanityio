import {useDatastores, useSource} from '@sanity/base'
import {
  useDocumentPresence,
  unstable_useConditionalProperty as useConditionalProperty,
} from '@sanity/base/hooks'
import {PresenceOverlay} from '@sanity/base/presence'
import {SanityDocument} from '@sanity/client'
import {SanityFormBuilder} from '@sanity/form-builder'
import {FormBuilderFilterFieldFn} from '@sanity/form-builder/_internal'
import {isActionEnabled} from '@sanity/schema/_internal'
import {Box, Container, Flex, Spinner, Text} from '@sanity/ui'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {tap} from 'rxjs/operators'
import {useDocumentPane} from '../../useDocumentPane'
import {Delay} from '../../../../components/Delay'
import {afterEditorComponents, filterFieldFn$} from '../../../../TODO'

interface FormViewProps {
  granted: boolean
  hidden: boolean
  margins: [number, number, number, number]
}

interface FormViewState {
  filterField: FormBuilderFilterFieldFn
}

const INITIAL_STATE: FormViewState = {
  filterField: () => true,
}

const preventDefault = (ev: React.FormEvent) => ev.preventDefault()
const noop = () => undefined

export function FormView(props: FormViewProps) {
  const {hidden, margins, granted} = props
  const {schema} = useSource()
  const {
    compareValue,
    displayed: value,
    documentId,
    documentSchema,
    documentType,
    focusPath,
    handleChange,
    handleFocus,
    historyController,
    markers,
    ready,
    changesOpen,
  } = useDocumentPane()
  const {documentStore} = useDatastores()
  const presence = useDocumentPresence(documentId)
  const {revTime: rev} = historyController
  const [{filterField}, setState] = useState<FormViewState>(INITIAL_STATE)

  const hasTypeMismatch = value !== null && value._type !== documentSchema.name
  const isNonExistent = !value || !value._id

  // Create a patch channel for each document ID
  const patchChannelRef = useRef<any>()
  if (!patchChannelRef.current) {
    patchChannelRef.current = SanityFormBuilder.createPatchChannel()
  }

  const readOnly = useConditionalProperty({
    document: value as SanityDocument,
    value,
    checkProperty: documentSchema.readOnly,
    checkPropertyKey: 'readOnly',
  })

  const isReadOnly = useMemo(() => {
    return (
      !ready ||
      rev !== null ||
      !granted ||
      !isActionEnabled(documentSchema, 'update') ||
      (isNonExistent && !isActionEnabled(documentSchema, 'create')) ||
      readOnly
    )
  }, [documentSchema, isNonExistent, granted, ready, rev, readOnly])

  useEffect(() => {
    if (!filterFieldFn$) return undefined

    const sub = filterFieldFn$.subscribe((nextFilterField) =>
      setState({filterField: nextFilterField})
    )

    return () => sub.unsubscribe()
  }, [])

  const handleBlur = useCallback(() => {
    // do nothing
  }, [])

  useEffect(() => {
    const sub = documentStore.pair
      .documentEvents(documentId, documentType)
      .pipe(tap((event) => patchChannelRef.current.receiveEvent(event)))
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [documentId, documentType, patchChannelRef])

  const hasRev = Boolean(value?._rev)
  useEffect(() => {
    if (hasRev) {
      // this is a workaround for an issue that caused the document pushed to withDocument to get
      // stuck at the first initial value.
      // This effect is triggered only when the document goes from not having a revision, to getting one
      // so it will kick in as soon as the document is received from the backend
      patchChannelRef.current.receiveEvent({type: 'mutation', mutations: [], document: value})
    }
    // React to changes in hasRev only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRev])

  const form = useMemo(() => {
    if (hasTypeMismatch) {
      return (
        <>
          <Text>
            This document is of type <code>{value?._type}</code> and cannot be edited as{' '}
            <code>{documentSchema.name}</code>.
          </Text>

          {/* @todo */}
          {/* <Box marginTop={4}>
            <Button
              onClick={handleEditAsActualType}
              text={<>Edit as <code>{value?._type}</code> instead</>}
              tone="critical"
            />
          </Box> */}
        </>
      )
    }

    return (
      <PresenceOverlay margins={margins}>
        <Box as="form" onSubmit={preventDefault}>
          {ready ? (
            <SanityFormBuilder
              patchChannel={patchChannelRef.current}
              value={value as any}
              compareValue={compareValue}
              type={documentSchema}
              presence={presence}
              filterField={filterField}
              readOnly={isReadOnly}
              onBlur={handleBlur}
              onFocus={handleFocus}
              focusPath={focusPath}
              onChange={isReadOnly ? noop : handleChange}
              markers={markers}
              changesOpen={changesOpen}
              schema={schema}
            />
          ) : (
            <Delay ms={300}>
              <Flex align="center" direction="column" height="fill" justify="center">
                <Spinner muted />

                <Box marginTop={3}>
                  <Text align="center" muted size={1}>
                    Loading document
                  </Text>
                </Box>
              </Flex>
            </Delay>
          )}
        </Box>
      </PresenceOverlay>
    )
  }, [
    compareValue,
    documentSchema,
    filterField,
    focusPath,
    handleBlur,
    handleChange,
    handleFocus,
    hasTypeMismatch,
    margins,
    markers,
    patchChannelRef,
    presence,
    ready,
    isReadOnly,
    value,
    changesOpen,
  ])

  const after = useMemo(
    () =>
      Array.isArray(afterEditorComponents) &&
      afterEditorComponents.map(
        (AfterEditorComponent: React.ComponentType<{documentId: string}>, idx: number) => (
          <AfterEditorComponent key={String(idx)} documentId={documentId} />
        )
      ),
    [documentId]
  )

  return (
    <Container
      hidden={hidden}
      paddingX={4}
      paddingTop={5}
      paddingBottom={9}
      sizing="border"
      width={1}
    >
      {form}
      {after}
    </Container>
  )
}
