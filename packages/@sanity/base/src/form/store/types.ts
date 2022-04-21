import {
  ArraySchemaType,
  BooleanSchemaType,
  NumberSchemaType,
  ObjectSchemaType,
  Path,
  StringSchemaType,
  ValidationMarker,
} from '@sanity/types'
import * as React from 'react'
import {ComponentType} from 'react'
import {PatchEvent} from '../patch'
import {FieldPresence, PreparedProps} from './formState'
import {FormFieldPresence} from '../../presence'

export interface StateTree<T> {
  value: T | undefined
  children?: {
    [key: string]: StateTree<T>
  }
}

export interface FieldGroup {
  name: string
  title?: string
  icon?: ComponentType<void>
  default?: boolean
  selected?: boolean
  disabled?: boolean
}

export type ObjectMember = FieldMember | FieldSetMember

export interface FieldMember {
  type: 'field'
  field: FieldProps
}

export interface FieldSetProps {
  name: string
  title?: string
  hidden?: boolean
  collapsible?: boolean
  collapsed?: boolean
  onSetCollapsed: (collapsed: boolean) => void
  fields: FieldMember[]
}

export interface FieldSetMember {
  type: 'fieldSet'
  fieldSet: FieldSetProps
}

interface BaseFieldProps {
  name: string
  title?: string
  description?: string
  path: Path
  presence: FormFieldPresence[]
  validation: ValidationMarker[]
  index: number
  level: number
  hidden?: boolean
  readOnly?: boolean
  onChange: (patchEvent: PatchEvent) => void
  onFocus: (focusEvent: React.FocusEvent) => void
}

export interface StringFieldProps extends BaseFieldProps {
  kind: 'string'
  type: StringSchemaType
  value?: string
}

export interface NumberFieldProps extends BaseFieldProps {
  kind: 'number'
  type: NumberSchemaType
  value?: number
}

export interface BooleanFieldProps extends BaseFieldProps {
  kind: 'boolean'
  type: BooleanSchemaType
  value?: boolean
}

export interface ObjectFieldProps extends BaseFieldProps {
  kind: 'object'
  type: ObjectSchemaType
  members: ObjectMember[]
  groups?: FieldGroup[]
  onSelectGroup: (name: string) => void
  onFocus: (focusEvent: React.FocusEvent) => void
  hidden?: boolean
  value?: Record<string, unknown>
  readOnly?: boolean
  collapsed?: boolean
  collapsible?: boolean
  onSetCollapsed: (collapsed: boolean) => void
}

export interface ArrayFieldProps extends BaseFieldProps {
  kind: 'array'
  type: ArraySchemaType
  members: PreparedProps<unknown>[]
  value?: unknown[]
}

export type FieldProps =
  | StringFieldProps
  | ObjectFieldProps
  | ArrayFieldProps
  | NumberFieldProps
  | BooleanFieldProps

export type RenderFieldCallback = (renderFieldProps: RenderFieldCallbackArg) => React.ReactNode
export type RenderFieldCallbackArg = FieldProps & {
  onChange: (event: PatchEvent) => void
}
export type RenderFieldSetCallback = (
  renderFieldSetProps: RenderFieldSetCallbackArg
) => React.ReactNode

export type RenderFieldSetCallbackArg = FieldSetProps & {
  children?: React.ReactNode
}
