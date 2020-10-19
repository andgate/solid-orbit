import {
  FindRecord,
  FindRecords,
  FindRelatedRecord,
  FindRelatedRecords,
  Operation,
  QueryExpression,
  Record as OrbitRecord,
  Transform,
} from '@orbit/data'
import MemorySource from '@orbit/memory'
import { IQuerySubscriptions } from 'solid-orbit/types'
import {
  isRecordInList,
  isRecordInQueryResult,
  isRelatedToQueryResult,
  isSameRecord,
} from 'solid-orbit/helpers/orbit-helpers'

export enum Op {
  // Queries
  FIND_RECORD = 'findRecord',
  FIND_RELATED_RECORD = 'findRelatedRecord',
  FIND_RELATED_RECORDS = 'findRelatedRecords',
  FIND_RECORDS = 'findRecords',

  // Things that can be done to change the store's contents
  ADD_RECORD = 'addRecord',
  REPLACE_RECORD = 'replaceRecord',
  REMOVE_RECORD = 'removeRecord',
  REPLACE_KEY = 'replaceKey',
  REPLACE_ATTRIBUTE = 'replaceAttribute',
  ADD_TO_RELATED_RECORDS = 'addToRelatedRecords',
  REMOVE_FROM_RELATED_RECORDS = 'removeFromRelatedRecords',
  REPLACE_RELATED_RECORD = 'replaceRelatedRecord',
  REPLACE_RELATED_RECORDS = 'replaceRelatedRecords',
}

/**
 * 1. Generate a list of changed records, and potentially changed related records
 * 2. Match against our list of subscriptions
 *
 * @param dataStore
 * @param transform
 * @param subscriptions
 */
export const doesTransformCauseUpdate = <
  TQueryResults extends Record<string, unknown>
>(
  memory: MemorySource,
  transform: Transform,
  subscriptions: IQuerySubscriptions,
  previousResults: TQueryResults
): boolean =>
  transform.operations.some((operation) =>
    isOperationRelevantToSubscriptions(
      memory,
      operation,
      subscriptions,
      previousResults
    )
  )

function isOperationRelevantToSubscriptions<
  TQueryResults extends Record<string, unknown>
>(
  memory: MemorySource,
  operation: Operation,
  subscriptions: IQuerySubscriptions,
  previousResults: TQueryResults
) {
  switch (operation.op) {
    case Op.ADD_RECORD:
    case Op.REPLACE_RECORD:

    case Op.REPLACE_KEY:
    case Op.REPLACE_ATTRIBUTE:

    case Op.ADD_TO_RELATED_RECORDS:
    case Op.REPLACE_RELATED_RECORD:
    case Op.REPLACE_RELATED_RECORDS:
      // Are we watching this record in anyway?
      return isRecordRelevantToAnySubscription(
        memory,
        (operation as any).record,
        subscriptions
      )

    case Op.REMOVE_RECORD:
    case Op.REMOVE_FROM_RELATED_RECORDS:
      return wasRecordRemovedFromAnySubscription(
        memory,
        (operation as any).record,
        subscriptions,
        previousResults
      )
    default:
      throw new Error(
        `query expression's op was not recognized for tracking data updates`
      )
  }
}

function wasRecordRemovedFromAnySubscription<
  TQueryResults extends Record<string, unknown>
>(
  memory: MemorySource,
  record: OrbitRecord,
  subscriptions: IQuerySubscriptions,
  previousResults: TQueryResults
) {
  // NOTE: we can't query for the record, because it was removed.
  return findInSubscription(
    subscriptions,
    (qExp: QueryExpression, propName: string): boolean => {
      const previousResult = previousResults[propName]

      // if the record was removed, and if it was already in our result list,
      // we don't need to check any of the query expressions
      const wasInPreviousResult = isRecordInList(
        record,
        Array.isArray(previousResult) ? previousResult : [previousResult]
      )

      if (wasInPreviousResult) {
        return true
      }

      switch (qExp.op) {
        case 'findRecord':
          isSameRecord((qExp as FindRecord).record, record)
          break
        case 'findRelatedRecord':
        case 'findRelatedRecords':
          // is the TransformRecordOperation related to the same thing as qExp.record via the relationship?
          const parentRecordQueryResult = memory.cache.query((q) =>
            q.findRecord(
              (qExp as FindRelatedRecord | FindRelatedRecords).record
            )
          )
          const doesRelationToRecordExist = isRelatedToQueryResult(
            record,
            parentRecordQueryResult,
            (qExp as FindRelatedRecord | FindRelatedRecords).relationship
          )
          return !doesRelationToRecordExist
        case 'findRecords':
          // running the query should not have the `record`, but that doesn't mean that it _was_ in the result
          if ((qExp as FindRecords).type === record.type) {
            const queryResult = memory.cache.query(qExp)
            return !isRecordInQueryResult(record, queryResult)
          }

          break
        default:
          throw new Error(
            `query expression's op was not recognized for tracking data updates`
          )
      }

      return false
    }
  )
}

function findInSubscription(
  subscriptions: IQuerySubscriptions,
  func: (query: QueryExpression, propName: string) => boolean
): boolean {
  const props = Object.keys(subscriptions)
  return props.some((prop) => {
    let qExp = subscriptions[prop]
    if ('expression' in qExp) qExp = qExp.toQueryExpression()

    return func(qExp as QueryExpression, prop)
  })
}

function isRecordRelevantToAnySubscription(
  memory: MemorySource,
  record: OrbitRecord,
  subscriptions: IQuerySubscriptions
) {
  return findInSubscription(subscriptions, (qExp: QueryExpression) => {
    const queryResult = memory.cache.query(qExp)

    switch (qExp.op) {
      case 'findRecord':
      case 'findRelatedRecord':
        return isRecordInQueryResult(record, queryResult)

      case 'findRelatedRecords:':
      case 'findRecords':
        return isRecordInQueryResult(record, queryResult)
      default:
        throw new Error(
          `query expression's op was not recognized for tracking data updates`
        )
    }
  })
}
