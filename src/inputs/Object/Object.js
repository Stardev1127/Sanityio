import React, {PropTypes} from 'react'
import FormBuilderPropTypes from '../../FormBuilderPropTypes'
import RenderField from './RenderField'
import ObjectContainer from './ObjectContainer'
import Fieldset, {FieldWrapper} from 'part:@sanity/components/fieldsets/default'
import equals from 'shallow-equals'


export default class Obj extends React.Component {
  static displayName = 'Object'

  static valueContainer = ObjectContainer;

  static propTypes = {
    type: FormBuilderPropTypes.type,
    field: FormBuilderPropTypes.field,
    validation: PropTypes.shape(FormBuilderPropTypes.validation),
    value: PropTypes.object,
    focus: PropTypes.bool,
    onChange: PropTypes.func,
    onEnter: PropTypes.func,
    level: PropTypes.number,
    isRoot: PropTypes.bool
  };

  static defaultProps = {
    onChange() {},
    onEnter() {},
    level: 0
  };

  static contextTypes = {
    resolveInputComponent: PropTypes.func,
    schema: PropTypes.object
  };

  constructor(props, context) {
    super(props, context)
    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleFieldEnter = this.handleFieldEnter.bind(this)
  }

  handleFieldChange(event, fieldName) {
    const {onChange} = this.props
    const patch = {[fieldName]: event.patch}
    onChange({patch})
  }

  handleFieldEnter(event, fieldName) {
    this.props.onEnter(fieldName)
  }

  shouldComponentUpdate(nextProps) {
    return !equals(this.props, nextProps)
  }

  renderField(field, level, index) {
    const {value, focus, validation} = this.props
    const fieldValidation = validation && validation.fields[field.name]

    const fieldValue = value.getFieldValue(field.name)

    return (
      <RenderField
        key={field.name}
        focus={focus && index === 0}
        fieldName={field.name}
        field={field}
        value={fieldValue}
        onChange={this.handleFieldChange}
        onEnter={this.handleFieldEnter}
        validation={fieldValidation}
        level={level}
      />
    )
  }

  renderFieldset(fieldset, index) {
    const {level} = this.props
    const columns = fieldset.options && fieldset.options.columns
    return (
      <Fieldset
        key={fieldset.name}
        legend={fieldset.title}
        description={fieldset.description}
        level={level}
        columns={columns}
      >
        {fieldset.fields.map((field, fieldIndex) => {
          return (
            <FieldWrapper key={fieldIndex}>
              {this.renderField(field, level + 1, index + fieldIndex)}
            </FieldWrapper>
          )
        })}
      </Fieldset>
    )
  }

  render() {
    const {isRoot, field, type, level} = this.props

    const renderedFields = type.fieldsets.map((fieldset, i) => {
      return fieldset.single
            ? this.renderField(fieldset.field, level, i)
            : this.renderFieldset(fieldset, i)
    })

    if (isRoot) {
      return <div>{renderedFields}</div>
    }

    return (
      <Fieldset legend={field.title} description={field.description}>
        {renderedFields}
      </Fieldset>
    )
  }
}
