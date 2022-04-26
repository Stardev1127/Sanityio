/* eslint-disable @typescript-eslint/no-empty-interface */

import {
  ArraySchemaType,
  BooleanSchemaType,
  NumberSchemaType,
  ObjectSchemaType,
  Path,
  SchemaType,
  StringSchemaType,
  ValidationMarker,
} from '@sanity/types'
import {FormFieldPresence} from '../../presence'
import {PatchEvent} from '../patch'
import {InsertEvent} from './event'
import {FieldGroup} from './fieldGroup'
import {ArrayMember, ObjectMember} from './member'
import {RenderArrayItemCallback, RenderFieldCallback} from './renderCallback'

export interface BaseInputProps<T = unknown, S extends SchemaType = SchemaType> {
  compareValue: T | undefined
  focusPath: Path
  focused: boolean
  hidden?: boolean
  inputProps: {
    id: string
    onBlur: (event?: React.FocusEvent) => void
    onFocus: (pathOrEvent?: Path | React.FocusEvent) => void
    readOnly: boolean
    ref: React.Ref<any> // @todo
  }
  level: number
  onChange: (patchEvent: PatchEvent) => void
  path: Path
  presence: FormFieldPresence[]
  type: S
  validation: ValidationMarker[]
  value: T | undefined
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ObjectInputProps<T extends {} = {}, S extends ObjectSchemaType = ObjectSchemaType>
  extends BaseInputProps<T, S> {
  kind: 'object'
  collapsed: boolean
  collapsible: boolean
  groups: FieldGroup[]
  members: ObjectMember[]
  onSelectFieldGroup: (groupName: string) => void
  onSetCollapsed: (collapsed: boolean) => void
  renderField: RenderFieldCallback
}

export interface ArrayInputProps<V = unknown, S extends ArraySchemaType = ArraySchemaType<V>>
  extends BaseInputProps<V, S> {
  kind: 'array'
  collapsed: boolean
  collapsible: boolean
  members: ArrayMember[]
  onInsert: (event: InsertEvent) => void
  onSetCollapsed: (collapsed: boolean) => void
  renderItem: RenderArrayItemCallback

  // ArrayFunctionsImpl: React.ComponentType<
  //   FormArrayInputFunctionsProps<ArraySchemaType<ArrayMember>, ArrayMember>
  // >

  // ArrayItemImpl: typeof ArrayItem
  // ReferenceItemComponent: ReferenceItemComponentType
  // filterField: FormBuilderFilterFieldFn
  // resolveInitialValue?: (type: ObjectSchemaType, value: any) => Promise<any>
  // resolveUploader?: (type: SchemaType, file: FileLike) => Uploader | null
}

export interface BooleanInputProps extends BaseInputProps<boolean, BooleanSchemaType> {
  kind: 'boolean'
}

export interface NumberInputProps extends BaseInputProps<number, NumberSchemaType> {
  kind: 'number'
}

export interface StringInputProps<S extends StringSchemaType = StringSchemaType>
  extends BaseInputProps<string, S> {
  kind: 'string'
}

export type InputProps =
  | ObjectInputProps
  | ArrayInputProps
  | BooleanInputProps
  | NumberInputProps
  | StringInputProps