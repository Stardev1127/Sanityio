import PropTypes from 'prop-types'
import React from 'react'
import styles from 'part:@sanity/components/selects/custom-style'
import {uniqueId} from 'lodash'
import FaAngleDown from 'part:@sanity/base/angle-down-icon'
import DefaultList from 'part:@sanity/components/lists/default'
import enhanceWithClickOutside from 'react-click-outside'

class CustomSelect extends React.Component {
  static propTypes = {
    inputId: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onOpen: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClose: PropTypes.func,
    value: PropTypes.object,
    renderItem: PropTypes.func,
    className: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
      })
    ),
  }

  static defaultProps = {
    placeholder: 'Type to search…',
    loading: false,
    onChange() {},
    onBlur() {},
    onOpen() {},
    onClose() {}
  }

  state = {
    hasFocus: false,
    inputSelected: false,
    arrowNavigationPosition: 0
  }

  handleClickOutside = () => {
    this.handleCloseList()
  }

  handleFocus = event => {
    this.props.onFocus(event)
  }

  handleBlur = event => {
    this.props.onBlur(event)
  }

  handleSelect = item => {
    this.props.onChange(item)
    this.handleCloseList()
  }

  handleOpenList = () => {
    this.setState({
      showList: true,
    })
    this.props.onOpen()
  }

  handleCloseList = () => {
    this.setState({
      showList: false
    })
    this.props.onClose()
  }

  handleInnerClick = () => {
    if (this.state.showList) {
      this.handleCloseList()
    } else {
      this.handleOpenList()
    }
  }


  handleKeyDown = event => {
    const {items} = this.props
    const {arrowNavigationPosition} = this.state
    if (items) {
      if (event.key == 'ArrowUp' && arrowNavigationPosition > 0) {
        this.setState({
          arrowNavigationPosition: arrowNavigationPosition - 1,
          showList: true
        })
        return false
      }

      if (event.key == 'ArrowDown' && arrowNavigationPosition < items.length - 1) {
        this.setState({
          arrowNavigationPosition: arrowNavigationPosition + 1,
          showList: true
        })
        return false
      }
    }
    return true
  }

  handleKeyUp = event => {
    const {items} = this.props
    const {arrowNavigationPosition} = this.state
    if (event.key == 'Enter' && arrowNavigationPosition) {
      this.handleSelect(items[arrowNavigationPosition])
      this.setState({
        hasFocus: false
      })
      return false
    }
    return true
  }

  componentWillMount() {
    this._inputId = uniqueId('CustomSelect')
  }

  render() {
    const {inputId, value, items, className} = this.props
    const {showList, arrowNavigationPosition} = this.state

    return (
      <div className={className}>
        <div className={styles.inner} onClick={this.handleInnerClick}>
          <div className={styles.selectContainer}>
            <span className={styles.text}>
              {this.props.renderItem(this.props.value)}
            </span>
            <div className={styles.arrow}>
              <FaAngleDown color="inherit" />
            </div>
          </div>
        </div>
        <div className={`${showList ? styles.listContainer : styles.listContainerHidden}`}>
          {showList && (
            <DefaultList
              items={items}
              scrollable
              highlightedItem={(items && items[arrowNavigationPosition]) || value}
              selectedItem={value}
              onSelect={this.handleSelect}
              renderItem={this.props.renderItem}
            />
          )}
        </div>
      </div>
    )
  }
}

export default enhanceWithClickOutside(CustomSelect)
