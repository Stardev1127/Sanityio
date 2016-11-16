import test from './_util/test'
import inspect from 'object-inspect'
import {router, examples} from './examples'
import resolvePathFromState from '../src/resolvePathFromState'

examples.forEach(([path, state]) => {
  test(`state ${inspect(state)} produces path ${path}`, t => {
    t.same(resolvePathFromState(router, state), path)
  })
})
