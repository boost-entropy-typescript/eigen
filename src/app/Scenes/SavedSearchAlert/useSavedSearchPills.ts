import { useLocalizedUnit } from "app/utils/useLocalizedUnit"
import { useMemo } from "react"
import { SavedSearchStore } from "./SavedSearchStore"
import { extractPills } from "./pillExtractors"

export const useSavedSearchPills = (options?: { convertUnit?: boolean; unit: "cm" | "in" }) => {
  const { localizedUnit } = useLocalizedUnit()
  const attributes = SavedSearchStore.useStoreState((state) => state.attributes)
  const aggregations = SavedSearchStore.useStoreState((state) => state.aggregations)
  const entity = SavedSearchStore.useStoreState((state) => state.entity)

  return useMemo(
    () =>
      extractPills({
        attributes,
        aggregations,
        unit: options?.unit ?? localizedUnit,
        entity,
        convertUnit: !!options?.convertUnit,
      }),
    [attributes, aggregations, localizedUnit, entity, options?.convertUnit, options?.unit]
  )
}
