import {Image} from '@sanity/types'
import * as React from 'react'
import {
  DiffCard,
  DiffComponent,
  DiffTooltip,
  ObjectDiff,
  ChangeList,
  getAnnotationAtPath
} from '../../../diff'
import {FromTo} from '../../../diff/components'
import {ImagePreview, NoImagePreview} from './ImagePreview'
import styles from './ImageFieldDiff.css'

const IMAGE_META_FIELDS = ['crop', 'hotspot']
const BASE_IMAGE_FIELDS = ['asset', ...IMAGE_META_FIELDS]

export const ImageFieldDiff: DiffComponent<ObjectDiff<Image>> = ({diff, schemaType}) => {
  const {fromValue, toValue, fields, isChanged} = diff
  const fromRef = fromValue?.asset?._ref
  const toRef = toValue?.asset?._ref
  const assetAnnotation = getAnnotationAtPath(diff, ['asset', '_ref'])

  // Get all the changed fields within this image field
  const changedFields = Object.keys(fields).filter(
    name => fields[name].isChanged && name !== '_type'
  )

  const nestedFields = schemaType.fields
    .filter(field => !BASE_IMAGE_FIELDS.includes(field.name) && changedFields.includes(field.name))
    .map(field => field.name)

  let assetAction: 'changed' | 'added' | 'removed' = 'changed'
  if (!fromRef && toRef) {
    assetAction = 'added'
  } else if (!toRef && fromRef) {
    assetAction = 'removed'
  }

  const didAssetChange = changedFields.includes('asset')
  const didCropChange = changedFields.includes('crop')
  const didHotspotChange = changedFields.includes('hotspot')
  const didMetaChange = didCropChange || didHotspotChange
  const showImageDiff = didAssetChange || didMetaChange
  const showMetaChange = didMetaChange && !didAssetChange

  const from =
    fromValue && fromRef ? (
      <DiffCard className={styles.annotation} annotation={assetAnnotation}>
        <ImagePreview
          is="from"
          id={fromRef}
          diff={diff}
          action={assetAction}
          hotspot={showMetaChange && didHotspotChange ? fromValue.hotspot : undefined}
          crop={showMetaChange && didCropChange ? fromValue.crop : undefined}
        />
      </DiffCard>
    ) : (
      <NoImagePreview />
    )

  const to =
    toValue && toRef ? (
      <DiffCard className={styles.annotation} annotation={assetAnnotation}>
        <ImagePreview
          is="to"
          id={toRef}
          diff={diff}
          hotspot={showMetaChange && didHotspotChange ? toValue.hotspot : undefined}
          crop={showMetaChange && didCropChange ? toValue.crop : undefined}
        />
      </DiffCard>
    ) : (
      <NoImagePreview />
    )

  if (!from && !to) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyMessage}>
          <span>Image not set</span>
        </div>
      </div>
    )
  }

  if (!isChanged) {
    return toRef ? (
      <DiffCard className={styles.annotation} annotation={assetAnnotation}>
        <ImagePreview id={toRef} is="to" diff={diff} />
      </DiffCard>
    ) : null
  }

  const imageDiff = <FromTo align="center" from={from} layout="grid" to={to} />

  return (
    <div className={styles.root}>
      {showImageDiff &&
        (didAssetChange ? (
          <DiffTooltip
            annotations={assetAnnotation ? [assetAnnotation] : []}
            description={`${assetAction[0].toUpperCase()}${assetAction.slice(1)}`}
          >
            {imageDiff}
          </DiffTooltip>
        ) : (
          imageDiff
        ))}

      {nestedFields.length > 0 && (
        <div className={styles.nestedFields}>
          <ChangeList diff={diff} schemaType={schemaType} fields={nestedFields} />
        </div>
      )}
    </div>
  )
}
