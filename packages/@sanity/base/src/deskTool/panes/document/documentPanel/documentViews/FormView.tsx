/* eslint-disable no-nested-ternary */

import {isActionEnabled} from '@sanity/schema/_internal'
import {Box, Container, Flex, Spinner, Text} from '@sanity/ui'
import React, {useCallback, useEffect, useMemo} from 'react'
import {tap} from 'rxjs/operators'
import {ObjectSchemaType, Path} from '@sanity/types'
import {useDocumentPane} from '../../useDocumentPane'
import {Delay} from '../../../../components/Delay'
import {useDocumentStore} from '../../../../../datastores'
import {
  // FormBuilderFilterFieldFn,
  fromMutationPatches,
  createPatchChannel,
  PatchEvent,
  PatchMsg,
  StudioFormBuilder,
} from '../../../../../form'
import {PresenceOverlay} from '../../../../../presence'
import {useSource} from '../../../../../studio'
// TODO
import {
  DocumentMutationEvent,
  DocumentRebaseEvent,
} from '../../../../../datastores/document/buffered-doc/types'

interface FormViewProps {
  granted: boolean
  hidden: boolean
  margins: [number, number, number, number]
}

// interface FormViewState {
//   filterField: FormBuilderFilterFieldFn
// }

// const INITIAL_STATE: FormViewState = {
//   filterField: () => true,
// }

const preventDefault = (ev: React.FormEvent) => ev.preventDefault()

export function FormView(props: FormViewProps) {
  const {hidden: hiddenProp, margins, granted} = props
  const {schema} = useSource()
  const {
    // changesOpen,
    // focusPath,
    // validation,
    compareValue,
    displayed: value,
    documentId,
    documentSchema,
    documentType,
    formState,
    historyController,
    onBlur,
    onChange,
    onFocus,
    onSetActiveFieldGroup,
    onSetExpandedFieldSet,
    onSetExpandedPath,
    ready,
  } = useDocumentPane()
  const documentStore = useDocumentStore()
  const {revTime: rev} = historyController
  // const [{filterField}, setState] = useState<FormViewState>(INITIAL_STATE)

  // const hasTypeMismatch = value !== null && value._type !== documentSchema.name
  const isNonExistent = !value || !value._id

  // The `patchChannel` is an INTERNAL publish/subscribe channel that we use to notify form-builder
  // nodes about both remote and local patches.
  // - Used by the Portable Text input to modify selections.
  // - Used by `withDocument` to reset value.
  const patchChannel = useMemo(() => createPatchChannel(), [])

  const hidden = formState.hidden || hiddenProp
  const readOnly = formState.hidden ? false : formState.readOnly

  const isReadOnly = useMemo(() => {
    return (
      hidden ||
      readOnly ||
      !ready ||
      rev !== null ||
      !granted ||
      !isActionEnabled(documentSchema, 'update') ||
      (isNonExistent && !isActionEnabled(documentSchema, 'create'))
    )
  }, [documentSchema, isNonExistent, granted, ready, rev, hidden, readOnly])

  const handleChange = useCallback(
    (event: PatchEvent) => {
      if (!isReadOnly) onChange(event)
    },
    [onChange, isReadOnly]
  )

  // const handleFocus = useCallback((path: Path) => {
  //   console.warn('todo: handleFocus', {path})
  // }, [])

  // const handleSelectFieldGroup = useCallback(
  //   (path: Path, groupName: string) => {
  //     onSetActiveFieldGroup(path, groupName)
  //   },
  //   [onSetActiveFieldGroup]
  // )

  const handleSetCollapsed = useCallback(
    (path: Path, collapsed: boolean) => {
      onSetExpandedPath(path, !collapsed)
    },
    [onSetExpandedPath]
  )

  const handleSetCollapsedFieldSet = useCallback(
    (path: Path, collapsed: boolean) => {
      onSetExpandedFieldSet(path, !collapsed)
    },
    [onSetExpandedFieldSet]
  )

  useEffect(() => {
    const sub = documentStore.pair
      .documentEvents(documentId, documentType)
      .pipe(
        tap((event) => {
          if (event.type === 'mutation') {
            patchChannel.publish(prepareMutationEvent(event))
          }

          if (event.type === 'rebase') {
            patchChannel.publish(prepareRebaseEvent(event))
          }
        })
      )
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [documentId, documentStore, documentType, patchChannel])

  const hasRev = Boolean(value?._rev)
  useEffect(() => {
    if (hasRev) {
      // this is a workaround for an issue that caused the document pushed to withDocument to get
      // stuck at the first initial value.
      // This effect is triggered only when the document goes from not having a revision, to getting one
      // so it will kick in as soon as the document is received from the backend
      patchChannel.publish({
        type: 'mutation',
        patches: [],
        snapshot: value,
      })
    }
    // React to changes in hasRev only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRev])

  // const after = useMemo(
  //   () =>
  //     Array.isArray(afterEditorComponents) &&
  //     afterEditorComponents.map(
  //       (AfterEditorComponent: React.ComponentType<{documentId: string}>, idx: number) => (
  //         <AfterEditorComponent key={String(idx)} documentId={documentId} />
  //       )
  //     ),
  //   [documentId]
  // )

  return (
    <Container
      hidden={hidden}
      paddingX={4}
      paddingTop={5}
      paddingBottom={9}
      sizing="border"
      width={1}
    >
      <PresenceOverlay margins={margins}>
        <Box as="form" onSubmit={preventDefault}>
          {ready ? (
            formState.hidden ? (
              <Box padding={2}>
                <Text>This form is hidden</Text>
              </Box>
            ) : (
              <StudioFormBuilder
                __internal_patchChannel={patchChannel}
                collapsed={false}
                collapsible={false}
                compareValue={compareValue as Record<string, unknown>}
                // filterField={filterField}
                focusPath={formState.focusPath}
                focused={formState.focused}
                groups={formState.groups}
                level={formState.level}
                members={formState.members}
                onBlur={onBlur}
                onChange={handleChange}
                onFocus={onFocus}
                onSelectFieldGroup={onSetActiveFieldGroup}
                onSetCollapsed={handleSetCollapsed}
                onSetCollapsedFieldSet={handleSetCollapsedFieldSet}
                path={formState.path}
                presence={formState.presence}
                readOnly={false}
                schema={schema}
                type={formState.type as ObjectSchemaType}
                validation={formState.validation}
                value={formState.value}
              />
            )
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
    </Container>
  )
}

function prepareMutationEvent(event: DocumentMutationEvent): PatchMsg {
  const patches = event.mutations.map((mut) => mut.patch).filter(Boolean)

  return {
    type: 'mutation',
    snapshot: event.document,
    patches: fromMutationPatches(event.origin, patches),
  }
}

function prepareRebaseEvent(event: DocumentRebaseEvent): PatchMsg {
  const remotePatches = event.remoteMutations.map((mut) => mut.patch).filter(Boolean)
  const localPatches = event.localMutations.map((mut) => mut.patch).filter(Boolean)

  return {
    type: 'rebase',
    snapshot: event.document,
    patches: fromMutationPatches('remote', remotePatches).concat(
      fromMutationPatches('local', localPatches)
    ),
  }
}
