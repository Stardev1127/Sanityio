import React, {ForwardedRef, useMemo} from 'react'
import {useId} from '@reach/auto-id'
import {isValidationErrorMarker, TextSchemaType} from '@sanity/types'
import {TextArea} from '@sanity/ui'
import styled from 'styled-components'
import {PatchEvent, set, unset} from '../patch'
import {FormField} from '../components/formField'
import {StringInputProps} from '../types'

export type TextInputProps = StringInputProps<TextSchemaType>

const StyledTextArea = styled(TextArea)`
  &[data-as='textarea'] {
    resize: vertical;
  }
`

export const TextInput = React.forwardRef(function TextInput(
  props: TextInputProps,
  forwardedRef: ForwardedRef<HTMLTextAreaElement>
) {
  const {value, validation, type, readOnly, level, onFocus, onBlur, onChange} = props
  const inputId = useId()
  const errors = useMemo(() => validation.filter(isValidationErrorMarker), [validation])

  const handleChange = React.useCallback(
    (event) => {
      const inputValue = event.currentTarget.value
      onChange(PatchEvent.from(inputValue ? set(inputValue) : unset()))
    },
    [onChange]
  )

  return (
    <StyledTextArea
      id={inputId}
      customValidity={errors && errors.length > 0 ? errors[0].item.message : ''}
      value={value || ''}
      readOnly={Boolean(readOnly)}
      placeholder={type.placeholder}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      rows={typeof type.rows === 'number' ? type.rows : 10}
      ref={forwardedRef}
    />
  )
})
