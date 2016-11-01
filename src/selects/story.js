/* eslint-disable react/no-multi-comp */
import React from 'react'
import {storiesOf, action} from 'part:@sanity/storybook'

import DefaultSelect from 'part:@sanity/components/selects/default'
import SearchableSelect from 'part:@sanity/components/selects/searchable'
import CustomSelect from 'part:@sanity/components/selects/custom'
import {range} from 'lodash'

import Fuse from 'fuse.js'

import Chance from 'chance'
const chance = new Chance()


const items = range(100).map((item, i) => {
  return {
    title: chance.name(),
    key: `${i}`
  }
})


class SearchableTest extends React.Component {

  constructor(...args) {
    super(...args)

    const fuseOptions = {
      keys: ['title']
    }

    this.searchAbleItems = range(100).map((item, i) => {
      return {
        title: chance.name(),
        key: `${i}`
      }
    })

    this.fuse = new Fuse(this.searchAbleItems, fuseOptions)

    this.state = {
      searchResult: []
    }
  }

  handleSearch = query => {
    const result = this.fuse.search(query)
    this.setState({
      loading: true
    })

    setTimeout(() => {
      this.setState({
        searchResult: result,
        loading: false
      })
    }, 500)
  }

  render() {
    return (
      <SearchableSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onSearch={this.handleSearch}
        onChange={action('onChange')}
        onFocus={action('onFocus')}
        onOpen={action('onOpen')}
        loading={this.state.loading}
        items={this.state.searchResult}
      />

    )
  }
}


storiesOf('Selects')
  .addWithInfo(
  'Default',
  `
    Default select. Works as a normal <select />
  `,
  () => {
    return (
      <DefaultSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onChange={action('onChange')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        items={items}
      />
    )
  },
  {
    propTables: [DefaultSelect],
    role: 'part:@sanity/components/selects/default'
  }
)
.addWithInfo(
  'Default other value',
  `
    Default select. Works as a normal <select />
  `,
  () => {
    return (
      <DefaultSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onChange={action('onChange')}
        onFocus={action('onFocus')}
        onBlur={action('onBlur')}
        value={items[10]}
        items={items}
      />
    )
  },
  {
    propTables: [DefaultSelect],
    role: 'part:@sanity/components/selects/default'
  }
)

.addWithInfo(
  'Searchable (selected value)',
  `
    When provided with items, the component searches inside these when no onSearch is provided
  `,
  () => {
    return (
      <SearchableSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onChange={action('onChange')}
        onFocus={action('onChange')}
        onBlur={action('onBlur')}
        onOpen={action('onOpen')}
        value={items[5]}
        items={items}
      />
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)

.addWithInfo(
  'Searchable (with onClear)',
  `
    When provided with items, the component searches inside these when no onSearch is provided
  `,
  () => {
    return (
      <SearchableSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onChange={action('onChange')}
        onFocus={action('onChange')}
        onBlur={action('onBlur')}
        onOpen={action('onOpen')}
        onClear={action('onClear')}
        value={items[5]}
        items={items}
      />
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)

.addWithInfo(
  'Searchable (loading)',
  `
    Takes a loading prop.
  `,
  () => {

    return (
      <SearchableSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onSearch={action('onSearch')}
        onChange={action('onChange')}
        onFocus={action('onFocus')}
        onOpen={action('onOpen')}
        loading
        items={[]}
      />
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)

.addWithInfo(
  'Custom select',
  `
    Custom preview
  `,
  () => {

    const renderItem = function (item) {
      return (
        <div>Custom rendering of {item.title}</div>
      )
    }

    return (
      <CustomSelect
        label="This is the label"
        placeholder="This is the placeholder"
        onChange={action('onChange')}
        onFocus={action('onFocus')}
        onOpen={action('onOpen')}
        renderItem={renderItem}
        value={items[2]}
        items={items}
      />
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)

.addWithInfo(
  'Custom select (transparent)',
  `
    Custom preview
  `,
  () => {

    const renderItem = function (item) {
      return (
        <div>Custom rendering of {item.title}</div>
      )
    }

    return (
      <div style={{padding: '2em', backgroundColor: '#eee'}}>
        <CustomSelect
          label="This is the label"
          placeholder="This is the placeholder"
          onChange={action('onChange')}
          onFocus={action('onFocus')}
          onOpen={action('onOpen')}
          renderItem={renderItem}
          transparent
          value={items[2]}
          items={items}
        />
      </div>
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)


.addWithInfo(
  'Searchable example',
  `
    When an onSearch is provided. Populate the items, and remember to set _loading prop_ when waiting for server.
  `,
  () => {

    return (
      <SearchableTest />
    )
  },
  {
    propTables: [SearchableSelect],
    role: 'part:@sanity/components/selects/searchable'
  }
)
