import React, {useCallback, useEffect} from 'react'
import {useId} from '@reach/auto-id'
import {Path, ValidationMarker, SchemaType} from '@sanity/types'
import {PortableTextBlock, Type, PortableTextChild} from '@sanity/portable-text-editor'
import {Box, Dialog, PortalProvider, useLayer, usePortal} from '@sanity/ui'
import {PatchEvent} from '../../../../patch'
import {FormFieldPresence, PresenceOverlay} from '../../../../../presence'
import {DIALOG_WIDTH_TO_UI_WIDTH} from './constants'
import {ModalWidth} from './types'

interface DefaultObjectEditingProps {
  focusPath: Path
  validation: ValidationMarker[]
  object: PortableTextBlock | PortableTextChild
  onBlur: () => void
  onChange: (patchEvent: PatchEvent, path: Path) => void
  onClose: () => void
  onFocus: (path: Path) => void
  path: Path
  presence: FormFieldPresence[]
  readOnly?: boolean
  type: Type
  width?: ModalWidth
}

export function DefaultObjectEditing(props: DefaultObjectEditingProps) {
  const {
    focusPath,
    validation,
    object,
    onBlur,
    onChange,
    onClose,
    onFocus,
    path,
    presence,
    readOnly,
    type,
    width = 'medium',
  } = props

  const dialogId = useId()
  const {isTopLayer} = useLayer()
  const portal = usePortal()

  const handleChange = useCallback(
    (patchEvent: PatchEvent): void => onChange(patchEvent, path),
    [onChange, path]
  )

  const handleClose = useCallback(() => {
    if (isTopLayer) onClose()
  }, [isTopLayer, onClose])

  const handleFocus = useCallback(
    (pathOrEvent?: Path | React.FocusEvent) => {
      onFocus(Array.isArray(pathOrEvent) ? pathOrEvent : [])
    },
    [onFocus]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    },
    [handleClose]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <Dialog
      id={dialogId || ''}
      onClose={onClose}
      header={type.title}
      portal="default"
      width={DIALOG_WIDTH_TO_UI_WIDTH[width]}
    >
      <PresenceOverlay margins={[0, 0, 1, 0]}>
        <Box padding={4}>
          <PortalProvider element={portal.elements?.default}>
            TODO
            {/* <FormBuilderInput
              focusPath={focusPath}
              level={0}
              validation={validation}
              onBlur={onBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              path={path}
              presence={presence}
              readOnly={readOnly || type.readOnly}
              type={type as SchemaType}
              value={object}
            /> */}
          </PortalProvider>
        </Box>
      </PresenceOverlay>
    </Dialog>
  )
}
