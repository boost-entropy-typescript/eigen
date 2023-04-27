import { Box, Button, Spacer } from "@artsy/palette-mobile"
import { BottomSheetView, useBottomSheetDynamicSnapPoints } from "@gorhom/bottom-sheet"
import { useArtworkListsContext } from "app/Components/ArtworkLists/ArtworkListsContext"
import { ArtworkInfo } from "app/Components/ArtworkLists/components/ArtworkInfo"
import { ArtworkListsBottomSheetSectionTitle } from "app/Components/ArtworkLists/components/ArtworkListsBottomSheetSectionTitle"
import { AutomountedBottomSheetModal } from "app/Components/ArtworkLists/components/AutomountedBottomSheetModal"
import { BottomSheetInput } from "app/Components/BottomSheetInput"
import { useMemo, useState } from "react"

export const CreateNewArtworkListView = () => {
  const [name, setName] = useState("")
  const { state, dispatch } = useArtworkListsContext()
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT"], [])

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints)

  const closeCurrentView = () => {
    dispatch({
      type: "SET_CREATE_NEW_ARTWORK_LIST_VIEW_VISIBLE",
      payload: false,
    })
  }

  const setRecentlyAddedArtworkList = () => {
    dispatch({
      type: "SET_RECENTLY_ADDED_ARTWORK_LIST",
      payload: {
        // TODO: Use real data from mutation
        internalID: "recently-created-artwork-list-id",
        name,
      },
    })
  }

  const handleSave = () => {
    // TODO: Run save mutation
    // TODO: Preselect recently create artwork list
    setRecentlyAddedArtworkList()
    closeCurrentView()
  }

  return (
    <AutomountedBottomSheetModal
      visible
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      onDismiss={closeCurrentView}
    >
      <BottomSheetView onLayout={handleContentLayout}>
        <ArtworkListsBottomSheetSectionTitle mt={1}>
          Create a new list
        </ArtworkListsBottomSheetSectionTitle>

        <Box m={2}>
          <ArtworkInfo artwork={state.artwork!} />
        </Box>

        <BottomSheetInput placeholder="Placeholder" value={name} onChangeText={setName} />

        <Button width="100%" block onPress={handleSave}>
          Save
        </Button>

        <Spacer y={2} />

        <Button width="100%" block variant="outline" onPress={closeCurrentView}>
          Back
        </Button>
      </BottomSheetView>
    </AutomountedBottomSheetModal>
  )
}
