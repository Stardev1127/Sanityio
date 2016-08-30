import React, {PropTypes} from 'react'
import styles from '../../styles/LoginStatus.css'
import userStore from 'datastore:@sanity/base/user'
import {FormattedMessage} from 'component:@sanity/base/locale/intl'
// import config from 'config:sanity'

export default class LoginStatus extends React.Component {

  static propTypes = {
    className: PropTypes.string
  }

  constructor() {
    super()
    this.handleLogoutButtonClicked = this.handleLogoutButtonClicked.bind(this)
    this.state = {user: null, menuVisible: false}
  }

  componentWillMount() {
    this.userSubscription = userStore.currentUser
      .map(ev => ev.user)
      .subscribe(user => {
        this.setState({user: user})
      })
  }

  componentWillUnmount() {
    this.userSubscription.unsubscribe()
  }


  handleLogoutButtonClicked(evnt) {
    evnt.preventDefault()
    userStore.actions.logout()
  }

  render() {
    const {className} = this.props
    const {user} = this.state
    if (!user) {
      return null
    }
    return (
      <div className={`${styles.root} ${className}`}>
        <img src={user.profileImage} className={styles.userImage} />

        <div className={styles.userName}>{user.name}</div>
        <button
          className={styles.logoutButton}
          onClick={this.handleLogoutButtonClicked}
        >
          <FormattedMessage id="logoutButtonText" />
        </button>


      </div>
    )
  }
}
