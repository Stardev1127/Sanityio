import React, {PropTypes} from 'react'

import styles from 'part:@sanity/components/imageinput/fieldset-style'
// import DefaultLabel from 'part:@sanity/components/labels/default'
import ProgressCircle from 'part:@sanity/components/progress/circle'
import UploadIcon from 'part:@sanity/base/upload-icon'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import createImageLoader from './common/createImageLoader'
import _HotspotImage from '@sanity/imagetool/HotspotImage'
import ImageSelect from 'part:@sanity/components/imageinput/image-select'
import {DEFAULT_CROP} from '@sanity/imagetool/constants'

const DEFAULT_HOTSPOT = {
  height: 0,
  width: 0,
  x: 0.5,
  y: 0.5
}

const HotspotImage = createImageLoader(_HotspotImage, image => {
  return {srcAspectRatio: image.width / image.height}
})


export default class ImageInputFieldset extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(['ready', 'complete', 'pending', 'error']),
    legend: PropTypes.string,
    level: PropTypes.number,
    percent: PropTypes.number,
    fieldName: PropTypes.string,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func,
    hotspotImage: PropTypes.shape({
      hotspot: PropTypes.object,
      crop: PropTypes.object,
      imageUrl: PropTypes.string
    }),
    children: PropTypes.node
  }

  static defaultProps = {
    hotspotImage: {
      imageUrl: null
    },
    status: 'ready'
  }

  componentWillMount() {
    // this._inputId = uniqueId('ImageInputFieldset')
  }

  render() {

    const {legend, level, hotspotImage, fieldName, percent, status} = this.props

    return (
      <Fieldset legend={legend} level={level}>
        <div className={styles.grid}>
          <div
            className={`
              ${hotspotImage && hotspotImage.imageUrl ? styles.imageWrapper : styles.imageWrapperEmpty}
              ${status == 'error' && styles.error}
            `}
          >
            {
              hotspotImage.imageUrl
              && <div className={status === 'complete' ? styles.imageIsUploaded : styles.imageIsNotUploaded}>
                <HotspotImage
                  aspectRatio="auto"
                  hotspot={hotspotImage.hotspot || DEFAULT_HOTSPOT}
                  crop={hotspotImage.crop || DEFAULT_CROP}
                  src={hotspotImage.imageUrl}
                />
              </div>
            }

            {
              !hotspotImage.imageUrl
              && <ImageSelect
                className={styles.upload}
                name={fieldName}
                onSelect={this.props.onSelect}
              >
                <div className={styles.uploadInner}>
                  <UploadIcon className={styles.uploadIcon} />
                  Upload image
                </div>
              </ImageSelect>
            }
            {
              status !== 'complete' && status !== 'ready'
              && <div className={styles.progressContainer}>
                <div className={styles.progressInner}>
                  {percent && <ProgressCircle percent={percent} showPercent className={styles.progress} />}
                </div>
              </div>
            }
            {
              status === 'pending' && this.props.onCancel
              && <a className={styles.cancel} onClick={this.props.onCancel}>Cancel</a>
            }
            {
              status == 'error'
              && <div className={styles.errorMessage}>
                <div>Error!</div>
                <ImageSelect name={fieldName} onSelect={this.props.onSelect}>
                  <span>Try again…</span>
                </ImageSelect>
              </div>
            }

            {
              status === 'complete'
              && <div className={styles.progressContainerComplete}>
                <div className={styles.progressInner}>
                  <ProgressCircle percent={100} completed className={styles.progressComplete} />
                </div>
              </div>
            }
          </div>
          <div className={styles.content}>
            {this.props.children}
          </div>
        </div>
      </Fieldset>
    )
  }
}
