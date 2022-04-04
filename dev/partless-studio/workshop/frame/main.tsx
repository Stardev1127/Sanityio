import {StudioProvider} from 'sanity'
import {ThemeColorSchemeKey, usePrefersDark} from '@sanity/ui'
import {WorkshopFrame} from '@sanity/ui-workshop'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import Refractor from 'react-refractor'
import javascript from 'refractor/lang/javascript'
import json from 'refractor/lang/json'
import jsx from 'refractor/lang/jsx'
import typescript from 'refractor/lang/typescript'
import sanityConfig from '../../sanity.config'
import {config} from '../config'

Refractor.registerLanguage(javascript)
Refractor.registerLanguage(json)
Refractor.registerLanguage(jsx)
Refractor.registerLanguage(typescript)

function Main() {
  const prefersDark = usePrefersDark()
  const [scheme, setScheme] = useState<ThemeColorSchemeKey>(prefersDark ? 'dark' : 'light')

  return (
    <StudioProvider config={sanityConfig} scheme={scheme} setScheme={setScheme}>
      <WorkshopFrame config={config} setScheme={setScheme} />
    </StudioProvider>
  )
}

ReactDOM.render(<Main />, document.getElementById('root'))
