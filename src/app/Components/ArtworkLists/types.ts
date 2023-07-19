import { Dispatch } from "react"

export interface RecentlyAddedArtworkList {
  internalID: string
  name: string
}

export enum ResultAction {
  SavedToDefaultArtworkList,
  RemovedFromDefaultArtworkList,
  ModifiedArtworkLists,
}

export interface ArtworkEntity {
  id: string
  internalID: string
  title: string
  year: string | null
  artistNames: string | null
  imageURL: string | null
}

export type SaveResult = {
  action: ResultAction
  artwork: ArtworkEntity
}

export enum ArtworkListMode {
  AddingArtworkList = "addingArtworkLists",
  RemovingArtworkList = "removingArtworkLists",
}

export interface ArtworkListEntity {
  internalID: string
  name: string
}

export type ArtworkListState = {
  createNewArtworkListViewVisible: boolean
  artwork: ArtworkEntity | null
  artworkListID: string | null
  recentlyAddedArtworkList: RecentlyAddedArtworkList | null
  selectedTotalCount: number
  addingArtworkLists: ArtworkListEntity[]
  removingArtworkLists: ArtworkListEntity[]
  hasUnsavedChanges: boolean
  toastBottomPadding: number | null
}

export type ArtworkListAction =
  | { type: "SET_TOAST_BOTTOM_PADDING"; payload: number }
  | { type: "SET_CREATE_NEW_ARTWORK_LIST_VIEW_VISIBLE"; payload: boolean }
  | {
      type: "OPEN_SELECT_ARTWORK_LISTS_VIEW"
      payload: {
        artwork: ArtworkEntity | null
        artworkListID: string | null
      }
    }
  | { type: "SET_RECENTLY_ADDED_ARTWORK_LIST"; payload: RecentlyAddedArtworkList | null }
  | { type: "RESET" }
  | {
      type: "ADD_OR_REMOVE_ARTWORK_LIST"
      payload: { mode: ArtworkListMode; artworkList: ArtworkListEntity }
    }
  | { type: "SET_SELECTED_TOTAL_COUNT"; payload: number }
  | { type: "SET_UNSAVED_CHANGES"; payload: boolean }

export interface ArtworkListsContextState {
  state: ArtworkListState
  artworkListId?: string
  addingArtworkListIDs: string[]
  removingArtworkListIDs: string[]
  dispatch: Dispatch<ArtworkListAction>
  reset: () => void
  onSave: (result: SaveResult) => void
}
