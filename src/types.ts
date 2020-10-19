import * as orbit from '@orbit/data'
import {
  QueryBuilderFunc,
  QueryExpression,
  QueryTerm,
  TransformBuilderFunc,
} from '@orbit/data'

export type OrbitRecord = orbit.Record

export type ToModel<T> = (results: OrbitRecord[]) => T

export type RecordsToProps<T extends Record<string, unknown>> = {
  [P in keyof T]: [QueryBuilderFunc, ToModel<T[P]>]
}

export type TransformsToActions<T> = {
  [P in keyof T]: (...args: any) => TransformBuilderFunc
}

export interface IQuerySubscriptions {
  [propName: string]: QueryExpression | QueryTerm
}
