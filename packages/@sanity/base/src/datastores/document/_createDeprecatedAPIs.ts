/* eslint-disable @typescript-eslint/no-use-before-define */
import {SanityClient} from '@sanity/client'
import {SanityDocument} from '@sanity/types'
import {Observable, defer, of as observableOf} from 'rxjs'
import {concatMap, map, share} from 'rxjs/operators'
import {createBufferedDocument} from './buffered-doc/createBufferedDocument'
import {WelcomeEvent} from './types'

function fetchDocumentSnapshot(client: SanityClient, id: string) {
  return client.observable.getDocument(id).pipe(
    map((document) => ({
      type: 'snapshot',
      document: document,
    }))
  )
}

export interface QuerySnapshotEvent {
  type: 'snapshot'
  documents: SanityDocument[]
}

type QueryEvent = WelcomeEvent | MutationEvent | QuerySnapshotEvent

function commitMutations(client: SanityClient, mutations: any[]) {
  return client.dataRequest('mutate', mutations, {
    visibility: 'async',
    returnDocuments: false,
  })
}

function _createDeprecatedAPIs(client: SanityClient) {
  const _doCommit = (mutations: any[]) => commitMutations(client, mutations)

  function patchDoc(documentId: string, patches: any[]) {
    const doc = checkout(documentId)
    doc.patch(patches)
    return doc.commit()
  }

  function deleteDoc(documentId: string) {
    const doc = checkout(documentId)
    doc.delete()
    doc.commit()
  }

  function checkout(documentId: string) {
    const serverEvents$ = client
      .listen(
        '*[_id == $id]',
        {id: documentId},
        {includeResult: false, events: ['welcome', 'mutation', 'reconnect']}
      )
      .pipe(
        concatMap((event: any) => {
          return event.type === 'welcome'
            ? fetchDocumentSnapshot(client, documentId)
            : observableOf(event)
        }),
        share()
      )

    return createBufferedDocument(documentId, serverEvents$ as any, _doCommit as any)
  }

  function byId(documentId: string) {
    return checkout(documentId).events
  }

  function byIds(documentIds: string[]) {
    return new Observable((observer) => {
      const documentSubscriptions = documentIds.map((id) => byId(id).subscribe(observer))

      return () => {
        documentSubscriptions.map((subscription) => subscription.unsubscribe())
      }
    })
  }

  function create(document: Omit<Partial<SanityDocument>, '_type'> & {_type: string}) {
    return client.observable.create(document)
  }

  function createIfNotExists(document: SanityDocument) {
    return client.observable.createIfNotExists(document)
  }

  function createOrReplace(document: SanityDocument) {
    return client.observable.createOrReplace(document)
  }

  function fetchQuerySnapshot(
    groqQuery: string,
    params: Record<string, unknown>
  ): Observable<QuerySnapshotEvent> {
    return client.observable.fetch(groqQuery, params).pipe(
      map((documents) => ({
        type: 'snapshot',
        documents: documents,
      }))
    )
  }

  function query(groqQuery: string, params: Record<string, unknown>): Observable<QueryEvent> {
    return defer(
      () =>
        client.observable.listen(groqQuery, params || {}, {
          includeResult: false,
          events: ['welcome', 'mutation', 'reconnect'],
        }) as Observable<WelcomeEvent | MutationEvent>
    ).pipe(
      concatMap((event) => {
        return event.type === 'welcome'
          ? fetchQuerySnapshot(groqQuery, params)
          : observableOf(event)
      })
    )
  }

  return {
    byId,
    byIds,
    create,
    checkout,
    query,
    patch: patchDoc,
    delete: deleteDoc,
    createOrReplace: createOrReplace,
    createIfNotExists: createIfNotExists,
  }
}

function deprecate(name: string, fn: any) {
  return (...args: any[]) => {
    console.warn(
      'The `documentStore.%s()-method is deprecated and should not be relied upon. Please use checkoutPair() or listenQuery() instead.',
      name
    )
    return fn(...args)
  }
}

function mapObj(obj: Record<string, unknown>, mapFn: (v: any, k: string) => any) {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    acc[key] = mapFn(obj[key], key)
    return acc
  }, {})
}

export default function createDeprecatedAPIs(client: SanityClient) {
  return mapObj(_createDeprecatedAPIs(client), (fn, key) => deprecate(key, fn))
}
