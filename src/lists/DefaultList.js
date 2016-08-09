import React, {PropTypes} from 'react'
import styles from 'style:@sanity/components/lists/default'
import ListItem from 'component:@sanity/components/lists/items/default'

export default class DefaultList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        index: PropTypes.string,
        content: PropTypes.node,
        extraContent: PropTypes.node,
        icon: PropTypes.node
      })
    ),
    onSelect: PropTypes.func,
    selectable: PropTypes.bool,
    selectedItem: PropTypes.object,
    loading: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    layout: PropTypes.oneOf(['media', 'block', 'string'])
  }

  static defaultProps = {
    selectedItemIndex: null
  }

  constructor(context, props) {
    super(context, props)

    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect(event) {
    const itemIndex = event.currentTarget.getAttribute('data-item-index')
    this.props.onSelect(this.props.items[itemIndex])
  }

  render() {

    const {items, children, layout, className, selectedItem} = this.props

    return (
      <div className={`${className} ${styles.root}`}>
        <div className={styles.inner}>
          <ul className={styles.list}>
            {
              !children && items && items.map((item, i) => {
                return (
                  <li key={i} onClick={this.handleSelect} data-item-index={i}>
                    <ListItem
                      layout={layout}
                      title={item.title}
                      icon={item.icon}
                      selected={selectedItem == item}
                    >
                      {item.content}
                    </ListItem>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}
