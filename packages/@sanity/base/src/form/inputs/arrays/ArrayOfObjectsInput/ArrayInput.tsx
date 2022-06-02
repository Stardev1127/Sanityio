/* eslint-disable react/default-props-match-prop-types,react/jsx-handler-names */

import {
  isKeySegment,
  isObjectSchemaType,
  isReferenceSchemaType,
  KeyedSegment,
  SchemaType,
} from '@sanity/types'
import {isPlainObject} from 'lodash'
import {Box, Button, Card, Dialog, Flex, Spinner, Stack, Text, ToastParams} from '@sanity/ui'
import React from 'react'
import {map} from 'rxjs/operators'
import {Subscription} from 'rxjs'
import {randomKey, resolveTypeName} from '@sanity/util/content'
import {Uploader, UploaderResolver, UploadEvent} from '../../../studio/uploads/types'
import {isDev} from '../../../../environment'
import {Alert} from '../../../components/Alert'
import {Details} from '../../../components/Details'
import {Item, List} from '../common/list'
import {applyAll} from '../../../patch/applyPatch'
import {PatchEvent, setIfMissing, unset} from '../../../patch'
import {ItemProps} from '../../../types/itemProps'
import {DefaultArrayInputFunctions} from '../common/ArrayFunctions'
import {ArrayOfObjectsInputProps} from '../../../types'
import {isObjectItemProps} from '../../../types/asserters'
import type {ArrayMember, InsertEvent} from './types'
import {uploadTarget} from './uploadTarget/uploadTarget'
import {isEmpty} from './item/helpers'
import {ArrayItem} from './item/ArrayItem'
import {MemberItem} from './MemberItem'
import {withFocusRing} from '../../../components/withFocusRing'
import {SanityClient} from '@sanity/client'

type Toast = {push: (params: ToastParams) => void}

export function createProtoValue(type: SchemaType): ArrayMember {
  if (!isObjectSchemaType(type)) {
    throw new Error(
      `Invalid item type: "${type.type}". Default array input can only contain objects (for now)`
    )
  }

  const _key = randomKey(12)
  return type.name === 'object' ? {_key} : {_type: type.name, _key}
}

interface State {
  isResolvingInitialValue: boolean
}

const UploadTarget = uploadTarget(withFocusRing(Card))

interface ArrayInputProps extends ArrayOfObjectsInputProps<ArrayMember> {
  resolveUploader: UploaderResolver
  client: SanityClient
}

export class ArrayInput extends React.PureComponent<ArrayInputProps> {
  _focusArea: HTMLElement | null = null
  toast: Toast | null = null

  uploadSubscriptions: Record<string, Subscription> = {}
  state: State = {
    isResolvingInitialValue: false,
  }

  insert = (
    item: ArrayMember,
    position: 'before' | 'after',
    referenceItem: number | KeyedSegment
  ) => {
    const {onInsert} = this.props
    onInsert({items: [item], position, referenceItem})
  }

  handlePrepend = (value: ArrayMember) => {
    this.handleInsert({item: value, position: 'before', referenceItem: 0})
  }

  handleAppend = (value: ArrayMember) => {
    this.handleInsert({item: value, position: 'after', referenceItem: -1})
  }

  handleInsert = (event: InsertEvent) => {
    const {onFocusPath, onOpenItem, resolveInitialValue} = this.props
    this.setState({isResolvingInitialValue: true})
    const memberType = this.getMemberTypeOfItem(event.item)

    if (!memberType) {
      throw new Error(`Type "${event.item._type}" not valid for this array`)
    }

    const resolvedInitialValue =
      isEmpty(event.item) && resolveInitialValue
        ? resolveInitialValue(memberType, event.item)
        : Promise.resolve({})

    resolvedInitialValue
      .then((initial) => ({...event.item, ...initial}))
      .then(
        (value) => {
          this.insert(value, event.position, event.referenceItem)
        },
        (error) => {
          this.toast?.push({
            title: `Could not resolve initial value`,
            description: `Unable to resolve initial value for type: ${memberType.name}: ${error.message}.`,
            status: 'error',
          })

          this.insert(event.item, event.position, event.referenceItem)
        }
      )
      .finally(() => {
        this.setState({isResolvingInitialValue: false})
        if (event.edit === false) {
          onFocusPath([{_key: event.item._key}])
        } else {
          onOpenItem(event.item._key)
        }
      })
  }

  getMemberTypeOfItem(item: ArrayMember): SchemaType | undefined {
    const {schemaType} = this.props
    const itemTypeName = resolveTypeName(item)
    return schemaType.of.find((memberType) => memberType.name === itemTypeName)
  }

  handleRemoveItem = (item: ArrayMember) => {
    this.removeItem(item)
  }

  handleFocus = (event: React.FocusEvent) => {
    const {onFocus} = this.props
    // We want to handle focus when the array input *itself* element receives
    // focus, not when a child element receives focus, but React has decided
    // to let focus bubble, so this workaround is needed
    // Background: https://github.com/facebook/react/issues/6410#issuecomment-671915381
    if (event.currentTarget === event.target && event.currentTarget === this._focusArea) {
      onFocus(event)
    }
  }

  removeItem(item: ArrayMember) {
    const {onChange, onFocusPath, value} = this.props

    // create a patch for removing the item
    const patch = unset(isKeySegment(item) ? [{_key: item._key}] : [value?.indexOf(item) || -1])

    // apply the patch to the current value
    const result = applyAll(value || [], [patch])

    // if the result is an empty array
    if (Array.isArray(result) && !result.length) {
      // then unset the value
      onChange(unset())
    } else {
      // otherwise apply the patch
      onChange(patch)
    }

    if (item._key in this.uploadSubscriptions) {
      this.uploadSubscriptions[item._key].unsubscribe()
    }

    // move focus to the nearest sibling
    const idx = value?.indexOf(item) || -1
    const nearestSibling = value?.[idx + 1] || value?.[idx - 1]

    // if there's no siblings we want to focus the input itself
    onFocusPath(nearestSibling ? [{_key: nearestSibling._key}] : [])
  }

  handleSortEnd = (event: {newIndex: number; oldIndex: number}) => {
    const {value, onMoveItem} = this.props
    const item = value?.[event.oldIndex]
    const refItem = value?.[event.newIndex]

    if (!item?._key || !refItem?._key) {
      // eslint-disable-next-line no-console
      console.error(
        'Neither the item you are moving nor the item you are moving to have a key. Cannot continue.'
      )

      return
    }

    if (event.oldIndex === event.newIndex || item._key === refItem._key) {
      return
    }

    onMoveItem({fromIndex: event.oldIndex, toIndex: event.newIndex})
  }

  focus() {
    if (this._focusArea) {
      this._focusArea.focus()
    }
  }

  setFocusArea = (el: HTMLElement | null) => {
    this._focusArea = el
  }

  handleFixMissingKeys = () => {
    const {onChange, value = []} = this.props
    const patches = (value || []).map((val, i) => setIfMissing(randomKey(), [i, '_key']))

    onChange(patches)
  }
  setToast = (toast: any | null) => {
    this.toast = toast
  }
  handleRemoveNonObjectValues = () => {
    const {onChange, value} = this.props
    const nonObjects = (value || [])
      .reduce((acc: number[], val, i) => (isPlainObject(val) ? acc : acc.concat(i)), [])
      .reverse()
    const patches = nonObjects.map((index) => unset([index]))

    onChange(patches)
  }

  handleUpload = ({file, type, uploader}: {file: File; type: SchemaType; uploader: Uploader}) => {
    const {onChange, client} = this.props
    const item = createProtoValue(type)
    const key = item._key

    this.insert(item, 'after', -1)

    const events$ = uploader
      .upload(client, file, type)
      .pipe(
        map((uploadEvent: UploadEvent) =>
          PatchEvent.from(uploadEvent.patches || []).prefixAll({_key: key})
        )
      )

    this.uploadSubscriptions = {
      ...this.uploadSubscriptions,
      [key]: events$.subscribe((event) => onChange(event.patches)),
    }
  }

  renderItem = (itemProps: ItemProps) => {
    if (!isObjectItemProps(itemProps)) {
      throw new Error('Expected item to be of object type')
    }

    const {id, schemaType, renderInput} = this.props

    if (isReferenceSchemaType(itemProps.schemaType)) {
      return itemProps.children
    }
    return (
      <>
        <ArrayItem
          validation={itemProps.validation}
          itemKey={itemProps.key}
          readOnly={itemProps.readOnly}
          onInsert={itemProps.onInsert}
          onRemove={itemProps.onRemove}
          onFocus={itemProps.onFocus}
          index={itemProps.index}
          schemaType={itemProps.schemaType}
          insertableTypes={schemaType.of}
          value={itemProps.value as ArrayMember}
          focused={itemProps.focused}
          open={itemProps.open}
          onClick={itemProps.onOpen}
          presence={[]}
        >
          {itemProps.open ? (
            <Dialog
              width={1}
              header={`Edit ${itemProps.schemaType.title}`}
              id={`${id}-item-${itemProps.key}-dialog`}
              onClose={itemProps.onClose}
            >
              <Box padding={4}>{itemProps.children}</Box>
            </Dialog>
          ) : null}
        </ArrayItem>
      </>
    )
  }

  render() {
    const {
      schemaType,
      onChange,
      value = [],
      readOnly,
      members,
      renderField,
      renderInput,
      resolveUploader,
    } = this.props

    const {isResolvingInitialValue} = this.state

    const hasNonObjectValues = (value || []).some((item) => !isPlainObject(item))

    if (hasNonObjectValues) {
      return (
        <Alert
          status="error"
          suffix={
            <Stack padding={2}>
              <Button
                onClick={this.handleRemoveNonObjectValues}
                text="Remove non-object values"
                tone="critical"
              />
            </Stack>
          }
          title={<>Invalid list values</>}
        >
          <Text as="p" muted size={1}>
            Some items in this list are not objects. This must be fixed in order to edit the list.
          </Text>

          <Details marginTop={4} open={isDev} title={<>Developer info</>}>
            <Stack space={3}>
              <Text as="p" muted size={1}>
                This usually happens when items are created using an API client, or when a custom
                input component has added invalid data to the list.
              </Text>
            </Stack>
          </Details>
        </Alert>
      )
    }

    const options = schemaType.options || {}
    const hasMissingKeys = value.some((item) => !item._key)
    const isSortable = options.sortable !== false && !hasMissingKeys
    const isGrid = options.layout === 'grid'
    return (
      <Stack space={3}>
        {hasMissingKeys && (
          <Alert
            status="warning"
            suffix={
              <Stack padding={2}>
                <Button
                  onClick={this.handleFixMissingKeys}
                  text="Add missing keys"
                  tone="caution"
                />
              </Stack>
            }
            title={<>Missing keys</>}
          >
            <Text as="p" muted size={1}>
              Some items in the list are missing their keys. This must be fixed in order to edit the
              list.
            </Text>

            <Details marginTop={4} open={isDev} title={<>Developer info</>}>
              <Stack space={3}>
                <Text as="p" muted size={1}>
                  This usually happens when items are created using an API client, and the{' '}
                  <code>_key</code> property has not been included.
                </Text>

                <Text as="p" muted size={1}>
                  The value of the <code>_key</code> property must be a unique string.
                </Text>
              </Stack>
            </Details>
          </Alert>
        )}

        <UploadTarget
          types={schemaType.of}
          resolveUploader={resolveUploader}
          onUpload={this.handleUpload}
          tabIndex={0}
        >
          <Stack data-ui="ArrayInput__content" space={3}>
            {members?.length === 0 && (
              <Card padding={3} border style={{borderStyle: 'dashed'}} radius={2}>
                <Text align="center" muted size={1}>
                  {schemaType.placeholder || <>No items</>}
                </Text>
              </Card>
            )}
            {(members?.length > 0 || isResolvingInitialValue) && (
              <Card border radius={1} paddingY={isGrid ? 2 : 1} paddingX={isGrid ? 2 : undefined}>
                <List onSortEnd={this.handleSortEnd} isSortable={isSortable} isGrid={isGrid}>
                  {members.map((member, index) => {
                    return (
                      <Item key={member.key} isSortable={isSortable} isGrid={isGrid} index={index}>
                        <MemberItem
                          member={member}
                          renderItem={this.renderItem}
                          renderField={renderField}
                          renderInput={renderInput}
                        />
                      </Item>
                    )
                  })}
                  {isResolvingInitialValue && (
                    <Item isGrid={isGrid} index={-1}>
                      <Card radius={1} padding={1}>
                        <Flex align="center" justify="center" padding={3}>
                          <Box marginX={3}>
                            <Spinner muted />
                          </Box>
                          <Text>Resolving initial value…</Text>
                        </Flex>
                      </Card>
                    </Item>
                  )}
                </List>
              </Card>
            )}
          </Stack>
        </UploadTarget>

        <DefaultArrayInputFunctions
          type={schemaType}
          value={value}
          readOnly={readOnly}
          onAppendItem={this.handleAppend}
          onPrependItem={this.handlePrepend}
          onCreateValue={createProtoValue}
          onChange={onChange}
        />
      </Stack>
    )
  }
}
