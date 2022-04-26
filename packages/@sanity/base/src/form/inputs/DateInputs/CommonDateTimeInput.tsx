/* eslint-disable no-nested-ternary */

import React, {useEffect} from 'react'
import {ValidationMarker} from '@sanity/types'
import {useForwardedRef, TextInput} from '@sanity/ui'
import {FormField} from '../../components/formField'
import {useFormNode} from '../../components/formNode'
import {DateTimeInput} from './base/DateTimeInput'
import {ParseResult} from './types'

export interface CommonDateTimeInputProps {
  deserialize: (value: string) => ParseResult
  formatInputValue: (date: Date) => string
  onChange: (nextDate: string | null) => void
  parseInputValue: (inputValue: string) => ParseResult
  placeholder?: string
  readOnly: boolean | undefined
  selectTime?: boolean
  serialize: (date: Date) => string
  timeStep?: number
  value: string | undefined
}

const DEFAULT_PLACEHOLDER_TIME = new Date()

export const CommonDateTimeInput = React.forwardRef(function CommonDateTimeInput(
  props: CommonDateTimeInputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const {inputId, validation} = useFormNode()

  const {
    deserialize,
    formatInputValue,
    onChange,
    parseInputValue,
    placeholder,
    readOnly,
    selectTime,
    serialize,
    timeStep,
    value,
    ...restProps
  } = props

  const [localValue, setLocalValue] = React.useState<string | null>(null)

  useEffect(() => {
    setLocalValue(null)
  }, [value])

  const handleDatePickerInputChange = React.useCallback(
    (event) => {
      const nextInputValue = event.currentTarget.value
      const result = nextInputValue === '' ? null : parseInputValue(nextInputValue)

      if (result === null) {
        onChange(null)

        // If the field value is undefined and we are clearing the invalid value
        // the above useEffect won't trigger, so we do some extra clean up here
        if (typeof value === 'undefined' && localValue) {
          setLocalValue(null)
        }
      } else if (result.isValid) {
        onChange(serialize(result.date))
      } else {
        setLocalValue(nextInputValue)
      }
    },
    [localValue, serialize, onChange, parseInputValue]
  )

  const handleDatePickerChange = React.useCallback(
    (nextDate: Date | null) => {
      onChange(nextDate ? serialize(nextDate) : null)
    },
    [serialize, onChange]
  )

  const forwardedRef = useForwardedRef(ref)

  const parseResult = localValue ? parseInputValue(localValue) : value ? deserialize(value) : null

  const inputValue = localValue
    ? localValue
    : parseResult?.isValid
    ? formatInputValue(parseResult.date)
    : value

  return (
    <FormField
      __internal_validation={
        parseResult?.error
          ? [
              ...validation,
              {
                level: 'error',
                item: {message: parseResult.error, paths: []},
              } as unknown as ValidationMarker, // casting to marker to avoid having to implement cloneWithMessage on item
            ]
          : validation
      }
    >
      {readOnly ? (
        <TextInput value={inputValue} readOnly />
      ) : (
        <DateTimeInput
          {...restProps}
          id={inputId}
          selectTime={selectTime}
          timeStep={timeStep}
          placeholder={placeholder || `e.g. ${formatInputValue(DEFAULT_PLACEHOLDER_TIME)}`}
          ref={forwardedRef}
          value={parseResult?.date}
          inputValue={inputValue || ''}
          readOnly={Boolean(readOnly)}
          onInputChange={handleDatePickerInputChange}
          onChange={handleDatePickerChange}
          customValidity={parseResult?.error}
        />
      )}
    </FormField>
  )
})
