import React from 'react'
import {TextWithTone} from '@sanity/base/components'
import {PreviewValue} from '@sanity/base/preview'
import {PublishIcon} from '@sanity/icons'
import {SanityDocument} from '@sanity/types'
import {Box, Text, Tooltip} from '@sanity/ui'
import {TimeAgo} from './TimeAgo'

export function PublishedStatus(props: {document?: PreviewValue | Partial<SanityDocument> | null}) {
  const {document} = props
  const updatedAt = document && '_updatedAt' in document && document._updatedAt

  return (
    <Tooltip
      portal
      content={
        <Box padding={2}>
          <Text size={1}>
            {document ? (
              <>Published {updatedAt && <TimeAgo time={updatedAt} />}</>
            ) : (
              <>Not published</>
            )}
          </Text>
        </Box>
      }
    >
      <TextWithTone tone="positive" dimmed={!document} muted={!document} size={1}>
        <PublishIcon />
      </TextWithTone>
    </Tooltip>
  )
}
