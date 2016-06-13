import {clone, keyBy} from 'lodash'
import {createFieldValue} from '../../state/FormBuilderState'
import {getFieldType} from '../../utils/getFieldType'

export default class ObjectContainer {

  static deserialize(serialized = {}, context) {
    const {field, schema, resolveContainer} = context
    const type = getFieldType(schema, field)
    const deserialized = {$type: field.type}

    type.fields.forEach(fieldDef => {
      deserialized[fieldDef.name] = createFieldValue(serialized[fieldDef.name], {field: fieldDef, schema, resolveContainer})
    })
    return new ObjectContainer(deserialized, context)
  }

  constructor(value, context) {
    this.context = context
    this.value = value
  }

  getFieldValue(fieldName) {
    return this.value[fieldName]
  }

  patch(patch) {
    const {value, context} = this
    const {field, schema, resolveContainer} = context

    const type = getFieldType(schema, field)
    const newVal = value ? clone(value) : {$type: type.name}

    if (patch.hasOwnProperty('$set')) {
      return ObjectContainer.deserialize(patch.$set, context)
    }

    const keyedFields = keyBy(type.fields, 'name')

    Object.keys(patch).forEach(keyName => {
      if (!keyedFields.hasOwnProperty(keyName)) {
        throw new Error(`Type ${type.name} has no field named ${keyName}`)
      }

      const fieldDef = keyedFields[keyName]

      if (!newVal.hasOwnProperty(keyName)) {
        newVal[keyName] = createFieldValue(void 0, {field: fieldDef, schema: context.schema, resolveContainer})
      }
      newVal[keyName] = newVal[keyName].patch(patch[keyName])
    })
    return new ObjectContainer(newVal, context)
  }

  validate() {
    const {field, schema} = this.context

    if (field.required && this.value === undefined) {
      return {messages: [{
        id: 'errors.fieldIsRequired',
        type: 'error',
        message: 'Field is required'
      }]}
    }

    const type = getFieldType(schema, field)
    const fieldValidation = {}

    type.fields.forEach(typeField => {
      const fieldValue = this.getFieldValue(typeField.name)
      const validation = fieldValue.validate()
      if (validation) {
        fieldValidation[typeField.name] = validation
      }
    })

    return {
      messages: [],
      fields: fieldValidation
    }
  }

  serialize() {
    const {field, schema} = this.context
    const type = getFieldType(schema, field)

    const serialized = type.fields.reduce((acc, typeField) => {
      const serializedFieldValue = this.getFieldValue(typeField.name).serialize()
      if (serializedFieldValue !== undefined) {
        acc[typeField.name] = serializedFieldValue
      }
      return acc
    }, {})

    return Object.keys(serialized).length
      ? Object.assign({$type: field.type}, serialized)
      : undefined
  }

  isEmpty() {
    const {field, schema} = this.context
    const type = getFieldType(schema, field)

    return type.fields.every(typeField => this.getFieldValue(typeField.name).isEmpty())
  }

  toJSON() {
    return this.serialize()
  }
}
