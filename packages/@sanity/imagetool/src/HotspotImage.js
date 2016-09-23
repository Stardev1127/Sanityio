import React, {PropTypes} from 'react'
import calculateStyles from './calculateStyles'
import Debug from 'debug'
import {DEFAULT_HOTSPOT, DEFAULT_CROP} from './constants'

const debug = Debug('sanity-imagetool')

export default class HotspotImage extends React.Component {
  static propTypes = {
    src: React.PropTypes.string,
    srcAspectRatio: PropTypes.number,
    srcSet: React.PropTypes.string,
    hotspot: React.PropTypes.object,
    crop: React.PropTypes.object,
    aspectRatio: PropTypes.number,
    clipPerimeter: PropTypes.arrayOf(PropTypes.array),
    alignX: PropTypes.oneOf(['center', 'left', 'right']),
    alignY: PropTypes.oneOf(['center', 'top', 'bottom']),
    className: PropTypes.string,
    style: PropTypes.object,
    onError: PropTypes.func,
    onLoad: PropTypes.func
  }

  static defaultProps = {
    alignX: 'center',
    alignY: 'center',
    crop: DEFAULT_CROP,
    hotspot: DEFAULT_HOTSPOT
  }

  componentDidMount() {
    const imageElement = this.imageElement
    // Fixes issues that may happen if the component is mounted after the image is done loading
    // In these situations, neither the onLoad or the onError events will be called.
    // Derived from http://imagesloaded.desandro.com/
    const alreadyLoaded = (imageElement.src && imageElement.complete && imageElement.naturalWidth !== undefined)
    if (alreadyLoaded) {
      debug("Image '%s' already loaded, refreshing (from cache) to trigger onLoad / onError", this.props.src)
      imageElement.src = imageElement.src
    }
  }

  renderPerimeter(styles, aspectRatio) {
    const {clipPerimeter} = this.props
    if (!clipPerimeter) {
      return null
    }

    const points = clipPerimeter.map(point => `${(point[0] * 2) - 1},${(point[1] * 2) - 1}`).join(' L')

    return (
      <svg style={styles.image} viewBox={'-1 -1 2 2'}>
        <g transform={`scale(${aspectRatio} 1)`} style={{fill: '#fff', strokeWidth: 0.1}}>
          <path d={`M-2,-2 L-2,2 L2,2 L2,-2 z M${points} z`} style={{fillRule: 'evenodd'}} />
        </g>
      </svg>
    )
  }

  setImageElement = el => {
    this.imageElement = el
  }

  render() {
    const {
      aspectRatio,
      srcAspectRatio,
      crop,
      hotspot,
      src,
      srcSet,
      alignX,
      alignY,
      className,
      style,
      onError,
      onLoad
    } = this.props

    const targetStyles = calculateStyles({
      container: {aspectRatio},
      image: {aspectRatio: srcAspectRatio},
      hotspot,
      crop,
      align: {
        x: alignX,
        y: alignY
      }
    })

    return (
      <div className={className} style={style}>
        <div style={targetStyles.container}>
          <div style={{paddingTop: targetStyles.container.height}} />
          <div style={targetStyles.crop}>
            <img
              ref={this.setImageElement}
              src={src}
              srcSet={srcSet}
              onLoad={onLoad}
              onError={onError}
              style={targetStyles.image}
            />
          </div>
        </div>
      </div>
    )
  }
}

