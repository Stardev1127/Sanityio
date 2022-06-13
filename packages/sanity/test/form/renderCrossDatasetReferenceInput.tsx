import {CrossDatasetReferenceSchemaType, Schema} from '@sanity/types'
import React from 'react'
import {of} from 'rxjs'
import {CrossDatasetReferenceInputProps} from '../../src/form/inputs/CrossDatasetReferenceInput'
import {ObjectInputProps} from '../../src/form'
import {TestRenderInputContext} from './renderInput'
import {TestRenderProps} from './types'
import {renderObjectInput} from './renderObjectInput'

const EMPTY_SEARCH = () => of([])

export type TestRenderCrossDatasetReferenceInputCallback = (
  inputProps: CrossDatasetReferenceInputProps,
  context: TestRenderInputContext
) => React.ReactElement

export async function renderCrossDatasetReferenceInput(options: {
  fieldDefinition: Schema.TypeDefinition<'reference'>
  getReferenceInfo: CrossDatasetReferenceInputProps['getReferenceInfo']
  onSearch?: CrossDatasetReferenceInputProps['onSearch']
  props?: TestRenderProps
  render: TestRenderCrossDatasetReferenceInputCallback
}) {
  const {
    fieldDefinition,
    getReferenceInfo,
    onSearch = EMPTY_SEARCH,
    props,
    render: initialRender,
  } = options

  function transformProps(baseProps: ObjectInputProps, _context: TestRenderInputContext) {
    const {changed, schemaType, value, ...restProps} = baseProps

    return {
      ...restProps,
      changed,
      getReferenceInfo,
      onSearch,
      schemaType: schemaType as CrossDatasetReferenceSchemaType,
      value: value as CrossDatasetReferenceInputProps['value'],
    }
  }

  const result = await renderObjectInput({
    fieldDefinition: fieldDefinition as Schema.TypeDefinition<'object'>,
    props,
    render: (baseProps, context) => initialRender(transformProps(baseProps, context), context),
  })

  function rerender(subsequentRender: TestRenderCrossDatasetReferenceInputCallback) {
    result.rerender((baseProps, context) =>
      subsequentRender(transformProps(baseProps, context), context)
    )
  }

  return {...result, rerender}
}
