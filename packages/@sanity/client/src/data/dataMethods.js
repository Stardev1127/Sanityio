const assign = require('xtend/mutable')
const validators = require('../validators')
const encodeQueryString = require('./encodeQueryString')
const Transaction = require('./transaction')
const Patch = require('./patch')

const mutationDefaults = {returnIds: true}
const getQuerySizeLimit = 1948

module.exports = {
  fetch(query, params) {
    return this.dataRequest('query', {query, params}).then(res => res.result || [])
  },

  getDocument(id) {
    return this.request({
      uri: `/data/doc/${id}`,
      json: true
    }).then(res => res.documents && res.documents[0])
  },

  create(doc) {
    return this._create(doc, 'create')
  },

  createIfNotExists(doc) {
    return this._create(doc, 'createIfNotExists')
  },

  createOrReplace(doc) {
    return this._create(doc, 'createOrReplace')
  },

  patch(documentId, operations) {
    validators.validateDocumentId('patch', documentId)
    return new Patch(documentId, operations, this)
  },

  delete(documentId) {
    validators.validateDocumentId('delete', documentId)
    return this.dataRequest('mutate', {delete: {id: documentId}})
  },

  mutate(mutations) {
    return this.dataRequest('mutate',
      mutations instanceof Patch
        ? mutations.serialize()
        : mutations
    )
  },

  transaction(operations) {
    return new Transaction(operations, this)
  },

  dataRequest(endpoint, body) {
    const isMutation = endpoint === 'mutate'

    // Check if the query string is within a configured threshold,
    // in which case we can use GET. Otherwise, use POST.
    const strQuery = !isMutation && encodeQueryString(body)
    const useGet = !isMutation && strQuery.length < getQuerySizeLimit
    const stringQuery = useGet ? strQuery : ''

    return validators.promise.hasDataset(this.clientConfig)
      .then(dataset => this.request({
        method: useGet ? 'GET' : 'POST',
        uri: `/data/${endpoint}/${dataset}${stringQuery}`,
        json: true,
        body: useGet ? undefined : body,
        query: isMutation && mutationDefaults
      }))
  },

  _create(doc, op) {
    const dataset = validators.hasDataset(this.clientConfig)
    const mutation = {[op]: assign({}, doc, {_id: doc._id || `${dataset}/`})}
    return this.dataRequest('mutate', mutation).then(res => ({
      transactionId: res.transactionId,
      documentId: res.createdIds ? res.createdIds[0] : res.updatedIds[0]
    }))
  }
}
