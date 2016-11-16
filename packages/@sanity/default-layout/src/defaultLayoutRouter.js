import {route} from 'part:@sanity/base/router'
import tools from 'all:part:@sanity/base/tool'

export default route('/', route('/:tool', params => {
  const tool = tools.find(tool => tool.name === params.tool)
  return route.scope(tool.name, '/', tool.router)
}))
