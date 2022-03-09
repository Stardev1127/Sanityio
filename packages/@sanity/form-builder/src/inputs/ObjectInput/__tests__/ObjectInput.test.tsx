// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/extend-expect'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ForwardedRef, forwardRef, useMemo} from 'react'
import {LayerProvider, studioTheme, ThemeProvider} from '@sanity/ui'
import Schema from '@sanity/schema'
import {SchemaType} from '@sanity/types'
import {ObjectInput, ObjectInputProps} from '../ObjectInput'
import FormBuilderProvider from '../../../FormBuilderProvider'
import is from '../../../utils/is'
import {ReviewChangesContextProvider} from '../../../sanity/contexts/reviewChanges/ReviewChangesProvider'
import {createPatchChannel} from '../../../patchChannel'

const schema = Schema.compile({
  name: 'test',
  types: [
    {
      title: 'Collapsible test',
      name: 'collapsibleTest',
      type: 'object',
      fields: [
        {
          name: 'collapsibleAndCollapsedByDefault',
          type: 'object',
          options: {collapsible: true, collapsed: true},
          fields: [{name: 'field1', type: 'string'}],
        },
      ],
    },
    {
      title: 'Focus test',
      name: 'focusTest',
      type: 'object',
      fields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'focusTest',
          type: 'object',
          fields: [{name: 'field1', type: 'string'}],
        },
      ],
    },
    {
      title: 'Hidden test',
      name: 'hiddenTest',
      type: 'object',
      fields: [
        {
          name: 'thisIsVisible',
          type: 'string',
        },
        {
          name: 'thisIsHidden',
          type: 'string',
          hidden: true,
        },
        {
          name: 'thisMayBeVisible',
          type: 'string',
        },
      ],
    },
  ],
})

const GenericInput = forwardRef(function GenericInput(props: any, ref: ForwardedRef<any>) {
  return <input type="string" ref={ref} onFocus={props.onFocus} />
})

const GenericPreview = function GenericPreview(props: any) {
  return <div />
}

function inputResolver(type: SchemaType) {
  if (is('object', type)) {
    return ObjectInput
  }
  return GenericInput
}

const DEFAULT_PROPS = {
  onFocus: jest.fn(),
  onBlur: jest.fn(),
  onChange: jest.fn(),
  validation: [],
  level: 0,
  presence: [],
}

const ObjectInputTester = forwardRef(function ObjectInputTester(
  props: Partial<Omit<ObjectInputProps, 'type'>> & {type: ObjectInputProps['type']},
  ref: ForwardedRef<any>
) {
  const patchChannel = useMemo(() => createPatchChannel(), [])

  return (
    <ThemeProvider scheme="light" theme={studioTheme}>
      <LayerProvider>
        <ReviewChangesContextProvider changesOpen={false}>
          <FormBuilderProvider
            value={undefined}
            __internal_patchChannel={patchChannel}
            schema={schema}
            filterField={() => true}
            resolveInputComponent={inputResolver}
            resolvePreviewComponent={(type) => GenericPreview}
          >
            <ObjectInput {...DEFAULT_PROPS} {...props} focusPath={[]} ref={ref} />
          </FormBuilderProvider>
        </ReviewChangesContextProvider>
      </LayerProvider>
    </ThemeProvider>
  )
})

const TOGGLE_BUTTON_SELECTOR = 'legend div'

describe('collapsible behavior', () => {
  it('does not render collapsible fields on objects configured with collapsed: true', () => {
    const {queryByTestId} = render(
      <ObjectInputTester type={schema.get('collapsibleTest')} focusPath={[]} />
    )
    expect(queryByTestId('input-field1')).toBeNull()
  })

  it('renders collapsible fields with collapsed: true if given a focus path that targets it', () => {
    const {queryByTestId} = render(
      <ObjectInputTester
        type={schema.get('collapsibleTest')}
        focusPath={['collapsibleAndCollapsedByDefault', 'field1']}
      />
    )
    expect(queryByTestId('input-field1')).toBeVisible()
  })

  it('toggles the collapsible field when clicking the expand/collapse button', () => {
    const firstFieldPath = ['collapsibleAndCollapsedByDefault', 'field1']
    const onFocus = jest.fn()
    const {container, queryByTestId, rerender} = render(
      <ObjectInputTester level={0} onFocus={onFocus} type={schema.get('collapsibleTest')} />
    )
    expect(queryByTestId('input-field1')).toBeNull()
    const button = container.querySelector(TOGGLE_BUTTON_SELECTOR)!
    userEvent.click(button)
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledWith(firstFieldPath)
    rerender(
      <ObjectInputTester
        level={0}
        focusPath={firstFieldPath}
        onFocus={onFocus}
        type={schema.get('collapsibleTest')}
      />
    )
    expect(queryByTestId('input-field1')).toBeVisible()
    userEvent.click(button)
    expect(onFocus).toHaveBeenCalledTimes(2)
    expect(onFocus).toHaveBeenLastCalledWith(['collapsibleAndCollapsedByDefault'])

    expect(queryByTestId('input-field1')).toBeNull()
  })

  it('does not show hidden fields', () => {
    const onFocus = jest.fn()

    const {queryByTestId} = render(
      <ObjectInputTester onFocus={onFocus} type={schema.get('hiddenTest')} />
    )

    expect(queryByTestId('input-thisIsVisible')).toBeVisible()
    expect(queryByTestId('input-thisIsHidden')).toBeNull()
    expect(queryByTestId('input-thisMayBeVisible')).toBeVisible()
  })

  it('supports filtering fields based on a predicate', () => {
    const onFocus = jest.fn()

    const {queryByTestId} = render(
      <ObjectInputTester
        onFocus={onFocus}
        type={schema.get('hiddenTest')}
        filterField={(type, field) => field.name !== 'thisMayBeVisible'}
      />
    )

    expect(queryByTestId('input-thisIsVisible')).toBeVisible()
    expect(queryByTestId('input-thisIsHidden')).toBeNull()
    expect(queryByTestId('input-thisMayBeVisible')).toBeNull()
  })

  it("expands a field that's been manually collapsed when receiving a focus path that targets it", () => {
    const firstFieldPath = ['collapsibleAndCollapsedByDefault', 'field1']

    const onFocus = jest.fn()

    const {container, queryByTestId, rerender} = render(
      <ObjectInputTester onFocus={onFocus} type={schema.get('collapsibleTest')} />
    )
    expect(queryByTestId('input-field1')).toBeNull()

    const toggleButton = container.querySelector(TOGGLE_BUTTON_SELECTOR)!

    userEvent.click(toggleButton)
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledWith(firstFieldPath)
    rerender(
      <ObjectInputTester
        type={schema.get('collapsibleTest')}
        focusPath={firstFieldPath}
        onFocus={onFocus}
      />
    )

    expect(queryByTestId('input-field1')).toBeVisible()

    userEvent.click(toggleButton)
    rerender(
      <ObjectInputTester
        type={schema.get('collapsibleTest')}
        focusPath={['collapsibleAndCollapsedByDefault']}
        onFocus={onFocus}
      />
    )

    expect(queryByTestId('input-field1')).toBeNull()

    // Focus moves into the collapsed field (this happens when e.g. deep linking)
    rerender(
      <ObjectInputTester
        type={schema.get('collapsibleTest')}
        focusPath={['collapsibleAndCollapsedByDefault', 'field1']}
        onFocus={onFocus}
      />
    )

    expect(queryByTestId('input-field1')).toBeVisible()

    // Note: if focus moves to another field we don't want to collapse the field again
    rerender(<ObjectInputTester type={schema.get('collapsibleTest')} focusPath={[]} />)
    expect(queryByTestId('input-field1')).toBeVisible()
  })
})

describe('focus handling', () => {
  it('calling .focus() on its ref puts focus on DOM node for its first field', () => {
    let inputRef: undefined | {focus: () => void}
    const {queryByTestId} = render(
      <ObjectInputTester type={schema.get('focusTest')} ref={(ref: any) => (inputRef = ref)} />
    )

    expect(inputRef).toBeDefined()
    inputRef!.focus()
    expect(queryByTestId('input-title')?.querySelector('input')).toHaveFocus()
  })

  it('updates input focus based on passed focusPath', () => {
    const {queryByTestId} = render(
      <ObjectInputTester type={schema.get('focusTest')} focusPath={['focusTest', 'field1']} />
    )
    expect(queryByTestId('input-field1')?.querySelector('input')).toHaveFocus()
  })

  it('emits an `onFocus()` event with the focus path of the first field when the imperative .focus() method is invoked', () => {
    // Note: this depends on the underlying native input component forwarding it's received onFocus prop
    let inputRef: undefined | {focus: () => void}
    const onFocus = jest.fn()
    render(
      <ObjectInputTester
        type={schema.get('focusTest')}
        onFocus={onFocus}
        ref={(ref: any) => (inputRef = ref)}
      />
    )

    inputRef!.focus()

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledWith(['title'])
  })
})
