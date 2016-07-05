import React, {PropTypes} from 'react'
import Ink from 'react-ink'
import styles from 'style:@sanity/components/buttons/default'
import Spinner from 'component:@sanity/components/loading/spinner'

/**
 * General
 */

export default class DefaultButton extends React.Component {
  static propTypes = {
    /**
     * Kind of button. Supports add, warning, success, danger
     */
    kind: PropTypes.oneOf(['add', 'warning', 'success', 'danger']),
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
    inverted: PropTypes.bool,
    /**
     * Icon
     */
    icon: PropTypes.node,
    loading: PropTypes.bool,
    ripple: PropTypes.bool,
    colored: PropTypes.bool,
    className: PropTypes.string,
    color: PropTypes.string // success, warning, danger, info
  }

  handleOnClick() {
    this.props.onClick()
  }

  render() {

    const {kind, inverted, color, colored, ripple, icon, loading, className} = this.props

    if (!styles[kind] && kind) {
      console.error(`There is no ${kind} button`) // eslint-disable-line no-console
    }

    const style = `${styles[kind] || styles.root} ${colored && styles.colored} ${inverted && styles.inverted} ${color} ${className}`

    return (
      <button
        className={style}
        type="button"
        onClick={this.props.onClick}
        {...this.props}
      >
        {
          loading && <Spinner />
        }
        {
          icon && <span className={styles.icon}>{icon}</span>
        }
        <span className={styles.content}>
          {this.props.children}
        </span>

        {
          ripple && <span className={styles.ripple}><Ink /></span>
        }
      </button>
    )
  }
}
