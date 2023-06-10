import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { dispatchArtworkSavedStateChanged } from "app/Components/ArtworkLists/ArtworkListEvents"
import { ArtworkListEntity } from "app/Components/ArtworkLists/types"
import { useArtworkListToast } from "app/Components/ArtworkLists/useArtworkListsToast"
import { CreateNewArtworkListView } from "app/Components/ArtworkLists/views/CreateNewArtworkListView/CreateNewArtworkListView"
import { SelectArtworkListsForArtworkView } from "app/Components/ArtworkLists/views/SelectArtworkListsForArtworkView/SelectArtworkListsForArtworkView"
import { createContext, FC, useCallback, useContext, useReducer } from "react"
import {
  ArtworkEntity,
  ArtworkListAction,
  ArtworkListsContextState,
  ArtworkListState,
  ResultAction,
  SaveResult,
} from "./types"

export interface ArtworkListsProviderProps {
  artworkListId?: string
  // Needs for tests
  artwork?: ArtworkEntity
}

export const ARTWORK_LISTS_CONTEXT_INITIAL_STATE: ArtworkListState = {
  createNewArtworkListViewVisible: false,
  artwork: null,
  artworkListID: null,
  recentlyAddedArtworkList: null,
  selectedTotalCount: 0,
  addingArtworkLists: [],
  removingArtworkLists: [],
  hasUnsavedChanges: false,
}

export const ArtworkListsContext = createContext<ArtworkListsContextState>(
  null as unknown as ArtworkListsContextState
)

export const useArtworkListsContext = () => {
  return useContext(ArtworkListsContext)
}

/**
 *
 * If `artworkListId` was passed, it means the user is on the artwork lists page
 * In this case, whether the artwork is saved or not will depend on the local state (not on the status received from backend)
 */
export const ArtworkListsProvider: FC<ArtworkListsProviderProps> = ({
  children,
  artworkListId,
  artwork,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...ARTWORK_LISTS_CONTEXT_INITIAL_STATE,
    artwork: artwork ?? null,
  })
  const toast = useArtworkListToast()

  const showToastForAddedLists = (artwork: ArtworkEntity, artworkLists: ArtworkListEntity[]) => {
    if (artworkLists.length === 1) {
      toast.addedToSingleArtworkList({
        artwork,
        artworkList: artworkLists[0],
      })
      return
    }

    return toast.addedToMultipleArtworkLists({
      artwork,
      artworkLists,
    })
  }

  const showToastForRemovedLists = (artwork: ArtworkEntity, artworkLists: ArtworkListEntity[]) => {
    if (artworkLists.length === 1) {
      toast.removedFromSingleArtworkList({
        artwork,
        artworkList: artworkLists[0],
      })
      return
    }

    return toast.removedFromMultipleArtworkLists({
      artwork,
      artworkLists,
    })
  }

  const modifiedArtworkLists = (
    artwork: ArtworkEntity,
    addedArtworkLists: ArtworkListEntity[],
    removedArtworkLists: ArtworkListEntity[]
  ) => {
    if (addedArtworkLists.length > 0 && removedArtworkLists.length > 0) {
      toast.changesSaved({
        artwork,
      })
      return
    }

    if (addedArtworkLists.length > 0) {
      showToastForAddedLists(artwork, addedArtworkLists)
      return
    }

    if (removedArtworkLists.length > 0) {
      showToastForRemovedLists(artwork, removedArtworkLists)
      return
    }
  }

  const savedToDefaultArtworkList = (artwork: ArtworkEntity) => {
    const openSelectArtworkListsForArtworkView = () => {
      dispatch({
        type: "OPEN_SELECT_ARTWORK_LISTS_VIEW",
        payload: {
          artwork,
          artworkListID: null,
        },
      })
    }

    toast.savedToDefaultArtworkList({
      artwork,
      onToastPress: openSelectArtworkListsForArtworkView,
    })
  }

  const onSave = (result: SaveResult) => {
    dispatch({ type: "SET_UNSAVED_CHANGES", payload: false })

    if (state.artworkListID !== null) {
      if (result.action !== ResultAction.ModifiedArtworkLists) {
        throw new Error("You should pass `ModifiedArtworkLists` action")
      }

      const isArtworkListAdded = isArtworkListsIncludes(
        state.artworkListID,
        state.addingArtworkLists
      )
      const isArtworkListRemoved = isArtworkListsIncludes(
        state.artworkListID,
        state.removingArtworkLists
      )

      if (isArtworkListAdded || isArtworkListRemoved) {
        dispatchArtworkSavedStateChanged(state.artwork!.internalID)
      }

      toast.changesSaved({
        artwork: result.artwork,
      })

      return
    }

    if (result.action === ResultAction.SavedToDefaultArtworkList) {
      savedToDefaultArtworkList(result.artwork)
      return
    }

    if (result.action === ResultAction.RemovedFromDefaultArtworkList) {
      toast.removedFromDefaultArtworkList({
        artwork: result.artwork,
      })

      return
    }

    if (result.action === ResultAction.ModifiedArtworkLists) {
      modifiedArtworkLists(result.artwork, state.addingArtworkLists, state.removingArtworkLists)
      return
    }

    throw new Error("Unexpected save result for artwork lists")
  }

  const reset = useCallback(() => {
    dispatch({
      type: "RESET",
    })
  }, [dispatch])

  const addingArtworkListIDs = state.addingArtworkLists.map((entity) => entity.internalID)
  const removingArtworkListIDs = state.removingArtworkLists.map((entity) => entity.internalID)
  const value: ArtworkListsContextState = {
    state,
    artworkListId,
    addingArtworkListIDs,
    removingArtworkListIDs,
    dispatch,
    reset,
    onSave,
  }

  return (
    <ArtworkListsContext.Provider value={value}>
      <BottomSheetModalProvider>
        {children}

        {!!state.artwork && (
          <>
            <SelectArtworkListsForArtworkView />
            {!!state.createNewArtworkListViewVisible && <CreateNewArtworkListView />}
          </>
        )}
      </BottomSheetModalProvider>
    </ArtworkListsContext.Provider>
  )
}

const reducer = (state: ArtworkListState, action: ArtworkListAction): ArtworkListState => {
  switch (action.type) {
    case "SET_CREATE_NEW_ARTWORK_LIST_VIEW_VISIBLE":
      return {
        ...state,
        createNewArtworkListViewVisible: action.payload,
      }
    case "OPEN_SELECT_ARTWORK_LISTS_VIEW":
      return {
        ...state,
        artwork: action.payload.artwork,
        artworkListID: action.payload.artworkListID,
      }
    case "SET_RECENTLY_ADDED_ARTWORK_LIST":
      return {
        ...state,
        recentlyAddedArtworkList: action.payload,
      }
    case "ADD_OR_REMOVE_ARTWORK_LIST":
      // eslint-disable-next-line no-case-declarations
      const { artworkList, mode } = action.payload
      // eslint-disable-next-line no-case-declarations
      const artworkLists = state[mode]
      // eslint-disable-next-line no-case-declarations
      const ids = artworkLists.map((artworkList) => artworkList.internalID)
      // eslint-disable-next-line no-case-declarations
      const updatedState = { ...state }

      if (ids.includes(artworkList.internalID)) {
        updatedState[mode] = artworkLists.filter(
          (entity) => entity.internalID !== artworkList.internalID
        )
      } else {
        updatedState[mode] = [...artworkLists, artworkList]
      }

      updatedState.hasUnsavedChanges = hasChanges(updatedState)

      return updatedState
    case "SET_SELECTED_TOTAL_COUNT":
      return {
        ...state,
        selectedTotalCount: action.payload,
      }
    case "RESET":
      return ARTWORK_LISTS_CONTEXT_INITIAL_STATE
    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      }
    default:
      return state
  }
}

const isArtworkListsIncludes = (artworkListID: string, artworkLists: ArtworkListEntity[]) => {
  return artworkLists.find((artworkList) => artworkList.internalID === artworkListID)
}

const hasChanges = (state: ArtworkListState) => {
  return state.addingArtworkLists.length !== 0 || state.removingArtworkLists.length !== 0
}
