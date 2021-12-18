import {AddIcon} from '@sanity/icons'
import {getTemplateById, Template} from '@sanity/initial-value-templates'
import {isActionEnabled} from '@sanity/schema/_internal'
import {Schema} from '@sanity/types'
import {pickBy} from 'lodash'
import {MenuItemBuilder, MenuItem} from './MenuItem'
import {IntentParams} from './Intent'
import {StructureBuilder} from './types'
import {HELP_URL, SerializeError} from './SerializeError'
import {Serializable, SerializeOptions, SerializePath} from './StructureNodes'

export type InitialValueTemplateItem = {
  id: string
  templateId: string
  title?: string
  description?: string
  parameters?: {[key: string]: any}
  type: 'initialValueTemplateItem'
  icon?: React.ElementType | React.ReactElement
  /**
   * @experimental
   */
  initialDocumentId?: string
}

export class InitialValueTemplateItemBuilder implements Serializable {
  protected spec: Partial<InitialValueTemplateItem>

  constructor(spec?: Partial<InitialValueTemplateItem>) {
    this.spec = spec ? spec : {}
  }

  id(id: string): InitialValueTemplateItemBuilder {
    return this.clone({id})
  }

  getId() {
    return this.spec.id
  }

  title(title: string) {
    return this.clone({title})
  }

  getTitle() {
    return this.spec.title
  }

  description(description: string): InitialValueTemplateItemBuilder {
    return this.clone({description})
  }

  getDescription() {
    return this.spec.description
  }

  templateId(templateId: string): InitialValueTemplateItemBuilder {
    // Let's try to be a bit helpful and assign an ID from template ID if none is specified
    const paneId = this.spec.id || templateId

    return this.clone({
      id: paneId,
      templateId,
    })
  }

  getTemplateId() {
    return this.spec.templateId
  }

  parameters(parameters: {[key: string]: any}): InitialValueTemplateItemBuilder {
    return this.clone({parameters})
  }

  getParameters() {
    return this.spec.parameters
  }

  serialize({path = [], index, hint}: SerializeOptions = {path: []}): InitialValueTemplateItem {
    const {id, templateId} = this.spec

    if (typeof id !== 'string' || !id) {
      throw new SerializeError(
        '`id` is required for initial value template item nodes',
        path,
        index,
        hint
      ).withHelpUrl(HELP_URL.ID_REQUIRED)
    }

    if (!templateId) {
      throw new SerializeError(
        'template id (`templateId`) is required for initial value template item nodes',
        path,
        id,
        hint
      ).withHelpUrl(HELP_URL.ID_REQUIRED)
    }

    return {...this.spec, id, templateId, type: 'initialValueTemplateItem'}
  }

  clone(withSpec: Partial<InitialValueTemplateItem> = {}): InitialValueTemplateItemBuilder {
    const builder = new InitialValueTemplateItemBuilder()

    builder.spec = {...this.spec, ...withSpec}

    return builder
  }
}

export function defaultInitialValueTemplateItems(
  builder: StructureBuilder,
  schema: Schema,
  initialValueTemplates: Template[]
): InitialValueTemplateItemBuilder[] {
  const templates = initialValueTemplates
    // Don't list templates that require parameters
    .filter((tpl) => !tpl.parameters || tpl.parameters.length === 0)
    // Don't list templates that we can't create
    .filter((tpl) => {
      const schemaType = schema.get(tpl.schemaType)

      if (!schemaType) {
        // @todo: throw error
        // throw new Error(`no schema type: "${tpl.schemaType}"`)
        return false
      }

      return isActionEnabled(schemaType, 'create')
    })

  // Sort templates by their schema type, in order or definition
  const typeNames = schema.getTypeNames()
  const ordered = templates.sort(
    (a, b) => typeNames.indexOf(a.schemaType) - typeNames.indexOf(b.schemaType)
  )

  // Create actual template items out of the templates
  return ordered.map((tpl) => builder.initialValueTemplateItem(tpl.id))
}

export function maybeSerializeInitialValueTemplateItem(
  item: InitialValueTemplateItem | InitialValueTemplateItemBuilder,
  index: number,
  path: SerializePath
): InitialValueTemplateItem {
  return item instanceof InitialValueTemplateItemBuilder ? item.serialize({path, index}) : item
}

export function menuItemsFromInitialValueTemplateItems(
  schema: Schema,
  initialValueTemplates: Template[],
  templateItems: InitialValueTemplateItem[]
): MenuItem[] {
  return templateItems.map((item) => {
    const tpl = getTemplateById(schema, initialValueTemplates, item.templateId)
    const title = item.title || (tpl && tpl.title) || 'Create new'
    const params = pickBy({type: tpl && tpl.schemaType, template: item.templateId}, Boolean)
    const intentParams: IntentParams = item.parameters ? [params, item.parameters] : params
    const schemaType = tpl && schema.get(tpl.schemaType)

    return new MenuItemBuilder()
      .title(title)
      .icon((tpl && tpl.icon) || (schemaType && schemaType.icon) || AddIcon)
      .intent({type: 'create', params: intentParams})
      .serialize()
  })
}
