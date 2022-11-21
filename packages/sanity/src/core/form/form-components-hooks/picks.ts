import {ComponentType} from 'react'
import {PreviewProps} from '../../components/previews'
import {PluginOptions} from '../../config'
import {FieldProps, InputProps, ItemProps} from '../types'

export function pickInputComponent(
  plugin: PluginOptions
): ComponentType<Omit<InputProps, 'renderDefault'>> {
  return plugin.form?.components?.input as ComponentType<Omit<InputProps, 'renderDefault'>>
}

export function pickFieldComponent(
  plugin: PluginOptions
): ComponentType<Omit<FieldProps, 'renderDefault'>> {
  return plugin.form?.components?.field as ComponentType<Omit<FieldProps, 'renderDefault'>>
}

export function pickPreviewComponent(
  plugin: PluginOptions
): ComponentType<Omit<PreviewProps, 'renderDefault'>> {
  return plugin.form?.components?.preview as ComponentType<Omit<PreviewProps, 'renderDefault'>>
}

export function pickItemComponent(
  plugin: PluginOptions
): ComponentType<Omit<ItemProps, 'renderDefault'>> {
  return plugin.form?.components?.item as ComponentType<Omit<ItemProps, 'renderDefault'>>
}
