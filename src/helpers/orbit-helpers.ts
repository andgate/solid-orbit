import { QueryResultData } from '@orbit/record-cache'
import { OrbitRecord } from 'solid-orbit/types'

export const isSameRecord = (a: OrbitRecord, b: OrbitRecord): boolean =>
  a.id == b.id && a.type == b.type

export const isRecordInList = (
  record: OrbitRecord,
  recordList: OrbitRecord[]
): boolean => recordList.some((l: OrbitRecord) => isSameRecord(record, l))

export const isRecordInQueryResult = (
  record: OrbitRecord,
  queryResult: QueryResultData
): boolean => isRecordInList(record, getRecordsFromQueryResult(queryResult))

export const getRecordsFromQueryResult = (
  queryResult: QueryResultData
): OrbitRecord[] =>
  !queryResult ? [] : Array.isArray(queryResult) ? queryResult : [queryResult]

export const getRelatedRecords = (
  record: OrbitRecord,
  relationship: string
): OrbitRecord[] => {
  if (!record.relationships) return []
  if (!(relationship in record.relationships)) return []
  const relationshipData = record.relationships[relationship].data
  if (!relationshipData) return []
  return Array.isArray(relationshipData) ? relationshipData : [relationshipData]
}

export const isRelatedRecord = (
  record: OrbitRecord,
  parentRecord: OrbitRecord,
  relationship: string
): boolean =>
  isRecordInList(record, getRelatedRecords(parentRecord, relationship))

export const isRelatedToAnyRecords = (
  record: OrbitRecord,
  parentRecords: OrbitRecord[],
  relationship: string
): boolean =>
  parentRecords.some((parentRecord) =>
    isRelatedRecord(record, parentRecord, relationship)
  )

export const isRelatedToQueryResult = (
  record: OrbitRecord,
  queryResult: QueryResultData,
  relationship: string
): boolean =>
  isRelatedToAnyRecords(
    record,
    getRecordsFromQueryResult(queryResult),
    relationship
  )
