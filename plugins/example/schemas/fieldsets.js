export default {
  name: 'fieldsets',
  types: [
    {
      name: 'blogpost',
      type: 'object',
      displayField: 'author',
      fieldsets: [
        {
          name: 'headings',
          title: 'Headings'
        },
        {
          name: 'author',
          title: 'Author details'
        },
        {
          name: 'checkboxes',
          title: 'Checkbox Mc. Checkboxface'
        }
      ],
      fields: [
        {
          name: 'foo',
          title: 'Foo',
          type: 'string',
          fieldset: 'headings'
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          fieldset: 'headings'
        },
        {
          name: 'author',
          type: 'person',
          fieldset: 'author'
        },
        {
          name: 'murgh',
          type: 'string',
          title: 'Murgh'
        },
        {
          name: 'lead',
          title: 'Lead',
          type: 'text'
        },
        {
          name: 'check-one',
          title: 'Check one?',
          type: 'boolean',
          fieldset: 'checkboxes'
        },
        {
          name: 'check-two',
          title: 'Check two?',
          type: 'boolean',
          fieldset: 'checkboxes'
        },
        {
          name: 'check-three',
          title: 'Check three?',
          type: 'boolean',
          fieldset: 'checkboxes'
        },
        {
          name: 'content',
          type: 'array',
          of: [
            {
              title: 'String',
              type: 'string'
            }
          ]
        },
        {
          name: 'standalone-check',
          title: 'Standalone checkbox',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'person',
      type: 'object',
      fieldsets: [
        {
          name: 'basics',
          title: 'Basics'
        },
        {
          name: 'address',
          title: 'Address'
        }
      ],
      fields: [
        {name: 'firstname', type: 'string', title: 'First name', fieldset: 'basics'},
        {name: 'lastname', type: 'string', title: 'Last name', fieldset: 'basics'},
        {name: 'street', type: 'string', title: 'Street', fieldset: 'address'},
        {name: 'zip', type: 'string', title: 'Zip', fieldset: 'address'}
      ]
    }
  ]
}
