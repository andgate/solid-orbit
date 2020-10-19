import { Transform } from '@orbit/data'
import MemorySource from '@orbit/memory'
import { createMemo, createSignal, onCleanup } from 'solid-js'
import { useMemorySource } from 'solid-orbit/hooks/useMemorySource'
import { doesTransformCauseUpdate } from 'solid-orbit/helpers/doesTransformCauseUpdate'
import { getRecordsFromQueryResult } from 'solid-orbit/helpers/orbit-helpers'
import { IQuerySubscriptions, RecordsToProps } from 'solid-orbit/types'

export const useQuery = <T extends Record<string, unknown>>(
  subscribeToQueries: RecordsToProps<T>
): (() => T) => {
  const memory = useMemorySource()

  const initialData = createMemo(() =>
    getDataFromCache<T>(memory, subscribeToQueries)
  )

  const [data, setData] = createSignal<T>(initialData())

  const handleTransform = () =>
    subscribeTo(memory, setData, data(), subscribeToQueries)

  memory.on('transform', handleTransform())

  onCleanup(() => {
    memory.off('transform', handleTransform())
  })

  return data
}

type HandleTransform = (transform: Transform) => void

const subscribeTo = <T extends Record<string, unknown>>(
  memory: MemorySource,
  setData: (v: T) => T,
  data: T,
  subscribeToQueries: RecordsToProps<T>
): HandleTransform => {
  const subscriptions = determineSubscriptions(memory, subscribeToQueries)
  return (transform: Transform): void => {
    const shouldUpdate = doesTransformCauseUpdate(
      memory,
      transform,
      subscriptions,
      data
    )

    if (shouldUpdate) {
      const results = getDataFromCache(memory, subscribeToQueries) as T

      setData(results)
    }
  }
}

const getDataFromCache = <TResult extends Record<string, unknown>>(
  memory: MemorySource,
  queries: RecordsToProps<TResult>
): TResult => {
  const results: any = {}

  Object.keys(queries).map((propName: string) => {
    const [qFn, processRecords] = queries[propName]
    const query = qFn(memory.queryBuilder)
    const queryResult = memory.cache.query(query)
    const records = getRecordsFromQueryResult(queryResult)
    const result = processRecords(records)

    results[propName] = result
  })

  return results as TResult
}

const determineSubscriptions = <T extends Record<string, unknown>>(
  memory: MemorySource,
  recordQueries: RecordsToProps<T>
): IQuerySubscriptions => {
  const recordQueryKeys = Object.keys(recordQueries)
  const subscriptions: IQuerySubscriptions = {}

  // Iterate all queries, to make a list of models to listen for
  recordQueryKeys.forEach((prop) => {
    const queryExpression = recordQueries[prop][0](memory.queryBuilder)

    subscriptions[prop] = queryExpression
  })

  return subscriptions
}
