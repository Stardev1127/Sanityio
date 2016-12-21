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
// import Button from 'part:@sanity/components/buttons/default'

const HotspotImage = createImageLoader(_HotspotImage, image => {
  return {srcAspectRatio: image.width / image.height}
})

const DEFAULT_HOTSPOT = {
  height: 0,
  width: 0,
  x: 0.5,
  y: 0.5
}

export default class ImageInputFieldset extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(['ready', 'complete', 'pending', 'error']),
    legend: PropTypes.string,
    level: PropTypes.number,
    percent: PropTypes.number,
    fieldName: PropTypes.string,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func,
    imageUrl: PropTypes.string,
    hotspotImage: PropTypes.shape({
      hotspot: PropTypes.object,
      crop: PropTypes.object,
      imageUrl: PropTypes.string
    }),
    children: PropTypes.node
  }

  static defaultProps = {
    status: 'ready'
  }

  constructor(...args) {
    super(...args)
    this.state = {
      aspect: null
    }
  }

  componentWillMount() {
    // this._inputId = uniqueId('ImageInputFieldset')
  }

  componentDidMount() {
    const {imageUrl} = this.props
    if (imageUrl) {
      this.renderImage(imageUrl)
    }
  }

  renderImage = url => {
    const image = new Image()
    image.src = url
    image.onload = i => {
      this.setState({
        aspect: image.width / image.height
      })
    }
  }

  render() {

    const {legend, level, hotspotImage, imageUrl, fieldName, percent, status, onCancel, children} = this.props

    return (
      <Fieldset legend={legend} level={level} className={`${styles[`level${level}`]}`}>
        <div className={styles.grid}>
          <div
            className={`
              ${hotspotImage && hotspotImage.imageUrl ? styles.imageWrapper : styles.imageWrapperEmpty}
              ${children ? styles.hasContent : styles.noContent}
              ${status == 'error' && styles.error}
            `}
          >
            {
              ((hotspotImage && hotspotImage.imageUrl) || imageUrl)
              && <div className={status === 'complete' || status === 'ready' ? styles.imageIsUploaded : styles.imageIsNotUploaded}>
                {
                  hotspotImage && (
                    <HotspotImage
                      aspectRatio="auto"
                      hotspot={hotspotImage.hotspot || DEFAULT_HOTSPOT}
                      crop={hotspotImage.crop || DEFAULT_CROP}
                      src={hotspotImage.imageUrl}
                    />
                  )
                }
                {
                  imageUrl && !hotspotImage && this.state.aspect && (
                    <div className={styles.vanillaImageWrapper}>
                      <img src={imageUrl} className={this.state.aspect >= 1 ? styles.landscapeImage : styles.portraitImage} />
                    </div>
                  )
                }
                <ImageSelect
                  className={styles.imageSelect}
                  name={fieldName}
                  onSelect={this.props.onSelect}
                >
                  <div className={styles.uploadInner}>
                    <div className={styles.uploadIconContainer}>
                      <UploadIcon className={styles.uploadIcon} />
                    </div>
                    <span className={styles.uploadIconText}>Upload new image</span>
                  </div>
                </ImageSelect>
              </div>
            }

            {
              // Empty state and ready
              status === 'ready' && !imageUrl
              && !(hotspotImage && hotspotImage.imageUrl)
              && (
                <ImageSelect
                  className={styles.imageSelect}
                  name={fieldName}
                  onSelect={this.props.onSelect}
                >
                  <div className={styles.uploadInner}>
                    <div className={styles.uploadIconContainer}>
                      <UploadIcon className={styles.uploadIcon} />
                    </div>
                    <span className={styles.uploadIconText}>Upload image</span>
                  </div>
                </ImageSelect>
              )
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
              status === 'pending' && onCancel
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
          {
            children && (
              <div className={styles.content}>
                {children}
              </div>
            )
          }
        </div>
      </Fieldset>
    )
  }
}
