import {SanityConfig} from '../config'
import {DocumentPreviewStore} from '../preview'
import {SanitySource} from '../source'
import {CrossProjectTokenStore} from './crossProjectToken'
import {DocumentStore} from './document'
import {GrantsStore} from './grants/types'
import {HistoryStore} from './history'
import {PresenceStore} from './presence'
import {ProjectStore} from './project'
import {SettingsStore} from './settings/types'
import {UserStore} from './user'

export interface DatastoresContext {
  config: SanityConfig
  source: SanitySource
}

export interface Datastores {
  crossProjectTokenStore: CrossProjectTokenStore
  documentStore: DocumentStore
  documentPreviewStore: DocumentPreviewStore
  grantsStore: GrantsStore
  historyStore: HistoryStore
  presenceStore: PresenceStore
  projectStore: ProjectStore
  settingsStore: SettingsStore
  userStore: UserStore
}
