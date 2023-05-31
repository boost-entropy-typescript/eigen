import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { useReducer } from "react"
import { Record } from "relay-runtime/lib/store/RelayStoreTypes"

export type CleanRelayFragment<T> = Omit<
  T,
  "$refType" | " $fragmentRefs" | " $fragmentSpreads" | " $fragmentType"
>

/**
 * Extract type from a relay connection
 *
 * @example
 * type nodeElement = ExtractNodeType<QueryOrFragment_query["connectionFieldName"]>
 */
export type ExtractNodeType<T> = T extends { edges: any }
  ? NonNullable<NonNullable<NonNullable<NonNullable<T>["edges"]>[number]>["node"]>
  : never

const getStore = () => getRelayEnvironment().getStore()

/**
 * Find a relay  from the Relay store by providing a key value pair
 * (e.g. findRelayRecord("slug", "artwork-slug"))
 */
export const findRelayRecord = (key: string, value: any): Record | undefined => {
  const store = getStore()

  const record = Object.values(store.getSource().toJSON()).find((e: Record) => e[key] === value)

  return record
}

/**
 * Find a record fro the Relay store by reference ID
 * (e.g. findRelayRecordByDataID(myRecord.__ref))
 */
export const findRelayRecordByDataID = (id: string): Record | undefined | null => {
  const store = getStore()
  const record = store.getSource().get(id)

  return record
}

/**
 * Returns a fetchKey and a refetch function that can be used to force a refetch of a relay query
 */
export const useRefetch = () => {
  const [fetchKey, refetch] = useReducer((state: number) => state + 1, 0)

  return { fetchKey, refetch }
}
