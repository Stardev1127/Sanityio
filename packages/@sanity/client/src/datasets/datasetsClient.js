const assign = require('xtend/mutable')
const validate = require('../validators')

function DatasetsClient(client) {
  this.request = client.request.bind(client)
}

assign(DatasetsClient.prototype, {
  create(name) {
    return this._modify('PUT', name)
  },

  delete(name) {
    return this._modify('DELETE', name)
  },

  _modify(method, name) {
    validate.dataset(name)
    return this.request({method, uri: `/datasets/${name}`})
  }
})

module.exports = DatasetsClient
