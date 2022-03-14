/* eslint-disable camelcase */

import {waitForElementToBeRemoved, within} from '@testing-library/react'
import React from 'react'
import {Observable, of} from 'rxjs'
import {AvailabilityReason} from '@sanity/base/_internal'
import userEvent from '@testing-library/user-event'
import {
  CrossDatasetReferenceInput,
  CrossDatasetReferenceInputProps,
} from '../CrossDatasetReferenceInput'
import {SearchHit} from '../types'
import {renderInput} from '../../../../test/renderInput'

const EMPTY_SEARCH = () => of([])

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const AVAILABLE = {
  available: true,
  reason: AvailabilityReason.READABLE,
} as const

const defaultProps: Partial<CrossDatasetReferenceInputProps> = {
  validation: [],
  level: 0,
  focusPath: [],
  presence: [],
  onSearch: EMPTY_SEARCH,
}

function renderCDReferenceInput(options: {
  props?: Partial<CrossDatasetReferenceInputProps>
  type: any
}) {
  return renderInput<CrossDatasetReferenceInputProps>({
    ...options,
    render: (props) => <CrossDatasetReferenceInput {...defaultProps} {...props} />,
  })
}

describe('render states', () => {
  test('it renders the autocomplete when no value is given', () => {
    const getReferenceInfo = ({_id: id, _type: type}) => {
      return of({
        id,
        type,
        availability: AVAILABLE,
        preview: {
          published: {title: `Product ${id}`},
        },
      })
    }

    const {result} = renderCDReferenceInput({
      props: {
        getReferenceInfo,
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        to: [
          {
            type: 'product',
            __experimental_search: [{path: 'title'}],
            preview: {},
          },
        ],
      },
    })

    expect(result.queryByTestId('autocomplete')).toBeInTheDocument()
  })

  test('it renders the autocomplete when it has a value but focus is on the _ref', () => {
    const getReferenceInfo = jest.fn().mockReturnValue(
      of({
        _id: 'foo',
        type: 'product',
        availability: AVAILABLE,
        preview: {
          published: {title: `Foo`},
        },
      })
    )

    const {result} = renderCDReferenceInput({
      props: {
        focusPath: ['_ref'],
        getReferenceInfo,
        value: {
          _type: 'productReference',
          _ref: 'foo',
          _dataset: 'foo',
          _projectId: 'foo',
        },
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        to: [
          {
            type: 'product',
            __experimental_search: [{path: 'title'}],
            preview: {},
          },
        ],
      },
    })

    expect(result.getByTestId('autocomplete')).toBeInTheDocument()
  })

  test.skip('a warning is displayed if the reference value is strong while the schema says it should be weak', () => {
    const getReferenceInfo = jest.fn().mockReturnValue(
      of({
        _id: 'foo',
        type: 'product',
        availability: AVAILABLE,
        preview: {
          published: {title: `Foo`},
        },
      })
    )

    const {result} = renderCDReferenceInput({
      props: {
        focusPath: ['_ref'],
        getReferenceInfo,
        value: {
          _type: 'reference',
          _ref: 'someActor',
          _dataset: 'otherDataset',
          _projectId: 'otherProject',
        },
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        weak: true,
        to: [{type: 'product', __experimental_search: [{path: 'title'}], preview: {}}],
      },
    })

    expect(result.getByTestId('alert-reference-strength-mismatch')).toBeInTheDocument()
  })
})

describe('user interaction happy paths', () => {
  test('an input without a value support searching for references and emits patches when a reference is chosen', async () => {
    const handleSearch = jest.fn<Observable<SearchHit[]>, [string]>().mockReturnValue(
      of([
        {id: 'one', type: 'product', published: {_id: 'one', _type: 'product'}},
        {id: 'two', type: 'product', published: {_id: 'two', _type: 'product'}},
      ])
    )
    // const handleChange = jest.fn()
    const getReferenceInfo = ({_id: id, _type: type}) =>
      of({
        id,
        type,
        availability: AVAILABLE,
        preview: {
          published: {title: `Product ${id}`},
        },
      })

    const {onChange, result} = renderCDReferenceInput({
      props: {
        getReferenceInfo,
        // onChange: handleChange,
        onSearch: handleSearch,
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        to: [{type: 'product', __experimental_search: [{path: 'title'}], preview: {}}],
      },
    })

    const autocomplete = result.getByTestId('autocomplete')
    userEvent.type(autocomplete, 'foo')
    const popover = result.getByTestId('autocomplete-popover')
    const previews = within(popover).getAllByTestId('preview')

    expect(previews.length).toBe(2)
    expect(previews[0]).toHaveTextContent('Product one')
    expect(previews[1]).toHaveTextContent('Product two')

    // Click "Product two"
    userEvent.click(within(popover).getAllByRole('button')[1])

    // Note: this asserts the necessity of awaiting after click. Currently, the onChange event is
    // emitted asynchronously after an item is selected due to behavior in Sanity UI's autocomplete
    // (https://github.com/sanity-io/design/blob/b956686c2c663c4f21910f7d3d0be0a27663f5f4/packages/%40sanity/ui/src/components/autocomplete/autocompleteOption.tsx#L16-L20)
    // if this tests suddenly fails this expectation, it can be removed along with the waiting
    expect(onChange).toHaveBeenCalledTimes(0)
    await waitForElementToBeRemoved(() => result.getByTestId('autocomplete-popover'))
    //----

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]).toEqual([
      {
        patches: [
          {
            path: [],
            type: 'set',
            value: {
              _dataset: 'products',
              _projectId: 'abcxyz',
              _ref: 'two',
              _type: 'productReference',
            },
          },
        ],
      },
    ])
  })

  test('an input with an existing value support replacing the value, and emits patches when a new reference is chosen', async () => {
    const handleSearch = jest.fn<Observable<SearchHit[]>, [string]>().mockReturnValue(
      of([
        {id: 'one', type: 'product', published: {_id: 'one', _type: 'product'}},
        {id: 'two', type: 'product', published: {_id: 'two', _type: 'product'}},
      ])
    )

    const getReferenceInfo = ({_id: id}) =>
      of({
        id,
        type: 'product',
        availability: AVAILABLE,
        preview: {
          published: {title: `Product ${id}`},
        },
      })

    const {onChange, onFocus, rerender, result} = renderCDReferenceInput({
      props: {
        getReferenceInfo,
        onSearch: handleSearch,
        value: {
          _type: 'productReference',
          _ref: 'some-product',
          _dataset: 'products',
          _projectId: 'abcxyz',
        },
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        to: [{type: 'product', __experimental_search: [{path: 'title'}], preview: {}}],
      },
    })

    const preview = result.getByTestId('preview')
    expect(preview).toHaveTextContent('Product some-product')
    const menuButton = result.getByTestId('menu-button')
    menuButton.click()
    const replaceMenuItem = result.getByTestId('menu-item-replace')
    replaceMenuItem.click()
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledWith(['_ref'])

    rerender({
      focusPath: ['_ref'],
    })

    const autocomplete = result.getByTestId('autocomplete')
    userEvent.type(autocomplete, 'foo')
    const popover = result.getByTestId('autocomplete-popover')
    const previews = within(popover).getAllByTestId('preview')

    expect(previews.length).toBe(2)
    expect(previews[0]).toHaveTextContent('Product one')
    expect(previews[1]).toHaveTextContent('Product two')

    userEvent.click(within(popover).getAllByRole('button')[1])

    // Note: this asserts the necessity of awaiting after click. Currently, the onChange event is emitted asynchronously after an item is selected due to behavior in Sanity UI's autocomplete
    // (https://github.com/sanity-io/design/blob/b956686c2c663c4f21910f7d3d0be0a27663f5f4/packages/%40sanity/ui/src/components/autocomplete/autocompleteOption.tsx#L16-L20)
    // if this tests suddenly fails this expectation, it can be removed along with the waiting
    expect(onChange).toHaveBeenCalledTimes(0)
    // await wait(1)
    await waitForElementToBeRemoved(() => result.getByTestId('autocomplete-popover'))
    //----

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]).toEqual([
      {
        patches: [
          {
            path: [],
            type: 'set',
            value: {
              _dataset: 'products',
              _projectId: 'abcxyz',
              _ref: 'two',
              _type: 'productReference',
            },
          },
        ],
      },
    ])
  })

  test('an input with an existing value support clearing the value', () => {
    const getReferenceInfo = ({_id: id}) =>
      of({
        id,
        type: 'product',
        availability: AVAILABLE,
        preview: {
          published: {title: `Product ${id}`},
        },
      })

    const {onChange, result} = renderCDReferenceInput({
      props: {
        getReferenceInfo,
        value: {
          _type: 'productReference',
          _ref: 'some-product',
          _dataset: 'products',
          _projectId: 'abcxyz',
        },
      },
      type: {
        name: 'productReference',
        type: 'crossDatasetReference',
        dataset: 'products',
        projectId: 'abcxyz',
        to: [{type: 'product', __experimental_search: [{path: 'title'}], preview: {}}],
      },
    })

    const preview = result.getByTestId('preview')
    expect(preview).toHaveTextContent('Product some-product')
    const menuButton = result.getByTestId('menu-button')
    menuButton.click()
    const replaceMenuItem = result.getByTestId('menu-item-clear')
    replaceMenuItem.click()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]).toEqual([
      {
        patches: [
          {
            path: [],
            type: 'unset',
          },
        ],
      },
    ])
  })
})
