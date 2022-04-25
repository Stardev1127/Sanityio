import React, {useMemo} from 'react'
import {
  Path,
  SanityDocument,
  SlugParent,
  SlugSchemaType,
  isValidationErrorMarker,
  SlugSourceFn,
} from '@sanity/types'
import * as PathUtils from '@sanity/util/paths'
import {TextInput, Button, Flex, Box, Card, Stack} from '@sanity/ui'
import {useId} from '@reach/auto-id'
import {PatchEvent, set, setIfMissing, unset} from '../../patch'
import {ChangeIndicatorCompareValueProvider} from '../../../components/changeIndicators'
import {FormField} from '../../../components/formField'
import {withDocument} from '../../utils/withDocument'
import {withValuePath} from '../../utils/withValuePath'
import {ObjectFieldProps} from '../../types'
import {slugify} from './utils/slugify'
import {useAsync} from './utils/useAsync'

export interface Slug {
  _type: 'slug'
  current?: string
}

export interface SlugInputProps extends ObjectFieldProps<Slug, SlugSchemaType> {
  document: SanityDocument
  getValuePath: () => Path
}

function getNewFromSource(
  source: string | Path | SlugSourceFn,
  valuePath: Path,
  document: SanityDocument
) {
  const parentPath = valuePath.slice(0, -1)
  const parent = PathUtils.get(document, parentPath) as SlugParent
  return Promise.resolve(
    typeof source === 'function'
      ? source(document, {parentPath, parent})
      : (PathUtils.get(document, source) as string | undefined)
  )
}

const SlugInputInner = React.forwardRef(function SlugInput(
  props: SlugInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const {
    value,
    compareValue,
    type,
    level,
    validation,
    onChange,
    onFocus,
    getValuePath,
    document,
    readOnly,
    presence,
  } = props

  const sourceField = type.options?.source

  const inputId = useId()
  const errors = useMemo(() => validation.filter(isValidationErrorMarker), [validation])

  const updateSlug = React.useCallback(
    (nextSlug) => {
      if (!nextSlug) {
        onChange(PatchEvent.from(unset([])))
        return
      }

      onChange(PatchEvent.from(setIfMissing({_type: type.name}), set(nextSlug, ['current'])))
    },
    [onChange, type.name]
  )

  const [generateState, handleGenerateSlug] = useAsync(() => {
    if (!sourceField) {
      return Promise.reject(
        new Error(`Source is missing. Check source on type "${type.name}" in schema`)
      )
    }

    return getNewFromSource(sourceField, getValuePath(), document)
      .then((newFromSource) => slugify(newFromSource || '', type))
      .then((newSlug) => updateSlug(newSlug))
  }, [getValuePath, updateSlug, document, type])

  const isUpdating = generateState?.status === 'pending'

  const handleChange = React.useCallback(
    (event) => updateSlug(event.currentTarget.value),
    [updateSlug]
  )

  const handleFocus = React.useCallback(() => onFocus(['current']), [onFocus])

  return (
    <ChangeIndicatorCompareValueProvider
      value={value?.current}
      compareValue={compareValue?.current}
    >
      <FormField
        title={type.title}
        description={type.description}
        level={level}
        validation={validation}
        __unstable_presence={presence}
        inputId={inputId}
      >
        <Stack space={3}>
          <Flex>
            <Box flex={1}>
              <TextInput
                id={inputId}
                ref={forwardedRef}
                customValidity={errors.length > 0 ? errors[0].item.message : ''}
                disabled={isUpdating}
                onChange={handleChange}
                onFocus={handleFocus}
                value={value?.current || ''}
                readOnly={readOnly}
              />

              {generateState?.status === 'error' && (
                <Card padding={2} tone="critical">
                  {generateState.error.message}
                </Card>
              )}
            </Box>
            {sourceField && (
              <Box marginLeft={1}>
                <Button
                  mode="ghost"
                  type="button"
                  disabled={readOnly || isUpdating}
                  onClick={handleGenerateSlug}
                  onFocus={handleFocus}
                  text={generateState?.status === 'pending' ? 'Generating…' : 'Generate'}
                />
              </Box>
            )}
          </Flex>
        </Stack>
      </FormField>
    </ChangeIndicatorCompareValueProvider>
  )
})

export const SlugInput = withValuePath(withDocument(SlugInputInner))
