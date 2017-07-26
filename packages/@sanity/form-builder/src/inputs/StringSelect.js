import PropTypes from 'prop-types'
import React from 'react'
import FormBuilderPropTypes from '../FormBuilderPropTypes'
import Select from 'part:@sanity/components/selects/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import RadioSelect from 'part:@sanity/components/selects/radio'
import PatchEvent, {set} from '../PatchEvent'

export default class StringSelect extends React.PureComponent {
  static displayName = 'StringSelect';

  static propTypes = {
    type: FormBuilderPropTypes.type.isRequired,
    level: PropTypes.number.isRequired,
    value: PropTypes.string,
    hasFocus: PropTypes.bool,
    onChange: PropTypes.func,
    onEnter: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    onChange() {},
    onEnter() {},
    onFocus() {}
  }

  constructor(props, context) {
    super(props, context)
    this.handleChange = this.handleChange.bind(this)
    this.setInputElement = this.setInputElement.bind(this)
    this.state = {
      hasFocus: this.props.hasFocus
    }
  }

  setInputElement(element) {
    this.inputElement = element
  }

  handleChange(item) {
    const {onChange} = this.props

    onChange(PatchEvent.from(set(typeof item === 'string' ? item : item.value)))
  }

  handleFocus = () => {
    this.setState({
      hasFocus: true
    })
  }

  handleBlur = () => {
    this.setState({
      hasFocus: false
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.props.onEnter()
    }
  }

  render() {
    const {value, type, level} = this.props

    // Support array of string if not objects
    let items = type.options.list

    if (typeof (items[0]) === 'string') {
      items = items.map(item => {
        return {
          title: item,
          value: item
        }
      })
    }

    const currentItem = items.find(item => {
      return item.value == value
    })

    if (type.options.layout == 'radio') {
      return (
        <Fieldset legend={type.title} level={level}>
          <RadioSelect
            name={type.name}
            items={items}
            onChange={this.handleChange}
            value={currentItem || items[0]}
            direction={type.options.direction || 'vertical'}
          />
        </Fieldset>
      )
    }

    return (
      <Select
        label={type.title}
        level={level}
        type="text"
        value={currentItem || items[0]}
        placeholder={type.placeholder}
        description={type.description}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        items={items}
        hasFocus={this.state.hasFocus}
        ref={this.setInputElement}
      />
    )
  }
}
