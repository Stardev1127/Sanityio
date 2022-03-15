import React from 'react'
import {PresenceOverlay, FieldPresence, DocumentPresence} from '@sanity/base/presence'
import {Button, Dialog} from '@sanity/ui'
import {setIfMissing, FormBuilderInput} from '@sanity/form-builder'
import {ObjectSchemaType, Path} from '@sanity/types'

export const CustomInputWithDialogOverlay = React.forwardRef(function CustomInputWithDialogOverlay(
  props: {
    focusPath?: Path
    level?: number
    onBlur: () => void
    onChange: (patches: any) => void
    onFocus: (pathOrEvent?: Path | React.FocusEvent) => void
    presence: DocumentPresence[]
    type: ObjectSchemaType
    value?: any
  },
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {focusPath, level = 0, onBlur, onChange, onFocus, presence, type, value} = props

  const handleFieldChange = React.useCallback(
    (field, fieldPatchEvent) => {
      // Whenever the field input emits a patch event, we need to make sure to each of the included patches
      // are prefixed with its field name, e.g. going from:
      // {path: [], set: <nextvalue>} to {path: [<fieldName>], set: <nextValue>}
      // and ensure this input's value exists
      onChange(fieldPatchEvent.prefixAll(field.name).prepend(setIfMissing({_type: type.name})))
    },
    [onChange, type.name]
  )

  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <>
      {isOpen && (
        <Dialog id="todo" onClose={() => setIsOpen(false)}>
          <PresenceOverlay>
            <div style={{padding: 10}}>
              {type.fields.map((field, i) => (
                // Delegate to the generic FormBuilderInput. It will resolve and insert the actual input component
                // for the given field type
                <FormBuilderInput
                  level={level + 1}
                  key={field.name}
                  type={field.type}
                  value={value && value[field.name]}
                  onChange={(patchEvent) => handleFieldChange(field, patchEvent)}
                  path={[field.name]}
                  focusPath={focusPath}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              ))}
            </div>
          </PresenceOverlay>
        </Dialog>
      )}
      <div ref={ref} tabIndex={-1} onFocus={onFocus}>
        <div>{type.title}</div>
        <em>{type.description}</em>
        <div>
          <Button onClick={() => setIsOpen(true)} text="Click to edit" />
          {!isOpen && <FieldPresence maxAvatars={3} presence={presence} />}
          {/* Show field presence here! */}
        </div>
      </div>
    </>
  )
})
