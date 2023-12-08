import { OwnerType } from "@artsy/cohesion"
import { Aggregations } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  SavedSearchEntity,
  SearchCriteria,
  SearchCriteriaAttributes,
} from "app/Components/ArtworkFilter/SavedSearch/types"
import { Metric } from "app/Scenes/Search/UserPrefsModel"
import { Action, action, createContextStore } from "easy-peasy"
import { pick } from "lodash"

export interface SavedSearchModel {
  aggregations: Aggregations
  attributes: SearchCriteriaAttributes
  /** Artwork ID, if the current saved search alert is being set from an artwork */
  currentArtworkID?: string
  currentSavedSearchID?: string
  dirty: boolean
  entity: SavedSearchEntity
  unit: Metric

  addValueToAttributesByKeyAction: Action<
    this,
    {
      key: SearchCriteria
      value: string | string[] | boolean | null
    }
  >
  clearAllAttributesAction: Action<this>
  removeValueFromAttributesByKeyAction: Action<
    this,
    {
      key: SearchCriteria
      value: string | string[] | number | boolean
    }
  >
  setAttributeAction: Action<this, { key: SearchCriteria; value: any }>
  setUnitAction: Action<this, Metric>
  setCurrentSavedSearchID: Action<this, string>
}

export const savedSearchModel: SavedSearchModel = {
  attributes: {},
  aggregations: [],
  currentArtworkID: undefined,
  currentSavedSearchID: undefined,
  dirty: false,
  entity: {
    artists: [],
    owner: {
      type: OwnerType.artist,
      id: "",
      slug: "",
    },
  },
  // this will be overwritten by the user's default unit when we initialize the store
  unit: "in",

  addValueToAttributesByKeyAction: action((state, payload) => {
    if (payload.key === "priceRange" && typeof payload.value === "string") {
      // set form dirty on price update
      if (state.attributes[payload.key] !== payload.value) {
        state.dirty = true
      }

      // set the price range to be null if the value is *-* (which means empty)
      state.attributes[payload.key] = payload.value === "*-*" ? null : payload.value
    } else {
      state.attributes[payload.key] = payload.value as unknown as null | undefined
    }
  }),

  clearAllAttributesAction: action((state) => {
    state.attributes = pick(state.attributes, ["artistIDs", "artistID"])
    state.dirty = true
  }),

  removeValueFromAttributesByKeyAction: action((state, payload) => {
    const prevValue = state.attributes[payload.key]

    if (Array.isArray(prevValue)) {
      ;(state.attributes[payload.key] as string[]) = prevValue.filter(
        (value) => value !== payload.value
      )
    } else {
      state.attributes[payload.key] = null
    }

    state.dirty = true
  }),

  setAttributeAction: action((state, payload) => {
    state.attributes[payload.key] = payload.value
  }),

  setUnitAction: action((state, payload) => {
    state.unit = payload
  }),

  setCurrentSavedSearchID: action((state, payload) => {
    state.currentSavedSearchID = payload
  }),
}

export const SavedSearchStore = createContextStore<SavedSearchModel>(
  (initialData) => ({
    ...savedSearchModel,
    ...initialData,
  }),
  { name: "SavedSearchStore" }
)
export const SavedSearchStoreProvider = SavedSearchStore.Provider
