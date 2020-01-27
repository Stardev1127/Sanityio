// Default wiring for FormBuilderContext when used as a sanity part
import React from 'react'
import FormBuilderContext from '../FormBuilderContext'
import SanityPreview from 'part:@sanity/base/preview'
import inputResolver from './inputResolver/inputResolver'
import * as gradientPatchAdapter from './utils/gradientPatchAdapter'

const previewResolver = () => SanityPreview
type Props = {
  value: any | null
  schema: Record<string, any>
  patchChannel: any
  children: React.ReactElement
}
export default function SanityFormBuilderContext(props: Props) {
  return (
    <FormBuilderContext
      value={props.value}
      schema={props.schema}
      patchChannel={props.patchChannel}
      resolveInputComponent={inputResolver}
      resolvePreviewComponent={previewResolver}
    >
      {props.children}
    </FormBuilderContext>
  )
}

function prepareMutationEvent(event) {
  const patches = event.mutations.map(mut => mut.patch).filter(Boolean)
  return {
    snapshot: event.document,
    patches: gradientPatchAdapter.toFormBuilder(event.origin, patches)
  }
}

function prepareRebaseEvent(event) {
  return {
    snapshot: event.document,
    patches: gradientPatchAdapter.toFormBuilder('internal', [
      {
        id: event.document._id,
        set: event.document
      }
    ])
  }
}

SanityFormBuilderContext.createPatchChannel = () => {
  const patchChannel = FormBuilderContext.createPatchChannel()
  return {
    receiveEvent: event => {
      if (event.type !== 'mutation' && event.type !== 'rebase') {
        return
      }
      patchChannel.receivePatches(
        event.type === 'mutation' ? prepareMutationEvent(event) : prepareRebaseEvent(event)
      )
    },
    onPatch: patchChannel.onPatch
  }
}
