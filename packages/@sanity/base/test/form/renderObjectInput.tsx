import {Schema, ObjectSchemaType} from '@sanity/types'
import React from 'react'
import {ObjectInputProps} from '../../src/form'
import {renderInput, TestRenderInputContext, TestRenderInputProps} from './renderInput'
import {TestRenderProps} from './types'

export type TestRenderObjectInputCallback = (
  inputProps: ObjectInputProps,
  context: TestRenderInputContext
) => React.ReactElement

export function renderObjectInput(options: {
  fieldDefinition: Schema.TypeDefinition<'object'>
  props?: TestRenderProps
  render: TestRenderObjectInputCallback
}) {
  const {fieldDefinition, props, render: initialRender} = options

  const onCloseField = jest.fn()
  const onCollapse = jest.fn()
  const onCollapseField = jest.fn()
  const onCollapseFieldSet = jest.fn()
  const onExpand = jest.fn()
  const onExpandField = jest.fn()
  const onExpandFieldSet = jest.fn()
  const onOpenField = jest.fn()
  const onSelectFieldGroup = jest.fn()

  function transformProps(inputProps: TestRenderInputProps): ObjectInputProps {
    const {compareValue, onPathFocus, path, schemaType, value, ...restProps} = inputProps

    return {
      ...restProps,
      collapsed: false,
      compareValue: compareValue as Record<string, any>,
      groups: [],
      members: [],
      onCloseField,
      onCollapse,
      onCollapseField,
      onCollapseFieldSet,
      onExpand,
      onExpandField,
      onExpandFieldSet,
      onFocusPath: onPathFocus,
      onOpenField,
      onSelectFieldGroup,
      path,
      renderField: () => <>TODO</>,
      renderInput: () => <>TODO</>,
      renderItem: () => <>TODO</>,
      schemaType: schemaType as ObjectSchemaType,
      value: value as Record<string, any>,
    }
  }

  const result = renderInput({
    fieldDefinition,
    props,
    render: (inputProps, context) => initialRender(transformProps(inputProps), context),
  })

  function rerender(subsequentRender: TestRenderObjectInputCallback) {
    result.rerender((inputProps, context) => subsequentRender(transformProps(inputProps), context))
  }

  return {...result, rerender}
}
