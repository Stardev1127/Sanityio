import {Modifier} from '@popperjs/core'
import React, {useCallback, useState} from 'react'
import {usePopper} from 'react-popper'
import styles from 'part:@sanity/components/selects/searchable-style'
import FaAngleDown from 'part:@sanity/base/angle-down-icon'
import DefaultTextInput from 'part:@sanity/components/textinputs/default'
import Spinner from 'part:@sanity/components/loading/spinner'
import {Modal} from 'part:@sanity/components/modal'
import CloseIcon from 'part:@sanity/base/close-icon'
import CaptureOutsideClicks from '../utilities/CaptureOutsideClicks'
import Escapable from '../utilities/Escapable'
import Stacked from '../utilities/Stacked'
import SelectMenu from './SelectMenu'

// @todo
type Item = unknown
type Value = any

interface StatelessSearchableSelectProps {
  onChange?: (item: Item) => void
  value?: Value
  inputValue?: string
  onInputChange?: (val: string) => void
  onClear?: () => void
  renderItem: (item: Item) => React.ReactNode
  placeholder?: string
  isLoading?: boolean
  isOpen?: boolean
  onOpen?: () => void
  onClose?: (event?: Event) => void
  openItemElement?: (value: Value) => React.ReactNode
  items?: Item[]
  highlightIndex?: number
  onHighlightIndexChange?: (index: number) => void
  isInputSelected?: boolean
  disabled?: boolean
  dropdownPosition?: string
  readOnly?: boolean
  inputId?: string
}

const sameWidthModifier: Modifier<'sameWidth', any> = {
  name: 'sameWidth',
  enabled: true,
  phase: 'beforeWrite',
  requires: ['computeStyles'],
  fn({state}) {
    state.styles.popper.width = `${state.rects.reference.width}px`
  }
}

const StatelessSearchableSelect = React.forwardRef(
  // eslint-disable-next-line complexity
  (props: StatelessSearchableSelectProps & React.HTMLProps<HTMLInputElement>, ref) => {
    const {
      onClear,
      placeholder,
      isLoading,
      value,
      items = [],
      isOpen,
      highlightIndex = -1,
      isInputSelected,
      inputValue,
      onChange,
      onInputChange,
      onOpen,
      onClose,
      dropdownPosition = 'bottom-start',
      disabled,
      onHighlightIndexChange,
      openItemElement,
      readOnly,
      renderItem: renderItemProp,
      ...rest
    } = props

    const itemsLen = items.length

    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null)
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
    const popper = usePopper(referenceElement, popperElement, {
      placement: dropdownPosition as any,
      modifiers: [
        {
          name: 'preventOverflow',
          options: {
            altAxis: true,
            padding: 8,
            tether: false
          }
        },
        sameWidthModifier
      ]
    })

    const handleSelect = useCallback(
      (item: Item) => {
        if (onChange) onChange(item)
      },
      [onChange]
    )

    const handleClose = useCallback(
      (event?: Event) => {
        if (onClose) onClose(event)
      },
      [onClose]
    )

    const handleArrowClick = useCallback(() => {
      if (isOpen) {
        handleClose()
      } else if (onOpen) onOpen()
    }, [handleClose, isOpen, onOpen])

    const handleArrowKeyPress = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
          handleArrowClick()
        }
      },
      [handleArrowClick]
    )

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onInputChange) onInputChange(event.target.value)
      },
      [onInputChange]
    )

    const handleKeyDown = useCallback(
      // eslint-disable-next-line complexity
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' && !isOpen) {
          if (onOpen) onOpen()
        }

        if (itemsLen === 0) {
          return
        }

        const lastIndex = itemsLen - 1

        if (event.key === 'ArrowUp') {
          event.preventDefault()

          const nextIndex = highlightIndex - 1

          if (onHighlightIndexChange) {
            onHighlightIndexChange(nextIndex < 0 ? lastIndex : nextIndex)
          }
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()

          if (!isOpen && onOpen) onOpen()

          const nextIndex = highlightIndex + 1

          if (onHighlightIndexChange) {
            onHighlightIndexChange(nextIndex > lastIndex ? 0 : nextIndex)
          }
        }
      },
      [highlightIndex, isOpen, itemsLen, onHighlightIndexChange, onOpen]
    )

    const handleKeyUp = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && highlightIndex > -1 && items[highlightIndex]) {
          if (onChange) onChange(items[highlightIndex])
        }
      },
      [highlightIndex, items, onChange]
    )

    const renderItem = useCallback(
      (item: Item) => {
        return <div className={styles.item}>{renderItemProp(item)}</div>
      },
      [renderItemProp]
    )

    return (
      <>
        <div
          ref={setReferenceElement}
          className={disabled ? styles.selectContainerDisabled : styles.selectContainer}
        >
          <DefaultTextInput
            {...rest}
            className={styles.select}
            placeholder={placeholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            value={inputValue || ''}
            selected={isInputSelected}
            disabled={disabled}
            ref={ref as any}
            spellCheck="false"
            readOnly={readOnly}
          />
          <div className={styles.functions}>
            {openItemElement && value && (
              <span className={styles.openItem}>{openItemElement(value)}</span>
            )}
            {!readOnly && onClear && value && (
              <button type="button" className={styles.clearButton} onClick={onClear}>
                <CloseIcon />
              </button>
            )}
            {!readOnly && (
              <div className={styles.arrowAndSpinnerContainer}>
                {!isLoading && (
                  <div
                    className={styles.arrow}
                    onClick={disabled ? undefined : handleArrowClick}
                    tabIndex={0}
                    onKeyPress={disabled ? undefined : handleArrowKeyPress}
                  >
                    <FaAngleDown />
                  </div>
                )}
                {isLoading && (
                  <div className={styles.spinner}>
                    <Spinner />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {isOpen && (
          <Modal>
            <Stacked>
              {isActive => (
                <div
                  ref={setPopperElement}
                  className={styles.popper}
                  style={popper.styles.popper}
                  {...popper.attributes.popper}
                >
                  <CaptureOutsideClicks
                    onClickOutside={isActive && isOpen ? handleClose : undefined}
                  >
                    <div
                      className={
                        itemsLen === 0 ? styles.listContainerNoResult : styles.listContainer
                      }
                    >
                      <Escapable onEscape={handleClose} />
                      <div
                        className={
                          itemsLen === 0 && !isLoading
                            ? styles.noResultText
                            : styles.noResultTextHidden
                        }
                      >
                        No results
                      </div>
                      {itemsLen > 0 && (
                        <SelectMenu
                          items={items}
                          value={value}
                          onSelect={handleSelect}
                          renderItem={renderItem}
                          highlightIndex={highlightIndex}
                        />
                      )}
                    </div>
                  </CaptureOutsideClicks>
                </div>
              )}
            </Stacked>
          </Modal>
        )}
      </>
    )
  }
)

StatelessSearchableSelect.displayName = 'StatelessSearchableSelect'

export default StatelessSearchableSelect
