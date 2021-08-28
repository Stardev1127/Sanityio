/// <reference types="@sanity/types/parts" />

import {Rule, SanityDocument, Schema} from '@sanity/types'
import createSchema from 'part:@sanity/base/schema-creator'
import validateDocument, {resolveTypeForArrayItem} from './validateDocument'

describe('validateDocument', () => {
  it('takes in a document + a compiled schema and returns a list of validation markers', async () => {
    const schema = createSchema({
      types: [
        {
          name: 'simpleDoc',
          type: 'document',
          title: 'Simple Document',
          fields: [
            {
              name: 'title',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
          ],
        },
      ],
    })

    const document: SanityDocument = {
      _id: 'testId',
      _createdAt: '2021-08-27T14:48:51.650Z',
      _rev: 'exampleRev',
      _type: 'simpleDoc',
      _updatedAt: '2021-08-27T14:48:51.650Z',
      title: null,
    }

    const result = await validateDocument(document, schema)
    expect(result).toMatchObject([
      {
        type: 'validation',
        level: 'error',
        item: {
          message: 'Expected type "String", got "null"',
          paths: [],
        },
        path: ['title'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {
          message: 'Required',
          paths: [],
        },
        path: ['title'],
      },
    ])
  })

  it('should be able to resolve an array item type if there is just one type', async () => {
    const schema = createSchema({
      types: [
        {
          name: 'testDoc',
          type: 'document',
          title: 'Test Document',
          fields: [
            {
              name: 'values',
              type: 'array',
              // note that there is only one type available
              of: [{type: 'arrayItem'}],
              validation: (rule: Rule) => rule.required(),
            },
          ],
        },
        {
          name: 'arrayItem',
          type: 'object',
          fields: [{name: 'title', type: 'string'}],
        },
      ],
    })

    const document: SanityDocument = {
      _id: 'testId',
      _createdAt: '2021-08-27T14:48:51.650Z',
      _rev: 'exampleRev',
      _type: 'testDoc',
      _updatedAt: '2021-08-27T14:48:51.650Z',
      values: [
        {
          // note how this doesn't have a _type
          title: 5,
          _key: 'exampleKey',
        },
      ],
    }

    await expect(validateDocument(document, schema)).resolves.toEqual([
      {
        type: 'validation',
        level: 'error',
        item: {
          message: 'Expected type "String", got "Number"',
          paths: [],
        },
        path: ['values', {_key: 'exampleKey'}, 'title'],
      },
    ])
  })

  it("runs nested validation on an undefined value if it's required", async () => {
    const validation = (rule: Rule) => [
      rule.required().error('This is required!'),
      rule.max(160).warning('Too long!'),
    ]

    const schema = createSchema({
      types: [
        {
          name: 'testDoc',
          type: 'document',
          title: 'Test Document',
          fields: [
            {name: 'registeredString', type: 'registeredString'},
            {name: 'inlineString', type: 'string', validation},
            {
              name: 'registeredObject',
              type: 'registeredObjectField',
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'inlineObject',
              type: 'object',
              fields: [{name: 'foo', type: 'string', validation}],
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'notRequiredRegisteredObject',
              type: 'registeredObjectField',
            },
            {
              name: 'notRequiredInlineObject',
              type: 'object',
              fields: [{name: 'foo', type: 'string', validation}],
            },
          ],
        },
        {name: 'registeredString', type: 'string', validation},
        {
          name: 'registeredObjectField',
          type: 'object',
          fields: [{name: 'foo', type: 'string', validation}],
        },
      ],
    })

    const document: SanityDocument = {
      _id: 'testId',
      _createdAt: '2021-08-27T14:48:51.650Z',
      _rev: 'exampleRev',
      _type: 'testDoc',
      _updatedAt: '2021-08-27T14:48:51.650Z',
    }

    await expect(validateDocument(document, schema)).resolves.toMatchObject([
      {
        type: 'validation',
        level: 'error',
        item: {message: 'This is required!'},
        path: ['registeredString'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {message: 'This is required!'},
        path: ['inlineString'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {message: 'Required'},
        path: ['registeredObject'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {message: 'This is required!'},
        path: ['registeredObject', 'foo'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {message: 'Required'},
        path: ['inlineObject'],
      },
      {
        type: 'validation',
        level: 'error',
        item: {message: 'This is required!'},
        path: ['inlineObject', 'foo'],
      },
    ])
  })
})

describe('resolveTypeForArrayItem', () => {
  const schema: Schema = createSchema({
    types: [
      {
        name: 'foo',
        type: 'object',
        fields: [{name: 'title', type: 'number'}],
      },
      {
        name: 'bar',
        type: 'object',
        fields: [{name: 'title', type: 'string'}],
      },
    ],
  })

  const fooType = schema.get('foo')
  const barType = schema.get('bar')

  it('finds a matching schema type for an array item value given a list of candidate types', () => {
    const resolved = resolveTypeForArrayItem(
      {
        _type: 'bar',
        _key: 'exampleKey',
        title: 5,
      },
      [fooType, barType]
    )

    expect(resolved).toBe(barType)
  })

  it('assumes the type if there is only one possible candidate', () => {
    const resolved = resolveTypeForArrayItem(
      {
        // notice no _type
        _key: 'exampleKey',
        title: 5,
      },
      [fooType]
    )

    expect(resolved).toBe(fooType)
  })
})
