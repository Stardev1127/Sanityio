import {createConfig, deskTool} from '@sanity/base'
import {schemaTypes} from './schema'

export default createConfig({
  plugins: [deskTool()],
  title: 'Strict',
  name: 'default',
  projectId: 'ppsg7ml5',
  dataset: 'test',
  schema: {types: schemaTypes},
})
