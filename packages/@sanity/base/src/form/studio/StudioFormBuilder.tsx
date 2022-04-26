import {Schema, SchemaType} from '@sanity/types'
import React, {createElement, forwardRef, useCallback, useMemo} from 'react'
import {PatchChannel} from '../patch/PatchChannel'
import {DocumentInput} from '../inputs/DocumentInput'
import {useSource} from '../../studio'
import {fallbackInputs} from '../fallbackInputs'
import {
  FIXME,
  // ObjectInputProps,
  // ObjectInputProps,
  // RenderArrayItemCallbackArg,
  RenderFieldCallback,
  InputProps,
  // FieldProps,
  ObjectFieldProps,
  ItemProps,
} from '../types'
// import {ChangeIndicatorProvider} from '../../components/changeIndicators'
// import {assertType} from '../utils/asserters'
// import {FormNode} from '../FormNode'
// import {FormPatch} from '../patch'
// import {MutationPatch} from '../utils/mutationPatch'
import {Focusable} from '../types/focusable'
import {FormNode} from '../components/formNode'
import {PatchEvent} from '../patch'
import {StudioFormBuilderProvider} from './StudioFormBuilderProvider'
import {resolveInputComponent as defaultInputResolver} from './inputResolver/inputResolver'

/**
 * @alpha
 */
export interface StudioFormBuilderProps
  extends Omit<ObjectFieldProps, 'hidden' | 'id' | 'index' | 'kind' | 'name'> {
  // changesOpen: boolean
  /**
   * @internal Considered internal – do not use.
   */
  __internal_patchChannel: PatchChannel // eslint-disable-line camelcase
  // autoFocus?: boolean
  onBlur: () => void
  onChange: (event: PatchEvent) => void
  onFocus: () => void
  onSelectFieldGroup: () => void
  onSetCollapsed: () => void
  schema: Schema
}

/**
 * @alpha
 */
export const StudioFormBuilder = forwardRef(function StudioFormBuilder(
  props: StudioFormBuilderProps,
  ref: React.Ref<Focusable>
) {
  const {
    __internal_patchChannel: patchChannel,
    // changesOpen,
    collapsed,
    collapsible,
    compareValue,
    focusPath,
    focused,
    groups,
    // hidden,
    // id,
    level,
    members,
    onBlur,
    onChange,
    onFocus,
    onSelectFieldGroup,
    onSetCollapsed,
    path,
    presence,
    readOnly,
    schema,
    type,
    validation,
    value,
    ...restProps
  } = props

  const {unstable_formBuilder: formBuilder} = useSource()

  const resolveInputComponent = useCallback(
    (inputType: SchemaType): React.ComponentType<InputProps> => {
      const resolved = defaultInputResolver(
        formBuilder.components?.inputs,
        formBuilder.resolveInputComponent,
        inputType
      )

      if (resolved) {
        return resolved
      }

      return fallbackInputs[inputType.jsonType]?.input as FIXME // React.ComponentType<FieldProps>
    },
    [formBuilder]
  )

  const renderField: RenderFieldCallback = useCallback(
    (fieldProps, fieldRef) => {
      const inputComponent = resolveInputComponent(fieldProps.type)

      if (!inputComponent) {
        return <div>No input resolved for type: {fieldProps.type.name}</div>
      }

      return (
        <FormNode
          component={inputComponent}
          fieldProps={fieldProps}
          fieldRef={fieldRef}
          renderField={renderField}
          renderItem={renderItem}
        />
      )
    },
    [resolveInputComponent]
  )

  const renderItem = useCallback(
    (item: ItemProps) => {
      const inputComponent = resolveInputComponent(item.type)

      if (!inputComponent) {
        return <div>No input resolved for type: {item.type.name}</div>
      }

      if (item.kind === 'object') {
        return createElement(inputComponent, {...item, renderField} as FIXME)
      }

      return createElement(inputComponent, {...item, renderField} as FIXME)
    },
    [resolveInputComponent]
  )

  const rootFieldProps: ObjectFieldProps = useMemo(
    () => ({
      kind: 'object',
      // focusRef: useRef(null),
      // onSelectFieldGroup,
      // onSetCollapsed,
      // renderField,
      collapsed,
      collapsible,
      compareValue,
      focusPath,
      focused,
      groups,
      hidden: false,
      id: '', // @todo
      // hidden: Boolean(hidden),
      // id,
      index: 0, // @todo
      level,
      members,
      name: '', // @todo
      // onBlur,
      // onChange,
      // onFocus,
      path,
      presence,
      readOnly,
      type,
      validation,
      value,
    }),
    [
      collapsed,
      collapsible,
      compareValue,
      focusPath,
      focused,
      groups,
      // hidden,
      // id,
      level,
      members,
      // onBlur,
      // onChange,
      // onFocus,
      path,
      presence,
      readOnly,
      type,
      validation,
      value,
    ]
  )

  return (
    <StudioFormBuilderProvider
      __internal_patchChannel={patchChannel}
      renderField={renderField}
      schema={schema}
      value={value}
    >
      <FormNode
        component={DocumentInput as FIXME}
        fieldProps={rootFieldProps}
        fieldRef={ref}
        renderField={renderField}
        renderItem={renderItem}
      />
    </StudioFormBuilderProvider>
  )
})
