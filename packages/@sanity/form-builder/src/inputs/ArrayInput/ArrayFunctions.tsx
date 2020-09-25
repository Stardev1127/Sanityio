import React from 'react'
import {ArraySchemaType, SchemaType, isReferenceSchemaType} from '@sanity/types'
import DropDownButton from 'part:@sanity/components/buttons/dropdown'
import Button from 'part:@sanity/components/buttons/default'
import ButtonGrid from 'part:@sanity/components/buttons/button-grid'
import PlusIcon from 'part:@sanity/base/plus-icon'
import PatchEvent from '../../PatchEvent'
import styles from './styles/ArrayInput.css'
import {ItemValue} from './typedefs'

type Props = {
  type: ArraySchemaType
  children: Node | null
  value: ItemValue[]
  readOnly: boolean | null
  onAppendItem: (itemValue: ItemValue) => void
  onPrependItem: (itemValue: ItemValue) => void
  onFocusItem: (item: ItemValue) => void
  onCreateValue: (type: SchemaType) => ItemValue
  onChange: (event: PatchEvent) => void
}

export default class ArrayFunctions extends React.Component<Props> {
  handleDropDownAction = (menuItem: {type: SchemaType}) => {
    this.handleInsertItem(menuItem.type)
  }
  handleAddBtnClick = () => {
    this.handleInsertItem(this.props.type.of[0])
  }
  handleInsertItem = type => {
    const {onCreateValue, onAppendItem} = this.props
    const item = onCreateValue(type)
    onAppendItem(item)
  }
  renderSelectType() {
    const items = this.props.type.of.map(memberDef => {
      // Use reference icon if reference is to one type only
      const referenceIcon =
        isReferenceSchemaType(memberDef) &&
        (memberDef.to || []).length === 1 &&
        memberDef.to[0].icon

      const icon = memberDef.icon || memberDef.type.icon || referenceIcon || PlusIcon
      return {
        title: memberDef.title || memberDef.type.name,
        type: memberDef,
        icon
      }
    })
    return (
      <DropDownButton inverted items={items} onAction={this.handleDropDownAction}>
        Add
      </DropDownButton>
    )
  }
  render() {
    const {type, readOnly, children} = this.props
    if (readOnly) {
      return null
    }
    return (
      <div className={styles.functions}>
        <ButtonGrid align="start">
          {type.of.length === 1 ? (
            <Button inverted onClick={this.handleAddBtnClick}>
              Add
            </Button>
          ) : (
            this.renderSelectType()
          )}

          {children || null}
        </ButtonGrid>
      </div>
    )
  }
}
