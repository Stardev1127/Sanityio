# Form Builder

## Big fat disclaimer: Work in progress

There is an example of a consumer app in the `./example` that can be started with `npm start`

## Limitations

Polymorphic arrays may only contain elements of one primitive type. Thus, this is invalid:

```json
{
  "myType": {
    "type": "array",
    "of": [
      {"type": "string", "title": "Street"},
      {"type": "string", "title": "E-mail"}
    ]
  }
}
```

## Terminology

### Type
Types are the building blocks for your schema. A type defines the structure and behavior of your data model.

There is a distiction between _primitive types_ and _container types_.

A container type is a type that contains data of other types, e.g. `array` or `object`. A primitive type only represents one simple value, like the number `3` or the string `foobar`


### Field
If you define an object type, you must also define its fields. E.g. if you are defining a `person` type, it may look like this:

```json
{
  "type": "object",
  "fields": {
    "firstName": {
      "title": "First name",
      "type": "string"
    },
    "lastName": {
      "title": "Last name",
      "type": "string"
    }
  }
}
```

## Input widgets

All input fields must follow a simple convention based protocol.
Every input field must:
 - Accept a `value` prop which is the field's value
 - Accept an `onChange` function as prop which is called whenever a value changes


## Schema
When writing a schema, `type` is implicitly `object`, unless otherwise specified. You're not allowed to set type: 'object' (redundant definition).

Only built-in types can take options. Below, `email.placeholder` is an option to `string` and `versions.of` is an option to `list`.

```
user: {
  fields: {
    email: {
      type: 'string',
      title: 'E-mail address',
      placeholder: 'murgh@example.com'
    },
    profilePicture: {
      'type', 'image'
    },
  }
},

image: {
  fields: {
    fullSizeUrl: {type: 'string'},
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
```




## Considerations / todo
 - Support for collaborative editing
 - Powerful validation rules
 - i18n
 - List item edit modality
 - Styling
