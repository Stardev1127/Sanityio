import {SanityClient, ClientConfig} from '@sanity/client'
import client from 'part:@sanity/base/client'
import {CONFIGURED_SPACES} from './spaces'

type StudioClient = SanityClient & {
  config(newConfig?: Partial<ClientConfig>, silenceConfigWarning?: boolean): SanityClient
}

export default function reconfigureClient(routerState: {space: string}): void {
  const space = CONFIGURED_SPACES.find((sp) => sp.name === routerState.space)
  if (space && space.api) {
    ;(client as StudioClient).config(space.api, true)
  }
}
