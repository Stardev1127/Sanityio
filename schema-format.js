//import {atLeast, atMost, required} from './sanity/validations'
//import {image, imageVersion, richText} from './sanity/types/bundled'

export default {
  //string: {},
  //object: {},
  //boolean: {},
  //number: {},
  latlon: {
    fields: {
      lat: {type: 'number'},
      lon: {type: 'number'}
    }
  },
  relation: {
    type: 'object',
    fields: {
      meta: {
        type: 'object'
      }
    }
  },
  //list: {
  //},
  //reference: {
  //},
  image: {
    fields: {
      fullsize: {type: 'string'},
      aspectRatio: {type: 'number'},
      versions: {
        type: 'list',
        of: [{type: 'imageVersion'}]
      }
    }
  },
  imageVersion: {
    fields: {
      width: {type: 'number'},
      square: {type: 'boolean'},
      url: {type: 'string'}
    }
  },
  //richText: {
  //},
  //person: {
  //},
  //tag: {
  //},
  client: {
    fields: {
      name: {
        type: 'string',
        title: 'Tittel',
        placeholder: 'Hva heter kunden?'
      },
      names: {
        type: 'list',
        title: 'Names',
        of: [{type: 'string'}]
      },
      tags: {
        type: 'tag',
        title: 'Tag',
        placeholder: 'Hva heter kunden?'
      }
    }
  },
  story: {
    fields: {
      title: {
        type: 'string',
        title: 'Tittel',
        placeholder: 'Slik får du tettere bart enn Poirot'
      },
      ingress: {
        type: 'richText',
        title: 'Ingress'
      },
      location: {
        type: 'latlon'
      },
      image: {
        type: 'image',
        title: 'Image'
      },
      client: {
        type: 'client',
        title: 'Klient'
      },
      mainImages: {
        title: 'Hovedbilder',
        description: 'Ett eller flere bilder som egner som til å fylle skjermen. NB: Kun første bilde vises foreløpig.',
        type: 'list',
        of: [
          {
            type: 'reference',
            to: [{type: 'image'}],
            meta: {type: 'imageMetadata'}
          },
          {type: 'tag'},
          {type: 'placeholder'},
          {
            type: 'list',
            of: [{type: 'string'}]
          }
        ]
      }
    }
  }
}
