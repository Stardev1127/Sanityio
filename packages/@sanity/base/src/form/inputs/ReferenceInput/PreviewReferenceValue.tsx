import React from 'react'
import {Reference, ReferenceSchemaType} from '@sanity/types'
import {Box, Flex, Inline, Label, Stack, TextSkeleton} from '@sanity/ui'
import {RenderPreviewCallback} from '../../types'
import {ReferencePreview} from './ReferencePreview'
import {Loadable} from './useReferenceInfo'
import {ReferenceInfo} from './types'

export function PreviewReferenceValue(props: {
  referenceInfo: Loadable<ReferenceInfo>
  renderPreview: RenderPreviewCallback
  type: ReferenceSchemaType
  value: Reference
}) {
  const {referenceInfo, renderPreview, type, value} = props

  if (referenceInfo.isLoading || referenceInfo.error) {
    return (
      <Stack space={2} padding={1}>
        <TextSkeleton style={{maxWidth: 320}} radius={1} animated={!referenceInfo.error} />
        <TextSkeleton style={{maxWidth: 200}} radius={1} size={1} animated={!referenceInfo.error} />
      </Stack>
    )
  }
  const showTypeLabel = type.to.length > 1

  if (referenceInfo.result.availability.reason === 'NOT_FOUND' && value._strengthenOnPublish) {
    const refType = type.to.find((toType) => toType.name === value?._strengthenOnPublish?.type)
    if (!refType) {
      return <div>Invalid reference type</div>
    }
    if (value._strengthenOnPublish) {
      const stub = {
        _id: value._ref,
        _type: value._strengthenOnPublish?.type,
      }
      return (
        <Flex align="center">
          <Box flex={1}>
            {renderPreview({
              layout: 'default',
              schemaType: refType,
              value: stub,
            })}
          </Box>
          <Box>
            <Inline space={4}>
              {showTypeLabel && (
                <Label size={1} muted>
                  {refType.title}
                </Label>
              )}
            </Inline>
          </Box>
        </Flex>
      )
    }
  }

  const refTypeName = referenceInfo.result?.type
  const refType = type.to.find((toType) => toType.name === refTypeName)

  if (!refType) {
    return (
      <Stack space={2} padding={2}>
        The referenced document is of invalid type: ({refTypeName || 'unknown'})
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Stack>
    )
  }

  return (
    <ReferencePreview
      availability={referenceInfo.result.availability}
      id={value._ref}
      layout="default"
      preview={referenceInfo.result.preview}
      refType={refType}
      renderPreview={renderPreview}
      showTypeLabel={showTypeLabel}
    />
  )
}
