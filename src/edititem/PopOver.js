import React, {PropTypes} from 'react'
import styles from 'part:@sanity/components/edititem/popover-style'
import Button from 'part:@sanity/components/buttons/default'
import {debounce} from 'lodash'
import CloseIcon from 'part:@sanity/base/close-icon'
import scroll from 'scroll'
import ease from 'ease-component'

export default class EditItemPopOver extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func,
    isCreatingNewItem: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.object),
    fullWidth: PropTypes.bool,
    onNeedScroll: PropTypes.func,
    scrollContainer: PropTypes.node,
    scrollContainerId: PropTypes.string
  }

  static defaultProps = {
    onClose() {},
    actions: []
  }

  constructor() {
    super()
    this.handleClose = this.handleClose.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.setRootElement = this.setRootElement.bind(this)
    this.setInnerElement = this.setInnerElement.bind(this)
    this.setArrowElement = this.setArrowElement.bind(this)
    this.repositionElement = this.repositionElement.bind(this)
    this.handleResize = debounce(this.handleResize.bind(this), 17) // 60fps
    this.resetPosition = this.resetPosition.bind(this)
    this.scrollOptions = {
      duration: 250,
      ease: ease.easeInOutQuart
    }
  }

  handleKeyDown = event => {
    if (event.key == 'Escape') {
      this.handleClose()
    }
  }

  handleClose() {
    this.props.onClose()
  }

  handleClick(event) {
    event.stopPropagation()
  }

  handleMouseDown(event) {
    event.stopPropagation()
  }

  repositionElement() {
    const rootElement = this._rootElement
    const innerElement = this._innerElement

    if (rootElement && innerElement) {

      const rootRects = rootElement.getClientRects()
      const width = rootRects[0].width
      const height = rootRects[0].height
      const left = rootRects[0].left
      const top = rootRects[0].top

      // we can use window since we don't support horizontal scrolling
      // and the backdrop is fixed
      const windowWidth = window.innerWidth
      const containerOffsetHeight = this.scrollContainer.offsetHeight

      const padding = 30

      const margin = parseInt(innerElement.style.marginLeft, 10) || 0
      const scrollTop = this.scrollContainer.scrollTop

      // Scroll container when there is no space
      if ((containerOffsetHeight + scrollTop) < (top + height)) {
        scroll.top(this.scrollContainer, (containerOffsetHeight - top - height - scrollTop) * -1, this.scrollOptions)
      }

      // Need more bottom space
      if (this.scrollContainer.scrollHeight < (scrollTop + top + height)) {
        this.scrollContainer.style.paddingBottom = this.scrollContainer.scrollHeight - scrollTop - height - top
        scroll.top(this.scrollContainer, (containerOffsetHeight - top - height - scrollTop) * -1, this.scrollOptions)
      }

      // Reposition horizon
      if ((width + left - margin + padding) > windowWidth) {
        const diff = windowWidth - width - padding - left + margin
        innerElement.style.marginLeft = `${diff}px`
        this._arrowElement.style.transform = `translateX(${diff * -1}px)`
      } else {
        this.resetPosition()
      }
    }
  }

  resetPosition() {
    this._innerElement.style.marginLeft = '0'
    this._arrowElement.style.transform = 'translateX(0px)'
  }

  handleResize() {
    // Uses the css the determine if it should reposition with an Media Query
    const computedStyle = window.getComputedStyle(this._rootElement, '::before')
    const contentValue = computedStyle.getPropertyValue('content')
    const shouldReposition = contentValue === '"shouldReposition"' // Is quoted

    if (shouldReposition) {
      this.repositionElement()
    } else {
      this.resetPosition()
    }
  }

  componentDidMount() {
    // Sets a scrollContainer with ID
    if (!this.props.scrollContainer && this.props.scrollContainerId) {
      this.scrollContainer = document.getElementById(this.props.scrollContainerId)
    } else if (this.props.scrollContainer) {
      this.scrollContainer = this.props.scrollContainer
    } else {
      this.scrollContainer = document.getElementById('Sanity_Default_DeskTool_Editor_ScrollContainer')
    }
    if (this.scrollContainer) {
      this.initialScrollTop = this.scrollContainer.scrollTop
      this.handleResize()
      window.addEventListener('resize', this.handleResize)
      window.addEventListener('keydown', this.handleKeyDown, false)
    }
  }

  componentWillUnmount() {
    if (this.scrollContainer && this.initialScrollTop) {
      scroll.top(this.scrollContainer, this.initialScrollTop, this.scrollOptions)
    }
    window.removeEventListener('keydown', this.handleKeyDown, false)
    window.removeEventListener('resize', this.handleResize)
  }

  setRootElement(element) {
    this._rootElement = element
  }
  setInnerElement(element) {
    this._innerElement = element
  }

  setArrowElement(element) {
    this._arrowElement = element
  }

  handleBackdropClick = () => {
    this.handleClose()
  }

  handleInnerClick = event => {
    event.stopPropagation()
  }

  render() {
    const {title, children, className, isCreatingNewItem, actions, fullWidth} = this.props
    return (
      <div
        className={`${fullWidth ? styles.fullWidth : styles.autoWidth} ${className}`}
        onClick={this.handleClick}
        ref={this.setRootElement}
      >
        <div className={styles.overlay} onClick={this.handleBackdropClick} />
        <div className={styles.inner} ref={this.setInnerElement} onClick={this.handleInnerClick}>

          <div className={styles.arrow} ref={this.setArrowElement} />

          <button className={styles.close} type="button" onClick={this.handleClose}>
            <CloseIcon />
          </button>

          <div className={styles.head}>
            <h3 className={styles.title}>
              {
                isCreatingNewItem && 'New '
              }
              {title}
            </h3>
          </div>

          <div className={styles.content}>
            {children}
          </div>

          {
            actions.length > 0 && <div className={styles.functions}>
              {
                actions.map((action, i) => {
                  return (
                    <Button
                      key={i}
                      onClick={this.handleActionClick}
                      data-action-index={i}
                      kind={action.kind}
                      className={styles[`button_${action.kind}`] || styles.button}
                    >
                      {action.title}
                    </Button>
                  )
                })
              }
            </div>
          }
        </div>
      </div>
    )
  }
}
