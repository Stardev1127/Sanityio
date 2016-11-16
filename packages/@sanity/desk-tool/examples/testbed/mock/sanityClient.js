import {range} from 'lodash'
import {Patch} from '@sanity/client'
import Observable from 'zen-observable'

function generateId(n) {
  return ((n + 1) / 1.1111111111111).toString(32).substring(2)
}

function createDoc(_type, fields) {
  return Object.assign({_type}, fields)
}
function createBlogPost(number) {
  return createDoc('exampleBlog.blogpost', {
    title: `Blogpost ${number}`
  })
}
function createAuthor(number) {
  return createDoc('exampleBlog.author', {
    name: `Author ${number}`
  })
}


function createDB() {
  const docs = []
  const index = {}
  return {
    create,
    getById,
    getAll() {
      return docs.slice()
    },
    patch(patch) {
      // Todo: apply patch locally, then call update(patch.id, newDocument)
    }
  }
  function indexOf(id) {
    return index[id]
  }
  // keep for later
  function update(_id, document) { // eslint-disable-line no-unused-vars
    const idx = indexOf(_id)
    docs[idx] = document
  }
  function getById(id) {
    return docs[indexOf(id)]
  }
  function create(doc) {
    if (doc._id) {
      throw new Error('Cannot create document with an id')
    }
    const nextIdx = docs.length
    const _id = `public/${generateId(nextIdx)}`
    const storedDoc = Object.assign({}, doc, {_id})
    docs.push(storedDoc)
    index[_id] = nextIdx
    return storedDoc
  }
}

const DB = createDB()
range(5)
  .map(createAuthor)
  .map(DB.create)

range(20)
  .map(createBlogPost)
  .map(DB.create)

export default {
  fetch(query) {
    const [type] = query.split(' ')
    return Promise.resolve(DB.getAll().filter(doc => doc._type === type))
  },
  getDocument(id) {
    return Promise.resolve(DB.getById(id))
  },
  create(doc) {
    return Promise.resolve({documentId: DB.create(doc)._id})
  },
  patch(id, operations) {
    return new Patch(id, operations, this)
  },
  listen() {
    return new Observable(observer => {

    })
  },
  mutate(spec) {
    return Promise.resolve(DB.patch(spec.patch))
  }
}
