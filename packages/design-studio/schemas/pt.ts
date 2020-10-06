const objectExample = {
  type: 'object',
  name: 'objectExample',
  title: 'Object (1)',
  fields: [{type: 'string', name: 'title', title: 'Title'}]
}

const imageExample = {
  type: 'image',
  name: 'imageExample',
  title: 'Image example',
  options: {
    hotspot: true
  }
}

export default {
  type: 'document',
  name: 'pt',
  title: 'Portable Text™',
  fields: [
    {
      type: 'string',
      name: 'title',
      title: 'Title'
    },
    {
      type: 'array',
      name: 'pt',
      title: 'Portable text',
      of: [
        {
          type: 'block',
          of: [{...objectExample, validation: Rule => Rule.required()}],
          marks: {
            annotations: [
              {
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: Rule => Rule.required()
                  }
                ]
              }
            ]
          }
        },
        imageExample,
        objectExample
      ]
    }
  ]
}
