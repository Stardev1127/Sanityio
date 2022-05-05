import {ArraySchemaType, isReferenceSchemaType, SchemaType} from '@sanity/types'
import React, {ForwardedRef, forwardRef, useMemo} from 'react'
import {ArrayOfObjectsInputProps, FormBuilderFilterFieldFn, InputProps} from '../../../../types'
import {ArrayMember, ReferenceItemComponentType} from '../types'

interface ItemFormProps
  extends Omit<ArrayOfObjectsInputProps<ArrayMember, ArraySchemaType>, 'level' | 'value'> {
  // onInsert?: (event: InsertEvent) => void
  insertableTypes?: SchemaType[]
  ReferenceItemComponent: ReferenceItemComponentType
  filterField: FormBuilderFilterFieldFn
  isSortable: boolean
  value: ArrayMember
}

export const ItemForm = forwardRef(function ItemForm(props: ItemFormProps, ref: ForwardedRef<any>) {
  const {
    schemaType,
    value,
    validation,
    focusPath,
    ReferenceItemComponent,
    insertableTypes,
    isSortable,
    filterField,
    presence,
    onChange,
    onInsert,
    compareValue,
    onFocus,
    onBlur,
    readOnly,
  } = props

  const isReference = isReferenceSchemaType(schemaType)

  const Input = useMemo(
    () =>
      isReference
        ? function Input_(givenProps: InputProps) {
            return (
              <ReferenceItemComponent
                {...givenProps}
                insertableTypes={insertableTypes}
                onInsert={onInsert}
                isSortable={isSortable}
                onChange={onChange}
              />
            )
          }
        : undefined,
    [ReferenceItemComponent, insertableTypes, isReference, isSortable, onInsert, onChange]
  )

  const path = useMemo(() => [{_key: value?._key}], [value?._key])

  return (
    <>TODO</>
    // <FormBuilderInput
    //   type={type}
    //   level={0}
    //   value={value}
    //   onChange={onChange}
    //   onFocus={onFocus}
    //   onBlur={onBlur}
    //   inputComponent={Input}
    //   compareValue={compareValue}
    //   focusPath={focusPath}
    //   readOnly={readOnly || type.readOnly || false}
    //   validation={validation}
    //   path={path}
    //   // filterField={filterField}
    //   presence={presence}
    //   ref={ref}
    // />
  )
})
