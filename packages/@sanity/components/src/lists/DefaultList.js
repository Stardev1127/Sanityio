import PropTypes from 'prop-types'
import React from 'react'
import styles from 'part:@sanity/components/lists/default-style'
import ListItemWrapper from './items/ListItemWrapper'
import itemStyles from 'part:@sanity/components/lists/items/default-style'
import DefaultItem from 'part:@sanity/components/lists/items/default'
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc'
import DragBarsIcon from 'part:@sanity/base/bars-icon'
import {item as itemPropType} from './PropTypes'

const DragHandle = SortableHandle(() => <span className={itemStyles.dragHandle}><DragBarsIcon /></span>)

const SortableItem = SortableElement(({renderListItem, value, idx}) => {
  return renderListItem(value, idx)
})

const SortableList = SortableContainer(({sortableItems, renderListItem, getItemKey, className, ref}) => {
  return (
    <ul className={`${styles.sortableList} ${className}`} ref={ref}>
      {
        sortableItems.map((value, index) => {
          return (
            <SortableItem
              key={getItemKey(value, index)}
              idx={index}
              index={index}
              value={value}
              renderListItem={renderListItem}
            />
          )
        })
      }
    </ul>
  )
})

export default class DefaultList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(itemPropType),
    useDragHandle: PropTypes.bool,

    scrollable: PropTypes.bool,
    sortable: PropTypes.bool,

    selectedItem: itemPropType,
    highlightedItem: itemPropType,
    focusedItem: itemPropType,
    className: PropTypes.string,

    overrideItemRender: PropTypes.bool,

    renderItem: PropTypes.func,
    getItemKey: PropTypes.func,

    decoration: PropTypes.string,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func,
    onSortStart: PropTypes.func,
    onSortMove: PropTypes.func,
    onSortEnd: PropTypes.func
  }

  static defaultProps = {
    onSelect() {},
    onOpen() {},
    sortable: false,
    overrideItemRender: false,
    renderItem(item) {
      return item
    },
    getItemKey(item, index) {
      return `list-item-${index}`
    }
  }

  setListElement = element => {
    this._listElement = element
  }

  scrollElementIntoViewIfNeeded = itemElement => {

    const listElement = this._listElement
    const offset = itemElement.offsetTop

    if (!itemElement || !listElement) {
      return
    }

    if (listElement.scrollTop < offset) {
      listElement.scrollTop = offset - (listElement.offsetHeight / 2)
    }

  }

  renderListItem = (item, index) => {
    const {
      renderItem,
      getItemKey,
      decoration,
      selectedItem,
      highlightedItem,
      sortable,
      useDragHandle,
      overrideItemRender,
      onOpen,
      onSelect,
      focusedItem
    } = this.props

    const isSelected = item === selectedItem
    const hasFocus = focusedItem === item
    const isHighlighted = item === highlightedItem

    const renderedItem = renderItem(item, index, {
      isSelected,
      isHighlighted,
      hasFocus
    })

    const key = getItemKey(item, index)
    return (
      <ListItemWrapper
        className={styles.item}
        index={index}
        key={key}
        item={item}
        onSelect={onSelect}
        selected={isSelected}
        hasFocus={hasFocus}
        highlighted={isHighlighted}
        decoration={decoration}
        scrollIntoView={this.scrollElementIntoViewIfNeeded}
      >
        {
          sortable && useDragHandle && <DragHandle />
        }
        {overrideItemRender ? renderedItem : (
          <DefaultItem
            key={key}
            item={item}
            onSelect={onSelect}
            onOpen={onOpen}
            selected={isSelected}
            hasFocus={hasFocus}
          >

            {renderedItem}
          </DefaultItem>
        )}
      </ListItemWrapper>
    )
  }

  render() {
    const {
      items,
      className,
      scrollable,
      sortable,
      useDragHandle,
      onSortStart,
      onSortEnd,
      onSortMove,
      getItemKey
    } = this.props

    return (
      <div
        className={`
          ${scrollable ? styles.scrollable : styles.root}
          ${sortable ? styles.isSortable : ''}
          ${useDragHandle ? styles.usesDragHandle : ''}
          ${className || ''}
        `}
      >

        {
          !sortable && <ul className={scrollable ? styles.scrollableList : styles.list} ref={this.setListElement}>
            {
              items && items.map((item, index) => {
                return (
                  this.renderListItem(item, index)
                )
              })
            }
          </ul>
        }
        {
          sortable && (
            <SortableList
              sortableItems={items}
              onSortEnd={onSortEnd}
              onSortStart={onSortStart}
              onSortMove={onSortMove}
              className={scrollable ? styles.scrollableList : styles.list}
              helperClass={itemStyles.sortableHelper}
              transitionDuration={100}
              distance={0}
              axis="y"
              lockAxis="y"
              useDragHandle={useDragHandle}
              renderListItem={this.renderListItem}
              getItemKey={getItemKey}
              ref={this.setListElement}
              hideSortableGhost
            />
          )
        }

      </div>
    )
  }
}
