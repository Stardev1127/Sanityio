import React, {PropTypes} from 'react'
import FormBuilderPropTypes from '../../FormBuilderPropTypes'
import RenderField from './RenderField'
import ObjectContainer from '../../state/ObjectContainer'
import Fieldset from '../../Fieldset'
import equals from 'shallow-equals'

export default class Obj extends React.Component {
  static displayName = 'Object'

  static valueContainer = ObjectContainer;

  static propTypes = {
    type: FormBuilderPropTypes.type,
    field: FormBuilderPropTypes.field,
    value: PropTypes.object,
    onChange: PropTypes.func
  };

  static defaultProps = {
    onChange() {}
  };

  static contextTypes = {
    resolveInputComponent: PropTypes.func,
    schema: PropTypes.object
  };

  constructor(props, context) {
    super(props, context)
    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.renderField = this.renderField.bind(this)
  }

  handleFieldChange(event, fieldName) {
    const {onChange} = this.props
    const patch = {[fieldName]: event.patch}
    onChange({patch})
  }

  shouldComponentUpdate(nextProps) {
    console.log('Object update?', !equals(this.props, nextProps))
    return !equals(this.props, nextProps)
  }

  renderField(field) {
    const {value} = this.props
    const fieldValue = value && value.getFieldValue(field.name)
    return (
      <RenderField
        key={field.name}
        fieldName={field.name}
        field={field}
        value={fieldValue}
        onChange={this.handleFieldChange}
      />
    )

  }

  renderFieldset(fieldset) {
    return (
      <Fieldset legend={fieldset.title}>
        {fieldset.fields.map(this.renderField)}
      </Fieldset>
    )
  }

  renderFieldsets(fieldsets) {
    return fieldsets.map(fieldset => {
      return fieldset.lonely ? this.renderField(fieldset.field) : this.renderFieldset(fieldset)
    })
  }

  render() {
    const {type, field} = this.props
    return (
      <div>
        {this.renderFieldsets(type.fieldsets)}
      </div>
    )
  }
}
