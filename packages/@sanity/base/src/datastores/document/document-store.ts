import {SanityClient} from '@sanity/client'
import {Schema} from '@sanity/types'
import {Observable} from 'rxjs'
import {Template} from '@sanity/initial-value-templates'
import {getDraftId, isDraftId} from '../../util/draftUtils'
import {HistoryStore} from '../history'
import {DocumentPreviewStore} from '../../preview'
import createDeprecatedAPIs from './_createDeprecatedAPIs'
import {checkoutPair, DocumentVersionEvent, Pair} from './document-pair/checkoutPair'
import {consistencyStatus} from './document-pair/consistencyStatus'
import {documentEvents} from './document-pair/documentEvents'
import {editOperations} from './document-pair/editOperations'
import {editState, EditStateFor} from './document-pair/editState'
import {getOperationEvents, OperationError, OperationSuccess} from './document-pair/operationEvents'
import {OperationsAPI} from './document-pair/operations'
import {validation, ValidationStatus} from './document-pair/validation'
import {listenQuery, ListenQueryOptions} from './listenQuery'
import {resolveTypeForDocument} from './resolveTypeForDocument'
import {IdPair} from './types'
import {getInitialValueStream, InitialValueMsg, InitialValueOptions} from './initialValue'

type QueryParams = Record<string, string | number | boolean | string[]>

function getIdPairFromPublished(publishedId: string): IdPair {
  if (isDraftId(publishedId)) {
    throw new Error('editOpsOf does not expect a draft id.')
  }

  return {publishedId, draftId: getDraftId(publishedId)}
}

export interface DocumentStore {
  checkoutPair: (idPair: IdPair) => Pair
  initialValue: (opts: InitialValueOptions) => Observable<InitialValueMsg>
  listenQuery: (query: string, params: QueryParams, options: ListenQueryOptions) => Observable<any>
  resolveTypeForDocument: (id: string, specifiedType?: string) => Observable<string>

  pair: {
    consistencyStatus: (publishedId: string, type: string) => Observable<boolean>
    documentEvents: (publishedId: string, type: string) => Observable<DocumentVersionEvent>
    editOperations: (publishedId: string, type: string) => Observable<OperationsAPI>
    editState: (publishedId: string, type: string) => Observable<EditStateFor>
    operationEvents: (
      publishedId: string,
      type: string
    ) => Observable<OperationSuccess | OperationError>
    validation: (publishedId: string, type: string) => Observable<ValidationStatus>
  }
}

export function createDocumentStore(
  client: SanityClient,
  documentPreviewStore: DocumentPreviewStore,
  historyStore: HistoryStore,
  schema: Schema,
  initialValueTemplates: Template[]
): DocumentStore {
  const versionedClient = client.withConfig({
    apiVersion: '2021-12-01',
  })

  const ctx = {client, documentPreviewStore, historyStore, schema}

  const operationEvents = getOperationEvents(ctx)

  return {
    // Todo: can be removed in ~january 2020
    ...createDeprecatedAPIs(versionedClient),

    // Public API
    checkoutPair(idPair) {
      return checkoutPair(versionedClient, idPair)
    },
    initialValue(opts) {
      return getInitialValueStream(schema, initialValueTemplates, documentPreviewStore, opts)
    },
    listenQuery(query, params, options) {
      return listenQuery(versionedClient, query, params, options)
    },
    resolveTypeForDocument(id, specifiedType) {
      return resolveTypeForDocument(versionedClient, id, specifiedType)
    },
    pair: {
      consistencyStatus(publishedId, type) {
        return consistencyStatus(ctx.client, getIdPairFromPublished(publishedId), type)
      },
      documentEvents(publishedId, type) {
        return documentEvents(ctx.client, getIdPairFromPublished(publishedId), type)
      },
      editOperations(publishedId, type) {
        return editOperations(ctx, getIdPairFromPublished(publishedId), type)
      },
      editState(publishedId, type) {
        return editState(ctx, getIdPairFromPublished(publishedId), type)
      },
      operationEvents(publishedId, type) {
        return operationEvents(getIdPairFromPublished(publishedId), type)
      },
      validation(publishedId, type) {
        return validation(ctx, getIdPairFromPublished(publishedId), type)
      },
    },
  }
}
