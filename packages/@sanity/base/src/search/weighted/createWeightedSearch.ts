/* eslint-disable import/prefer-default-export */
import type {SanityClient} from '@sanity/client'
import type {ObjectSchemaType} from '@sanity/types'
import type {Observable} from 'rxjs'
import {compact, toLower, flatten, uniq, flow, sortBy, union} from 'lodash'
import {map} from 'rxjs/operators'
import {joinPath} from '../../util/searchUtils'
import {removeDupes} from '../../util/draftUtils'
import {tokenize} from '../common/tokenize'
import {applyWeights} from './applyWeights'
import {WeightedHit, WeightedSearchOptions, SearchOptions, SearchHit} from './types'

const combinePaths = flow([flatten, union, compact])

const toGroqParams = (terms: string[]): Record<string, string> => {
  const params: Record<string, string> = {}
  return terms.reduce((acc, term, i) => {
    acc[`t${i}`] = `${term}*` // "t" is short for term
    return acc
  }, params)
}

export function createWeightedSearch(
  types: ObjectSchemaType[],
  client: SanityClient,
  options: WeightedSearchOptions = {}
): (query: string) => Observable<WeightedHit[]> {
  const {filter, params, tag} = options
  const searchSpec = types.map((type) => ({
    typeName: type.name,
    paths: type.__experimental_search.map((config) => ({
      weight: config.weight,
      path: joinPath(config.path),
    })),
  }))

  const combinedSearchPaths = combinePaths(
    searchSpec.map((configForType) => configForType.paths.map((opt) => opt.path))
  )

  const selections = searchSpec.map(
    (spec) =>
      `_type == "${spec.typeName}" => {${spec.paths.map((cfg, i) => `"w${i}": ${cfg.path}`)}}`
  )

  // this is the actual search function that takes the search string and returns the hits
  return function search(queryString: string, searchOpts: SearchOptions = {}) {
    const terms = uniq(compact(tokenize(toLower(queryString))))
    const constraints = terms
      .map((term, i) => combinedSearchPaths.map((joinedPath) => `${joinedPath} match $t${i}`))
      .filter((constraint) => constraint.length > 0)

    const filters = [
      '_type in $__types',
      searchOpts.includeDrafts === false && `!(_id in path('drafts.**'))`,
      ...constraints.map((constraint) => `(${constraint.join('||')})`),
      filter ? `(${filter})` : '',
    ].filter(Boolean)

    const selection = selections.length > 0 ? `...select(${selections.join(',\n')})` : ''
    const query = `*[${filters.join('&&')}][0...$__limit]{_type, _id, ${selection}}`

    return client.observable
      .fetch(
        query,
        {
          ...toGroqParams(terms),
          __types: searchSpec.map((spec) => spec.typeName),
          __limit: 1000,
          ...(params || {}),
        },
        {tag}
      )
      .pipe(
        map(removeDupes),
        map((hits: SearchHit[]) => applyWeights(searchSpec, hits, terms)),
        map((hits) => sortBy(hits, (hit) => -hit.score)),
        map((hits) => hits.slice(0, 100))
      )
  }
}
