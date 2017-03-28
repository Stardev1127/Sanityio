import React from 'react'
import Undoable from './lib/Undoable'

import Schema from '@sanity/schema'
import {createFormBuilder} from '../../src'
import applyPatch from '../../src/simplePatch'

const schema = Schema.compile({
  name: 'simple',
  types: [
    {
      name: 'book',
      type: 'object',
      fields: [
        {
          name: 'title',
          type: 'string',
          title: 'Book title'
        },
        {
          name: 'author',
          type: 'string',
          title: 'Name of author'
        },
        {
          name: 'isbn',
          type: 'string',
          title: 'ISBN'
        }
      ]
    }
  ]
})

const FormBuilder = createFormBuilder({schema})

export default class SimpleExample extends React.Component {
  state = {
    value: new Undoable(FormBuilder.createEmpty('book')),
    shouldInspect: false
  }
  setValue(nextValue) {
    this.setState({
      value: this.state.value.set(nextValue)
    })
  }
  getValue() {
    return this.state.value.get()
  }
  handleChange = event => {
    this.setValue(applyPatch(this.getValue(), event.patch))
  }
  undo() {
    this.setState({
      value: this.state.value.undo()
    })
  }
  redo() {
    this.setState({
      value: this.state.value.redo()
    })
  }
  handleCommand = event => {
    const command = event.currentTarget.dataset.command
    switch (command) {
      case 'undo':
        this.undo()
        break
      case 'redo':
        this.redo()
        break
      case 'inspect':
        this.setState({shouldInspect: !this.state.shouldInspect})
        break
      default:
    }
  }
  render() {
    const {value, shouldInspect} = this.state
    return (
      <div style={{padding: 100}}>
        <div>
          <button onClick={this.handleCommand} data-command="undo" disabled={!value.canUndo}>Undo</button>
          <button onClick={this.handleCommand} data-command="redo" disabled={!value.canRedo}>Redo</button>
        </div>
        <FormBuilder value={value.get()} onChange={this.handleChange} />
        <div>
          <label>
            <input type="checkbox" checked={shouldInspect} onChange={this.handleCommand} data-command="inspect" />
            {' '} Inspect as you type
          </label>
        </div>
        {shouldInspect && (
          <pre>
            {JSON.stringify(value.get(), null, 2)}
          </pre>
        )}
      </div>
    )
  }
}
