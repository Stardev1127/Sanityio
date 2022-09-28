import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {isNonNullable} from '../../util/isNonNullable'
import {useThrottledCallback} from '../../util/useThrottledCallback'
import {getHookId} from './actionId'
import {HookStateContainer} from './HookStateContainer'
import {cancelIdleCallback, requestIdleCallback} from './requestIdleCallback'
import {ActionHook} from './types'

interface GetHookCollectionStateProps<T, K> {
  args: T
  children: (props: {states: K[]}) => React.ReactNode
  hooks: ActionHook<T, K>[]
  onReset?: () => void
}

export function GetHookCollectionState<T, K>(props: GetHookCollectionStateProps<T, K>) {
  const {hooks, args, children, onReset} = props

  const statesRef = useRef<Record<string, {value: K}>>({})
  const [tickId, setTick] = useState(0)

  const [keys, setKeys] = useState<Record<string, number>>({})
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const ricHandle = useRef<number | null>(null)

  const handleRequestUpdate = useCallback(() => {
    if (ricHandle.current) {
      cancelIdleCallback(ricHandle.current)
    }

    ricHandle.current = requestIdleCallback(() => {
      ricHandle.current = null

      if (mountedRef.current) {
        setTick((tick) => tick + 1)
      }
    })
  }, [])

  const handleRequestUpdateThrottled = useThrottledCallback(handleRequestUpdate, 60, {
    trailing: true,
  })

  const handleNext = useCallback((id: any, hookState: any) => {
    if (hookState === null) {
      delete statesRef.current[id]
    } else {
      const current = statesRef.current[id]
      statesRef.current[id] = {...current, value: hookState}
    }
  }, [])

  const handleReset = useCallback(
    (id: any) => {
      setKeys((currentKeys) => ({...currentKeys, [id]: (currentKeys[id] || 0) + 1}))

      if (onReset) {
        onReset()
      }
    },
    [onReset]
  )

  const hookIds = useMemo(() => hooks.map((hook) => getHookId(hook)), [hooks])

  const states = useMemo(
    () => hookIds.map((id) => statesRef.current[id]?.value).filter(isNonNullable),
    [hookIds, tickId]
  )

  return (
    <>
      {hooks.map((hook) => {
        const id = getHookId(hook)
        const key = keys[id] || 0

        return (
          <HookStateContainer
            key={`${id}-${key}`}
            hook={hook}
            id={id}
            args={args}
            onNext={handleNext}
            onRequestUpdate={handleRequestUpdateThrottled}
            onReset={handleReset}
          />
        )
      })}

      {children({states})}
    </>
  )
}
