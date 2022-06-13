/* eslint-disable camelcase */
/* eslint-disable react/jsx-handler-names */

import {ObjectSchemaType, Path, ValidationMarker} from '@sanity/types'
import React, {useCallback, useRef} from 'react'
import {FormFieldPresence} from '../../presence'
import {FormPatch, PatchChannel, PatchEvent} from '../patch'
import {ObjectFormNode} from '../store/types/nodes'
import {ObjectInputProps} from '../types'
import {EMPTY_ARRAY} from '../utils/empty'
import {useFormBuilder} from '../useFormBuilder'
import {StudioFormBuilderProvider} from './StudioFormBuilderProvider'
import {useFormCallbacks} from './contexts/FormCallbacks'

/**
 * @alpha
 */
export interface StudioFormBuilderProps
  extends Omit<ObjectFormNode, 'level' | 'path' | 'presence' | 'validation'> {
  /**
   * @internal Considered internal – do not use.
   */
  __internal_patchChannel: PatchChannel

  autoFocus?: boolean
  changesOpen?: boolean
  focusPath: Path
  focused: boolean | undefined
  id: string
  onChange: (changeEvent: PatchEvent) => void
  onPathBlur: (path: Path) => void
  onPathFocus: (path: Path) => void
  onPathOpen: (path: Path) => void
  onFieldGroupSelect: (path: Path, groupName: string) => void
  onSetFieldSetCollapsed: (path: Path, collapsed: boolean) => void
  onSetPathCollapsed: (path: Path, collapsed: boolean) => void
  presence: FormFieldPresence[]
  readOnly?: boolean
  schemaType: ObjectSchemaType
  validation: ValidationMarker[]
  value: {[field in string]: unknown} | undefined
}

/**
 * @alpha
 */
export function StudioFormBuilder(props: StudioFormBuilderProps) {
  const {
    __internal_patchChannel: patchChannel,
    autoFocus,
    changesOpen,
    focusPath,
    focused,
    groups,
    id,
    members,
    onChange,
    onPathBlur,
    onPathFocus,
    onPathOpen,
    onFieldGroupSelect,
    onSetFieldSetCollapsed,
    onSetPathCollapsed,
    presence,
    readOnly,
    schemaType,
    validation,
    value,
  } = props

  return (
    <StudioFormBuilderProvider
      __internal_patchChannel={patchChannel}
      autoFocus={autoFocus}
      changesOpen={changesOpen}
      focusPath={focusPath}
      focused={focused}
      groups={groups}
      id={id}
      members={members}
      onChange={onChange}
      onPathBlur={onPathBlur}
      onPathFocus={onPathFocus}
      onPathOpen={onPathOpen}
      onFieldGroupSelect={onFieldGroupSelect}
      onSetPathCollapsed={onSetPathCollapsed}
      onSetFieldSetCollapsed={onSetFieldSetCollapsed}
      presence={presence}
      validation={validation}
      readOnly={readOnly}
      schemaType={schemaType}
      value={value}
    >
      <RootInput />
    </StudioFormBuilderProvider>
  )
}

function RootInput() {
  const {
    focusPath,
    focused,
    groups,
    id,
    members,
    readOnly,
    renderField,
    renderInput,
    renderItem,
    renderPreview,
    schemaType,
    value,
  } = useFormBuilder()

  const {
    onChange,
    onFieldGroupSelect,
    onPathBlur,
    onPathFocus,
    onPathOpen,
    onSetFieldSetCollapsed,
    onSetPathCollapsed,
  } = useFormCallbacks()

  const handleCollapseField = useCallback(
    (fieldName: string) => onSetPathCollapsed([fieldName], true),
    [onSetPathCollapsed]
  )

  const handleExpandField = useCallback(
    (fieldName: string) => onSetPathCollapsed([fieldName], false),
    [onSetPathCollapsed]
  )

  const handleBlur = useCallback(() => onPathBlur(EMPTY_ARRAY), [onPathBlur])

  const handleFocus = useCallback(() => onPathFocus(EMPTY_ARRAY), [onPathFocus])

  const handleChange = useCallback(
    (patch: FormPatch | FormPatch[] | PatchEvent) => onChange(PatchEvent.from(patch)),
    [onChange]
  )

  const focusRef = useRef(null)

  const handleSelectFieldGroup = useCallback(
    (groupName: string) => onFieldGroupSelect(EMPTY_ARRAY, groupName),
    [onFieldGroupSelect]
  )

  const handleCollapse = useCallback(
    () => onSetPathCollapsed(EMPTY_ARRAY, true),
    [onSetPathCollapsed]
  )

  const handleExpand = useCallback(
    () => onSetPathCollapsed(EMPTY_ARRAY, false),
    [onSetPathCollapsed]
  )

  const handleOpenField = useCallback((fieldName: string) => onPathOpen([fieldName]), [onPathOpen])

  const handleCloseField = useCallback(() => onPathOpen([]), [onPathOpen])

  const handleCollapseFieldSet = useCallback(
    (fieldSetName: string) => onSetFieldSetCollapsed([fieldSetName], true),
    [onSetFieldSetCollapsed]
  )

  const handleExpandFieldSet = useCallback(
    (fieldSetName: string) => onSetFieldSetCollapsed([fieldSetName], false),
    [onSetFieldSetCollapsed]
  )

  const rootInputProps: ObjectInputProps = {
    collapsed: false,
    focusPath,
    focusRef,
    changed: members.some((m) => m.kind === 'field' && m.field.changed),
    focused,
    groups,
    id,
    level: 0,
    members,
    onBlur: handleBlur,
    onChange: handleChange,
    onCloseField: handleCloseField,
    onCollapse: handleCollapse,
    onCollapseField: handleCollapseField,
    onCollapseFieldSet: handleCollapseFieldSet,
    onExpand: handleExpand,
    onExpandField: handleExpandField,
    onExpandFieldSet: handleExpandFieldSet,
    onFocus: handleFocus,
    onFocusPath: onPathFocus,
    onOpenField: handleOpenField,
    onFieldGroupSelect: handleSelectFieldGroup,
    path: EMPTY_ARRAY,
    presence: EMPTY_ARRAY,
    readOnly,
    renderField,
    renderInput,
    renderItem,
    renderPreview,
    schemaType,
    validation: EMPTY_ARRAY,
    value,
  }

  return <>{renderInput(rootInputProps)}</>
}
