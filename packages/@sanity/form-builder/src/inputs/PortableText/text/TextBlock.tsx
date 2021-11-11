import React, {useMemo} from 'react'
import {Box, Flex, ResponsivePaddingProps, Theme, Tooltip} from '@sanity/ui'
import styled, {css} from 'styled-components'
import {hues} from '@sanity/color'
import {isKeySegment, Marker} from '@sanity/types'
import {PortableTextBlock, RenderAttributes} from '@sanity/portable-text-editor'
import {ChangeIndicatorWithProvidedFullPath} from '@sanity/base/change-indicators'
import {Markers} from '../../../legacyParts'
import {RenderBlockActions, RenderCustomMarkers} from '../types'
import PatchEvent from '../../../PatchEvent'
import {BlockActions} from '../BlockActions'
import {TEXT_STYLES} from './textStyles'

export interface TextBlockProps {
  attributes: RenderAttributes
  block: PortableTextBlock
  blockRef?: React.RefObject<HTMLDivElement>
  children: React.ReactNode
  isFullscreen?: boolean
  markers: Marker[]
  onChange: (event: PatchEvent) => void
  readOnly: boolean
  renderBlockActions?: RenderBlockActions
  renderCustomMarkers?: RenderCustomMarkers
}

interface TextBlockStyleProps {
  $level?: number
  $listItem?: 'bullet' | 'number'
  $size: number
}

const HEADER_SIZES: {[key: string]: number | undefined} = {
  h1: 5,
  h2: 4,
  h3: 3,
  h4: 2,
  h5: 1,
  h6: 0,
}

const TEXT_STYLES_KEYS = Object.keys(TEXT_STYLES)
const HEADER_SIZES_KEYS = Object.keys(HEADER_SIZES)

const BULLET_MARKERS = ['●', '○', '■']
const NUMBER_FORMATS = ['number', 'lower-alpha', 'lower-roman']

export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function createListName(level: number) {
  return `list-level-${level}`
}

function textBlockStyle(props: TextBlockStyleProps & {theme: Theme}) {
  const {$level, $listItem, theme} = props
  const {fonts, color} = theme.sanity

  const overlay = css`
    content: '';
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: -4px;
    right: -4px;
    border-radius: ${theme.sanity.radius[2]}px;
  `

  return css`
    mix-blend-mode: ${color.dark ? 'screen' : 'multiply'};
    position: relative;

    & > [data-ui='TextBlock_inner'] {
      position: relative;
      flex: 1;
    }

    &[data-markers] > div:before {
      ${overlay}
      background-color: ${color.dark ? hues.purple[950].hex : hues.purple[50].hex};
    }

    &[data-warning] {
      --card-border-color: ${color.muted.caution.enabled.border};
      & > div:before {
        ${overlay}
        background-color: ${color.muted.caution.hovered.bg};
      }
    }

    &[data-invalid] {
      --card-border-color: ${color.muted.critical.enabled.border};
      & > div:before {
        ${overlay}
        background-color: ${color.muted.critical.hovered.bg};
      }
    }

    & [data-ui='TextBlock__text'] {
      overflow-wrap: anywhere;
      text-transform: none;
      white-space: pre-wrap;
      font-family: ${fonts.text.family};
      flex: 1;
      *::selection {
        background-color: ${color.selectable.primary.pressed.bg};
      }
    }

    & [data-list-prefix] {
      position: absolute;
      margin-left: -4.5rem;
      width: 3.75rem;
      text-align: right;
      box-sizing: border-box;

      ${$listItem === 'number' &&
      css`
        font-variant-numeric: tabular-nums;
        & > span:before {
          content: ${`counter(${createListName($level)})`} '.';
          content: ${`counter(${createListName($level)}, ${
              NUMBER_FORMATS[($level - 1) % NUMBER_FORMATS.length]
            })`}
            '.';
        }
      `}

      ${$listItem === 'bullet' &&
      css`
        & > span {
          position: relative;
          top: -0.1875em;

          &:before {
            content: '${BULLET_MARKERS[($level - 1) % BULLET_MARKERS.length]}';
            font-size: 0.46666em;
          }
        }
      `}
    }
  `
}

const TextRoot = styled(Flex)<TextBlockStyleProps>(textBlockStyle)

const InnerFlex = styled(Flex)`
  position: relative;
`

const ListPrefixWrap = styled.div`
  user-select: none;
  white-space: nowrap;
`

const BlockActionsOuter = styled(Box)`
  line-height: 0;
  width: 25px;
  position: relative;
  user-select: none;

  /* Without this, select all (CMD-A) will not work properly */
  /* when the editor is in non-fullscreen mode. */
  &:before {
    content: ' ';
    font-size: 0;
  }
`

const BlockActionsInner = styled(Flex)`
  position: absolute;
  right: 0;
  top: -7px;
`

const TooltipBox = styled(Box)`
  max-width: 250px;
`

const TextFlex = styled(Flex)<{$level?: number}>`
  position: relative;

  ${({$level}) =>
    $level &&
    css`
      padding-left: ${$level * 32}px;
    `}
`

const ChangeIndicatorWrapper = styled.div(({theme}: {theme: Theme}) => {
  const {space} = theme.sanity

  return css`
    position: absolute;
    width: ${space[2]}px;
    right: -${space[2]}px;
    top: -${space[1]}px;
    bottom: -${space[1]}px;
    overflow-x: hidden;
    padding-left: ${space[1]}px;
    user-select: none;
  `
})

const StyledChangeIndicatorWithProvidedFullPath = styled(ChangeIndicatorWithProvidedFullPath)`
  width: 1px;
  height: 100%;

  & > div {
    height: 100%;
  }
`

export function TextBlock(props: TextBlockProps): React.ReactElement {
  const {
    attributes,
    block,
    blockRef,
    children,
    isFullscreen,
    markers,
    onChange,
    readOnly,
    renderBlockActions,
    renderCustomMarkers,
  } = props
  const {focused} = attributes

  // These are marker that is only for the block level (things further up, like annotations and inline objects are dealt with in their respective components)
  const blockMarkers = useMemo(
    () =>
      markers.filter(
        (marker) =>
          marker.path.length === 1 &&
          isKeySegment(marker.path[0]) &&
          marker.path[0]._key === block._key
      ),
    [block._key, markers]
  )

  const errorMarkers = useMemo(
    () => blockMarkers.filter((marker) => marker.type === 'validation' && marker.level === 'error'),
    [blockMarkers]
  )
  const warningMarkers = useMemo(
    () =>
      blockMarkers.filter((marker) => marker.type === 'validation' && marker.level === 'warning'),
    [blockMarkers]
  )

  const hasMarkers = blockMarkers.length > 0
  const hasErrors = errorMarkers.length > 0
  const hasWarning = warningMarkers.length > 0

  const {$size, $style} = useMemo((): {$size: number; $style: 'text' | 'heading'} => {
    if (HEADER_SIZES_KEYS.includes(block.style)) {
      return {$style: 'heading', $size: HEADER_SIZES[block.style]}
    }

    return {$size: 2, $style: 'text'}
  }, [block])

  const text = useMemo(() => {
    const hasTextStyle = TEXT_STYLES_KEYS.includes(block.style)
    const TextComponent = TEXT_STYLES[hasTextStyle ? block?.style : 'normal']

    if (hasTextStyle) {
      return (
        <TextFlex align="flex-start" $level={block?.level}>
          {block.listItem && (
            <ListPrefixWrap contentEditable={false}>
              <TextComponent data-list-prefix />
            </ListPrefixWrap>
          )}
          <div data-ui="TextBlock__text">
            <TextComponent>{children}</TextComponent>
          </div>
        </TextFlex>
      )
    }

    if (block.listItem) {
      return (
        <TextFlex align="flex-start" $level={block?.level}>
          {block.listItem && (
            <ListPrefixWrap contentEditable={false}>
              <TextComponent data-list-prefix />
            </ListPrefixWrap>
          )}
          <div data-ui="TextBlock__text">{children}</div>
        </TextFlex>
      )
    }

    return <div data-ui="TextBlock__text">{children}</div>
  }, [block.style, block.listItem, block.level, children])

  const outerPaddingProps: ResponsivePaddingProps = useMemo(() => {
    if (block.listItem) {
      return {paddingY: 2}
    }

    switch (block.style) {
      case 'h1': {
        return {paddingTop: 5, paddingBottom: 4}
      }
      case 'h2': {
        return {paddingTop: 4, paddingBottom: 4}
      }
      case 'h3': {
        return {paddingTop: 4, paddingBottom: 3}
      }
      case 'h4': {
        return {paddingTop: 4, paddingBottom: 3}
      }
      case 'h5': {
        return {paddingTop: 4, paddingBottom: 3}
      }
      case 'h6': {
        return {paddingTop: 4, paddingBottom: 2}
      }
      case 'normal': {
        return {paddingTop: 2, paddingBottom: 3}
      }
      case 'blockquote': {
        return {paddingTop: 2, paddingBottom: 3}
      }
      default: {
        return {paddingY: 2}
      }
    }
  }, [block])

  const innerPaddingProps: ResponsivePaddingProps = useMemo(() => {
    if (isFullscreen && !renderBlockActions) {
      return {paddingX: 5}
    }

    if (isFullscreen && renderBlockActions) {
      return {paddingLeft: 5, paddingRight: 2}
    }

    if (renderBlockActions) {
      return {
        paddingLeft: 3,
        paddingRight: 2,
      }
    }

    return {paddingX: 3}
  }, [isFullscreen, renderBlockActions])

  const markersToolTip = useMemo(
    () =>
      hasErrors || hasWarning || (hasMarkers && renderCustomMarkers) ? (
        <Tooltip
          placement="top"
          boundaryElement={blockRef?.current}
          portal="editor"
          content={
            <TooltipBox padding={2}>
              <Markers markers={blockMarkers} renderCustomMarkers={renderCustomMarkers} />
            </TooltipBox>
          }
        >
          {text}
        </Tooltip>
      ) : undefined,
    [blockMarkers, blockRef, hasErrors, hasWarning, hasMarkers, renderCustomMarkers, text]
  )

  return (
    <Box {...outerPaddingProps}>
      <InnerFlex>
        <Box flex={1} {...innerPaddingProps}>
          <TextRoot
            $level={block.level}
            $listItem={block.listItem}
            $size={$size}
            data-invalid={hasErrors || undefined}
            data-warning={hasWarning || undefined}
            data-level={block.level}
            data-list-item={block.listItem}
            data-markers={hasMarkers || undefined}
            data-style={$style}
            data-testid="text-block"
            ref={blockRef}
            flex={1}
          >
            <Box data-testid="text-block__inner">{markersToolTip || text}</Box>
          </TextRoot>
        </Box>
        <div
          contentEditable={false}
          // NOTE: it’s important that this element does not have the `user-select: none` CSS
          // property, because that will not work in Safari (breaks `Cmd+A`).
          // It seems Safari does not allow defining `user-select` on an element which also has
          // the `contenteditable="false"` attribute.
        >
          {renderBlockActions && (
            <BlockActionsOuter marginRight={1}>
              <BlockActionsInner>
                {focused && !readOnly && (
                  <BlockActions
                    onChange={onChange}
                    block={block}
                    renderBlockActions={renderBlockActions}
                  />
                )}
              </BlockActionsInner>
            </BlockActionsOuter>
          )}
          {isFullscreen && (
            <ChangeIndicatorWrapper>
              <StyledChangeIndicatorWithProvidedFullPath
                compareDeep
                value={block}
                hasFocus={focused}
                path={[{_key: block._key}]}
                withBadge={false}
              />
            </ChangeIndicatorWrapper>
          )}
        </div>
      </InnerFlex>
    </Box>
  )
}
