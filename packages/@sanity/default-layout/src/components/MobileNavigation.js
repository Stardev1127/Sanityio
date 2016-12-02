import React, {PropTypes} from 'react'
import LoginStatus from './LoginStatus'
import ToolSwitcher from './ToolSwitcher'
import tools from 'all:part:@sanity/base/tool'
import styles from './styles/MobileNavigation.css'
import CompanyBranding from './CompanyBranding'
import HamburgerIcon from 'part:@sanity/base/hamburger-icon'
import Button from 'part:@sanity/components/buttons/default'
import Search from './Search'

class MobileNavigation extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  state = {
    isOpen: false
  }

  handleOpen = event => {
    this.setState({
      isOpen: true
    })
  }

  handleClose = event => {
    this.setState({
      isOpen: false
    })
  }

  handleToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const {router} = this.context
    const {isOpen} = this.state
    return (
      <div className={styles.root}>
        <CompanyBranding />
        <div className={styles.searchContainer}>
          <Search />
        </div>

        <Button
          kind="simple"
          className={styles.hamburgerButton}
          onClick={this.handleToggle}
          title="Menu"
          icon={HamburgerIcon}
        />

        <div className={`${isOpen ? styles.menuOpen : styles.menuClosed}`}>
          <LoginStatus className={styles.loginStatus} />
          <ToolSwitcher
            tools={tools}
            activeToolName={router.state.tool}
            className={styles.toolSwitcher}
            onClick={this.handleClose}
          />
        </div>
      </div>
    )
  }
}

export default MobileNavigation
