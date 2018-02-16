//@flow
import React from 'react'
import TextInput from 'part:@sanity/components/textinputs/default'
import FormField from 'part:@sanity/components/formfields/default'
import PatchEvent, {set, unset} from '../PatchEvent'
import type {Type} from '../typedefs'

type Props = {
  type: Type,
  level: number,
  value: ?string,
  readOnly: ?boolean,
  onChange: PatchEvent => void
}

export default class NumberInput extends React.Component<Props> {
  _input: ?TextInput

  handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value
    this.props.onChange(PatchEvent.from(nextValue === '' ? unset() : set(Number(nextValue))))
  }

  focus() {
    if (this._input) {
      this._input.focus()
    }
  }

  setInput = (input: ?TextInput) => {
    this._input = input
  }

  render() {
    const {value = '', readOnly, type, level, ...rest} = this.props

    return (
      <FormField
        level={level}
        label={type.title}
        description={type.description}
      >
        <TextInput
          {...rest}
          type="number"
          value={value}
          readOnly={readOnly}
          placeholder={type.placeholder}
          onChange={this.handleChange}
          ref={this.setInput}
        />
      </FormField>
    )
  }
}
