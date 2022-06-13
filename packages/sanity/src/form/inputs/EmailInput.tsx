import React from 'react'
import {TextInput} from '@sanity/ui'
import {set, unset} from '../patch'
import {StringInputProps} from '../types'
import {ChangeIndicator} from '../../components/changeIndicators'

export type EmailInputProps = StringInputProps

export const EmailInput = React.forwardRef(function EmailInput(
  props: EmailInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const {
    changed,
    focused,
    id,
    onBlur,
    onChange,
    onFocus,
    path,
    readOnly,
    schemaType,
    validationError,
    value,
  } = props

  const handleChange = React.useCallback(
    (event) => {
      const inputValue = event.currentTarget.value
      onChange(inputValue ? set(inputValue) : unset())
    },
    [onChange]
  )

  return (
    <ChangeIndicator path={path} isChanged={changed} hasFocus={!!focused}>
      <TextInput
        type="email"
        inputMode="email"
        id={id}
        customValidity={validationError}
        value={value || ''}
        readOnly={Boolean(readOnly)}
        placeholder={schemaType.placeholder}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={forwardedRef}
      />
    </ChangeIndicator>
  )
})
