export default class DefaultContainer {
  static passSerialized = true;

  static deserialize(rawValue, context) {
    return new DefaultContainer(rawValue, context)
  }

  constructor(value, context) {
    this.value = value
    this.context = context
  }

  patch(patch) {
    if (patch.hasOwnProperty('$set')) {
      return new DefaultContainer(patch.$set, this.context)
    }
    if (patch.hasOwnProperty('$delete')) {
      return new DefaultContainer(undefined, this.context)
    }
    throw new Error(`Only $set and $delete is supported by default value container, got: ${JSON.stringify(patch)}`)
  }

  validate() {
    const messages = this.context.field.required && this.value === undefined && [{
      id: 'errors.fieldIsRequired',
      type: 'error',
      message: 'Field is required'
    }]

    return {messages: messages || []}
  }

  serialize() {
    return this.value
  }

  isEmpty() {
    return this.value === undefined
  }

  toJSON() {
    return this.serialize()
  }
}
