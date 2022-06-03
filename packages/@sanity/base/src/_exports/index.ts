/* eslint-disable camelcase */

export type {AuthController, SanityAuthProvider, SanityUser} from '../auth'

export type {
  DefaultPreviewProps,
  GeneralPreviewLayoutKey,
  PortableTextPreviewLayoutKey,
  PreviewLayoutKey,
  PreviewMediaDimensions,
  PreviewProps,
} from '../components/previews'

export * from '../components/DefaultDocument'

export type {
  AssetSourceResolver,
  AsyncComposableOption,
  ComposableOption,
  Config,
  ConfigContext,
  ConfigPropertyError,
  ConfigPropertyErrorOptions,
  ConfigResolutionError,
  ConfigResolutionErrorOptions,
  DocumentActionsContext,
  DocumentActionsResolver,
  DocumentBadgesContext,
  DocumentBadgesResolver,
  DocumentPluginOptions,
  FormBuilderComponentResolverContext,
  NewDocumentCreationContext,
  NewDocumentOptionsContext,
  NewDocumentOptionsResolver,
  PartialContext,
  Plugin,
  PluginFactory,
  PluginOptions,
  ResolveProductionUrlContext,
  SanityAuthConfig as unstable_SanityAuthConfig,
  SanityFormConfig as unstable_SanityFormConfig,
  SchemaError,
  SchemaPluginOptions,
  Source,
  SourceOptions,
  TemplateResolver,
  Tool,
  Workspace,
  WorkspaceOptions,
} from '../config'

export {createConfig, createPlugin} from '../config'

export type {
  AuthStateChangedMessage,
  AuthStateState,
  AuthStateConfig,
  AuthStateTokenStore,
  AuthStore,
  CurrentUserError,
  CurrentUserEvent,
  CurrentUserSnapshot,
  EditStateFor,
  GuardedOperation,
  MSG_AUTH_STATE_CHANGED,
  Operation,
  OperationsAPI,
  UserStore,
  WrappedOperation,
} from '../datastores'

export type {
  ActionComponent,
  DocumentActionComponent,
  DocumentActionConfirmModalProps,
  DocumentActionDescription,
  DocumentActionDialogModalProps,
  DocumentActionModalProps,
  DocumentActionPopoverModalProps,
  DocumentActionProps,
  DocumentBadgeComponent,
  DocumentBadgeDescription,
  DocumentBadgeProps,
} from '../desk'

export {isDev, isProd} from '../environment'

export {PatchEvent} from '../form'

export type {
  ArrayFieldProps,
  ArrayOfObjectsFormNode,
  ArrayOfObjectsInputProps,
  ArrayOfObjectsMember,
  ArrayOfPrimitivesElementType,
  ArrayOfPrimitivesFormNode,
  ArrayOfPrimitivesInputProps,
  ArrayOfPrimitivesMember,
  BaseFieldProps,
  BaseInputProps,
  BaseItemProps,
  BaseFormNode,
  BooleanFieldProps,
  BooleanFormNode,
  BooleanInputProps,
  FieldMember,
  FieldProps,
  FieldSetMember,
  FieldsetState,
  FormArrayInputFunctionsProps,
  FormBuilderArrayFunctionComponent,
  FormBuilderCustomMarkersComponent,
  FormBuilderMarkersComponent,
  FormDiffMatchPatch,
  FormFieldGroup,
  FormInsertPatch,
  FormInsertPatchPosition,
  FormPatch,
  FormPatchJSONValue,
  FormPatchOrigin,
  FormSetIfMissingPatch,
  FormSetPatch,
  FormUnsetPatch,
  InputProps,
  InsertItemEvent,
  ItemProps,
  MoveItemEvent,
  NumberFieldProps,
  NumberInputProps,
  NumberFormNode,
  ObjectFieldProps,
  ObjectInputProps,
  ObjectItemProps,
  ObjectMember,
  ObjectFormNode,
  PatchArg,
  PortableTextMarker,
  PrimitiveFormNode,
  PrimitiveItemProps,
  RenderArrayOfObjectsItemCallback,
  RenderArrayOfPrimitivesItemCallback,
  RenderCustomMarkers,
  RenderFieldCallback,
  RenderInputCallback,
  StringFieldProps,
  StringInputProps,
  StringFormNode,
} from '../form'

export {
  useClient,
  useConnectionState,
  useDataset,
  useDocumentOperation,
  useEditState,
  useProjectId,
  useSchema,
  useSyncState,
  useTemplates,
  useTools,
  useValidationStatus,
} from '../hooks'

export type {ConnectionState, SyncState, ValidationStatus} from '../hooks'

export type {FormFieldPresence} from '../presence'

export type {
  Route,
  RouteChildren,
  RouteSegment,
  RouteTransform,
  Router,
  RouterNode,
  RouterState,
} from '../router'

export {
  renderStudio,
  SourceProvider,
  Studio,
  StudioProvider,
  ToolLink,
  ToolMenu,
  useColorScheme,
  useConfig,
  useSource,
  useWorkspace,
  WorkspaceProvider,
} from '../studio'

export type {
  SourceProviderProps,
  StudioProps,
  StudioProviderProps,
  ToolLinkProps,
  ToolMenuProps,
  WorkspaceProviderProps,
} from '../studio'

export type {StudioTheme} from '../theme'

export {defaultTheme} from '../theme'

export type {Template, TemplateResponse} from '../templates'

export {getDraftId, getPublishedId} from '../util'

export type {
  ArrayFieldDefinition,
  FieldDefinition,
  InitialValueTemplateItem,
  ReferenceTarget,
  TemplateParameter,
  TypeTarget,
} from '../templates'

export type {DraftId, Opaque, PublishedId} from '../util'
